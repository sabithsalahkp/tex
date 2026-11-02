ANAAKA Designer Boutique V13 — distinct catalogue photographs

Open index.html to explore the website. All 20 category cards and all 80
product listings now have separate, non-repeating source photo IDs.

IMPORTANT: Photos cannot be downloaded inside the website-building environment,
so this ZIP contains an image manifest and downloader, NOT the full photo files.
Until you run the downloader with an internet connection, the website loads
these images from their original online URLs, just as V12 did.

Windows image download (uses built-in PowerShell; no Python required):
1. Extract the ZIP.
2. Open anaaka-site and double-click DOWNLOAD-PHOTOS-WINDOWS.bat.
   Wait for the summary; it reports any failed downloads.
3. Check that assets/catalog contains the downloaded .jpg/.webp files.
4. Open index.html, or publish the entire anaaka-site folder to your host.

For macOS/Linux, run: python3 download-photos.py

The downloader prevents identical image files being assigned to two products.
If a source URL is unavailable, that image stays online; failures are reported.
For an actual store, replace these example stock photographs with ANAAKA's own
photographs and real SKU/color-specific variants. This is still a demo shop.
Third-party retailer photos used as editorial images may require permission.
