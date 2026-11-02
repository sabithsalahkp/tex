/* ANAAKA image loading: only a soft shimmer while photos load. No SVG placeholders. */
(()=>{
 const prepare=(root=document)=>{
  const imgs=[];
  if(root instanceof HTMLImageElement)imgs.push(root);
  if(root.querySelectorAll)imgs.push(...root.querySelectorAll('img'));
  for(const img of imgs){
   if(img.dataset.photoTracked==='1')continue;
   const original=img.getAttribute('src')||'';
   const photoId=(original.match(/photo-[0-9a-z-]+/)||[])[0];
   const localId=original.includes('myfashionroad.com')?'editorial-women':original.includes('mumkins.in')?'editorial-kids':photoId;
   if(localId && window.ANAAKA_DOWNLOADED_MEDIA?.[localId]) img.setAttribute('src',window.ANAAKA_DOWNLOADED_MEDIA[localId]);
   img.dataset.photoTracked='1';
   img.classList.add('photo-loading');
   img.addEventListener('load',()=>{
    img.classList.remove('photo-loading','photo-failed');
    img.classList.add('photo-ready');
   });
   img.addEventListener('error',()=>{
    img.classList.remove('photo-loading','photo-ready');
    img.classList.add('photo-failed');
   });
   if(img.complete && img.currentSrc && img.naturalWidth>0){
    img.classList.remove('photo-loading');img.classList.add('photo-ready');
   } else if(img.complete && img.getAttribute('src') && img.naturalWidth===0){
    img.classList.remove('photo-loading');img.classList.add('photo-failed');
   }
  }
 };
 document.addEventListener('DOMContentLoaded',()=>prepare());
 window.anaakaPhotos={prepare};
})();
