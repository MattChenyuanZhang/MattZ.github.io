"""Extract equal-size transparent animation frames; preserve a shared world scale."""
from pathlib import Path
from PIL import Image
import json
root=Path(__file__).resolve().parents[1]
out=root/'assets/garden-sequences'
variants=[('tree-sage','tree-sage.png','tree'),('flower-cosmos','flower-cosmos.png','flower'),
          ('tree-willow','tree-willow-v2.png','tree'),('flower-ivory','flower-ivory.png','flower')]
manifest=[]
for name,source,kind in variants:
    im=Image.open(out/'source'/source).convert('RGBA')
    assert im.size==(1536,1024)
    entry={'id':name,'kind':kind,'frames':[]}
    for i in range(8):
        col,row=i%4,i//4
        tile=im.crop((col*384,row*512,(col+1)*384,(row+1)*512))
        a=tile.getchannel('A')
        # Strong pigment identifies the root; ignore diffuse translucent watercolor wash.
        box=a.point(lambda value:255 if value>200 else 0).getbbox()
        assert box,(name,i)
        bottom=box[3]-1
        points=[x for y in range(max(box[1],bottom-6),bottom+1)
                for x in range(box[0],box[2]) if a.getpixel((x,y))>200]
        anchor=sorted(points)[len(points)//2] if points else (box[0]+box[2])/2
        dest=out/name;dest.mkdir(exist_ok=True)
        file=dest/f'{i}.webp';tile.save(file,'WEBP',quality=86,method=6)
        entry['frames'].append({'anchor':[anchor,bottom],'size':[384,512],'bytes':file.stat().st_size})
    manifest.append(entry)
(out/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
p=root/'garden-sequences.js';s=p.read_text();start=s.index('  const VARIANTS = ');end=s.index('\n  const connection',start)
s=s[:start]+'  const VARIANTS = '+json.dumps(manifest,separators=(',',':'))+';'+s[end:];p.write_text(s)
print(f"Prepared {len(manifest)*8} alpha WebP frames; {sum(f['bytes'] for v in manifest for f in v['frames']):,} bytes total",flush=True)
