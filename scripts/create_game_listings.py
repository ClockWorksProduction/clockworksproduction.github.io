import os
import json
import re
import urllib.request
import urllib.parse
import time
import argparse
import html as _html

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
GAME_DIR = os.path.join(ROOT, 'docs', 'asset', 'Game')

SOURCE_FILES = []
for fn in os.listdir(GAME_DIR):
    if fn.startswith('_') and fn.endswith('_game_list.json'):
        SOURCE_FILES.append(os.path.join(GAME_DIR, fn))


def load_json(path):
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return []


def strip_tags(s):
    # remove HTML tags and unescape entities
    s = re.sub(r'<[^>]+>', ' ', s or '')
    s = _html.unescape(s)
    s = re.sub(r'\s+', ' ', s).strip()
    return s


def slug(name):
    s = re.sub(r"[^A-Za-z0-9 _-]", '', name)
    s = s.strip().replace(' ', '_')
    return s


def fetch_url_bytes(url, timeout=15):
    req = urllib.request.Request(url, headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) '
                      'Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
    })
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read()


def load_existing_meta(path):
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return None


def merge_store_urls(existing_urls, new_urls):
    # existing_urls and new_urls are dicts; prefer existing non-empty values
    out = existing_urls.copy() if existing_urls else {}
    for k, v in (new_urls or {}).items():
        if not out.get(k) and v:
            out[k] = v
    # ensure all expected keys exist
    keys = ['steam', 'itchIo', 'epicGames', 'gog', 'xbox', 'playstation', 'nintendo', 'newgrounds', 'other']
    for k in keys:
        out.setdefault(k, '')
    return out


def detect_platforms_from_steam(appid):
    """Try to detect available OS platforms from Steam store page for the appid.
    Returns a list like ['Windows', 'macOS', 'Linux'] or empty list on failure.
    """
    try:
        url = f'https://store.steampowered.com/app/{appid}/'
        raw = fetch_url_bytes(url, timeout=10)
        html = raw.decode('utf-8', errors='ignore')
        platforms = []
        if re.search(r'Windows', html, re.I):
            platforms.append('Windows')
        if re.search(r'macOS|OS X|Mac OS X|Mac', html, re.I):
            platforms.append('macOS')
        if re.search(r'Linux', html, re.I):
            platforms.append('Linux')
        return list(dict.fromkeys(platforms))
    except Exception:
        return []


def detect_platforms_from_url(url):
    """Fetch a store page and try to infer supported OS platforms from its HTML."""
    try:
        raw = fetch_url_bytes(url, timeout=10)
        html = raw.decode('utf-8', errors='ignore')
        platforms = []
        if re.search(r'Windows', html, re.I):
            platforms.append('Windows')
        if re.search(r'macOS|OS X|Mac OS X|Mac', html, re.I):
            platforms.append('macOS')
        if re.search(r'Linux', html, re.I):
            platforms.append('Linux')
        return list(dict.fromkeys(platforms))
    except Exception:
        return []


def classify_store_from_url(url):
    if not url:
        return 'other'
    u = url.lower()
    if 'store.steampowered.com' in u or '/app/' in u and 'steam' in u:
        return 'steam'
    if 'epicgames' in u or 'epic' in u and 'store' in u:
        return 'epicGames'
    if 'itch.io' in u or 'itch.io' in u or 'itchio' in u:
        return 'itchIo'
    if 'gog.com' in u or 'gog' in u:
        return 'gog'
    if 'xbox' in u or 'microsoft.com' in u:
        return 'xbox'
    if 'playstation' in u or 'psn' in u or 'store.playstation' in u:
        return 'playstation'
    if 'nintendo' in u or 'nintendo.com' in u:
        return 'nintendo'
    if 'newgrounds' in u:
        return 'newgrounds'
    return 'other'


def build_store_url_from_appid(store_key, appid):
    """Best-effort build of a public store URL from a known appid for some stores."""
    if not appid:
        return ''
    try:
        if store_key == 'steam' or str(store_key).lower() == 'steam':
            return f'https://store.steampowered.com/app/{int(appid)}/'
    except Exception:
        pass
    return ''


def find_og_image(html):
    # search for og:image or twitter:image meta tag
    m = re.search(r'''<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']''', html, re.I)
    if not m:
        m = re.search(r'''<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']''', html, re.I)
    if not m:
        m = re.search(r'''<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']''', html, re.I)
    return m.group(1) if m else None


def find_description_from_html(html, url=None):
    # Try JSON-LD description blocks first
    for m in re.finditer(r"<script[^>]+type=[\"']application/ld\+json[\"'][^>]*>(.*?)</script>", html, re.I | re.S):
        try:
            data = json.loads(m.group(1))
            if isinstance(data, dict) and data.get('description'):
                return strip_tags(data.get('description'))
        except Exception:
            pass

    # try common meta tags next
    m = re.search(r'''<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']''', html, re.I)
    if not m:
        m = re.search(r'''<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']''', html, re.I)
    if not m:
        m = re.search(r'''<meta[^>]+name=["']twitter:description["'][^>]+content=["']([^"']+)["']''', html, re.I)
    if m:
        return strip_tags(m.group(1))

    # steam-specific: try description blocks (id or class) and snippets
    if url and 'store.steampowered.com' in (url or '').lower():
        # id-based block
        m = re.search(r"<div[^>]+id=[\"']game_area_description[\"'][^>]*>([\s\S]*?)</div>", html, re.I)
        if not m:
            # class-based variants
            m = re.search(r"<div[^>]+class=[\"']game_area_description[\"'][^>]*>([\s\S]*?)</div>", html, re.I)
        if not m:
            m = re.search(r"<div[^>]+class=[\"']game_description_snippet[\"'][^>]*>([\s\S]*?)</div>", html, re.I)
        if m:
            return strip_tags(m.group(1))

    # fallback: first sizeable paragraph-like chunk
    m = re.search(r'<p[^>]*>(.{40,500})<\/p>', html, re.I | re.S)
    if m:
        return strip_tags(m.group(1))

    return ''


def find_metadata_from_html(html, url=None):
    """Best-effort extraction of developer, publisher, releaseDate, genres, platforms, tags from page HTML.
    Returns dict with keys: developer, publisher, releaseDate, genres(list), platforms(list), tags(list)
    """
    out = {'developer': '', 'publisher': '', 'releaseDate': '', 'genres': [], 'platforms': [], 'tags': []}

    # try JSON-LD blocks first
    for m in re.finditer(r"""<script[^>]+type=["']application/ld\+json["'][^>]*>(.*?)</script>""", html, re.I | re.S):
        try:
            data = json.loads(m.group(1))
            if isinstance(data, dict):
                if not out['developer'] and data.get('author'):
                    if isinstance(data.get('author'), dict):
                        out['developer'] = data['author'].get('name') or out['developer']
                    elif isinstance(data.get('author'), str):
                        out['developer'] = data.get('author')
                if not out['publisher'] and data.get('publisher'):
                    if isinstance(data.get('publisher'), dict):
                        out['publisher'] = data['publisher'].get('name') or out['publisher']
                    elif isinstance(data.get('publisher'), str):
                        out['publisher'] = data.get('publisher')
                if not out['releaseDate'] and data.get('datePublished'):
                    out['releaseDate'] = data.get('datePublished')
                if not out['genres'] and data.get('genre'):
                    ge = data.get('genre')
                    if isinstance(ge, list):
                        out['genres'] = ge
                    elif isinstance(ge, str):
                        out['genres'] = [x.strip() for x in re.split(r'[,/|;]', ge) if x.strip()]
        except Exception:
            continue

    # steam-specific: look for details_block content
    if url and 'store.steampowered.com' in (url or '').lower():
        m = re.search(r"<div[^>]+class=[\"']details_block[\"'][^>]*>(.*?)</div>", html, re.I | re.S)
        block = m.group(1) if m else ''
        if block:
            # Developer
            mdev = re.search(r'Developer:\s*</?[^>]*>\s*<a[^>]*>([^<]+)</a>', block, re.I)
            if not mdev:
                mdev = re.search(r'Developer:\s*([^<\n]+)<', block, re.I)
            if mdev:
                out['developer'] = strip_tags(mdev.group(1))
            # Publisher
            mpub = re.search(r'Publisher:\s*</?[^>]*>\s*<a[^>]*>([^<]+)</a>', block, re.I)
            if not mpub:
                mpub = re.search(r'Publisher:\s*([^<\n]+)<', block, re.I)
            if mpub:
                out['publisher'] = strip_tags(mpub.group(1))
            # Release Date
            mrel = re.search(r'Release Date:\s*([^<\n]+)<', block, re.I)
            if mrel:
                out['releaseDate'] = strip_tags(mrel.group(1))
            # genres/tags
            tags = re.findall(r"""<a[^>]+href=["'][^"']*(?:tag|genre|tags)[^"']*["'][^>]*>([^<]+)</a>""", block, re.I)
            if tags:
                out['genres'] = [t.strip() for t in tags]

    # fallback: meta tags for publisher/author
    if not out['publisher']:
        m = re.search(r"""<meta[^>]+name=["']publisher["'][^>]+content=["']([^"']+)["']""", html, re.I)
        if m:
            out['publisher'] = strip_tags(m.group(1))

    return out


def download_cover_for_game(name, primary_store_link, store_urls=None, appids=None, info_image=None):
    # returns local filename or empty string
    dest_dir = os.path.join(GAME_DIR, slug(name))
    os.makedirs(dest_dir, exist_ok=True)
    cover_path = os.path.join(dest_dir, 'cover.jpg')

    # Try explicit image URL discovered from source metadata first (Epic keyImages etc.)
    if info_image:
        try:
            img = info_image
            if primary_store_link:
                img = urllib.parse.urljoin(primary_store_link, img)
            data = fetch_url_bytes(img)
            with open(cover_path, 'wb') as f:
                f.write(data)
            return 'cover.jpg'
        except Exception:
            pass

    # Steam CDN is easiest
    if appids and appids.get('steam'):
        try:
            steam_appid = appids.get('steam')
            url = f'https://cdn.cloudflare.steamstatic.com/steam/apps/{steam_appid}/header.jpg'
            data = fetch_url_bytes(url)
            with open(cover_path, 'wb') as f:
                f.write(data)
            return 'cover.jpg'
        except Exception:
            pass

    # try to fetch og:image from the provided primary link first
    tried = set()
    if primary_store_link:
        try:
            raw = fetch_url_bytes(primary_store_link)
            html = raw.decode('utf-8', errors='ignore')
            img = find_og_image(html)
            if img:
                img = urllib.parse.urljoin(primary_store_link, img)
                data = fetch_url_bytes(img)
                with open(cover_path, 'wb') as f:
                    f.write(data)
                return 'cover.jpg'
        except Exception:
            pass
        tried.add(primary_store_link)

    # fallback: iterate any other known store urls and try to extract og:image
    if store_urls:
        for k, url in (store_urls or {}).items():
            if not url or url in tried:
                continue
            try:
                raw = fetch_url_bytes(url)
                html = raw.decode('utf-8', errors='ignore')
                img = find_og_image(html)
                if img:
                    img = urllib.parse.urljoin(url, img)
                    data = fetch_url_bytes(img)
                    with open(cover_path, 'wb') as f:
                        f.write(data)
                    return 'cover.jpg'
            except Exception:
                continue

    return ''


def main():
    parser = argparse.ArgumentParser(description='Generate game folders and meta files')
    parser.add_argument('--no-download-covers', dest='download_covers', action='store_false', help='Do not download cover images')
    parser.add_argument('--overwrite-meta', dest='overwrite_meta', action='store_true', help='Overwrite existing meta.json entirely')
    parser.add_argument('--fetch-descriptions', dest='fetch_descriptions', action='store_true', help='Fetch descriptions from store pages when missing')
    args = parser.parse_args()

    # Load all discovered source lists into a dict keyed by the store name (filename)
    store_lists = {}
    for path in SOURCE_FILES:
        key = os.path.basename(path).lstrip('_').split('_game_list.json')[0]
        store_lists[key] = load_json(path)

    # Aggregate games by name and collect per-store links and ids
    games = {}
    for store_key, entries in store_lists.items():
        for e in entries:
            name = e.get('name') or e.get('app_title') or (e.get('metadata') or {}).get('title')
            if not name:
                continue
            if name not in games:
                games[name] = {
                    'name': name,
                    'store_links': {},  # map store_key -> url
                    'appids': {},       # map store_key -> id
                    'description': '',
                    'developers': set(),
                    'publishers': set(),
                    'releaseDate': '',
                    'genres': set(),
                    'platforms': set(),
                    'tags': set()
                }

            # find a URL in common fields (sources have inconsistent keys)
            possible_url_fields = ['store_link', 'storeUrl', 'store_url', 'link', 'url', 'game_url', 'website', 'page', 'storepage', 'store_page', 'permalink', 'epic_link', 'primary_link']
            url = ''
            for fld in possible_url_fields:
                val = e.get(fld)
                if isinstance(val, str) and val:
                    url = val
                    break

            # Some sources provide base_urls as a list
            if not url and isinstance(e.get('base_urls'), list) and e.get('base_urls'):
                url = e.get('base_urls')[0]

            # Some sources provide nested metadata with possible link fields
            if not url and isinstance(e.get('metadata'), dict):
                for fld in ['url', 'store_url', 'permalink', 'page', 'link', 'website']:
                    val = (e.get('metadata') or {}).get(fld)
                    if isinstance(val, str) and val:
                        url = val
                        break

            # If the source explicitly provides a primary_link, prefer it
            if not url and isinstance(e.get('primary_link'), str) and e.get('primary_link'):
                url = e.get('primary_link')

            # Some exports include a storefronts array with {store, url}
            if not url and isinstance(e.get('storefronts'), list):
                for sf in e.get('storefronts'):
                    if isinstance(sf, dict) and sf.get('url'):
                        url = sf.get('url')
                        break

            # If no url but we have a steam appid, construct a steam store url
            if not url and (e.get('appid') or (e.get('metadata') or {}).get('appid')):
                aid = e.get('appid') or (e.get('metadata') or {}).get('appid')
                url = build_store_url_from_appid('steam', aid)

            # Epic-specific: some Epic exports use productSlug / offerId / catalogOfferId
            if (not url) and store_key.lower().startswith('epic'):
                # try several possible epic fields
                slug_val = e.get('productSlug') or e.get('slug') or (e.get('metadata') or {}).get('productSlug') or (e.get('metadata') or {}).get('slug')
                offer_id = e.get('offerId') or e.get('catalogOfferId') or (e.get('metadata') or {}).get('id')
                if slug_val and isinstance(slug_val, str):
                    # build Epic store product URL (best-effort)
                    try:
                        url = f'https://www.epicgames.com/store/en-US/p/{slug_val}'
                    except Exception:
                        url = ''
                elif offer_id:
                    # store the offer id in appids for later processing
                    games[name]['appids']['epic'] = offer_id
                    # also keep canonical epicGames key
                    games[name]['appids']['epicGames'] = games[name]['appids'].get('epicGames') or offer_id

            # If still no url but we have an epic metadata id in metadata.id, capture it
            if not url and (e.get('metadata') or {}).get('id') and store_key.lower().startswith('epic'):
                possible_id = (e.get('metadata') or {}).get('id')
                # store under both keys for compatibility
                games[name]['appids']['epic'] = games[name]['appids'].get('epic') or possible_id
                games[name]['appids']['epicGames'] = games[name]['appids'].get('epicGames') or possible_id

            # Epic: extract metadata.keyImages and description where available
            if store_key.lower().startswith('epic') and isinstance(e.get('metadata'), dict):
                meta = e.get('metadata') or {}
                # prefer long/clean description from Epic metadata
                if not games[name].get('description'):
                    desc = meta.get('description') or meta.get('longDescription') or meta.get('shortDescription')
                    if isinstance(desc, str) and desc:
                        games[name]['description'] = strip_tags(desc)
                # keyImages: prefer DieselGameBox, fallback to first image
                key_images = meta.get('keyImages') or meta.get('key_images') or []
                image_url = ''
                if isinstance(key_images, list) and key_images:
                    for img in key_images:
                        if isinstance(img, dict) and img.get('type') == 'DieselGameBox':
                            image_url = img.get('url') or img.get('image') or ''
                            break
                    if not image_url:
                        first = key_images[0]
                        if isinstance(first, dict):
                            image_url = first.get('url') or first.get('image') or ''
                if image_url:
                    games[name]['image'] = image_url
            # top-level image field (some exports include a direct image URL)
            if not games[name].get('image') and isinstance(e.get('image'), str) and e.get('image'):
                games[name]['image'] = e.get('image')

            if url:
                sk = store_key.lower()
                games[name]['store_links'][sk] = url

            # capture appid/id if present for common providers
            # normalize common id keys into canonical provider keys
            if e.get('appid'):
                # Treat appid according to source: Epic lists often use 'appid' for epic ids
                if store_key.lower().startswith('epic'):
                    games[name]['appids']['epic'] = e.get('appid')
                else:
                    games[name]['appids']['steam'] = e.get('appid')
            # metadata.id often useful for Epic
            if (e.get('metadata') or {}).get('id'):
                games[name]['appids']['epic'] = (e.get('metadata') or {}).get('id')
            # other possible id fields
            if e.get('id') and not games[name]['appids'].get('other'):
                games[name]['appids']['other'] = e.get('id')
            if e.get('slug') and not games[name]['appids'].get('slug'):
                games[name]['appids']['slug'] = e.get('slug')
            # capture description from source lists when available
            for df in ['description', 'desc', 'summary', 'short_description', 'about']:
                dval = e.get(df) or (e.get('metadata') or {}).get(df)
                if isinstance(dval, str) and dval and not games[name].get('description'):
                    games[name]['description'] = strip_tags(dval)
                    break
            # capture developers/publishers/release/genres/platforms/tags from source fields
            def collect_list_field(val, target_set):
                if not val:
                    return
                if isinstance(val, list):
                    for x in val:
                        if isinstance(x, str) and x.strip():
                            target_set.add(x.strip())
                elif isinstance(val, str):
                    # split common separators
                    for part in re.split(r"[,/|;]", val):
                        part = part.strip()
                        if part:
                            target_set.add(part)

            # developer
            dev = e.get('developer') or e.get('dev') or (e.get('metadata') or {}).get('developer')
            collect_list_field(dev, games[name]['developers'])
            pub = e.get('publisher') or e.get('pub') or (e.get('metadata') or {}).get('publisher')
            collect_list_field(pub, games[name]['publishers'])
            # release date
            rd = e.get('releaseDate') or e.get('release_date') or e.get('released') or (e.get('metadata') or {}).get('datePublished')
            if isinstance(rd, str) and rd and not games[name]['releaseDate']:
                games[name]['releaseDate'] = rd.strip()
            # genres
            g = e.get('genre') or e.get('genres') or (e.get('metadata') or {}).get('genre')
            collect_list_field(g, games[name]['genres'])
            # platforms
            p = e.get('platforms') or e.get('platform') or e.get('os') or (e.get('metadata') or {}).get('platforms')
            collect_list_field(p, games[name]['platforms'])
            # tags / categories
            t = e.get('tags') or e.get('categories') or (e.get('metadata') or {}).get('tags')
            collect_list_field(t, games[name]['tags'])

    # create files and download covers
    out_count = 0
    for name, info in games.items():
        dest_dir = os.path.join(GAME_DIR, slug(name))
        os.makedirs(dest_dir, exist_ok=True)
        # gather store urls collected earlier for this game
        store_urls = {k: '' for k in ['steam', 'itchIo', 'epicGames', 'gog', 'xbox', 'playstation', 'nintendo', 'newgrounds', 'other']}
        for sk, url in info.get('store_links', {}).items():
            if not url:
                continue
            classified = classify_store_from_url(url)
            if classified == 'steam':
                store_urls['steam'] = store_urls.get('steam') or url
            elif classified == 'epicGames':
                store_urls['epicGames'] = store_urls.get('epicGames') or url
            elif classified == 'itchIo':
                store_urls['itchIo'] = store_urls.get('itchIo') or url
            elif classified == 'gog':
                store_urls['gog'] = store_urls.get('gog') or url
            elif classified == 'xbox':
                store_urls['xbox'] = store_urls.get('xbox') or url
            elif classified == 'playstation':
                store_urls['playstation'] = store_urls.get('playstation') or url
            elif classified == 'nintendo':
                store_urls['nintendo'] = store_urls.get('nintendo') or url
            elif classified == 'newgrounds':
                store_urls['newgrounds'] = store_urls.get('newgrounds') or url
            else:
                store_urls['other'] = store_urls.get('other') or url

        # decide a primary store link for cover download / fallback
        primary_candidate = store_urls.get('other') or store_urls.get('steam') or store_urls.get('epicGames') or ''
        store_link = primary_candidate

        # Build meta.json following the provided template structure
        # If an existing meta.json exists, load and merge unless overwrite requested
        meta_path = os.path.join(dest_dir, 'meta.json')
        existing_meta = load_existing_meta(meta_path)

        base_meta = {
            'name': info['name'],
            'image': info.get('image') or '',
            'appId': {
                'steam': int((info.get('appids') or {}).get('steam') or 0),
                'itchIo': (info.get('appids') or {}).get('itch') or 0,
                'epicGames': (info.get('appids') or {}).get('epic') or (info.get('appids') or {}).get('epicGames') or 0,
                'gog': (info.get('appids') or {}).get('gog') or 0,
                'xbox': (info.get('appids') or {}).get('xbox') or 0,
                'playstation': (info.get('appids') or {}).get('playstation') or 0,
                'nintendo': (info.get('appids') or {}).get('nintendo') or 0,
                'newgrounds': (info.get('appids') or {}).get('newgrounds') or 0,
                'other': (info.get('appids') or {}).get('other') or 0
            },
            'description': info.get('description') or '',
            'developer': (list(info.get('developers') or [])[:1] or [''])[0] if info.get('developers') else '',
            'publisher': (list(info.get('publishers') or [])[:1] or [''])[0] if info.get('publishers') else '',
            'releaseDate': info.get('releaseDate') or '',
            'genre': list(info.get('genres') or []) if info.get('genres') else [''],
            'platforms': list(info.get('platforms') or []),
            'tags': list(info.get('tags') or []) if info.get('tags') else [''],
            'storeUrl': store_urls
        }

        if existing_meta and not args.overwrite_meta:
            # merge: prefer existing non-empty fields, but update appId steam and storeUrl
            merged = existing_meta.copy()
            # ensure name and appId steam are updated
            merged['name'] = base_meta['name']
            merged.setdefault('appId', {})
            # update all known appId keys if not present
            for ak, av in base_meta['appId'].items():
                if not merged['appId'].get(ak) and av:
                    merged['appId'][ak] = av
            # merge storeUrl
            merged['storeUrl'] = merge_store_urls(merged.get('storeUrl', {}), base_meta['storeUrl'])
            # ensure description is set from sources when existing meta lacks it
            if not merged.get('description') and base_meta.get('description'):
                merged['description'] = base_meta.get('description')
            # ensure description/developer/publisher/genres/platforms/tags are set from sources when existing meta lacks them
            if not merged.get('description') and base_meta.get('description'):
                merged['description'] = base_meta.get('description')
            if not merged.get('developer') and base_meta.get('developer'):
                merged['developer'] = base_meta.get('developer')
            if not merged.get('publisher') and base_meta.get('publisher'):
                merged['publisher'] = base_meta.get('publisher')
            if not merged.get('releaseDate') and base_meta.get('releaseDate'):
                merged['releaseDate'] = base_meta.get('releaseDate')
            if (not merged.get('genre') or merged.get('genre') == ['']) and base_meta.get('genre'):
                merged['genre'] = base_meta.get('genre')
            if (not merged.get('platforms')) and base_meta.get('platforms'):
                merged['platforms'] = base_meta.get('platforms')
            if (not merged.get('tags') or merged.get('tags') == ['']) and base_meta.get('tags'):
                merged['tags'] = base_meta.get('tags')
            # ensure platforms: if empty, try to detect from steam
            if not merged.get('platforms'):
                merged['platforms'] = []
            # ensure image: if existing meta lacks an image, take base image
            if (not merged.get('image') or merged.get('image') == '') and base_meta.get('image'):
                merged['image'] = base_meta.get('image')
            meta = merged
        else:
            meta = base_meta

        # platform detection: try Steam first, else try any store URL to infer OS
        try:
            if (not meta.get('platforms')) or (isinstance(meta.get('platforms'), list) and len(meta.get('platforms')) == 0):
                detected = []
                # prefer Steam appid detection
                if meta.get('appId', {}).get('steam'):
                    detected = detect_platforms_from_steam(meta['appId']['steam'])

                # if nothing from steam, try other store pages
                if not detected:
                    # check primary store link first
                    primary = store_link
                    if primary:
                        detected = detect_platforms_from_url(primary)

                if not detected:
                    # try any available store urls
                    for _, u in (store_urls or {}).items():
                        if not u:
                            continue
                        detected = detect_platforms_from_url(u)
                        if detected:
                            break

                if detected:
                    meta['platforms'] = detected
                else:
                    # fallback default if we have any store link
                    if any((v for v in (store_urls or {}).values())):
                        meta['platforms'] = ['Windows']
                    else:
                        meta['platforms'] = []
        except Exception:
            meta['platforms'] = meta.get('platforms') or []

        # attempt to download cover (saved as cover.jpg in the game's folder) if enabled
        cover = ''
        if args.download_covers:
            cover = download_cover_for_game(info['name'], store_link, store_urls, info.get('appids'), info.get('image'))

        # fetch descriptions from store pages if requested and description is empty
        if args.fetch_descriptions:
            # prefer any description already aggregated from sources
            current_desc = meta.get('description') or info.get('description') or ''
            if not current_desc:
                # try primary link first
                tried = set()
                if store_link:
                    try:
                        raw = fetch_url_bytes(store_link)
                        html = raw.decode('utf-8', errors='ignore')
                        desc = find_description_from_html(html, store_link)
                        if desc:
                            meta['description'] = desc
                        # also try to extract metadata (developer/publisher/release/genres/platforms/tags)
                        meta_info = find_metadata_from_html(html, store_link)
                        if meta_info:
                            if not meta.get('developer') and meta_info.get('developer'):
                                meta['developer'] = meta_info.get('developer')
                            if not meta.get('publisher') and meta_info.get('publisher'):
                                meta['publisher'] = meta_info.get('publisher')
                            if not meta.get('releaseDate') and meta_info.get('releaseDate'):
                                meta['releaseDate'] = meta_info.get('releaseDate')
                            if meta_info.get('genres') and (not meta.get('genre') or meta.get('genre') == ['']):
                                meta['genre'] = meta_info.get('genres')
                            if meta_info.get('platforms') and (not meta.get('platforms')):
                                meta['platforms'] = meta_info.get('platforms')
                            if meta_info.get('tags') and (not meta.get('tags') or meta.get('tags') == ['']):
                                meta['tags'] = meta_info.get('tags')
                        tried.add(store_link)
                    except Exception:
                        pass

                if not meta.get('description') and store_urls:
                    for k, u in (store_urls or {}).items():
                        if not u or u in tried:
                            continue
                        try:
                            raw = fetch_url_bytes(u)
                            html = raw.decode('utf-8', errors='ignore')
                            desc = find_description_from_html(html, u)
                            if desc:
                                meta['description'] = desc
                                meta_info = find_metadata_from_html(html, u)
                                if meta_info:
                                    if not meta.get('developer') and meta_info.get('developer'):
                                        meta['developer'] = meta_info.get('developer')
                                    if not meta.get('publisher') and meta_info.get('publisher'):
                                        meta['publisher'] = meta_info.get('publisher')
                                    if not meta.get('releaseDate') and meta_info.get('releaseDate'):
                                        meta['releaseDate'] = meta_info.get('releaseDate')
                                    if meta_info.get('genres') and (not meta.get('genre') or meta.get('genre') == ['']):
                                        meta['genre'] = meta_info.get('genres')
                                    if meta_info.get('platforms') and (not meta.get('platforms')):
                                        meta['platforms'] = meta_info.get('platforms')
                                    if meta_info.get('tags') and (not meta.get('tags') or meta.get('tags') == ['']):
                                        meta['tags'] = meta_info.get('tags')
                                break
                        except Exception:
                            continue

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
