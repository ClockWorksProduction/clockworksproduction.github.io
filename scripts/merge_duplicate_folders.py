
import os
import json
import shutil

def merge_meta_files(file1, file2, merged_file_path):
    with open(file1, 'r') as f1, open(file2, 'r') as f2:
        meta1 = json.load(f1)
        meta2 = json.load(f2)

    # Prioritize the meta file that has more information
    if len(str(meta1)) < len(str(meta2)):
        meta1, meta2 = meta2, meta1

    # Merge store URLs
    for store, url in meta2.get('storeUrl', {}).items():
        if url and not meta1.get('storeUrl', {}).get(store):
            if 'storeUrl' not in meta1:
                meta1['storeUrl'] = {}
            meta1['storeUrl'][store] = url
    
    # you can add more merge logic here if needed

    with open(merged_file_path, 'w') as f_merged:
        json.dump(meta1, f_merged, indent=2)

def merge_duplicate_folders():
    game_dir = 'docs/asset/Game/'
    files = os.listdir(game_dir)
    
    # Create a dictionary to keep track of folder names and their variants
    folder_map = {}
    for f in files:
        if os.path.isdir(os.path.join(game_dir, f)):
            # Normalize folder name by removing spaces and underscores
            normalized_name = f.replace(' ', '').replace('_', '').lower()
            if normalized_name not in folder_map:
                folder_map[normalized_name] = []
            folder_map[normalized_name].append(f)

    for normalized_name, folder_names in folder_map.items():
        if len(folder_names) > 1:
            print(f"Found duplicate folders for: {normalized_name}")
            # Choose the first folder as the one to keep
            keep_folder = os.path.join(game_dir, folder_names[0])
            
            for i in range(1, len(folder_names)):
                delete_folder = os.path.join(game_dir, folder_names[i])
                print(f"  Merging '{delete_folder}' into '{keep_folder}'")

                # Merge meta.json files
                keep_meta = os.path.join(keep_folder, 'meta.json')
                delete_meta = os.path.join(delete_folder, 'meta.json')
                if os.path.exists(keep_meta) and os.path.exists(delete_meta):
                    print("    Merging meta.json files...")
                    merged_meta_path = os.path.join(keep_folder, 'meta.json') # will overwrite the keep_meta
                    merge_meta_files(keep_meta, delete_meta, merged_meta_path)
                elif os.path.exists(delete_meta) and not os.path.exists(keep_meta):
                    shutil.move(delete_meta, keep_folder)

                # Move other files
                for filename in os.listdir(delete_folder):
                    if filename != 'meta.json':
                        src_file = os.path.join(delete_folder, filename)
                        dest_file = os.path.join(keep_folder, filename)
                        if not os.path.exists(dest_file):
                            print(f"    Moving '{filename}'...")
                            shutil.move(src_file, keep_folder)
                
                # Delete the merged folder
                print(f"  Deleting folder '{delete_folder}'...")
                shutil.rmtree(delete_folder)

merge_duplicate_folders()
