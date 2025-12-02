def add_game_to_list(filename, new_game_data):
    try:
        with open(filename, 'r+') as f:
            game_list = json.load(f)
            
            # Check if the game already exists
            for game in game_list:
                if game.get('name') == new_game_data.get('name') and game.get('store_link') == new_game_data.get('store_link'):
                    print(f"'{new_game_data.get('name')}' already in '{filename}' with the same link. Skipping.")
                    return

            # If not, add it
            game_list.append(new_game_data)
            f.seek(0) # rewind
            json.dump(game_list, f, indent=2)
            print(f"Added '{new_game_data.get('name')}' to '{filename}'.")

    except FileNotFoundError:
        with open(filename, 'w') as f:
            json.dump([new_game_data], f, indent=2)
            print(f"Created '{filename}' and added '{new_game_data.get('name')}'.")