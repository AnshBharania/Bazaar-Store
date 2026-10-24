(function () {
  const wrap = document.createElement("div");
  wrap.innerHTML = `
    <button id="chatToggle" class="chat-toggle" type="button" aria-expanded="false" aria-controls="chatPanel">💬 Ask Bazaar</button>
    <section id="chatPanel" class="chat-panel" aria-label="Shopping assistant" hidden>
      <div class="chat-head"><strong>Bazaar assistant</strong><button id="chatClose" type="button" aria-label="Close chat">×</button></div>
      <div id="chatLog" class="chat-log" role="log" aria-live="polite"></div>
      <div id="chatChips" class="chat-chips"></div>
      <form id="chatForm" class="chat-form">
        <label class="sr" for="chatInput">Type your question</label>
        <input id="chatInput" autocomplete="off" placeholder="Ask about products, delivery, returns">
        <button type="submit">Send</button>
      </form>
    </section>`;
  document.body.appendChild(wrap);

  const log = document.getElementById("chatLog");
  const panel = document.getElementById("chatPanel");
  const toggle = document.getElementById("chatToggle");
  const input = document.getElementById("chatInput");

  function add(text, who) {
    const d = document.createElement("div");
    d.className = "msg " + who;
    d.textContent = text;
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
  }
  function addProducts(items) {
    const d = document.createElement("div");
    d.className = "msg bot list";
    items.forEach(p => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = p.emoji + " " + p.name + " · " + inr(p.price) + " (" + off(p) + "% off)";
      b.onclick = () => openModal(p.id);
      d.appendChild(b);
    });
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
  }

  const STOP = new Set(["show","find","want","need","for","the","some","any","best","cheap","good","with","under","below","and","please","me","get","buy","looking","have","you","are","what","can","your","about","product","products"]);

  function reply(raw) {
    const q = raw.toLowerCase();
    if (/^(hi|hello|hey|namaste)\b/.test(q)) return add("Hi! I can help you find products, check delivery and returns, or tell you what's in your cart.", "bot");
    if (/deliver|shipping|ship|how long/.test(q)) return add("Delivery is free on orders over ₹499 and usually takes 3 to 5 days.", "bot");
    if (/return|refund|exchange|replace/.test(q)) return add("You can return most items within 7 days of delivery. The refund goes back to your original payment method.", "bot");
    if (/pay|upi|card|cod|cash|emi/.test(q)) return add("We accept UPI, cards and cash on delivery. Payments are encrypted and secure.", "bot");
    if (/track|order status|where is my order/.test(q)) return add("This is a demo store, so no real orders exist yet. Once you connect a backend, order tracking can go here.", "bot");
    if (/cart|basket|bag total/.test(q)) {
      const rows = Object.entries(state.cart).map(([id, n]) => ({ p: PRODUCTS.find(x => x.id === +id), n })).filter(r => r.p);
      if (!rows.length) return add("Your cart is empty right now. Ask me for deals or a product to get started.", "bot");
      const total = rows.reduce((s, r) => s + r.n * r.p.price, 0);
      return add("In your cart: " + rows.map(r => r.n + " × " + r.p.name).join(", ") + ". Subtotal: " + inr(total) + ".", "bot");
    }
    if (/deal|offer|discount|sale/.test(q)) {
      add("Here are the biggest discounts right now:", "bot");
      return addProducts([...PRODUCTS].sort((a, b) => off(b) - off(a)).slice(0, 4));
    }
    const budget = q.match(/(?:under|below|less than|within)\s*₹?\s*(\d+)/);
    const words = q.split(/[^a-z0-9]+/).filter(w => w.length > 2 && !STOP.has(w) && !/^\d+$/.test(w)).map(w => w.replace(/s$/, ""));
    const found = PRODUCTS.filter(p => {
      const hay = (p.name + " " + p.cat + " " + p.desc).toLowerCase();
      const wordOk = words.length === 0 || words.some(w => hay.includes(w));
      const priceOk = !budget || p.price <= +budget[1];
      return wordOk && priceOk;
    });
    if ((words.length || budget) && found.length) {
      add("Here's what I found:", "bot");
      return addProducts(found.slice(0, 4));
    }
    add("I couldn't find a match for that. Try a product like \"shoes\" or \"lamp\", or ask about deals, delivery or returns.", "bot");
  }

  function send(text) {
    const t = text.trim();
    if (!t) return;
    add(t, "user");
    reply(t);
  }

  ["Show deals", "Delivery info", "Return policy", "Under ₹1000"].forEach(label => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    b.onclick = () => send(label === "Under ₹1000" ? "products under 1000" : label);
    document.getElementById("chatChips").appendChild(b);
  });

  function setOpen(open) {
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    if (open) {
      if (!log.children.length) add("Hi! I'm the Bazaar assistant. What are you looking for today?", "bot");
      input.focus();
    }
  }
  toggle.onclick = () => setOpen(panel.hidden);
  document.getElementById("chatClose").onclick = () => { setOpen(false); toggle.focus(); };
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !panel.hidden) setOpen(false); });
  document.getElementById("chatForm").onsubmit = e => {
    e.preventDefault();
    send(input.value);
    input.value = "";
  };
})();