import urllib.request, json

# Let's search drone group (group 158 / 159 / etc. or drone market groups)
# Let's inspect market groups for Drones, Modules, Rigs
groups = json.loads(urllib.request.urlopen('https://esi.evetech.net/latest/markets/groups/').read().decode())

def search_group(gid):
    try:
        g = json.loads(urllib.request.urlopen(f'https://esi.evetech.net/latest/markets/groups/{gid}/').read().decode())
        name = g.get('name', '')
        types = g.get('types', [])
        if types:
            for t in types:
                try:
                    t_data = json.loads(urllib.request.urlopen(f'https://esi.evetech.net/latest/universe/types/{t}/').read().decode())
                    tname = t_data.get('name', '')
                    if any(x in tname for x in ['Hobgoblin', 'Hammerhead', 'Valkyrie', 'Warp Disruptor', 'Shield Booster', 'Tracking Enhancer', 'Core Defense Field Extender', 'Trimark Armor Pump']):
                        print(f"Group {gid} ({name}) -> ID {t}: {tname}")
                except:
                    pass
        for sub in g.get('subgroups', []):
            search_group(sub)
    except:
        pass

for gid in groups:
    search_group(gid)
