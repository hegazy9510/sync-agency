/* SYNC LAB — shared helpers for the demo pages */
const LAB = {
  /* posters (with images) from the control panel */
  async works(max = 14){
    const cats = ["film","series","music","video","social","ai"];
    const lists = await Promise.all(cats.map(c => fetch(`/content/${c}.json`, { cache: "no-cache" }).then(r => r.ok ? r.json() : null).catch(() => null)));
    const out = [];
    lists.forEach(d => (d?.items || []).forEach(it => { if (it.image && !it.hidden) out.push({ title: it.title || "", img: it.image.startsWith("/") ? it.image : "/" + it.image, featured: !!it.featured }) }));
    out.sort((a, b) => b.featured - a.featured);
    return out.slice(0, max);
  },
  load(src){ return new Promise((ok, no) => { const i = new Image(); i.decoding = "async"; i.onload = () => ok(i); i.onerror = no; i.src = src }) },
  /* average colour, pushed a little brighter/saturated for backgrounds */
  color(img){
    const c = document.createElement("canvas"), x = c.getContext("2d", { willReadFrequently: true }); c.width = c.height = 16;
    x.drawImage(img, 0, 0, 16, 16); const d = x.getImageData(0, 0, 16, 16).data; let r = 0, g = 0, b = 0, n = 0;
    for (let k = 0; k < d.length; k += 4){ const l = d[k] + d[k+1] + d[k+2]; if (l < 40) continue; r += d[k]; g += d[k+1]; b += d[k+2]; n++ }
    n = n || 1; r /= n; g /= n; b /= n; const m = (r + g + b) / 3, s = 1.5;
    return [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(m + (v - m) * s))));
  }
};
