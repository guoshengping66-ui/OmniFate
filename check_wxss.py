#!/usr/bin/env python3
with open('miniprogram/dist/app.wxss', 'r', encoding='utf-8') as f:
    content = f.read()

print(f"File size: {len(content)} chars")

# Find backslash positions
positions = [i for i, ch in enumerate(content) if ch == chr(92)]
print(f"Total backslashes: {len(positions)}")
for pos in positions[:20]:
    start = max(0, pos - 40)
    end = min(len(content), pos + 40)
    ctx = content[start:end].replace('\n', '\\n')
    print(f"\nPos {pos}: ...{ctx}...")
