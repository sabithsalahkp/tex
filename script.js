const photo=(id)=>window.ANAAKA_IMAGE_URL(id,700);
const women=[
['Bridal Wear','For your unforgettable day','photo-1594552072238-b8a33785b261','Statement silhouettes and graceful details for your most special celebrations.'],
['Sarees','Timeless drapes','photo-1610030469983-98e550d6193c','Explore classic drapes and contemporary elegance for every occasion.'],
['Pardhas & Abayas','Modest, modern elegance','photo-1585487000160-6ebcfceb0d03','Beautiful modestwear for confident, effortless dressing.'],
['Sportswear','Move in style','photo-1518611012118-696072aa579a','Comfortable active-inspired looks for your everyday movement.'],
['Party Wear','Made for the spotlight','photo-1539008835657-9e8e9680c956','Memorable looks for evenings, events and celebrations.'],
['Kurtis & Sets','Everyday refinement','photo-1612722432474-b971cdcea546','Versatile sets and easy silhouettes with thoughtful finishing.'],
['Gowns','A graceful entrance','photo-1595777457583-95e059d581b8','Flowing silhouettes for a striking occasion look.'],
['Casual Wear','Easy everyday style','photo-1483985988355-763728e1935b','Effortless pieces to wear your way, every day.'],
['Co-ord Sets','Perfectly paired','photo-1485968579580-b6d095142e6e','Modern matching looks that make styling simple.'],
['Ethnic Wear','Rooted in elegance','photo-1595777457583-95e059d581b8','Traditional inspiration with a contemporary point of view.']
];
const kids=[
['Party Wear','Little celebration looks','photo-1503919005314-30d93d07d823','Special outfits for birthdays, celebrations and picture-perfect moments.'],
['Girls Dresses','Pretty little favourites','photo-1519457431-44ccd64a579b','Charming dresses with playful details.'],
['Boys Occasion Wear','Dressed for the moment','photo-1503454537195-1dcabb73ffb9','Smart outfits for memorable occasions.'],
['Kids Ethnic Wear','Little traditions','photo-1519238263530-99bdd11df2ea','Festive styles with a joyful spirit.'],
['Casual Wear','Ready for every day','photo-1471286174890-9c112ffca5b4','Easygoing styles for little adventures.'],
['Baby Wear','Soft little beginnings','photo-1515488042361-ee00e0ddd4e4','Sweet and comfortable styles for the smallest ones.'],
['Festive Wear','Celebrate in style','photo-1484820540004-14229fe36ca4','Joyful outfits for festive gatherings.'],
['Kids Sportswear','Made to move','photo-1516627145497-ae6968895b74','Active everyday looks for energetic little ones.'],
['Sibling Sets','Better together','photo-1502086223501-7ea6ecd79368','Coordinated looks for family moments.'],
['Kids Winterwear','Cosy little layers','photo-1476231682828-37e571bc172f','Comfortable layers for cooler days.']
];
function render(items,target,group){document.getElementById(target).innerHTML=items.map(([name,sub,id,desc],i)=>`<button class="category-card" type="button" data-group="${group}" data-index="${i}" aria-label="View ${name} collection"><div class="category-image"><img loading="lazy" src="${photo(window.ANAAKA_CATALOG[group][i][0])}" alt="${name} fashion collection"><span class="arrow" aria-hidden="true">↗</span></div><h3>${name}</h3><p>${sub}</p></button>`).join('')}
render(women,'womenGrid','women');render(kids,'kidsGrid','kids');window.anaakaPhotos?.prepare(document);
document.addEventListener('click',e=>{const card=e.target.closest('.category-card');if(!card)return;location.href=`shop.html?page=category&group=${card.dataset.group}&i=${card.dataset.index}`});
try{const c=JSON.parse(localStorage.getItem('anaaka-cart')||'[]');document.getElementById('homeCartCount').textContent=Array.isArray(c)?c.reduce((n,x)=>n+(Number(x.qty)||0),0):0}catch{}
const themeBtn=document.getElementById('themeBtn');themeBtn.addEventListener('click',()=>{const t=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=t;try{localStorage.setItem('anaaka-theme',t)}catch(e){}document.querySelector('meta[name="theme-color"]').content=t==='dark'?'#141412':'#faf9f6'});
const menu=document.getElementById('mobileNav'),menuBtn=document.getElementById('menuBtn');menuBtn.addEventListener('click',()=>{const open=menu.classList.toggle('open');menuBtn.setAttribute('aria-expanded',String(open))});menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menu.classList.remove('open');menuBtn.setAttribute('aria-expanded','false')}));document.getElementById('year').textContent=new Date().getFullYear();
