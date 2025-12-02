import json
import re

with open("docs/asset/Game/_epic_game_list copy.json", "r", encoding="utf-8") as f:
    data = json.load(f)

games_out = []

for game in data:
    name = game.get("app_title") or game.get("app_name")
    metadata = game.get("metadata", {})

    # Create safe slug for Epic store URL
    slug = name.lower()
    slug = re.sub(r"[^\w\s-]", "", slug)
    slug = slug.replace(" ", "-")
    epic_link = f"https://store.epicgames.com/en-US/p/{slug}"

    # Description
    description = metadata.get("description", "")

    # Pull image URL from keyImages (prefer DieselGameBox type)
    key_images = metadata.get("keyImages", [])
    image_url = ""
    for img in key_images:
        if img.get("type") == "DieselGameBox":
            image_url = img.get("url")
            break
    # fallback to first image if DieselGameBox not found
    if not image_url and key_images:
        image_url = key_images[0].get("url", "")

    # Build final game entry
    game_entry = {
        "name": name,
        "description": description,
        "image": image_url,
        "primary_store": "epic",
        "primary_link": epic_link,
        "storefronts": [
            {
                "store": "epic",
                "url": epic_link
            }
        ]
    }

    games_out.append(game_entry)

# Write output JSON
with open("epic_games_formatted.json", "w", encoding="utf-8") as f:
    json.dump(games_out, f, indent=2, ensure_ascii=False)

print("Epic games formatted successfully with images!")
