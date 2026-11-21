/* =====================================================================
   SYNC AGENCY — main script
   1. Helpers            5. Portfolio (filter + load more)
   2. Data loading       6. Viewer (cinematic lightbox)
   3. Demo poster art    7. Motion (cursor, reveals, wall, marquee…)
   4. Render             8. Boot
   Defaults live in js/content.js — real content comes from /admin.
   ===================================================================== */
(() => {
"use strict";

/* ---------- 1. Helpers ---------- */
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const isAr = t => /[؀-ۿ]/.test(t);
const FINE = matchMedia("(hover:hover) and (pointer:fine)").matches;
const REDUCE = matchMedia("(prefers-reduced-motion:reduce)").matches;
const MOBILE = innerWidth < 760;
const PAL = [["#ff2d55","#2a0010"],["#7b5cff","#140a3a"],["#00d4ff","#001a2a"],["#ffb800","#3a1500"],["#2bd48a","#00281a"],["#ff6a00","#3a0a00"]];
const store = { get(k){ try{ return localStorage.getItem(k) }catch(e){ return null } }, set(k,v){ try{ localStorage.setItem(k,v) }catch(e){} } };

let L = store.get("lang") || (navigator.language.startsWith("ar") ? "ar" : "en");
let F = "all", LIM = 12, lenis = null;
const t = k => TXT[L][k] ?? "";
const cat = c => CATS[c][L === "ar" ? 0 : 1];

/* ---------- 2. Data loading (control panel JSON) ---------- */
const getJSON = async u => { try { const r = await fetch(u, { cache: "no-cache" }); if (r.ok) return await r.json() } catch (e) {} return null };

async function loadContent(){
  const cats = Object.keys(CATS);
  const [settings, ...lists] = await Promise.all([getJSON("content/settings.json"), ...cats.map(c => getJSON(`content/${c}.json`))]);

  const works = [];
  lists.forEach((d, n) => (d?.items || []).forEach(it => {
    if (it.hidden) return;
    works.push({ cat: cats[n], title: it.title || "", img: it.image || "", video: it.video_url || it.video_file || "", date: it.date || "", featured: !!it.featured });
  }));
  if (lists.some(Boolean)) WORKS = works.map((w,i) => [w,i]).sort((a,b) => (b[0].featured - a[0].featured) || a[1] - b[1]).map(x => x[0]);

  const s = settings; if (!s) return;
  if (s.email) EMAIL = s.email;
  if (s.portrait) PORTRAIT = s.portrait;
  if (s.links?.length) LINKS = s.links.map(l => [l.name, l.label || "", l.url]);
  if (s.clients?.length) CLIENTS = s.clients.map(c => c.logo || c.name);
  if (s.stats?.length) STATS = s.stats.map(x => [String(x.number), x.suffix || "", x.label_ar || "", x.label_en || ""]);
  if (s.services?.length) SERVICES = s.services.map(x => [x.title_ar, x.title_en, x.desc_ar || "", x.desc_en || ""]);
  if (s.tags?.length) TAGS = s.tags;
  if (s.marquee?.length) MARQUEE = s.marquee;
  for (const c in s.categories || {}) { const v = s.categories[c]; if (CATS[c] && v) CATS[c] = [v.ar || CATS[c][0], v.en || CATS[c][1]] }
  const alias = { hero: "hSub", hook: "aHook" };
  ["ar","en"].forEach(l => { const tx = s["text_" + l]; if (!tx) return;
    for (const k in tx) { if (tx[k] == null || tx[k] === "") continue;
      if (k === "about") TXT[l].about = String(tx[k]).split(/\n\s*\n/); else TXT[l][alias[k] || k] = tx[k] } });
  const R = document.documentElement.style;
  if (s.accent) R.setProperty("--ac", s.accent);
  if (s.background) R.setProperty("--bg", s.background);
  if (s.logo) R.setProperty("--logo", `url("${s.logo}")`);
  if (s.site_title) document.title = s.site_title;
}
let MARQUEE = ["SYNC AGENCY","Art Direction","Film","Music","Social","AI"];

/* ---------- 3. Demo poster art (shown when a work has no image) ---------- */
function art(w, i){
  const p = PAL[i % PAL.length], T = w.title, tc = `t${isAr(T) ? " ar" : ""}`;
  const v = `style="--c1:${w.c1 || p[0]};--c2:${w.c2 || p[1]};--hh:${i*60}deg"`;
  switch (w.cat){
    case "film":   return `<div class="p film" ${v}><div class="top">SYNC PICTURES PRESENTS</div><div class="sun"></div><div class="fig"></div><div class="fog"></div><div class="${tc}">${T}</div><div class="dt">${w.date||""}</div></div>`;
    case "series": return `<div class="p series" ${v}><div class="f"></div><div class="f"></div><div class="f"></div><div class="bar"></div><div class="top">AN ORIGINAL SERIES</div><div class="${tc}">${T}</div><div class="dt">${w.date||""}</div></div>`;
    case "video":  return `<div class="p clip" ${v}><div class="sun"></div><div class="ln"></div><div class="fig"></div><span class="tg">OFFICIAL VIDEO</span><div class="${tc}">${T}</div></div>`;
    case "music":  return `<div class="p cover" ${v}><div class="disc"></div><div class="${tc}">${T}</div></div>`;
    case "social": return `<div class="p soc" ${v}><div class="gl"></div><div class="${tc}">${T}</div><span class="pill">SWIPE →</span></div>`;
    default:       return `<div class="p ai" ${v}><div class="blob"></div><div class="mesh"></div><span class="tg">AI</span><div class="${tc}">${T}</div></div>`;
  }
}
const media = (w, i, eager) => w.img ? `<img src="${w.img}" alt="${w.title}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">` : art(w, i);

/* split text into words for the reveal animation */
function split(el){
  let i = 0;
  const wrap = s => s.split(/(\s+)/).map(w => !w || /^\s+$/.test(w) ? w : `<span class="w"><i style="--i:${i++}">${w}</i></span>`).join("");
  el.innerHTML = [...el.childNodes].map(n => { if (n.nodeType === 3) return wrap(n.textContent); const c = n.cloneNode(false); c.innerHTML = wrap(n.textContent); return c.outerHTML }).join("");
  el.classList.add("sp");
}

/* ---------- 4. Render (runs on load and on language switch) ---------- */
function render(){
  const A = L === "ar";
  document.documentElement.lang = L; document.documentElement.dir = A ? "rtl" : "ltr";
  $$("[data-t]").forEach(e => e.innerHTML = t(e.dataset.t));
  $("#lang").textContent = A ? "English" : "عربي";

  $("#stats").innerHTML = STATS.map(s => `<div><b data-n="${s[0]}" data-s="${s[1]}">${s[0]}${s[1]}</b><span>${A ? s[2] : s[3]}</span></div>`).join("");
  const used = ["all", ...Object.keys(CATS).filter(c => WORKS.some(w => w.cat === c))];
  $("#tabs").innerHTML = used.map(c => `<button class="${c === F ? "on" : ""}" data-f="${c}">${c === "all" ? t("all") : cat(c)}</button>`).join("");
  $("#grid").innerHTML = WORKS.map((w,i) => `<div class="it" data-i="${i}" style="--d:${i%3}"><div class="fr">${media(w,i)}<div class="ov"><i class="${w.cat==="video" ? "pl" : ""}">${w.cat==="video" ? "" : "⤢"}</i></div>${FINE ? '<div class="shine"></div>' : ""}</div><div class="cap"><h3 dir="auto">${w.title}</h3><small>${cat(w.cat)}</small></div></div>`).join("");
  $("#aboutTx").innerHTML = TXT[L].about.map(p => `<p class="tx">${p}</p>`).join("");
  $("#tags").innerHTML = TAGS.map(x => `<span>${x}</span>`).join("");
  $("#svc").innerHTML = SERVICES.map((s,i) => `<div><b>0${i+1}</b><h4>${A ? s[0] : s[1]}</h4><p>${A ? s[2] : s[3]}</p></div>`).join("");
  $("#cl").innerHTML = CLIENTS.map(c => `<div>${/\.(png|jpe?g|webp|svg)$/i.test(c) ? `<img src="${c}" alt="" loading="lazy">` : c}</div>`).join("");
  $("#mail").href = "mailto:" + EMAIL;
  $("#links").innerHTML = `<a href="mailto:${EMAIL}">Email<small>${EMAIL}</small></a>` + LINKS.map(l => `<a href="${l[2]}" target="_blank" rel="noopener">${l[0]}<small>${l[1]}</small></a>`).join("");

  $$("h2").forEach(h => { split(h); reveal.observe(h) });
  $$("#stats div").forEach(d => reveal.observe(d));
  applyFilter();
  bindHovers();
}

/* ---------- 5. Portfolio: filter + "load more" ---------- */
function applyFilter(){
  let shown = 0, total = 0;
  $$("#grid .it").forEach(it => {
    const match = F === "all" || WORKS[it.dataset.i].cat === F;
    if (match) total++;
    const vis = match && shown < LIM; if (vis) shown++;
    it.classList.toggle("hide", !vis);
    if (vis && !it.classList.contains("on")) reveal.observe(it);
  });
  const b = $("#more"); b.hidden = total <= LIM;
  b.textContent = (L === "ar" ? "عرض المزيد" : "Load more") + ` (${Math.max(0, total - LIM)})`;
}
function initPortfolio(){
  $("#tabs").addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return;
    F = b.dataset.f; LIM = 12; $$("#tabs button").forEach(x => x.classList.toggle("on", x === b)); applyFilter() });
  $("#grid").addEventListener("click", e => { const it = e.target.closest(".it"); if (it) Viewer.open(+it.dataset.i) });
  $("#more").addEventListener("click", () => { LIM += 12; applyFilter() });
}

/* ---------- 6. Viewer — "Now Showing" cinema ---------- */
const Viewer = (() => {
  let cur = 0, list = [], ratio = .8, busy = false;
  const vw = $("#vw"), vm = $("#vmed"), vv = $("#vvid");
  const visible = () => $$("#grid .it:not(.hide)").map(e => +e.dataset.i);
  const ytId = u => (u.match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([\w-]{11})/) || [])[1];
  const pad = n => String(n).padStart(2, "0");

  /* size poster + screen so both always fit the space between the letterbox bars */
  function size(){
    const mob = innerWidth <= 900, dual = vw.classList.contains("dual"), wide = vm.classList.contains("wide");
    const W = innerWidth - (mob ? 32 : 96), H = innerHeight - (mob ? 56 + 92 : 64 + 104) - (mob ? 150 : 150);
    const r = wide ? 16/9 : ratio, gap = Math.min(48, Math.max(20, innerWidth*.03));
    let ph;
    if (mob) ph = dual ? Math.min(H*.52, W/r) : Math.min(H*.85, W/r);
    else ph = dual ? Math.min(H, (W - gap)/(r + 16/9)) : Math.min(H, W/r);
    vw.style.setProperty("--ph", Math.max(160, ph) + "px");
    vm.style.setProperty("--pr", r);
  }
  /* average colour of the poster → ambient light around the screen */
  function ambient(img){
    try { const c = document.createElement("canvas"), x = c.getContext("2d", { willReadFrequently: true }); c.width = c.height = 12;
      x.drawImage(img, 0, 0, 12, 12); const d = x.getImageData(0, 0, 12, 12).data; let r = 0, g = 0, b = 0;
      for (let k = 0; k < d.length; k += 4){ r += d[k]; g += d[k+1]; b += d[k+2] }
      const n = d.length/4, boost = v => Math.min(255, Math.round(v/n*1.35));
      vw.style.setProperty("--amb", `${boost(r)},${boost(g)},${boost(b)}`) } catch (e) {}
  }
  function player(w){ const y = ytId(w.video);
    return y ? `<iframe src="https://www.youtube-nocookie.com/embed/${y}?rel=0&playsinline=1&modestbranding=1" title="${w.title}" allow="autoplay;encrypted-media;fullscreen;picture-in-picture" allowfullscreen></iframe>`
             : `<video src="${w.video}" controls playsinline preload="metadata"></video>` }

  function fill(i){
    cur = i; const w = WORKS[i], k = list.indexOf(i);
    const dual = !!(w.video && w.img), onlyVideo = !!(w.video && !w.img), demoVideo = w.cat === "video" && !w.video && !w.img;
    vw.classList.toggle("dual", dual);
    vm.className = "vmed" + (onlyVideo ? " wide" : "");
    vm.innerHTML = (onlyVideo ? player(w) : media(w, i, true) + (demoVideo ? `<div class="note">${t("demo")}</div>` : "")) + '<div class="gl2"></div>';
    vv.innerHTML = dual ? player(w) : "";
    ratio = .8; vw.style.setProperty("--amb", PAL[i % PAL.length][0].match(/\w\w/g).map(h => parseInt(h, 16)).join(","));
    const im = vm.querySelector("img");
    if (im){ const done = () => { if (im.naturalWidth){ ratio = im.naturalWidth/im.naturalHeight; size(); ambient(im) } }; im.complete ? done() : im.onload = done }
    size();

    $("#vbg").innerHTML = w.img ? `<img src="${w.img}" alt="">` : art(w, i);
    $("#vmq").textContent = Array(8).fill(w.title + "  ✦  ").join("");
    $("#vnum").innerHTML = `${L === "ar" ? "مشهد" : "SCENE"} <b>${pad(k+1)}</b> / ${pad(list.length)}`;
    $("#vc").textContent = cat(w.cat);
    const vt = $("#vt"); vt.textContent = w.title; vt.dir = isAr(w.title) ? "rtl" : "ltr";
    $("#vd").textContent = "SYNC AGENCY — Art Direction";
    split(vt); vt.classList.remove("on"); requestAnimationFrame(() => requestAnimationFrame(() => vt.classList.add("on")));
    $$("#vth button").forEach(b => b.classList.toggle("on", +b.dataset.i === i));
    const ab = $(`#vth button[data-i="${i}"]`), th = $("#vth");
    if (ab) th.scrollTo({ left: ab.offsetLeft - th.clientWidth/2 + ab.offsetWidth/2, behavior: "smooth" });
  }
  /* shutter cut, then swap the work */
  function go(i){
    if (busy || i === cur) return; busy = true;
    vw.classList.remove("cut"); void vw.offsetWidth; vw.classList.add("cut");
    setTimeout(() => fill(i), 270);
    setTimeout(() => { vw.classList.remove("cut"); busy = false }, 640);
  }
  function open(i, src){
    list = visible(); if (!list.includes(i)) list.unshift(i);
    $("#vth").innerHTML = list.map(j => `<button data-i="${j}" aria-label="${WORKS[j].title}">${media(WORKS[j], j)}</button>`).join("");
    const r = (src || $(`#grid .it[data-i="${i}"] .fr`))?.getBoundingClientRect();
    if (r){ vw.style.setProperty("--ox", r.left + r.width/2 + "px"); vw.style.setProperty("--oy", r.top + r.height/2 + "px") }
    cur = -1; fill(i); vw.classList.add("on"); document.body.style.overflow = "hidden"; lenis?.stop();
  }
  function close(){
    vw.classList.remove("on", "cut"); document.body.style.overflow = ""; lenis?.start();
    setTimeout(() => { if (!vw.classList.contains("on")){ vm.innerHTML = ""; vv.innerHTML = ""; $("#vbg").innerHTML = "" } }, 900);
  }
  const step = d => { const k = list.indexOf(cur); go(list[(k + d + list.length) % list.length]) };

  $("#vx").onclick = close; $("#vn").onclick = () => step(1); $("#vp").onclick = () => step(-1);
  $("#vth").addEventListener("click", e => { const b = e.target.closest("button"); if (b) go(+b.dataset.i) });
  addEventListener("keydown", e => { if (!vw.classList.contains("on")) return;
    if (e.key === "Escape") close(); if (e.key === "ArrowRight") step(1); if (e.key === "ArrowLeft") step(-1) });
  addEventListener("resize", () => vw.classList.contains("on") && size());
  if (FINE) vw.addEventListener("mousemove", e => { if (vm.classList.contains("wide")) return;
    const x = e.clientX/innerWidth - .5, y = e.clientY/innerHeight - .5;
    vm.style.transform = `rotateY(${x*12}deg) rotateX(${-y*10}deg)` });
  let tx = 0;
  vw.addEventListener("touchstart", e => tx = e.touches[0].clientX, { passive: true });
  vw.addEventListener("touchend", e => { if (e.target.closest(".vvid,.vth")) return; const d = e.changedTouches[0].clientX - tx; if (Math.abs(d) > 50) step(d < 0 ? 1 : -1) }, { passive: true });
  return { open };
})();

/* ---------- 7. Motion ---------- */
/* reveal on scroll + stat counters */
const reveal = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add("on"); reveal.unobserve(e.target);
  e.target.querySelectorAll?.("[data-n]").forEach(n => { let v = 0; const end = +n.dataset.n;
    const f = () => { v = Math.min(end, v + end/50); n.textContent = Math.round(v) + n.dataset.s; if (v < end) requestAnimationFrame(f) }; f() });
}), { threshold: .12 });

/* tracks whether an element is on screen (used to pause loops) */
const onScreen = (el, cb) => new IntersectionObserver(([e]) => cb(e.isIntersecting), { rootMargin: "100px" }).observe(el);

/* custom cursor (mouse only) */
const Cursor = (() => {
  const cd = $("#cd"), cr = $("#cr");
  if (!FINE){ cd.remove(); cr.remove(); return { set(){}, clear(){} } }
  let mx = -100, my = -100, rx = mx, ry = my, moving = false;
  addEventListener("mousemove", e => { mx = e.clientX; my = e.clientY; cd.style.transform = `translate(${mx-3}px,${my-3}px)`; if (!moving){ moving = true; requestAnimationFrame(loop) } }, { passive: true });
  function loop(){ rx += (mx-rx)*.18; ry += (my-ry)*.18; cr.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
    if (Math.abs(mx-rx) + Math.abs(my-ry) > .3) requestAnimationFrame(loop); else moving = false }
  return { set(cls, txt){ cr.className = "cr " + cls; cr.textContent = txt || "" }, clear(){ cr.className = "cr"; cr.textContent = "" } };
})();

function bindHovers(){
  if (!FINE) return;
  $$("a,button").forEach(el => { if (el._h) return; el._h = 1;
    el.addEventListener("mouseenter", () => Cursor.set("hv")); el.addEventListener("mouseleave", () => Cursor.clear()) });
  $$("#grid .it").forEach(it => { const fr = it.querySelector(".fr");
    it.addEventListener("mouseenter", () => Cursor.set("lb2", WORKS[it.dataset.i].cat === "video" ? (L === "ar" ? "شغّل" : "PLAY") : (L === "ar" ? "شوف" : "VIEW")));
    it.addEventListener("mouseleave", () => { Cursor.clear(); fr.style.transform = "" });
    it.addEventListener("mousemove", e => { const r = fr.getBoundingClientRect(), x = (e.clientX - r.left)/r.width, y = (e.clientY - r.top)/r.height;
      fr.style.transform = `perspective(900px) rotateY(${(x-.5)*10}deg) rotateX(${(.5-y)*10}deg)`; fr.style.setProperty("--mx", x*100 + "%"); fr.style.setProperty("--my", y*100 + "%") }) });
  $$(".btn").forEach(b => { if (b._m) return; b._m = 1;
    b.addEventListener("mousemove", e => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width/2)*.3}px,${(e.clientY - r.top - r.height/2)*.4}px)` });
    b.addEventListener("mouseleave", () => b.style.transform = "") });
}

/* 3D poster tunnel (hero) — scroll flies the camera through your work */
function initTunnel(){
  const hero = $(".hero"), world = $("#tworld"), flash = $("#tflash"), heroIn = $(".hero .in"), hint = $("#drag");
  let tiles = [], span = 1, running = false, visible = true, idle = 0, mx = 0, my = 0, rx = 0, ry = 0, last = -1;
  const mod = (a, n) => ((a % n) + n) % n;

  function build(){
    const mob = innerWidth < 760, tw = mob ? 112 : innerWidth < 1100 ? 170 : 230, D = mob ? 220 : 230;
    const N = Math.min(mob ? 24 : 42, Math.max(16, WORKS.length * 3));
    const W = innerWidth / 2, H = innerHeight / 2;
    const rMin = mob ? W * .62 : Math.max(W * .42, H * .9), rMax = mob ? W * 1.25 : W * 1.05;
    span = N * D;
    let h = "";
    for (let k = 0; k < N; k++){
      const i = k % WORKS.length, a = k * 2.39996, r = rMin + (rMax - rMin) * ((k * .618) % 1);
      const x = Math.round(Math.cos(a) * r), y = Math.round(Math.sin(a) * r * (mob ? 1.5 : .78)), rot = (k * 37) % 18 - 9;
      h += `<div class="tt" data-i="${i}" data-x="${x}" data-y="${y}" data-z="${-k * D}" data-r="${rot}">${media(WORKS[i], i)}</div>`;
    }
    world.style.setProperty("--tw", tw + "px"); world.innerHTML = h;
    tiles = $$("#tworld .tt").map(el => ({ el, x: +el.dataset.x, y: +el.dataset.y, z: +el.dataset.z, r: +el.dataset.r }));
    last = -1;
  }
  function frame(){
    if (!visible){ running = false; return }
    const top = hero.getBoundingClientRect().top, room = hero.offsetHeight - innerHeight;
    const p = Math.min(1, Math.max(0, -top / Math.max(1, room)));
    if (!REDUCE) idle += 1.3;
    const cam = idle + p * span * 1.15;
    rx += (mx - rx) * .06; ry += (my - ry) * .06;
    world.style.transform = `rotateX(${-ry * 7}deg) rotateY(${rx * 9}deg)`;
    for (const t of tiles){
      const z = mod(t.z + cam, span) - span + 620;                 // −span+620 … 620
      const far = Math.min(1, (z + span - 620) / (span * .22));    // fade in from the fog
      const near = z > 380 ? Math.max(0, (620 - z) / 240) : 1;      // fade out before hitting the lens
      t.el.style.transform = `translate3d(${t.x}px,${t.y}px,${z}px) rotate(${t.r}deg)`;
      t.el.style.opacity = (far * near).toFixed(3);
    }
    if (p !== last){ last = p;
      heroIn.style.opacity = Math.max(0, 1 - p * 3.2);
      heroIn.style.transform = `scale(${1 - p * .35})`;
      hint.style.opacity = Math.max(0, 1 - p * 6);
      flash.style.opacity = p > .76 ? Math.min(1, (p - .76) / .16) : 0;
    }
    requestAnimationFrame(frame);
  }
  const start = () => { if (!running){ running = true; requestAnimationFrame(frame) } };

  addEventListener("mousemove", e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5 }, { passive: true });
  world.addEventListener("click", e => { const tl = e.target.closest(".tt"); if (!tl) return;
    F = "all"; LIM = Math.max(LIM, WORKS.length); $$("#tabs button").forEach(x => x.classList.toggle("on", x.dataset.f === "all")); applyFilter();
    Viewer.open(+tl.dataset.i, tl) });
  if (FINE){
    world.addEventListener("mouseover", e => { const tl = e.target.closest(".tt"); if (tl) Cursor.set("lb2", WORKS[tl.dataset.i].cat === "video" ? (L === "ar" ? "شغّل" : "PLAY") : (L === "ar" ? "شوف" : "VIEW")) });
    world.addEventListener("mouseout", e => { if (e.target.closest(".tt")) Cursor.clear() });
  }
  let rt; addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(build, 250) });
  onScreen(hero, v => { visible = v; if (v) start() });
  document.addEventListener("visibilitychange", () => { if (!document.hidden) start() });
  build(); start();
}

/* big marquee — speeds up with scroll, pauses off screen */
function initMarquee(){
  const tr = $("#mqt"), words = MARQUEE.flatMap(w => [w, "✦"]);
  tr.innerHTML = [...words, ...words, ...words].map(w => `<span class="${w === "✦" ? "st" : ""}">${w}</span>`).join("");
  let x = 0, vel = 0, last = scrollY, on = false, running = false, third = 0;
  const loop = () => { if (!on){ running = false; return }
    vel *= .92; x -= 1 + Math.abs(vel)*.6; if (-x > third) x += third;
    tr.style.transform = `translate3d(${x}px,0,0)`; requestAnimationFrame(loop) };
  addEventListener("scroll", () => { vel += (scrollY - last)*.25; last = scrollY }, { passive: true });
  onScreen(tr, v => { on = v; third = tr.scrollWidth/3; if (v && !running){ running = true; requestAnimationFrame(loop) } });
}

/* scroll-driven: nav, progress bar, touch card tilt (one rAF per scroll) */
function initScroll(){
  const nav = $("#nav"), pg = $("#prog");
  let ticking = false;
  const update = () => { ticking = false;
    const y = scrollY, vh = innerHeight;
    nav.classList.toggle("s", y > 30);
    pg.style.transform = `scaleX(${y / Math.max(1, document.documentElement.scrollHeight - vh)})`;
    if (!FINE && !REDUCE) $$("#grid .it.on:not(.hide) .fr").forEach(fr => { const r = fr.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh) return;
      const k = (r.top + r.height/2 - vh/2)/vh; fr.style.transform = `perspective(800px) rotateX(${k*-12}deg) scale(${1 - Math.abs(k)*.06})` });
  };
  addEventListener("scroll", () => { if (!ticking){ ticking = true; requestAnimationFrame(update) } }, { passive: true });
  update();
}

/* smooth scrolling (desktop only — native scroll feels better on phones) */
function initSmooth(){
  if (!window.Lenis || REDUCE || !FINE) return;
  lenis = new Lenis({ lerp: .09 });
  const raf = time => { lenis.raf(time); requestAnimationFrame(raf) }; requestAnimationFrame(raf);
  $$('a[href^="#"]').forEach(a => a.addEventListener("click", e => { const tg = $(a.getAttribute("href")); if (tg){ e.preventDefault(); lenis.scrollTo(tg, { offset: -10 }) } }));
}

/* mobile menu */
function initMenu(){
  const set = v => { document.body.classList.toggle("mo", v); lenis && (v ? lenis.stop() : lenis.start()) };
  $("#burger").onclick = () => set(!document.body.classList.contains("mo"));
  $$("#mm a").forEach(a => a.addEventListener("click", () => set(false)));
}

/* ---------- 8. Boot ---------- */
async function boot(){
  const pnum = $("#pnum"), pbar = $("#pbar"); let p = 0;
  const tick = setInterval(() => { p = Math.min(90, p + Math.ceil(Math.random()*9)); pnum.textContent = p; pbar.style.width = p + "%" }, 40);
  const minTime = new Promise(r => setTimeout(r, MOBILE ? 400 : 700));

  await loadContent();
  if (PORTRAIT){ $("#port .sil")?.remove(); $("#port").insertAdjacentHTML("afterbegin", `<img src="${PORTRAIT}" alt="Mohamed Hegazy" loading="lazy">`) }
  render(); initPortfolio(); initMenu(); initSmooth(); initScroll(); initMarquee(); initTunnel();
  $("#lang").onclick = () => { L = L === "ar" ? "en" : "ar"; store.set("lang", L); render() };
  $$(".rv").forEach(e => reveal.observe(e)); reveal.observe($("#port"));

  await minTime; clearInterval(tick); pnum.textContent = 100; pbar.style.width = "100%";
  setTimeout(() => { $("#pre").classList.add("out"); document.body.classList.remove("loading"); setTimeout(() => $("#pre").remove(), 1200) }, 120);
}
boot();
})();
