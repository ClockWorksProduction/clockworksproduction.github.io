
import re
import json

def extract_url(cell):
    match = re.search(r'\[.*\]\((.*)\)', cell)
    if match:
        url = match.group(1)
        # Clean up the URL by removing the google search prefix if it exists
        if "google.com/search?q=" in url:
            url = url.split("q=")[1]
        return url
    elif "N/A" in cell:
        return None
    elif "http" not in cell:
        return None
    else:
        return cell

def parse_and_update():
    store_map = {
        'Steam Link': '_steam_game_list.json',
        'GOG Link': '_gog_game_list.json',
        'Epic Games Link': '_epic_game_list.json',
        'Itch.io Link': '_itch_game_list.json'
    }

    with open('docs/asset/Game/games.md', 'r') as f:
        content = f.read()

    # Use a more robust regex to handle tables
    tables = re.findall(r'\|([^\n]+)\|\n\|((?:[\s\|:-]+))\|\n((?:\|[^\n]+\|\n)+)', content)

    for header_str, _, rows_str in tables:
        header = [h.strip() for h in header_str.split('|') if h.strip()]
        rows = [r for r in rows_str.strip().split('\n') if r.strip()]

        for row in rows:
            row_data = [d.strip() for d in row.split('|')][1:-1]  # remove empty start and end

            if not row_data:
                continue

            game_name = row_data[0].replace('**', '').strip()

            for i, cell in enumerate(row_data):
                if i == 0: continue  # skip game title

                if i >= len(header): continue # if row has more columns than header

                store_header = header[i]
                if store_header in store_map:
                    filename = f"docs/asset/Game/{store_map[store_header]}"
                    url = extract_url(cell)

                    if url:
                        new_game_data = {
                            "name": game_name,
                            "storeUrl": url
                        }

                        try:
                            with open(filename, 'r+') as f:
                                try:
                                    game_list = json.load(f)
                                except json.JSONDecodeError:
                                    game_list = []

                                # Check if the game already exists
                                found = False
                                for game in game_list:
                                    if game.get('name') == game_name:
                                        # Game with same name exists, check if url is the same
                                        if game.get('storeUrl') == url:
                                            print(f"'{game_name}' already in '{filename}' with the same link. Skipping.")
                                            found = True
                                            break
                                
                                if not found:
                                    # Check for game with same name but different URL and update it
                                    for game in game_list:
                                        if game.get('name') == game_name:
                                            game['storeUrl'] = url
                                            print(f"Updated URL for '{game_name}' in '{filename}'.")
                                            found = True
                                            break

                                    if not found:
                                        game_list.append(new_game_data)
                                        print(f"Added '{game_name}' to '{filename}'.")

                                f.seek(0)
                                f.truncate()
                                json.dump(game_list, f, indent=2)

                        except FileNotFoundError:
                            with open(filename, 'w') as f:
                                json.dump([new_game_data], f, indent=2)
                                print(f"Created '{filename}' and added '{game_name}'.")

parse_and_update()
