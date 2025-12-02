import os
import json
import re
import urllib.request
import urllib.parse
import time

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
GAME_DIR = os.path.join(ROOT, 'docs', 'asset', 'Game')

SOURCE_FILES = [
    os.path.join(GAME_DIR, '_steam_game_list.json'),
    os.path.join(GAME_DIR, '_other_game_list.json'),
    os.path.join(GAME_DIR, '_epic_game_list.json'),
]


def load_json(path):
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return []


def slug(name):
    s = re.sub(r"[^A-Za-z0-9 _-]", '', name)
    s = s.strip().replace(' ', '_')
    return s


def fetch_url_bytes(url, timeout=15):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read()


def find_og_image(html):
    # search for og:image or twitter:image meta tag
    m = re.search(r'''<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']''', html, re.I)
    if not m:
        m = re.search(r'''<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']''', html, re.I)
    if not m:
        m = re.search(r'''<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']''', html, re.I)
    return m.group(1) if m else None


def download_cover_for_game(name, store_link, steam_appid=None):
    # returns local filename or empty string
    dest_dir = os.path.join(GAME_DIR, slug(name))
    os.makedirs(dest_dir, exist_ok=True)
    cover_path = os.path.join(dest_dir, 'cover.jpg')

    # Steam CDN is easiest
    if steam_appid:
        url = f'https://cdn.cloudflare.steamstatic.com/steam/apps/{steam_appid}/header.jpg'
        try:
            data = fetch_url_bytes(url)
            with open(cover_path, 'wb') as f:
                f.write(data)
            return 'cover.jpg'
        except Exception:
            pass

    # try to fetch og:image from store_link
    if store_link:
        try:
            raw = fetch_url_bytes(store_link)
            html = raw.decode('utf-8', errors='ignore')
            img = find_og_image(html)
            if img:
                # handle relative urls
                img = urllib.parse.urljoin(store_link, img)
                data = fetch_url_bytes(img)
                with open(cover_path, 'wb') as f:
                    f.write(data)
                return 'cover.jpg'
        except Exception:
            pass

    return ''


def main():
    steam = load_json(SOURCE_FILES[0])
    other = load_json(SOURCE_FILES[1])
    epic = load_json(SOURCE_FILES[2])

    games = {}

    # Steam: we have appid and store_link
    for g in steam:
        name = g.get('name')
        if not name:
            continue
        games[name] = {
            'name': name,
            'platform': 'Steam',
            'store_link': g.get('store_link') or g.get('store_link') or g.get('store_link'),
            'steam_appid': g.get('appid'),
        }

    # Other: storeUrl and name
    for g in other:
        name = g.get('name')
        if not name:
            continue
        if name in games:
            # prefer existing (Steam)
            if not games[name].get('store_link'):
                games[name]['store_link'] = g.get('storeUrl')
        else:
            games[name] = {
                'name': name,
                'platform': 'Other',
                'store_link': g.get('storeUrl'),
                'steam_appid': None,
            }

    # Epic: use app_title as name where available
    for g in epic:
        name = g.get('app_title') or (g.get('metadata') or {}).get('title')
        if not name:
            continue
        if name in games:
            # keep existing platform if Steam; else prefer Steam
            if games[name]['platform'] == 'Steam':
                continue
            else:
                games[name]['platform'] = 'Epic'
        else:
            games[name] = {
                'name': name,
                'platform': 'Epic',
                'store_link': '',
                'steam_appid': None,
            }

    # create files and download covers
    out_count = 0
    for name, info in games.items():
        dest_dir = os.path.join(GAME_DIR, slug(name))
        os.makedirs(dest_dir, exist_ok=True)

        store_link = info.get('store_link') or ''
        # try to find more specific store links from source lists
        steam_link = ''
        other_link = ''
        for s in steam:
            if s.get('name') == name:
                steam_link = s.get('store_link') or ''
                break
        for o in other:
            if o.get('name') == name:
                other_link = o.get('storeUrl') or o.get('storeUrl') or ''
                break

        # Build meta.json following the provided template structure
        # storeUrl should include all storefront links (a game can have many)
        meta = {
            'name': info['name'],
            'appId': {
                'steam': int(info.get('steam_appid') or 0),
                'itchIo': 0,
                'epicGames': 0,
                'gog': 0,
                'xbox': 0,
                'playstation': 0,
                'nintendo': 0,
                'newgrounds': 0,
                'other': 0
            },
            'description': '',
            'developer': '',
            'publisher': '',
            'releaseDate': '',
            'genre': [''],
            # `platforms` now represents operating systems the game runs on (Windows, MacOS, Linux, SteamOS, etc.)
            'platforms': [],
            'tags': [''],
            'storeUrl': {
                'steam': steam_link,
                'itchIo': '',
                'epicGames': '',
                'gog': '',
                'xbox': '',
                'playstation': '',
                'nintendo': '',
                'newgrounds': '',
                'other': other_link or store_link
            }
        }

        # set platforms (OS) sensibly: default to Windows if we have any storefront link
        if meta['storeUrl'].get('steam') or meta['storeUrl'].get('other') or meta['storeUrl'].get('epicGames'):
            meta['platforms'] = ['Windows']

        # attempt to download cover (saved as cover.jpg in the game's folder)
        cover = download_cover_for_game(info['name'], store_link, info.get('steam_appid'))

        with open(os.path.join(dest_dir, 'meta.json'), 'w', encoding='utf-8') as f:
            json.dump(meta, f, indent=2, ensure_ascii=False)

        syn_path = os.path.join(dest_dir, 'synopsis.txt')
        if not os.path.exists(syn_path):
            with open(syn_path, 'w', encoding='utf-8') as f:
                f.write(f"{info['name']}: Add your synopsis here.\n")

        out_count += 1
        # be polite to servers
        time.sleep(0.15)

    print(f"Created {out_count} game folders under {GAME_DIR}")


if __name__ == '__main__':
    main()
