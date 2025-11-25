
import json
import os

def generate_game_data():
    games = []
    game_dir = "docs/asset/Game"
    for game_name in os.listdir(game_dir):
        game_path = os.path.join(game_dir, game_name)
        if os.path.isdir(game_path):
            info_path = os.path.join(game_path, "info.txt")
            if os.path.exists(info_path):
                with open(info_path, "r") as f:
                    description = f.read().strip()
                
                # Find the image file
                image_file = None
                for file in os.listdir(game_path):
                    if file.lower().endswith((".png", ".jpg", ".jpeg", ".gif")):
                        image_file = file
                        break

                if image_file:
                    games.append({
                        "name": game_name,
                        "description": description,
                        "image": f"/asset/Game/{game_name}/{image_file}",
                        "link": f"https://store.steampowered.com/search/?term={game_name.replace(' ', '+')}" # Basic link, can be improved
                    })

    with open("docs/assets/data/games.json", "w") as f:
        json.dump(games, f, indent=4)

if __name__ == "__main__":
    generate_game_data()
