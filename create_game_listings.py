
import json
import os
import re
import urllib.request

epic_games_json = '''
[
    {
        "metadata": {
            "id": "492c84173fe34b009af51e739caba636",
            "title": "Amnesia: The Bunker",
            "description": "Amnesia: The Bunker is a first-person horror game set in a desolate WW1 Bunker.\n\nFace the oppressing terrors stalking in the dark. Search for and use the tools and weapons at your disposal. Keep the lights on at all costs and make your way out alive.",
            "keyImages": [
                {
                    "type": "DieselGameBox",
                    "url": "https://cdn1.epicgames.com/spt-assets/671aee4c8fb64a1c967d97f31f093e7a/amnesia-the-bunker-lyyfp.png"
                }
            ],
            "developer": "Frictional Games",
            "customAttributes": {
                "FolderName": {
                    "type": "STRING",
                    "value": "amnesia-the-bunker"
                }
            }
        }
    },
    {
        "metadata": {
            "id": "91fdd636e8a443b3b354dfc532be5f51",
            "title": "Backpack Hero",
            "description": "The inventory management roguelike! Collect rare items, organize your backpack, and vanquish your foes!",
            "keyImages": [
                {
                    "type": "DieselGameBox",
                    "url": "https://cdn1.epicgames.com/spt-assets/da842a6b6e324c39b54b16910856bdb3/backpack-hero-1jin1.jpg"
                }
            ],
            "developer": "Pretty Soon S.A.",
            "customAttributes": {
                "FolderName": {
                    "type": "STRING",
                    "value": "backpack-hero"
                }
            }
        }
    }
]
'''

other_games_json = '''
[
    {
        "name": "War Thunder",
        "storeUrl": "https://warthunder.com/en/"
    },
    {
        "name": "Kerbal Space Program",
        "storeUrl": "https://www.kerbalspaceprogram.com/en/"
    }
]
'''

steam_games_json = '''
[
  {
    "name": "DOOM + DOOM II",
    "appid": 2280,
    "store_link": "https://store.steampowered.com/app/2280/"
  },
  {
    "name": "DOOM II",
    "appid": 2300,
    "store_link": "https://store.steampowered.com/app/2300/"
  }
]
'''

epic_games = json.loads(epic_games_json)
other_games = json.loads(other_games_json)
steam_games = json.loads(steam_games_json)

all_games = {}

# Process Epic Games
for game in epic_games:
    title = game['metadata']['title']
    sanitized_title = re.sub(r'[^a-zA-Z0-9 ]', '', title).replace(' ', '_').lower()
    if sanitized_title not in all_games:
        all_games[sanitized_title] = {
            'title': title,
            'description': game['metadata']['description'],
            'developer': game['metadata']['developer'],
            'epic_url': f"https://www.epicgames.com/store/en-US/p/{game['metadata']['customAttributes']['FolderName']['value']}",
            'steam_url': '',
            'other_url': '',
            'cover_image_url': next((img['url'] for img in game['metadata']['keyImages'] if img['type'] == 'DieselGameBox'), None)
        }

# Process Steam Games
for game in steam_games:
    title = game['name']
    sanitized_title = re.sub(r'[^a-zA-Z0-9 ]', '', title).replace(' ', '_').lower()
    if sanitized_title in all_games:
        all_games[sanitized_title]['steam_url'] = game['store_link']
    else:
        all_games[sanitized_title] = {
            'title': title,
            'description': '',
            'developer': '',
            'epic_url': '',
            'steam_url': game['store_link'],
            'other_url': '',
            'cover_image_url': None
        }

# Process Other Games
for game in other_games:
    title = game['name']
    sanitized_title = re.sub(r'[^a-zA-Z0-9 ]', '', title).replace(' ', '_').lower()
    if sanitized_title in all_games:
        all_games[sanitized_title]['other_url'] = game['storeUrl']
    else:
        all_games[sanitized_title] = {
            'title': title,
            'description': '',
            'developer': '',
            'epic_url': '',
            'steam_url': '',
            'other_url': game['storeUrl'],
            'cover_image_url': None
        }

# Create directories and files
for sanitized_title, game_data in all_games.items():
    game_dir = f"clockworksproduction.github.io/docs/asset/Game/{sanitized_title}"
    os.makedirs(game_dir, exist_ok=True)

    # Create meta.json
    meta_content = {
        "title": game_data['title'],
        "developer": game_data['developer'],
        "description_source": "Game press kit or store page",
        "store_links": {
            "epic": game_data['epic_url'],
            "steam": game_data['steam_url'],
            "other": game_data['other_url']
        }
    }
    with open(f"{game_dir}/meta.json", 'w') as f:
        json.dump(meta_content, f, indent=4)

    # Create synopsis.txt
    with open(f"{game_dir}/synopsis.txt", 'w') as f:
        f.write(game_data['description'])

    # Download cover image
    if game_data['cover_image_url']:
        try:
            image_url = game_data['cover_image_url']
            image_ext = os.path.splitext(image_url)[1]
            if not image_ext:
                image_ext = '.jpg' # default extension
            image_path = f"{game_dir}/cover_img{image_ext}"
            urllib.request.urlretrieve(image_url, image_path)
            print(f"Downloaded cover for {game_data['title']}")
        except Exception as e:
            print(f"Could not download cover for {game_data['title']}: {e}")

print("Game listings created successfully.")
