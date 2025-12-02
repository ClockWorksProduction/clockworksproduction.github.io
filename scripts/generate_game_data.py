
import json
import os


PRIORITY = [
    'other',
    'steam',
    'itchIo',
    'epicGames',
    'xbox',
    'nintendo',
    'playstation',
    'newgrounds',
    'gog'
]


def choose_primary(store_urls: dict):
    # return (store_key, url) or (None, '')
    for key in PRIORITY:
        # handle key variations (case-insensitive)
        for k in store_urls:
            if k.lower() == key.lower() and store_urls.get(k):
                return (k, store_urls.get(k))
    # fallback: any non-empty
    for k, v in store_urls.items():
        if v:
            return (k, v)
    return (None, '')


def generate_game_data():
    games = []
    game_dir = "docs/asset/Game"
    if not os.path.isdir(game_dir):
        print(f"Game dir not found: {game_dir}")
        return

    for game_name in sorted(os.listdir(game_dir)):
        game_path = os.path.join(game_dir, game_name)
        if not os.path.isdir(game_path):
            continue

        meta_path = os.path.join(game_path, 'meta.json')
        if not os.path.exists(meta_path):
            # skip folders without meta
            continue

        try:
            with open(meta_path, 'r', encoding='utf-8') as f:
                meta = json.load(f)
        except Exception:
            continue

        description = meta.get('description') or ''

        # find an image file (prefer cover.jpg)
        image_file = None
        preferred = os.path.join(game_path, 'cover.jpg')
        if os.path.exists(preferred):
            image_file = 'cover.jpg'
        else:
            for file in os.listdir(game_path):
                if file.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')):
                    image_file = file
                    break

        image_path = f"/asset/Game/{game_name}/{image_file}" if image_file else ''

        store_urls = meta.get('storeUrl') or {}
        primary_store, primary_link = choose_primary(store_urls)

        # build storefronts list of remaining links
        storefronts = []
        for k, v in store_urls.items():
            if not v:
                continue
            if k == primary_store:
                continue
            storefronts.append({'store': k, 'url': v})

        games.append({
            'name': meta.get('name') or game_name,
            'description': description,
            'image': image_path,
            'primary_store': primary_store or '',
            'primary_link': primary_link or '',
            'storefronts': storefronts
        })

    out_dir = os.path.join('docs', 'assets', 'data')
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, 'games.json')
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(games, f, indent=2, ensure_ascii=False)


if __name__ == '__main__':
    generate_game_data()
