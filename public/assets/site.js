(function () {
  "use strict";

  // ------------------------------------------------------------------
  // Datos del negocio. Cambia aquí servicios, precios y fotos.
  // ------------------------------------------------------------------
  // Teléfono guardado al revés y en base64 para que los bots no lo recojan.
  // Para cambiarlo: printf %s "1787XXXXXXX" | rev | base64
  var PHONE = atob("NjYwMjI2Mzc4NzE=").split("").reverse().join("");   // 1 + número de PR
  var PHONE_FMT = PHONE.slice(1, 4) + "-" + PHONE.slice(4, 7) + "-" + PHONE.slice(7);
  var IG = "nails_d.aniela";
  var NAME = "Nails by Daniela";

  // min/max en dólares. Si min === max sale un solo precio.
  var SERVICES = [
    { es: "Uñas naturales", en: "Natural nails", items: [
      { id: "solido", es: "Color sólido", en: "Solid color", des: "Un solo color en todas las uñas.", den: "One color on every nail.", min: 25, max: 25 },
      { id: "complejo", es: "Diseño complejo", en: "Complex design", des: "Flores, rayas, puntos, 3D o la idea que traigas.", den: "Flowers, stripes, dots, 3D or whatever you have in mind.", min: 30, max: 30 }
    ]},
    { es: "Con gel tip", en: "With gel tips", items: [
      { id: "gel", es: "Gel tip, sin color", en: "Gel tips, no color", des: "Extensiones de gel, sin color.", den: "Gel extensions, no color.", min: 45, max: 45 },
      { id: "gelcomplejo", es: "Diseño complejo + gel tip", en: "Complex design + gel tips", des: "Extensiones de gel con diseño complejo.", den: "Gel extensions with a complex design.", min: 55, max: 55 }
    ]},
    { es: "Pedicura", en: "Pedicure", items: [
      { id: "pedi", es: "Pedicura", en: "Pedicure", des: "Para los pies.", den: "For your feet.", min: 25, max: 25 }
    ]}
  ];

  var T = {
    es: {
      waHello: "Hola Daniela, vi tu página y quiero hacerme las uñas. ¿Cuándo podemos coordinar?",
      waQuote: "Hola Daniela, vi tu página y me interesa:",
      waEstimate: "Estimado",
      waWhen: "¿Cuándo podemos coordinar?",
      waLike: "Hola Daniela, quiero unas uñas como las de",
      waForm: "Hola Daniela, soy",
      waFormSvc: "Me interesa",
      waFormIdea: "Mi idea",
      add: "Añadir", added: "Añadido",
      copied: "Enlace copiado", saved: "Contacto guardado",
      any: "Todavía no sé"
    },
    en: {
      waHello: "Hi Daniela, I saw your website and I'd like to get my nails done. When can we meet?",
      waQuote: "Hi Daniela, I saw your website and I'm interested in:",
      waEstimate: "Estimate",
      waWhen: "When can we meet?",
      waLike: "Hi Daniela, I'd like nails like your",
      waForm: "Hi Daniela, I'm",
      waFormSvc: "I'm interested in",
      waFormIdea: "My idea",
      add: "Add", added: "Added",
      copied: "Link copied", saved: "Contact saved",
      any: "Not sure yet"
    }
  };

  // ------------------------------------------------------------------
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  var lang = "es";
  function L(k) { return T[lang][k]; }
  function money(min, max) { return min === max ? "$" + min : "$" + min + "–" + max; }
  function wa(text) { return "https://wa.me/" + PHONE + "?text=" + encodeURIComponent(text); }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  // ---------- language ----------
  // Spanish is written in the HTML; English lives in data-en attributes.
  function setLang(next, save) {
    lang = next === "en" ? "en" : "es";
    if (save) store.set("ndd-lang", lang);
    document.documentElement.lang = lang;
    $$("[data-en]").forEach(function (n) {
      if (n.dataset.es == null) n.dataset.es = n.textContent;
      n.textContent = lang === "en" ? n.dataset.en : n.dataset.es;
    });
    $$("[data-en-placeholder]").forEach(function (n) { swapAttr(n, "placeholder", n.dataset.enPlaceholder); });
    $$("[data-en-label]").forEach(function (n) { swapAttr(n, "aria-label", n.dataset.enLabel); });
    $$("[data-en-alt]").forEach(function (n) { swapAttr(n, "alt", n.dataset.enAlt); });
    var t = $("title"); if (t && t.dataset.en) { if (t.dataset.es == null) t.dataset.es = t.textContent; document.title = lang === "en" ? t.dataset.en : t.dataset.es; }
    var md = $('meta[name="description"]'); if (md && md.dataset.en) swapAttr(md, "content", md.dataset.en);
    $$(".lang-btn").forEach(function (b) { b.textContent = lang === "en" ? "Español" : "English"; b.setAttribute("lang", lang === "en" ? "es" : "en"); });
    refresh();
  }
  function swapAttr(n, attr, en) {
    var k = "es" + attr.replace(/[^a-z]/g, "");
    if (n.dataset[k] == null) n.dataset[k] = n.getAttribute(attr) || "";
    n.setAttribute(attr, lang === "en" ? en : n.dataset[k]);
  }

  function refresh() {
    $$("[data-wa]").forEach(function (a) { a.href = wa(L("waHello")); a.target = "_blank"; a.rel = "noopener"; });
    $$("[data-tel]").forEach(function (a) { a.href = "tel:+" + PHONE; });
    $$("[data-phone]").forEach(function (n) { n.textContent = PHONE_FMT; });
    $$("[data-ig]").forEach(function (a) { a.href = "https://instagram.com/" + IG; a.target = "_blank"; a.rel = "noopener"; });
    renderServices();
    renderQuote();
    renderPrintList();
    renderFormOptions();
  }

  // ---------- services + quote (servicios) ----------
  var picked = [];
  function findItem(id) { for (var c = 0; c < SERVICES.length; c++) for (var i = 0; i < SERVICES[c].items.length; i++) if (SERVICES[c].items[i].id === id) return SERVICES[c].items[i]; return null; }

  function renderServices() {
    var box = $("#services");
    if (!box) return;
    box.textContent = "";
    SERVICES.forEach(function (cat) {
      var sec = el("section", "cat");
      sec.appendChild(el("h2", "cat-name", cat[lang]));
      var ul = el("ul", "items");
      cat.items.forEach(function (it) {
        var li = el("li", "item");
        var txt = el("div", "item-txt");
        txt.appendChild(el("h3", "item-name", it[lang]));
        txt.appendChild(el("p", "item-desc", lang === "en" ? it.den : it.des));
        var right = el("div", "item-right");
        right.appendChild(el("p", "item-price", money(it.min, it.max)));
        var on = picked.indexOf(it.id) > -1;
        var b = el("button", "btn small" + (on ? " on" : ""), on ? L("added") : L("add"));
        b.type = "button";
        b.setAttribute("aria-pressed", on ? "true" : "false");
        b.addEventListener("click", function () {
          var k = picked.indexOf(it.id);
          if (k > -1) picked.splice(k, 1); else picked.push(it.id);
          renderServices(); renderQuote();
          var again = $('[data-item="' + it.id + '"]'); if (again) again.focus();
        });
        b.dataset.item = it.id;
        right.appendChild(b);
        li.appendChild(txt); li.appendChild(right); ul.appendChild(li);
      });
      sec.appendChild(ul); box.appendChild(sec);
    });
  }

  function renderQuote() {
    var box = $("#quote-list");
    if (!box) return;
    box.textContent = "";
    var min = 0, max = 0;
    picked.forEach(function (id) {
      var it = findItem(id); if (!it) return;
      min += it.min; max += it.max;
      var li = el("li");
      li.appendChild(el("span", "", it[lang]));
      li.appendChild(el("span", "q-price", money(it.min, it.max)));
      box.appendChild(li);
    });
    $("#quote-empty").hidden = picked.length > 0;
    $("#quote-total").textContent = picked.length ? money(min, max) : "—";
    var send = $("#quote-send");
    if (picked.length) {
      var lines = picked.map(function (id) { var it = findItem(id); return "• " + it[lang] + " (" + money(it.min, it.max) + ")"; });
      send.href = wa(L("waQuote") + "\n" + lines.join("\n") + "\n" + L("waEstimate") + ": " + money(min, max) + "\n" + L("waWhen"));
    } else {
      send.href = wa(L("waHello"));
    }
    send.target = "_blank"; send.rel = "noopener";
    // phone: a floating pill with the running total while the estimate card is off screen
    var bar = $("#quote-bar");
    if (bar) {
      $("#quote-bar-total").textContent = picked.length ? money(min, max) : "";
      bar.hidden = !picked.length || quoteInView;
      document.body.classList.toggle("has-bar", picked.length > 0);
    }
  }
  var quoteInView = false;
  function watchQuote() {
    var q = $("#quote");
    if (!q || !("IntersectionObserver" in window)) return;
    new IntersectionObserver(function (es) { quoteInView = es[0].isIntersecting; renderQuote(); }).observe(q);
  }

  // ---------- printable price list (precios) ----------
  function renderPrintList() {
    var box = $("#print-list");
    if (!box) return;
    box.textContent = "";
    SERVICES.forEach(function (cat) {
      var sec = el("section", "p-cat");
      sec.appendChild(el("h2", "", cat[lang]));
      cat.items.forEach(function (it) {
        var row = el("div", "p-row");
        var txt = el("div");
        txt.appendChild(el("p", "p-name", it[lang]));
        txt.appendChild(el("p", "p-desc", lang === "en" ? it.den : it.des));
        row.appendChild(txt);
        row.appendChild(el("p", "p-price", money(it.min, it.max)));
        sec.appendChild(row);
      });
      box.appendChild(sec);
    });
    var qrBox = $("#qr");
    if (qrBox && window.qrcode && !qrBox.firstChild) {
      var url = location.origin + "/";
      var q = window.qrcode(0, "M"); q.addData(url); q.make();
      var n = q.getModuleCount(), m = 4, size = n + m * 2, d = "";
      for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (q.isDark(r, c)) d += "M" + (c + m) + " " + (r + m) + "h1v1h-1z";
      var NS = "http://www.w3.org/2000/svg";
      var svg = document.createElementNS(NS, "svg");
      svg.setAttribute("viewBox", "0 0 " + size + " " + size);
      svg.setAttribute("role", "img");
      svg.setAttribute("aria-label", "QR: " + url);
      svg.setAttribute("shape-rendering", "crispEdges");
      var bg = document.createElementNS(NS, "rect"); bg.setAttribute("width", size); bg.setAttribute("height", size); bg.setAttribute("fill", "#ffffff");
      var p = document.createElementNS(NS, "path"); p.setAttribute("d", d); p.setAttribute("fill", "#24161a");
      svg.appendChild(bg); svg.appendChild(p); qrBox.appendChild(svg);
      var u = $("#qr-url"); if (u) u.textContent = location.host;
    }
  }

  // ---------- contact form (contacto) ----------
  function renderFormOptions() {
    var sel = $("#f-service");
    if (!sel) return;
    var keep = sel.value;
    sel.textContent = "";
    var o = el("option", "", L("any")); o.value = ""; sel.appendChild(o);
    SERVICES.forEach(function (cat) {
      var g = document.createElement("optgroup"); g.label = cat[lang];
      cat.items.forEach(function (it) { var op = el("option", "", it[lang] + " · " + money(it.min, it.max)); op.value = it.id; g.appendChild(op); });
      sel.appendChild(g);
    });
    sel.value = keep;
  }
  function initForm() {
    var f = $("#wa-form");
    if (!f) return;
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = $("#f-name").value.trim(), it = findItem($("#f-service").value), idea = $("#f-idea").value.trim();
      var msg = L("waForm") + " " + (name || "…") + ".";
      if (it) msg += "\n" + L("waFormSvc") + ": " + it[lang] + " (" + money(it.min, it.max) + ").";
      if (idea) msg += "\n" + L("waFormIdea") + ": " + idea;
      msg += "\n" + L("waWhen");
      window.open(wa(msg), "_blank", "noopener");
    });
  }

  // ---------- gallery lightbox (galería) ----------
  function initLightbox() {
    var dlg = $("#lightbox");
    var figs = $$(".shot");
    if (!dlg || !figs.length) return;
    var img = $("#lb-img"), cap = $("#lb-cap"), want = $("#lb-want"), idx = 0, last = null;
    function show(i) {
      idx = (i + figs.length) % figs.length;
      var f = figs[idx], im = $("img", f), c = $(".shot-cap", f);
      img.src = f.dataset.full; img.alt = im.alt;
      cap.textContent = c ? c.textContent : "";
      want.href = wa(L("waLike") + " “" + cap.textContent + "”. " + L("waWhen"));
    }
    figs.forEach(function (f, i) {
      $("button", f).addEventListener("click", function () { last = this; show(i); dlg.showModal(); });
    });
    $("#lb-prev").addEventListener("click", function () { show(idx - 1); });
    $("#lb-next").addEventListener("click", function () { show(idx + 1); });
    $("#lb-close").addEventListener("click", function () { dlg.close(); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener("keydown", function (e) { if (e.key === "ArrowLeft") show(idx - 1); if (e.key === "ArrowRight") show(idx + 1); });
    dlg.addEventListener("close", function () { img.removeAttribute("src"); if (last) last.focus(); });
  }

  // ---------- save contact / share ----------
  function flash(btn, text) {
    var old = btn.textContent; btn.textContent = text; btn.classList.add("on");
    setTimeout(function () { btn.textContent = old; btn.classList.remove("on"); }, 1800);
  }
  function initContactButtons() {
    $$("[data-vcard]").forEach(function (b) {
      b.addEventListener("click", function () {
        var v = ["BEGIN:VCARD", "VERSION:3.0", "FN:" + NAME, "ORG:" + NAME, "TEL;TYPE=CELL:+" + PHONE,
          "URL:" + location.origin + "/", "X-SOCIALPROFILE;TYPE=instagram:https://instagram.com/" + IG, "END:VCARD"].join("\r\n");
        var a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([v], { type: "text/vcard" }));
        a.download = "Nails-by-Daniela.vcf";
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
        flash(b, L("saved"));
      });
    });
    $$("[data-share]").forEach(function (b) {
      b.addEventListener("click", function () {
        var url = location.origin + "/";
        if (navigator.share) { navigator.share({ title: NAME, url: url }).catch(function () {}); return; }
        if (navigator.clipboard) navigator.clipboard.writeText(url).then(function () { flash(b, L("copied")); }, function () {});
      });
    });
    $$("[data-print]").forEach(function (b) { b.addEventListener("click", function () { window.print(); }); });
  }

  // ---------- start ----------
  $$("[data-year]").forEach(function (n) { n.textContent = String(new Date().getFullYear()); });
  $$(".lang-btn").forEach(function (b) { b.addEventListener("click", function () { setLang(lang === "en" ? "es" : "en", true); }); });
  var q = new URLSearchParams(location.search).get("lang");
  initForm();
  initLightbox();
  watchQuote();
  initContactButtons();
  setLang(q === "en" || q === "es" ? q : (store.get("ndd-lang") || "es"), false);
})();
