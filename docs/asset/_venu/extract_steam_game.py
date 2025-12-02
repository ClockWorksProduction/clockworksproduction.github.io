import json
import urllib.request

API_KEY = "69DEE71CF152089BD5B6C405731190C4"
STEAMID = "76561198098109174"

url = (
    "https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/"
    f"?key={API_KEY}&steamid={STEAMID}"
    "&include_appinfo=1&include_played_free_games=1&format=json"
)

with urllib.request.urlopen(url) as response:
    data = json.loads(response.read().decode())

games = []
for g in data.get("response", {}).get("games", []):
    appid = g.get("appid")
    name = g.get("name")
    store_link = f"https://store.steampowered.com/app/{appid}/"
    games.append({
        "name": name,
        "appid": appid,
        "store_link": store_link,
        "playtime_minutes": g.get("playtime_forever", 0)
    })

print(json.dumps(games, indent=2, ensure_ascii=False))
