import urllib.request, json

req = urllib.request.Request('https://esi.evetech.net/latest/markets/groups/', headers={'User-Agent': 'EVE-Industry-Profit-Calculator'})
root_groups = json.loads(urllib.request.urlopen(req).read().decode())

def search_groups(gids, target_names):
    found = {}
    queue = list(gids)
    visited = set()
    while queue and len(found) < len(target_names):
        gid = queue.pop(0)
        if gid in visited:
            continue
        visited.add(gid)
        try:
            r = urllib.request.Request(f'https://esi.evetech.net/latest/markets/groups/{gid}/', headers={'User-Agent': 'EVE-Industry-Profit-Calculator'})
            g = json.loads(urllib.request.urlopen(r).read().decode())
            if 'subgroups' in g:
                queue.extend(g['subgroups'])
            for t in g.get('types', []):
                try:
                    tr = urllib.request.Request(f'https://esi.evetech.net/latest/universe/types/{t}/', headers={'User-Agent': 'EVE-Industry-Profit-Calculator'})
                    t_data = json.loads(urllib.request.urlopen(tr).read().decode())
                    tname = t_data.get('name', '')
                    for tn in target_names:
                        if tn.lower() == tname.lower():
                            found[tn] = t
                            print(f"FOUND {tn} -> ID {t}")
                except:
                    pass
        except:
            pass
    return found

targets = [
    "Warp Disruptor II",
    "Damage Control II",
    "Medium Shield Booster II",
    "Tracking Enhancer II",
    "Medium Core Defense Field Extender I",
    "Large Trimark Armor Pump I",
    "Hobgoblin II",
    "Valkyrie II"
]

res = search_groups(root_groups, targets)
print("Results:", res)

