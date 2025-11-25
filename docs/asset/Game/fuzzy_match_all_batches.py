import csv
import re
import time
from pathlib import Path
from urllib.request import Request, urlopen, urlretrieve
from urllib.error import HTTPError, URLError
from urllib.parse import quote_plus

ROOT = Path(r"d:/CWP/clockworksproduction.github.io/docs/asset/Game")
OUT_CSV = ROOT / 'fuzzy_matches.csv'
USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'
APP_RE = re.compile(r"/app/(\d+)/")


def folders_list():
    # list immediate subfolders only
    return [p for p in ROOT.iterdir() if p.is_dir()]


def parse_info_for_appid(folder):
    info = folder / 'info.txt'
    if not info.exists():
        return '', ''
    text = info.read_text(encoding='utf-8', errors='ignore')
    appid = ''
    steamUrl = ''
    for line in text.splitlines():
        if line.lower().startswith('steam appid'):
            appid = line.split(':',1)[1].strip()
        if line.lower().startswith('steam url'):
            steamUrl = line.split(':',1)[1].strip()
    return appid, steamUrl


def search_steam(name):
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
            m = APP_RE.search(html)
            if m:
                appid = m.group(1)
                return appid, f'https://store.steampowered.com/app/{appid}/'
        except Exception:
            pass
        time.sleep(0.35)
    return '', ''


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
            urlretrieve(url, str(header))
            return header.exists()
    except Exception:
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
    def set_field(key, value):
        nonlocal lines
        for i,l in enumerate(lines):
            if l.lower().startswith(key.lower()+':'):
                lines[i] = f"{key}: {value}"
                return
        lines.append(f"{key}: {value}")
    set_field('Steam AppID', appid or '')
    set_field('Steam URL', steamUrl or '')
    set_field('Image', 'header.jpg' if image_ok else 'None')
    info.write_text('\n'.join(lines), encoding='utf-8')


def write_rows_incremental(rows):
    # append mode if file exists, otherwise write header
    file_exists = OUT_CSV.exists()
    with OUT_CSV.open('a', newline='', encoding='utf-8') as f:
        fieldnames = ['name','folder','found','appid','steamUrl','imageDownloaded']
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        if not file_exists:
            writer.writeheader()
        for row in rows:
            writer.writerow(row)


def main(batch_size=30):
    folders = sorted(folders_list(), key=lambda p: p.name.lower())
    to_process = []
    for p in folders:
        # skip special files like .git, etc
        if p.name in ('__pycache__', ):
            continue
        appid, steamUrl = parse_info_for_appid(p)
        if not appid:
            to_process.append((p.name, p))
    print('Folders to process:', len(to_process))

    total = len(to_process)
    idx = 0
    while idx < total:
        batch = to_process[idx: idx+batch_size]
        out = []
        for name, folder in batch:
            print(f'Processing {name}')
            appid, steamUrl = search_steam(name)
            found = bool(appid)
            img_ok = False
            if found:
                img_ok = download_header(folder, appid)
                update_info_txt(folder, appid, steamUrl, img_ok)
            out.append({'name': name, 'folder': str(folder), 'found': str(found), 'appid': appid or '', 'steamUrl': steamUrl or '', 'imageDownloaded': str(img_ok)})
        write_rows_incremental(out)
        idx += batch_size
        # small pause between batches
        time.sleep(0.8)
    print('All batches finished. Output:', OUT_CSV)

if __name__ == '__main__':
    main(batch_size=30)
