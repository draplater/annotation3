import json
import re

with open("verb_frame_mapping_hq.xml") as f:
    content = f.read()

with open("mapping.json", "r") as f:
  mapping = json.load(f)

with open("linziverblinux", "r") as f:
    verb_by_freq = list(i.strip().split(" ")[-1] for i in f)

verb_to_frames = {}
records = []
verbs = re.findall(r"<Verb.*?</Verb>", content, re.DOTALL)
print("Verbs Count:")
print(len(verbs))
for verb in verbs:
    verb_name = re.findall(r"VerbName = \"(.*?)\"", verb)[0]
    frames = re.findall(r"<Frame>(.*?)</Frame>", verb)
    verb_to_frames[verb_name] = frames
    # for idx, frameset in enumerate(framesets, 1):
    #     records.append((verb_name, fs["file"], idx, frameset))

for verb in verb_by_freq:
    if verb in verb_to_frames.keys():
        fs = mapping[verb]
        framesets = fs["framesets"]
        for idx, frameset in enumerate(framesets, 1):
            records.append((verb, fs["file"], idx, frameset))

with open("verb_to_frames.json", "w") as f:
    json.dump(verb_to_frames, f)

with open("records.json", "w") as f:
    json.dump(records, f)

print("Record count:")
print(len(records))
