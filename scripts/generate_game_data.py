import json
import os
import sys
import re
from difflib import SequenceMatcher

PRIORITY = [
    "other",
    "steam",
    "itchIo",
    "epicGames",
    "xbox",
    "nintendo",
    "playstation",
    "newgrounds",
    "gog",
]

def choose_primary(store_urls: dict):
    for key in PRIORITY:
        for k in store_urls:
            if k.lower() == key.lower() and store_urls.get(k):
                return (k, store_urls.get(k))
    for k, v in store_urls.items():
        if v:
            return (k, v)
    return (None, "")

def find_best_match(game_name, dir_list):
    best_match = None
    highest_ratio = 0.0
    # A threshold to consider a match as valid
    match_threshold = 0.7

    # First, try to find an exact match (case-insensitive, ignoring spaces and special chars)
    sanitized_game_name = re.sub(r'[^\w]', '', game_name).lower()
    for dir_name in dir_list:
        sanitized_dir_name = re.sub(r'[^\w]', '', dir_name).lower()
        if sanitized_game_name == sanitized_dir_name:
            return dir_name

    # If no exact match, find the best partial match
    for dir_name in dir_list:
        ratio = SequenceMatcher(None, game_name, dir_name).ratio()
        if ratio > highest_ratio:
            highest_ratio = ratio
            best_match = dir_name

    if highest_ratio >= match_threshold:
        return best_match

    # Final fallback: check for partial match where game name starts with dir name
    for dir_name in dir_list:
        sanitized_dir_name = re.sub(r'[^\w]', '', dir_name).lower()
        if sanitized_game_name.startswith(sanitized_dir_name):
            return dir_name

    return None

def generate_game_data(game_list_path):
    if not os.path.exists(game_list_path):
        print(f"Error: Game list file not found: {game_list_path}")
        return

    with open(game_list_path, "r", encoding="utf-8") as f:
        game_names_from_file = [line.strip() for line in f if line.strip()]

    games = []
    game_dir = "docs/asset/Game"
    if not os.path.isdir(game_dir):
        print(f"Game dir not found: {game_dir}")
        return

    available_dirs = [d for d in os.listdir(game_dir) if os.path.isdir(os.path.join(game_dir, d))]

    for game_name in game_names_from_file:
        matched_dir = find_best_match(game_name, available_dirs)

        if not matched_dir:
            print(f"Warning: No matching game directory found for '{game_name}'. Skipping.")
            continue

        game_path = os.path.join(game_dir, matched_dir)
        meta_path = os.path.join(game_path, "meta.json")

        if not os.path.exists(meta_path):
            print(f"Warning: meta.json not found for '{game_name}'. Skipping.")
            continue

        try:
            with open(meta_path, "r", encoding="utf-8") as f:
                meta = json.load(f)
        except Exception as e:
            print(f"Error reading meta.json for '{game_name}': {e}. Skipping.")
            continue

        description = meta.get("description") or ""

        image_file = None
        preferred = os.path.join(game_path, "cover.jpg")
        if os.path.exists(preferred):
            image_file = "cover.jpg"
        else:
            for file in os.listdir(game_path):
                if file.lower().endswith((".png", ".jpg", ".jpeg", ".gif")):
                    image_file = file
                    break

        image_path = f"/asset/Game/{matched_dir}/{image_file}" if image_file else ""

        store_urls = meta.get("storeUrl") or {}
        primary_store, primary_link = choose_primary(store_urls)

        storefronts = []
        for k, v in store_urls.items():
            if not v:
                continue
            storefronts.append({"store": k, "url": v})

        games.append(
            {
                "name": meta.get("name") or game_name,
                "description": description,
                "image": image_path,
                "primary_store": primary_store or "",
                "primary_link": primary_link or "",
                "storefronts": storefronts,
            }
        )

    out_dir = os.path.join("docs", "assets", "data")
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "games.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(games, f, indent=2, ensure_ascii=False)

    print(f"Successfully generated games.json with {len(games)} games.")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python generate_game_data.py <path_to_game_list_file>")
    else:
        generate_game_data(sys.argv[1])
