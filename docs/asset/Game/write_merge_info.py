import json
import csv
import os
from pathlib import Path
from urllib.request import urlopen, urlretrieve
from urllib.error import URLError, HTTPError

ROOT = Path(r"d:/CWP/clockworksproduction.github.io/docs/asset/Game")
GAMES_JSON = ROOT / "games.json"
SUMMARY_CSV = ROOT / "games_json_update_summary.csv"
INFO_SUMMARY_CSV = ROOT / "game_info_summary.csv"
OUT_SUMMARY = ROOT / "games_info_merged.csv"

def load_games_json():
    with open(GAMES_JSON, 'r', encoding='utf-8') as f:
        return json.load(f)

def load_csv_as_dict(path, key_field='name'):
    if not path.exists():
        return {}
    out = {}
    with open(path, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for r in reader:
            out[r.get(key_field, '')] = r
    return out


def ensure_folder(name):
    p = ROOT / name
    p.mkdir(parents=True, exist_ok=True)
    return p


def download_header_if_missing(folder_path, appid):
    if not appid:
        return False
    header = folder_path / 'header.jpg'
    if header.exists():
        return True
    url = f'https://cdn.cloudflare.steamstatic.com/steam/apps/{appid}/header.jpg'
    try:
        urlretrieve(url, str(header))
        return header.exists()
    except (HTTPError, URLError, Exception):
        if header.exists():
            try:
                header.unlink()
            except Exception:
                pass
        return False


def write_info_txt(folder_path, data):
    # data is a dict with keys: store_link, description, appid, steamUrl, title, release, developer, publisher, tags, hasImage
    lines = []
    lines.append(f"Store: {data.get('store_link','')}")
    lines.append("")
    lines.append("Description:")
    lines.append(data.get('description',''))
    lines.append("")
    lines.append("Metadata:")
    lines.append(f"Steam AppID: {data.get('appid','')}")
    lines.append(f"Steam URL: {data.get('steamUrl','')}")
    lines.append(f"Title: {data.get('title','')}")
    lines.append(f"Release: {data.get('release','')}")
    lines.append(f"Developer: {data.get('developer','')}")
    lines.append(f"Publisher: {data.get('publisher','')}")
    lines.append(f"Tags: {data.get('tags','')}")
    lines.append("")
    img_flag = 'header.jpg' if data.get('hasImage') else 'None'
    lines.append(f"Image: {img_flag}")

    info_path = folder_path / 'info.txt'
    with open(info_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))
    return info_path.exists()


def main():
    games = load_games_json()
    summary = load_csv_as_dict(SUMMARY_CSV)
    info_meta = load_csv_as_dict(INFO_SUMMARY_CSV)

    out_rows = []

    for g in games:
        name = g.get('name')
        if not name:
            continue
        folder = ensure_folder(name)

        row_sum = summary.get(name, {})
        row_meta = info_meta.get(name, {})

        appid = (row_sum.get('appid') or row_sum.get('appid', '')).strip() if row_sum else ''
        steamUrl = (row_sum.get('steamLink') or row_sum.get('steamUrl') or row_sum.get('steamUrl','')).strip() if row_sum else ''
        if not steamUrl:
            steamUrl = row_meta.get('steamUrl','')
        # normalize empty strings
        if appid == '':
            appid = row_meta.get('appid','') or ''
        
        # Try downloading header if missing and we have an appid
        has_image = (folder / 'header.jpg').exists()
        if not has_image and appid:
            try:
                ok = download_header_if_missing(folder, appid)
                has_image = ok
            except Exception:
                has_image = False

        data = {
            'store_link': g.get('store_link',''),
            'description': g.get('description',''),
            'appid': appid,
            'steamUrl': steamUrl,
            'title': row_meta.get('title',''),
            'release': row_meta.get('release',''),
            'developer': row_meta.get('developer',''),
            'publisher': row_meta.get('publisher',''),
            'tags': row_meta.get('tags',''),
            'hasImage': has_image
        }

        wrote = write_info_txt(folder, data)

        out_rows.append({
            'name': name,
            'folder': str(folder),
            'wrote': str(wrote),
            'hasImage': str(has_image),
            'appid': appid,
            'steamUrl': steamUrl
        })

    # write merged summary csv
    with open(OUT_SUMMARY, 'w', newline='', encoding='utf-8') as f:
        fieldnames = ['name','folder','wrote','hasImage','appid','steamUrl']
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for r in out_rows:
            writer.writerow(r)

    print(f"Wrote {len(out_rows)} info.txt files and summary to {OUT_SUMMARY}")

if __name__ == '__main__':
    main()
