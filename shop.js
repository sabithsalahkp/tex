const W=[['Bridal Wear'],['Sarees'],['Pardhas & Abayas'],['Sportswear'],['Party Wear'],['Kurtis & Sets'],['Gowns'],['Casual Wear'],['Co-ord Sets'],['Ethnic Wear']].map((n,i)=>[n[0],window.ANAAKA_CATALOG.women[i][0]]);
const K=[['Party Wear'],['Girls Dresses'],['Boys Occasion Wear'],['Kids Ethnic Wear'],['Casual Wear'],['Baby Wear'],['Festive Wear'],['Kids Sportswear'],['Sibling Sets'],['Kids Winterwear']].map((n,i)=>[n[0],window.ANAAKA_CATALOG.kids[i][0]]);
const mainEditorial={women:window.ANAAKA_EDITORIAL_URL('women'),kids:window.ANAAKA_EDITORIAL_URL('kids')};
const all={women:W,kids:K},img=(id,w=720)=>window.ANAAKA_IMAGE_URL(id,w),main=document.getElementById('shopMain'),params=()=>new URLSearchParams(location.search),url=(page,o={})=>'?'+new URLSearchParams({page,...o});
const loadingPhotos=new Map();
function preloadPhoto(src){
 if(loadingPhotos.has(src))return loadingPhotos.get(src);
 const promise=new Promise(resolve=>{
  const probe=new Image();let done=false;
  const finish=ok=>{if(done)return;done=true;clearTimeout(timeout);resolve(ok?src:null)};
  const timeout=setTimeout(()=>finish(false),7000);
  probe.onload=()=>finish(true);
  probe.onerror=()=>finish(false);
  probe.decoding='async';probe.src=src;
 });
 loadingPhotos.set(src,promise);
 if(loadingPhotos.size>160)loadingPhotos.delete(loadingPhotos.keys().next().value);
 return promise;
}
function imagePending(node){
 if(!node)return;
 node.removeAttribute('src');
 node.classList.remove('photo-ready','photo-failed');
 node.classList.add('photo-loading');
}
function imageResolved(node,src){
 if(!node||!node.isConnected)return;
 if(src){node.src=src;}
 else{node.classList.remove('photo-loading','photo-ready');node.classList.add('photo-failed');}
}

let cart=[];try{cart=JSON.parse(localStorage.getItem('anaaka-cart')||'[]')}catch{}if(!Array.isArray(cart))cart=[];
const colors=['Black','Ivory','Red','Green','Rose','Navy'],sizes={women:['XS','S','M','L','XL','XXL'],kids:['2–3 Y','4–5 Y','6–7 Y','8–9 Y','10–12 Y']};
const itemPhotos={women:window.ANAAKA_CATALOG.women.map(row=>row.slice(1)),kids:window.ANAAKA_CATALOG.kids.map(row=>row.slice(1))};
const photo=(g,i)=>window.ANAAKA_CATALOG[g][i][0];
const galleryPositions=['center','center 20%','center 70%','30% center','70% center'];
function galleryFor(g,i,v,color){
 const c=colors.includes(color)?color:'Black';
 const id=itemPhotos[g][i][v];
 return galleryPositions.map((position,k)=>({
  // One product uses only its own source photo, never another product's image.
  // These are alternate crops; genuine colour-specific SKU photos must be supplied separately.
  src:img(id,k===0?900:840)+(window.ANAAKA_DOWNLOADED_MEDIA?.[id]?'':`&crop=${['center','top','bottom','left','right'][k]}`),
  alt:`${all[g][i][0]} · view ${k+1}`,
  position
 }));
}
let activeColour=null,activeGalleryIndex=0;
function safeHtml(s){return String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
function errorText(message,kind){const f=document.getElementById('feedback');if(f){f.textContent=message;f.classList.add('form-warning');f.setAttribute('role','alert');}if(kind){const box=document.querySelector(`[data-choice="${kind}"]`);box?.classList.add('choice-error');box?.scrollIntoView({block:'nearest',behavior:'smooth'});box?.querySelector('button')?.focus({preventScroll:true});}}
function clearErrors(){document.getElementById('feedback')?.classList.remove('form-warning');document.querySelectorAll('.choice-error').forEach(n=>n.classList.remove('choice-error'));const f=document.getElementById('feedback');if(f)f.textContent='';}
let galleryRequest=0;
function renderGallery(){
 const q=params(),g=q.get('group')==='kids'?'kids':'women',i=Math.min(9,Math.max(0,Number(q.get('i'))||0)),v=Math.min(3,Math.max(0,Number(q.get('v'))||0));
 const chosen=activeColour||colors[0],entries=galleryFor(g,i,v,chosen);
 const requestId=++galleryRequest;
 activeGalleryIndex=Math.min(activeGalleryIndex,entries.length-1);
 const im=document.getElementById('variantImage'),thumbs=document.getElementById('colourGallery');
 if(im){
  imagePending(im);
  im.alt=entries[activeGalleryIndex].alt;im.style.objectPosition=entries[activeGalleryIndex].position;
  preloadPhoto(entries[activeGalleryIndex].src).then(src=>{
   if(requestId!==galleryRequest||!im.isConnected)return;
   imageResolved(im,src);
   const next=entries[(activeGalleryIndex+1)%entries.length];preloadPhoto(next.src);
  });
 }
 if(thumbs){
  thumbs.innerHTML=entries.map((p,k)=>`<button type="button" class="thumb ${k===activeGalleryIndex?'active':''}" data-gallery-index="${k}" aria-label="View image ${k+1}" aria-pressed="${k===activeGalleryIndex}"><img class="photo-loading" data-remote="${p.src.replace(/w=8[0-9]+/,'w=180')}" alt="${p.alt}" loading="${k>1?'lazy':'eager'}" decoding="async" style="object-position:${p.position}"></button>`).join('');
  window.anaakaPhotos?.prepare(thumbs);
  thumbs.querySelectorAll('img').forEach(node=>{
   preloadPhoto(node.dataset.remote).then(src=>{
    if(requestId!==galleryRequest||!node.isConnected)return;
    imageResolved(node,src);
   });
  });
 }
 const caption=document.getElementById('galleryCaption');
 if(caption)caption.textContent=`${activeGalleryIndex+1} / ${entries.length}`;
}

function selectColour(c){if(!colors.includes(c))return;activeColour=c;activeGalleryIndex=0;document.querySelectorAll('[data-color]').forEach(b=>{let sel=b.dataset.color===c;b.classList.toggle('active',sel);b.setAttribute('aria-pressed',String(sel));});document.getElementById('chosenColor').textContent=c;clearErrors();renderGallery();}
function selectGallery(k){if(!activeColour)return;const q=params(),g=q.get('group')==='kids'?'kids':'women',i=Number(q.get('i'))||0,v=Number(q.get('v'))||0;const len=galleryFor(g,i,v,activeColour).length;activeGalleryIndex=(k+len)%len;renderGallery();}
const product=(g,i,v)=>({group:g,i,v,name:`${all[g][i][0]} · Style ${String(v+1).padStart(2,'0')}`,id:itemPhotos[g][i][v]});
function save(){localStorage.setItem('anaaka-cart',JSON.stringify(cart));document.querySelectorAll('.cart-count').forEach(x=>x.textContent=cart.reduce((n,y)=>n+y.qty,0))}
// Light product-to-cart motion, with a clear success notice and reduced-motion support.
let cartToastTimer=0;
function cartAddedFeedback(button, productName){
 const bag=document.querySelector('.bag-link');
 const target=bag?.querySelector('.anaaka-cart-svg')||bag;
 const notice=document.getElementById('feedback');
 if(notice){notice.textContent='Added to Cart successfully';notice.classList.remove('form-warning','bag-feedback');void notice.offsetWidth;notice.classList.add('bag-feedback');}
 button?.classList.remove('cart-button-added');
 void button?.offsetWidth;
 button?.classList.add('cart-button-added');
 window.setTimeout(()=>button?.classList.remove('cart-button-added'),850);
 const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
 const showNotice=()=>{
  let toast=document.getElementById('anaakaCartToast');
  if(!toast){
   toast=document.createElement('div');toast.id='anaakaCartToast';
   toast.className='cart-success-toast';toast.setAttribute('role','status');toast.setAttribute('aria-live','polite');
   toast.innerHTML='<span class="cart-toast-check" aria-hidden="true">✓</span><span class="cart-toast-copy"><strong>Added to Cart</strong><small></small></span><a href="?page=cart" data-link>View cart</a>';
   document.body.append(toast);
  }
  toast.querySelector('small').textContent=productName;
  toast.classList.remove('is-visible');void toast.offsetWidth;toast.classList.add('is-visible');
  window.clearTimeout(cartToastTimer);
  cartToastTimer=window.setTimeout(()=>toast.classList.remove('is-visible'),3400);
 };
 const popBag=()=>{
  bag?.classList.remove('bag-pop');void bag?.offsetWidth;bag?.classList.add('bag-pop');
  bag?.addEventListener('animationend',()=>bag.classList.remove('bag-pop'),{once:true});
 };
 if(reduced||!target?.getBoundingClientRect||!document.body.animate && !Element.prototype.animate){popBag();showNotice();return;}
 const productImage=document.getElementById('variantImage');
 const imageRect=productImage?.getBoundingClientRect();
 const sourceIsVisible=imageRect&&imageRect.bottom>35&&imageRect.top<innerHeight-35&&imageRect.width>0;
 const source=sourceIsVisible?imageRect:button?.getBoundingClientRect();
 if(!source){popBag();showNotice();return;}
 const destination=target.getBoundingClientRect();
 // Only a loaded product photo travels to the cart; never add an SVG or fallback illustration.
 const isLoaded=productImage?.classList.contains('photo-ready')&&productImage?.naturalWidth>0;
 const flying=document.createElement(isLoaded?'img':'span');
 flying.className='cart-flying-item';
 if(isLoaded){flying.src=productImage.currentSrc||productImage.src;flying.alt='';flying.setAttribute('aria-hidden','true');}
 const w=sourceIsVisible?Math.min(78,Math.max(46,source.width*.25)):48;
 const h=sourceIsVisible?Math.round(w*1.2):48;
 const startX=source.left+source.width/2-w/2,startY=source.top+source.height/2-h/2;
 flying.style.left=`${startX}px`;flying.style.top=`${startY}px`;
 flying.style.width=`${w}px`;flying.style.height=`${h}px`;
 document.body.append(flying);
 const dx=destination.left+destination.width/2-(startX+w/2),dy=destination.top+destination.height/2-(startY+h/2);
 const animation=flying.animate([
  {transform:'translate3d(0,0,0) scale(1)',opacity:1,offset:0},
  {transform:`translate3d(${dx*.42}px,${dy*.38-45}px,0) scale(.84)`,opacity:.95,offset:.48},
  {transform:`translate3d(${dx}px,${dy}px,0) scale(.15)`,opacity:.25,offset:1}
 ],{duration:650,easing:'cubic-bezier(.25,.75,.2,1)',fill:'forwards'});
 let finished=false;
 const done=()=>{if(finished)return;finished=true;flying.remove();popBag();showNotice();};
 animation.addEventListener('finish',done,{once:true});
 animation.addEventListener('cancel',done,{once:true});
 window.setTimeout(done,950);
}

function navigate(to){
  document.getElementById('anaakaCartToast')?.classList.remove('is-visible');
  // Real document navigation must never be intercepted by the shop SPA.
  if (/^(?:index\.html|https?:|\/)/.test(to)) { location.assign(to); return; }
  if (to === location.search) return;
  const depth = Number(history.state?.anaakaDepth || 0);
  history.pushState({anaaka:true,anaakaDepth:depth+1},'',to);
  render(); shopMenu?.classList.remove('open'); shopMenuBtn?.setAttribute('aria-expanded','false'); window.scrollTo(0,0);
}
function back(){
  // Always go to the actual previous page when it exists in this browsing session.
  if (Number(history.state?.anaakaDepth||0)>0){history.back();return;}
  const q=params(),page=q.get('page'),g=q.get('group')==='kids'?'kids':'women';
  if(page==='product')navigate(url('category',{group:g,i:q.get('i')||0}));
  else if(page==='category')navigate(url(g));
  else if(page==='review')navigate(url('checkout'));
  else if(page==='checkout')navigate(url('cart'));
  else if(page==='cart')navigate(url('women'));
  else location.assign('index.html');
}
const backButton=()=>'<button class="shop-back" data-back>← Back</button>';
function catCard(g,i){return `<a class="shop-card category-image-card" href="${url('category',{group:g,i})}" data-link><img loading="lazy" src="${img(photo(g,i),640)}" decoding="async" alt="${all[g][i][0]}"><div class="shop-card-body"><h3>${all[g][i][0]}</h3><span>Explore styles →</span></div></a>`}
function itemCard(g,i,v){const p=product(g,i,v);return `<a class="shop-card" href="${url('product',{group:g,i,v})}" data-link><img loading="lazy" src="${img(p.id,640)}" decoding="async" alt="${p.name}"><div class="shop-card-body"><h3>${p.name}</h3><span>View item →</span></div></a>`}
function render(){const q=params(),page=q.get('page')||'home',g=q.get('group')==='kids'?'kids':'women',i=Math.min(9,Math.max(0,Number(q.get('i'))||0)),v=Math.min(3,Math.max(0,Number(q.get('v'))||0));let h='';document.title=`${page==='home'?'Designer Boutique':page==='product'?all[g][i][0]:page==='kids'?'Kids':page==='women'?'Women':page==='cart'?'Cart':'ANAAKA'} | ANAAKA`;
if(page==='home')h=`<section class="welcome-hero"><div class="welcome-copy"><small>WELCOME TO ANAAKA</small><h1>Made for moments<br><em>that matter.</em></h1><p>At ANAAKA Designer Boutique, we believe that what you wear should reflect who you are. Explore our thoughtfully selected styles for women and children, from statement occasionwear to everyday favourites.</p><a class="shop-primary" href="${url('women')}" data-link>Explore the boutique ↗</a></div><img src="${img('photo-1539109136881-3be0616acf4b',1100)}" alt="Boutique fashion editorial"></section><section class="shop-section"><div class="section-heading"><h2>Discover our edits</h2></div><div class="shop-edits"><a href="${url('women')}" data-link><img src="${mainEditorial.women}" alt="Women's fashion"><div><small>THE WOMEN'S EDIT</small><h2>Women's wear</h2><span>Explore women's wear ↗</span></div></a><a href="${url('kids')}" data-link><img src="${mainEditorial.kids}" alt="Kids fashion"><div><small>THE LITTLE EDIT</small><h2>Kids' wear</h2><span>Explore kids' wear ↗</span></div></a></div></section><section class="shop-section"><div class="section-heading"><h2>Women's favourites</h2><a href="${url('women')}" data-link>Explore all ↗</a></div><div class="shop-grid">${[0,1,2,4].map(i=>catCard('women',i)).join('')}</div></section><section class="shop-section"><div class="section-heading"><h2>Little favourites</h2><a href="${url('kids')}" data-link>Explore all ↗</a></div><div class="shop-grid">${[0,1,2,6].map(i=>catCard('kids',i)).join('')}</div></section><section class="closing-hero"><small>FIND SOMETHING SPECIAL</small><h2>Your next favourite<br><em>look awaits.</em></h2><p>Browse our collections and discover a style that speaks to you.</p><a class="shop-primary" href="${url('women')}" data-link>Browse collections ↗</a></section>`;
else if(page==='women'||page==='kids')h=`<section class="shop-section">${backButton()}<div class="section-heading"><h1>${page==='women'?"Women's wear":"Kids' wear"}</h1><span>Explore categories</span></div><div class="shop-grid">${all[page].map((_,j)=>catCard(page,j)).join('')}</div></section>`;
else if(page==='category')h=`<section class="shop-section">${backButton()}<div class="section-heading"><h1>${all[g][i][0]}</h1><span>${g==='women'?'Women':'Kids'} / 4 styles</span></div><div class="shop-grid">${[0,1,2,3].map(v=>itemCard(g,i,v)).join('')}</div></section>`;
else if(page==='product'){const p=product(g,i,v);activeColour=colors[0];activeGalleryIndex=0;h=`<section class="shop-section">${backButton()}<div class="product-layout"><div class="product-photo"><div class="zoom-shell" id="zoomShell" role="button" tabindex="0" aria-label="Open full screen product image"><img id="variantImage" class="photo-loading" alt="${p.name}" draggable="false"><span class="zoom-hint">Tap to enlarge · Swipe through photos</span></div><div class="gallery-caption" id="galleryCaption">1 / 5</div><div class="thumb-row" id="colourGallery"></div></div><div class="product-details"><small>${g==='women'?'WOMEN':'KIDS'} / ${all[g][i][0]}</small><h1>${p.name}</h1><form id="buyForm" novalidate><div class="choice-wrap" data-choice="color"><div class="option-title">Colour <span id="chosenColor">${colors[0]}</span></div><div class="option-buttons">${colors.map(c=>`<button type="button" data-color="${c}" aria-pressed="${c===colors[0]}" class="option-button ${c===colors[0]?'active':''}">${c}</button>`).join('')}</div></div><div class="choice-wrap" data-choice="size"><div class="option-title">Choose size <span id="chosenSize">Required</span></div><div class="option-buttons">${sizes[g].map(size=>`<button type="button" data-size="${size}" aria-pressed="false" class="option-button">${size}</button>`).join('')}</div></div><label class="qty-label" for="qty">Quantity</label><input type="number" id="qty" min="1" max="20" value="1"><div class="shop-buttons"><button type="submit" value="cart" name="intent">Add to Cart</button><button class="shop-primary" type="submit" value="buy" name="intent">Buy Now</button></div></form><p id="feedback" role="status" aria-live="polite"></p></div></div></section>`}
else if(page==='cart')h=`<section class="shop-section">${backButton()}<div class="section-heading"><h1>Cart</h1><span>${cart.reduce((n,x)=>n+x.qty,0)} items</span></div>${cart.length?`<div class="bag-list">${cart.map((x,j)=>`<div class="bag-item"><img src="${x.galleryImage||img(x.id,320)}" alt="${x.name}"><div><h3>${x.name}</h3><p>${x.size} · ${x.color}</p><label>Qty <input type="number" min="1" max="20" value="${x.qty}" data-qty="${j}"></label><button class="remove" data-remove="${j}">Remove</button></div></div>`).join('')}</div><div class="bag-footer"><button class="shop-primary" data-go="checkout">Continue to checkout →</button></div>`:`<div class="bag-empty">Your cart is empty. <a href="${url('women')}" data-link>Browse collections →</a></div>`}</section>`;
else if(page==='checkout' && !cart.length){navigate(url('cart'));return}
else if(page==='review' && !cart.length){navigate(url('cart'));return}
else if(page==='checkout')h=`<section class="shop-section checkout-wrap">${backButton()}<h1>Checkout</h1><div class="steps"><span class="step-on">1 · Details</span><span>2 · Review</span><span>3 · Complete</span></div><form id="checkoutForm" class="checkout-form"><label>Full name<input name="name" autocomplete="name" required placeholder="Your name"></label><label>Mobile number<input name="phone" type="tel" inputmode="tel" required minlength="10" placeholder="Mobile number"></label><label>Delivery address<textarea name="address" required rows="3" placeholder="House, street, city, PIN code"></textarea></label><button class="shop-primary" type="submit">Review order →</button></form></section>`;
else if(page==='review')h=`<section class="shop-section checkout-wrap">${backButton()}<h1>Review order</h1><div class="steps"><span>1 · Details</span><span class="step-on">2 · Review</span><span>3 · Complete</span></div><div class="review-box"><p id="reviewCustomer"></p>${cart.map(x=>`<p>${x.name} · ${x.size} · ${x.color} × ${x.qty}</p>`).join('')}</div><p class="sample-note">Demo only. No payment, stock reservation or actual order will be placed.</p><button class="shop-primary" data-place>Place demo order →</button></section>`;
else if(page==='about')h=`<section class="shop-section info-page">${backButton()}<small>ABOUT ANAAKA</small><h1>Made for moments that matter.</h1><p>ANAAKA Designer Boutique is a fashion destination celebrating personal style and meaningful occasions. Explore our women’s and kids’ collections, from bridal and festive dressing to casual favourites.</p><p>Browse at your own pace and discover looks for the moments you want to remember.</p><a class="shop-primary" href="${url('women')}" data-link>Explore the collections ↗</a></section>`;
else if(page==='contact')h=`<section class="shop-section info-page">${backButton()}<small>GET IN TOUCH</small><h1>Contact ANAAKA</h1><p>Questions about a style or a collection? Use this demo enquiry form. Messages are not sent to the boutique.</p><form id="contactForm" class="checkout-form"><label>Your name<input name="name" required maxlength="80" placeholder="Full name"></label><label>Your contact details<input name="contact" required maxlength="120" placeholder="Email or mobile number"></label><label>Message<textarea name="message" required maxlength="1500" rows="5" placeholder="What would you like to know?"></textarea></label><button class="shop-primary" type="submit">Preview enquiry →</button></form><p id="contactFeedback" role="status" aria-live="polite"></p></section>`;
else if(page==='install')h=`<section class="shop-section info-page">${backButton()}<small>ANAAKA ON YOUR DEVICE</small><h1>Install ANAAKA</h1><p>Add ANAAKA to your home screen for easy access to the boutique. Installation is available when the site is hosted over HTTPS (or localhost) on a supported browser.</p><button class="shop-primary" type="button" data-install>Install app ↗</button><p id="installFeedback" class="install-note" role="status" aria-live="polite">If an install prompt is unavailable, use your browser’s menu and choose “Add to Home Screen” or “Install app.”</p></section>`;
else if(page==='success')h=`<section class="shop-section success-page"><div class="success-mark"><svg viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="44" stroke="currentColor" stroke-width="3"/><path d="M28 51L44 66L74 34" stroke="currentColor" stroke-width="5" stroke-linecap="square" stroke-linejoin="miter"/></svg></div><small>DEMO ORDER COMPLETE</small><h1>Thank you.</h1><p>Your simulated order is complete. No real order or payment was submitted.</p><a class="shop-primary" href="index.html">Continue shopping →</a></section>`;
else {navigate(url('home'));return}main.innerHTML=h;window.anaakaPhotos?.prepare(main);save();document.querySelectorAll('[data-page-nav]').forEach(a=>{a.classList.toggle('selected',a.dataset.pageNav===page);if(a.dataset.pageNav===page)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});if(page==='product'){initGestures();renderGallery();}if(page==='review'){let d={};try{d=JSON.parse(sessionStorage.getItem('anaaka-checkout')||'{}')}catch{}document.getElementById('reviewCustomer').textContent=`${d.name||'Customer'} · ${d.phone||''} · ${d.address||''}`}}
function openViewer(){
 
 const q=params(),g=q.get('group')==='kids'?'kids':'women',i=Number(q.get('i'))||0,v=Number(q.get('v'))||0;
 const layer=document.createElement('div');layer.className='anaaka-viewer';layer.setAttribute('role','dialog');layer.setAttribute('aria-modal','true');layer.setAttribute('aria-label','Product photo viewer');
 layer.innerHTML=`<div class="viewer-bar"><span>${activeColour} photos</span><button type="button" class="viewer-close" aria-label="Close photo viewer">×</button></div><div class="viewer-stage"><img alt="Enlarged garment photo" draggable="false"></div><div class="viewer-bottom"><button type="button" class="viewer-prev" aria-label="Previous image">←</button><span class="viewer-counter"></span><button type="button" class="viewer-next" aria-label="Next image">→</button></div>`;
 document.body.append(layer);window.anaakaPhotos?.prepare(layer);document.body.style.overflow='hidden';const stage=layer.querySelector('.viewer-stage'),pic=stage.querySelector('img'),counter=layer.querySelector('.viewer-counter');
 let k=activeGalleryIndex,scale=1,x=0,y=0,startX=0,startY=0,pinch=0,startScale=1,lastTap=0;
 const draw=()=>pic.style.transform=`translate(${x}px,${y}px) scale(${scale})`;
 let viewerRequest=0;const load=n=>{const entries=galleryFor(g,i,v,activeColour);k=(n+entries.length)%entries.length;const item=entries[k],request=++viewerRequest;imagePending(pic);preloadPhoto(item.src).then(src=>{if(!layer.isConnected||request!==viewerRequest)return;imageResolved(pic,src)});pic.alt=item.alt;pic.style.objectPosition=item.position;counter.textContent=`${k+1} / ${entries.length}`;scale=1;x=y=0;draw();selectGallery(k)};
 const keys=e=>{if(e.key==='Escape')close();else if(e.key==='ArrowRight')load(k+1);else if(e.key==='ArrowLeft')load(k-1)};
 const close=()=>{layer.remove();document.body.style.overflow='';document.removeEventListener('keydown',keys)};
 layer.querySelector('.viewer-close').onclick=close;layer.querySelector('.viewer-prev').onclick=()=>load(k-1);layer.querySelector('.viewer-next').onclick=()=>load(k+1);document.addEventListener('keydown',keys);load(k);
 stage.addEventListener('wheel',e=>{e.preventDefault();scale=Math.max(1,Math.min(5,scale+(e.deltaY<0?.3:-.3)));if(scale===1)x=y=0;draw()},{passive:false});
 stage.addEventListener('dblclick',()=>{scale=scale>1?1:2.5;x=y=0;draw()});
 const distance=t=>Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY);
 stage.addEventListener('touchstart',e=>{if(e.touches.length===2){pinch=distance(e.touches);startScale=scale}else if(e.touches.length===1){startX=e.touches[0].clientX;startY=e.touches[0].clientY;const now=Date.now();if(now-lastTap<300){scale=scale>1?1:2.5;x=y=0;draw()}lastTap=now}},{passive:true});
 stage.addEventListener('touchmove',e=>{if(e.touches.length===2){e.preventDefault();scale=Math.max(1,Math.min(5,startScale*distance(e.touches)/Math.max(1,pinch)));draw()}else if(e.touches.length===1&&scale>1){e.preventDefault();x+=e.touches[0].clientX-startX;y+=e.touches[0].clientY-startY;startX=e.touches[0].clientX;startY=e.touches[0].clientY;draw()}},{passive:false});
 stage.addEventListener('touchend',e=>{if(e.changedTouches.length===1&&scale===1){const dx=e.changedTouches[0].clientX-startX;if(Math.abs(dx)>55)load(k+(dx<0?1:-1))}},{passive:true});
 }
function initGestures(){const shell=document.getElementById('zoomShell');let startX=0,startY=0,lastSwipe=0;
 shell.addEventListener('touchstart',e=>{if(e.touches.length===1){startX=e.touches[0].clientX;startY=e.touches[0].clientY}},{passive:true});
 shell.addEventListener('touchend',e=>{if(e.changedTouches.length!==1||!activeColour)return;const dx=e.changedTouches[0].clientX-startX,dy=e.changedTouches[0].clientY-startY;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)){selectGallery(activeGalleryIndex+(dx<0?1:-1));lastSwipe=Date.now();window.__anaakaSwipeAt=lastSwipe}},{passive:true});
 }
document.addEventListener('click',e=>{const a=e.target.closest('a[data-link]');if(a){const href=a.getAttribute('href');if(href&&href.startsWith('?')){e.preventDefault();navigate(href)}return}if(e.target.closest('#zoomShell')){if(Date.now()-Number(window.__anaakaSwipeAt||0)>450)openViewer();return}if(e.target.closest('[data-back]')){back();return}const go=e.target.closest('[data-go]');if(go){navigate(url(go.dataset.go));return}const color=e.target.closest('[data-color]');if(color){selectColour(color.dataset.color);return}const thumb=e.target.closest('.thumb');if(thumb){selectGallery(Number(thumb.dataset.galleryIndex));return}const size=e.target.closest('[data-size]');if(size){document.querySelectorAll('[data-size]').forEach(b=>b.classList.remove('active'));size.classList.add('active');document.querySelectorAll('[data-size]').forEach(b=>b.setAttribute('aria-pressed',String(b===size)));document.getElementById('chosenSize').textContent=size.dataset.size;clearErrors();return}if(e.target.closest('[data-install]')){window.anaakaInstall?.();return}const remove=e.target.closest('[data-remove]');if(remove){cart.splice(Number(remove.dataset.remove),1);render();return}if(e.target.closest('[data-place]')){if(!cart.length){navigate(url('cart'));return}cart=[];save();navigate(url('success'));return}});
document.addEventListener('change',e=>{if(e.target.matches('[data-qty]')){const j=Number(e.target.dataset.qty);if(!cart[j])return;cart[j].qty=Math.max(1,Math.min(20,Number(e.target.value)||1));e.target.value=cart[j].qty;save()}});
document.addEventListener('submit',e=>{if(e.target.id==='buyForm'){
 e.preventDefault();const q=params(),g=q.get('group')==='kids'?'kids':'women',i=Math.min(9,Math.max(0,Number(q.get('i'))||0)),v=Math.min(3,Math.max(0,Number(q.get('v'))||0));
 const size=document.querySelector('[data-size].active')?.dataset.size;
 
 
 if(!size){errorText('Please select a size to continue.','size');return}
 const qty=Math.max(1,Math.min(20,Number(document.getElementById('qty').value)||1)),p=product(g,i,v),existing=cart.find(x=>x.group===g&&x.i===i&&x.v===v&&x.size===size&&x.color===activeColour);
 if(existing)existing.qty+=qty;else cart.push({...p,size,color:activeColour,qty,galleryImage:galleryFor(g,i,v,activeColour)[activeGalleryIndex].src});
 save();if(e.submitter?.value==='buy'){navigate(url('checkout'))}else{
 cartAddedFeedback(e.submitter,p.name);}
 }
 if(e.target.id==='contactForm'){e.preventDefault();const f=document.getElementById('contactFeedback');f.textContent='Demo enquiry prepared. This form does not send a message. Add ANAAKA’s contact details when publishing.';f.setAttribute('role','status');}
 if(e.target.id==='checkoutForm'){e.preventDefault();const data=Object.fromEntries(new FormData(e.target));sessionStorage.setItem('anaaka-checkout',JSON.stringify(data));navigate(url('review'))}});
window.addEventListener('popstate',()=>{render();scrollTo(0,0)});document.getElementById('shopTheme').onclick=()=>{
 const t=document.documentElement.dataset.theme==='dark'?'light':'dark';
 document.documentElement.dataset.theme=t;
 try{localStorage.setItem('anaaka-theme',t)}catch{}
};
window.addEventListener('pageshow',()=>save());
const shopMenuBtn=document.getElementById('shopMenuBtn'),shopMenu=document.getElementById('shopMenu');shopMenuBtn?.addEventListener('click',()=>{const open=shopMenu.classList.toggle('open');shopMenuBtn.setAttribute('aria-expanded',String(open));});shopMenu?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{shopMenu.classList.remove('open');shopMenuBtn.setAttribute('aria-expanded','false')}));
if(!history.state?.anaaka)history.replaceState({anaaka:true,anaakaDepth:0},'',location.href);
render();

document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target?.id==='zoomShell'){e.preventDefault();openViewer()}});
