/* SYNC AGENCY — "In the wild": your posters on a billboard, a cinema lightbox and an Instagram story */
(() => {
  const AR = () => document.documentElement.lang === "ar";
  const SCENES = [
    { id: "bb", icon: "🌃", ar: "بيلبورد", en: "Billboard", where: ["شارع رئيسي — بالليل", "Main street — at night"] },
    { id: "cn", icon: "🎬", ar: "السينما", en: "Cinema",    where: ["لوبي السينما", "Cinema lobby"] },
    { id: "ig", icon: "📱", ar: "إنستجرام", en: "Instagram", where: ["ستوري على إنستجرام", "Instagram story"] }
  ];
  const DUR = 3800, PER_SCENE = 3;

  function avg(img){ try { const c = document.createElement("canvas"), x = c.getContext("2d", { willReadFrequently: true }); c.width = c.height = 10;
    x.drawImage(img, 0, 0, 10, 10); const d = x.getImageData(0, 0, 10, 10).data; let r = 0, g = 0, b = 0;
    for (let k = 0; k < d.length; k += 4){ r += d[k]; g += d[k+1]; b += d[k+2] } const n = d.length/4, f = v => Math.min(255, Math.round(v/n*1.4));
    return `${f(r)},${f(g)},${f(b)}` } catch (e) { return "255,90,120" } }

  function init(){
    const sec = document.getElementById("wild"); if (!sec || typeof WORKS === "undefined") return;
    const list = WORKS.filter(w => w.img).slice(0, 18); if (!list.length){ sec.remove(); return }
    const stage = sec.querySelector(".wstage"), tabs = sec.querySelector(".wtabs");
    const imgs = list.map(w => `<img alt="" loading="lazy" decoding="async" src="${w.img}">`).join("");
    const city = Array.from({ length: 22 }, (_, i) => `<i style="height:${30 + ((i*53) % 70)}%;--lit:${(.25 + ((i*37) % 60)/100).toFixed(2)}"></i>`).join("");
    stage.innerHTML = `
      <div class="scene s-bb" data-s="bb"><div class="stars"></div><div class="moon"></div><div class="city">${city}</div><div class="fog"></div>
        <div class="bb"><div class="lamps"><i></i><i></i><i></i></div><div class="board"><div class="wp">${imgs}</div></div><div class="pole"></div></div></div>
      <div class="scene s-cn" data-s="cn"><div class="panels"></div><div class="floor"></div><div class="sign">NOW SHOWING</div>
        <div class="lb3"><div class="wp">${imgs}</div></div><div class="rope l"></div><div class="rope r"></div></div>
      <div class="scene s-ig" data-s="ig"><div class="blur wp">${imgs}</div>
        <div class="phone"><div class="screen"><div class="bgp wp">${imgs}</div><div class="notch"></div>
          <div class="bars">${"<i></i>".repeat(PER_SCENE)}</div>
          <div class="who"><span class="av"><i></i></span>syncagency.eg<small>2h</small></div>
          <div class="wp">${imgs}</div><div class="likes">❤️</div>
          <div class="reply"><span>Send message</span><b>♡</b><b>➤</b></div></div></div></div>`;
    stage.style.setProperty("--dur", DUR + "ms");
    const label = () => { tabs.innerHTML = SCENES.map((s, i) => `<button data-i="${i}" class="${i === si ? "on" : ""}"><i>${s.icon}</i>${AR() ? s.ar : s.en}</button>`).join("") };

    let si = 0, pi = 0, step = 0, timer = null;
    const scenes = [...stage.querySelectorAll(".scene")], prog = sec.querySelector(".wprog");
    function show(){
      const w = list[pi % list.length], ref = stage.querySelector(`.scene[data-s="${SCENES[si].id}"] .wp img:nth-child(${(pi % list.length) + 1})`);
      scenes.forEach((s, i) => s.classList.toggle("on", i === si));
      stage.querySelectorAll(".wp").forEach(wp => [...wp.children].forEach((im, k) => im.classList.toggle("on", k === pi % list.length)));
      const apply = () => { const r = ref.naturalWidth / ref.naturalHeight || .8; stage.style.setProperty("--r", r.toFixed(3)); stage.style.setProperty("--amb", avg(ref)) };
      ref.loading = "eager"; ref.complete ? apply() : ref.onload = apply;
      sec.querySelector(".wcap b").textContent = w.title; sec.querySelector(".wcap b").dir = "auto";
      sec.querySelector(".wcap small").textContent = SCENES[si].where[AR() ? 0 : 1];
      const bars = stage.querySelectorAll(".bars i"); bars.forEach((b, k) => { b.className = k < step ? "done" : k === step ? "now" : "" });
      prog.classList.remove("run"); void prog.offsetWidth; prog.classList.add("run");
      label();
    }
    function next(){ pi++; step++; if (step >= PER_SCENE){ step = 0; si = (si + 1) % SCENES.length } show() }
    const play = () => { clearInterval(timer); timer = setInterval(next, DUR) };
    tabs.addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; si = +b.dataset.i; step = 0; pi++; show(); play() });
    stage.addEventListener("click", () => { const i = WORKS.indexOf(list[pi % list.length]); const it = document.querySelector(`#grid .it[data-i="${i}"]`); it && it.click() });
    new IntersectionObserver(([e]) => { if (e.isIntersecting){ show(); play() } else clearInterval(timer) }, { threshold: .2 }).observe(stage);
    document.getElementById("lang")?.addEventListener("click", () => setTimeout(show, 50));
  }
  document.addEventListener("sync:ready", init, { once: true });
})();
