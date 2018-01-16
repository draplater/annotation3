import json
import os
import re

base_dir = "./cpb3.0/data/frames/"
mapping = {}
for file_name in os.listdir(base_dir):
    if not file_name.endswith(".xml"):
        continue
    full_name = base_dir + file_name
    with open(full_name) as f:
        content = f.read()
    lexicon = re.findall(r"<id>(.*?)</id>", content)[0].strip()
    framesets = re.findall(r"<frameset.*?</frameset>", content, re.DOTALL)
    mapping[lexicon] = {"file": os.path.basename(full_name), "framesets": framesets}

print(mapping)
with open("mapping.json", "w") as f:
  json.dump(mapping, f)
