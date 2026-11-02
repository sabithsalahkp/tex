#!/usr/bin/env python3
"""Download ANAAKA catalogue photos to this folder, preserving unique images.

Run with internet access on your computer: python download-photos.py
No third-party packages required. Unavailable remote photos remain linked online.
"""
import json, time, hashlib, urllib.request, urllib.error
from pathlib import Path
HERE=Path(__file__).resolve().parent
manifest=json.loads((HERE/'catalog-download-manifest.json').read_text(encoding='utf-8'))
existing={}
mapfile=HERE/'downloaded-media.js'
seen={}
fail=[]
for n,(key,item) in enumerate(manifest.items(),start=1):
 dest=HERE/item['file'];dest.parent.mkdir(parents=True,exist_ok=True)
 try:
  if dest.exists() and dest.stat().st_size>2000:
   data=dest.read_bytes()
  else:
   data=None
   for attempt in range(3):
    try:
     req=urllib.request.Request(item['url'],headers={'User-Agent':'Mozilla/5.0 (ANAAKA catalogue asset downloader)','Accept':'image/avif,image/webp,image/*,*/*;q=0.8'})
     with urllib.request.urlopen(req,timeout=22) as response:
      data=response.read(8_000_000)
     break
    except Exception:
     if attempt<2:time.sleep(1.5*(attempt+1))
     else: raise
  assert len(data)>2000,'Empty or invalid image'
  assert data[:3]==b'\xff\xd8\xff' or data[:4]==b'RIFF' or data[:8]==b'\x89PNG\r\n\x1a\n','Invalid image format'
  sha=hashlib.sha256(data).hexdigest()
  if sha in seen and seen[sha]!=key:
   raise RuntimeError('duplicate image content; not saved')
  seen[sha]=key
  dest.write_bytes(data)
  existing[key]=item['file']
  print(f'[{n:03d}/{len(manifest)}] OK {key} ({len(data)//1024} KB)')
 except Exception as exc:
  fail.append(key)
  print(f'[{n:03d}/{len(manifest)}] FAILED {key}: {exc}')
 # Save a working partial map even if interrupted.
 mapfile.write_text('window.ANAAKA_DOWNLOADED_MEDIA='+json.dumps(existing,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
print(f'Completed: {len(existing)} unique local photographs; {len(fail)} unavailable.')
if fail:
 print('Unavailable images will use their original online URL until rerun.')
