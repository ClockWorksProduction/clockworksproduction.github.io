import csv
import re
import time
from pathlib import Path
from urllib.request import Request, urlopen, urlretrieve
from urllib.error import HTTPError, URLError
from urllib.parse import quote_plus

ROOT = Path(r"d:/CWP/clockworksproduction.github.io/docs/asset/Game")
MERGED_CSV = ROOT / "games_info_merged.csv"
OUT_CSV = ROOT / "fuzzy_matches.csv"
USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'

APP_RE = re.compile(r"/app/(\d+)/")


def read_merged():
    rows = []
    if not MERGED_CSV.exists():
        return rows
    with MERGED_CSV.open(newline='', encoding='utf-8') as f:
        r = csv.DictReader(f)
        for row in r:
            rows.append(row)
    return rows


def search_steam_for(name):
    # try a few variants
    variants = [name]
    cleaned = re.sub(r"[()\[\]'\"]", '', name)
    if cleaned != name:
        variants.append(cleaned)
    variants.append(name.replace('&','and'))
    variants.append(' '.join(name.split()))
    variants = [v for v in dict.fromkeys(variants) if v]

    for v in variants:
        q = quote_plus(v)
        url = f'https://store.steampowered.com/search/?term={q}'
        try:
            req = Request(url, headers={'User-Agent': USER_AGENT})
            with urlopen(req, timeout=20) as resp:
                html = resp.read().decode('utf-8', errors='replace')
            # try to find app ids via /app/<id>/ links
            m = APP_RE.search(html)
            if m:
                appid = m.group(1)
                steamUrl = f'https://store.steampowered.com/app/{appid}/'
                return appid, steamUrl
        except (HTTPError, URLError, Exception):
            pass
        time.sleep(0.4)
    return None, None


def download_header(folder, appid):
    if not appid:
        return False
    header = folder / 'header.jpg'
    if header.exists():
        return True
    url = f'https://cdn.cloudflare.steamstatic.com/steam/apps/{appid}/header.jpg'
    try:
        req = Request(url, headers={'User-Agent': USER_AGENT})
        with urlopen(req, timeout=20) as resp:
            if resp.status != 200:
                return False
            # save
            urlretrieve(url, str(header))
            return header.exists()
    except (HTTPError, URLError, Exception):
        if header.exists():
            try:
                header.unlink()
            except Exception:
                pass
        return False


def update_info_txt(folder, appid, steamUrl, image_ok):
    info = folder / 'info.txt'
    lines = []
    if info.exists():
        lines = info.read_text(encoding='utf-8').splitlines()
    # naive upsert - replace Steam AppID/URL/Image lines if present, else append
    def set_field(key, value):
        nonlocal lines
        for i,l in enumerate(lines):
            if l.startswith(key+':'):
                lines[i] = f"{key}: {value}"
                return
        lines.append(f"{key}: {value}")

    set_field('Steam AppID', appid or '')
    set_field('Steam URL', steamUrl or '')
    set_field('Image', 'header.jpg' if image_ok else 'None')

    info.write_text('\n'.join(lines), encoding='utf-8')


def main():
    rows = read_merged()
    if not rows:
        print('No merged CSV found at', MERGED_CSV)
        return

    out = []
    matched = 0
    downloaded = 0

    for r in rows:
        name = r.get('name','').strip()
        folder = Path(r.get('folder',''))
        appid = (r.get('appid') or '').strip()
        steamUrl = (r.get('steamUrl') or '').strip()
        if appid:
            # already has appid, skip
            out.append({'name': name, 'folder': str(folder), 'found': 'existing', 'appid': appid, 'steamUrl': steamUrl, 'imageDownloaded': str(folder.joinpath('header.jpg').exists())})
            continue

        # attempt fuzzy search
        appid2, steamUrl2 = search_steam_for(name)
        found = bool(appid2)
        img_ok = False
        if found:
            matched += 1
            img_ok = download_header(folder, appid2)
            if img_ok:
                downloaded += 1
            update_info_txt(folder, appid2, steamUrl2, img_ok)
        else:
            # leave info.txt as-is
            pass

        out.append({'name': name, 'folder': str(folder), 'found': str(found), 'appid': appid2 or '', 'steamUrl': steamUrl2 or '', 'imageDownloaded': str(img_ok)})
        time.sleep(0.25)

    # write CSV
    with OUT_CSV.open('w', newline='', encoding='utf-8') as f:
        fieldnames = ['name','folder','found','appid','steamUrl','imageDownloaded']
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for row in out:
            writer.writerow(row)

    print(f'Fuzzy search complete. matched={matched}, downloaded_images={downloaded}, out={OUT_CSV}')

if __name__ == '__main__':
    main()
