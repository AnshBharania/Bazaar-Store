// Put photos in the img folder. If a photo is missing, the emoji shows instead.
const PRODUCTS = [
  { id:1, name:"Wireless Earbuds", cat:"Electronics", price:1499, mrp:2999, rating:4.3, emoji:"🎧", image:"img/earbuds.jpg", color:"#d8ecf5", desc:"Bluetooth 5.3, 24-hour battery with charging case." },
  { id:2, name:"Smartwatch Fit", cat:"Electronics", price:2799, mrp:5999, rating:4.1, emoji:"⌚", image:"img/smartwatch.jpg", color:"#e4dcf3", desc:"1.7-inch display, heart-rate and sleep tracking." },
  { id:3, name:"Power Bank 20000 mAh", cat:"Electronics", price:1299, mrp:2199, rating:4.4, emoji:"🔋", image:"img/powerbank.jpg", color:"#f7e6b8", desc:"Fast charging, two USB ports and one Type-C." },
  { id:4, name:"Running Shoes", cat:"Fashion", price:1899, mrp:3499, rating:4.2, emoji:"👟", image:"img/shoes.jpg", color:"#fbd9cf", desc:"Lightweight mesh upper with cushioned sole." },
  { id:5, name:"Cotton Casual Shirt", cat:"Fashion", price:699, mrp:1499, rating:3.9, emoji:"👕", image:"img/shirt.jpg", color:"#d5ead9", desc:"Regular fit, breathable 100% cotton." },
  { id:6, name:"Backpack 30 L", cat:"Fashion", price:999, mrp:1999, rating:4.5, emoji:"🎒", image:"img/backpack.jpg", color:"#cfe3e0", desc:"Water-resistant with a padded laptop sleeve." },
  { id:7, name:"Non-stick Cookware Set", cat:"Home", price:1599, mrp:3200, rating:4.0, emoji:"🍳", image:"img/cookware.jpg", color:"#f3dcc6", desc:"Three-piece set, works on gas and induction." },
  { id:8, name:"LED Desk Lamp", cat:"Home", price:549, mrp:999, rating:4.2, emoji:"💡", image:"img/lamp.jpg", color:"#fff0b8", desc:"Three brightness levels, USB powered." },
  { id:9, name:"Cotton Bedsheet Set", cat:"Home", price:799, mrp:1799, rating:4.1, emoji:"🛏️", image:"img/bedsheet.jpg", color:"#e0e6f5", desc:"Double bed sheet with two pillow covers." },
  { id:10, name:"Face Wash 150 ml", cat:"Beauty", price:249, mrp:399, rating:4.3, emoji:"🧴", image:"img/facewash.jpg", color:"#d9f0e6", desc:"Gentle daily cleanser for all skin types." },
  { id:11, name:"Habit Building Handbook", cat:"Books", price:299, mrp:499, rating:4.6, emoji:"📘", image:"img/book.jpg", color:"#d6e2f7", desc:"Paperback guide to small habits that stick." },
  { id:12, name:"Ruled Notebook Pack of 5", cat:"Books", price:349, mrp:550, rating:4.4, emoji:"📓", image:"img/notebook.jpg", color:"#f3d6dd", desc:"A5 size, 180 pages each, sturdy cover." }
];
const SLIDES = [
  { h:"Big savings on electronics", p:"Earbuds, watches and power banks at up to 50% off.", cat:"Electronics", bg:"linear-gradient(120deg,#4A22D9,#8b4dff)" },
  { h:"Step into the new season", p:"Shoes, shirts and bags for every day.", cat:"Fashion", bg:"linear-gradient(120deg,#E6246E,#ff7a59)" },
  { h:"Make your home feel new", p:"Kitchen and bedroom essentials under ₹2,000.", cat:"Home", bg:"linear-gradient(120deg,#0e8a7d,#2bc4a0)" }
];
const $ = id => document.getElementById(id);
const inr = n => "₹" + n.toLocaleString("en-IN");
const state = { cat:"All", q:"", sort:"rel", slide:0, cart:loadCart() };

function loadCart(){ try { return JSON.parse(localStorage.getItem("bazaar-cart")) || {}; } catch { return {}; } }
function saveCart(){ try { localStorage.setItem("bazaar-cart", JSON.stringify(state.cart)); } catch {} }

function renderCats(){
  const cats = ["All", ...new Set(PRODUCTS.map(p => p.cat))];
  $("cats").innerHTML = "";
  cats.forEach(c => {
    const b = document.createElement("button");
    b.type = "button"; b.textContent = c;
    b.setAttribute("aria-pressed", String(c === state.cat));
    b.onclick = () => { state.cat = c; renderCats(); renderGrid(); };
    $("cats").appendChild(b);
  });
}
function renderSlide(){
  const s = SLIDES[state.slide];
  $("slide").style.background = s.bg;
  $("slide").innerHTML = `<h1>${s.h}</h1><p>${s.p}</p><button type="button">Shop ${s.cat}</button>`;
  $("slide").querySelector("button").onclick = () => { state.cat = s.cat; renderCats(); renderGrid(); $("grid").scrollIntoView({behavior:"smooth"}); };
}
function list(){
  const out = PRODUCTS.filter(p => (state.cat === "All" || p.cat === state.cat) && (p.name + " " + p.desc + " " + p.cat).toLowerCase().includes(state.q.toLowerCase()));
  if (state.sort === "low") out.sort((a,b) => a.price - b.price);
  if (state.sort === "high") out.sort((a,b) => b.price - a.price);
  if (state.sort === "rate") out.sort((a,b) => b.rating - a.rating);
  return out;
}
const off = p => Math.round((1 - p.price / p.mrp) * 100);
function priceHtml(p){ return `<div class="prices"><b>${inr(p.price)}</b><s>${inr(p.mrp)}</s><span>${off(p)}% off</span></div>`; }
function pic(p){
  return `<span aria-hidden="true">${p.emoji}</span><img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.style.display='none'">`;
}
function renderGrid(){
  const items = list();
  $("title").textContent = state.q ? `Results for "${state.q}"` : (state.cat === "All" ? "Top deals today" : state.cat);
  $("empty").hidden = items.length > 0;
  $("grid").innerHTML = items.map(p => `
    <article class="card">
      <button class="tile" type="button" data-view="${p.id}" style="background:${p.color}" aria-label="View ${p.name}">${pic(p)}<span class="badge">${off(p)}% off</span></button>
      <div class="info">
        <button class="name" type="button" data-view="${p.id}">${p.name}</button>
        <div><span class="rate">${p.rating} ★</span></div>
        ${priceHtml(p)}
        <button class="add" type="button" data-add="${p.id}">Add to cart</button>
      </div>
    </article>`).join("");
}
function addToCart(id){ state.cart[id] = (state.cart[id] || 0) + 1; saveCart(); renderCart(); openCart(); }
function changeQty(id, d){ state.cart[id] = (state.cart[id] || 0) + d; if (state.cart[id] <= 0) delete state.cart[id]; saveCart(); renderCart(); }
function renderCart(){
  const rows = Object.entries(state.cart).map(([id, qty]) => ({ p: PRODUCTS.find(x => x.id === +id), qty })).filter(r => r.p);
  $("cartCount").textContent = rows.reduce((s, r) => s + r.qty, 0);
  $("cartTotal").textContent = inr(rows.reduce((s, r) => s + r.qty * r.p.price, 0));
  $("cartEmpty").hidden = rows.length > 0;
  $("checkout").disabled = rows.length === 0;
  $("cartItems").innerHTML = rows.map(({p, qty}) => `
    <li><div class="n">${p.name}<small>${inr(p.price)} each</small></div>
    <div class="qty"><button type="button" data-q="${p.id}" data-d="-1" aria-label="Remove one ${p.name}">−</button><span>${qty}</span><button type="button" data-q="${p.id}" data-d="1" aria-label="Add one ${p.name}">+</button></div></li>`).join("");
}
function openCart(){ $("drawer").hidden = false; $("overlay").hidden = false; $("closeCart").focus(); }
function closeCart(){ $("drawer").hidden = true; $("overlay").hidden = true; }
function openModal(id){
  const p = PRODUCTS.find(x => x.id === id);
  $("mbox").innerHTML = `<div class="tile" style="background:${p.color}">${pic(p)}</div>
    <div class="mbody"><h3>${p.name}</h3><div><span class="rate">${p.rating} ★</span></div>${priceHtml(p)}<p class="muted">${p.desc}</p>
    <div class="actions"><button class="add" type="button" data-add="${p.id}">Add to cart</button><button class="close" type="button" data-close>Close</button></div></div>`;
  $("modal").hidden = false; $("mbox").querySelector(".close").focus();
}
function closeModal(){ $("modal").hidden = true; }

document.addEventListener("click", e => {
  const t = e.target.closest("[data-add],[data-view],[data-q],[data-close]"); if (!t) return;
  if (t.dataset.add) { closeModal(); addToCart(+t.dataset.add); }
  else if (t.dataset.view) openModal(+t.dataset.view);
  else if (t.dataset.q) changeQty(+t.dataset.q, +t.dataset.d);
  else closeModal();
});
$("modal").addEventListener("click", e => { if (e.target === $("modal")) closeModal(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") { closeModal(); closeCart(); } });
$("cartBtn").onclick = openCart; $("closeCart").onclick = closeCart; $("overlay").onclick = closeCart;
$("searchForm").onsubmit = e => { e.preventDefault(); state.q = $("search").value.trim(); renderGrid(); };
$("search").oninput = e => { state.q = e.target.value.trim(); renderGrid(); };
$("sort").onchange = e => { state.sort = e.target.value; renderGrid(); };
$("prev").onclick = () => { state.slide = (state.slide + SLIDES.length - 1) % SLIDES.length; renderSlide(); };
$("next").onclick = () => { state.slide = (state.slide + 1) % SLIDES.length; renderSlide(); };
$("checkout").onclick = () => alert("This is a demo store, so orders aren't placed. Connect a payment provider such as Razorpay or Stripe to accept real orders.");
renderCats(); renderSlide(); renderGrid(); renderCart();
