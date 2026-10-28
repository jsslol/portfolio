/* Jared Schneider portfolio — vanilla JS, no dependencies.
   To add a project to the reel, add an entry to REEL and drop its files in
   assets/video/loops/<id>.mp4, assets/video/full/<id>.mp4 and assets/posters/<id>.jpg. */

const REEL = [
  { id: "fruitricide", title: "Fruitricide", engine: "unity",  target: "#p-fruitricide" },
  { id: "cabin",       title: "Something Is In The Woods", engine: "unreal", target: "#p-cabin" },
  { id: "tanks",       title: "Tank Arena",  engine: "unreal", target: "#p-tanks" },
  { id: "jumping",     title: "Prop Hop",    engine: "unreal", target: "#p-jumping" },
  { id: "dungeon",     title: "Dungeon Escape", engine: "unreal" },
  { id: "galaga",      title: "Galaga remake", engine: "unity" },
];

const ENGINE_LABEL = { unreal: "Unreal Engine 5", unity: "Unity", other: "Other" };
const loopSrc = id => `assets/video/loops/${id}.mp4`;
const fullSrc = id => `assets/video/full/${id}.mp4`;
const posterSrc = id => `assets/posters/${id}.jpg`;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------------- Hero reel ---------------- */
(function reel() {
  const vids = [...document.querySelectorAll(".reel__video")];
  const list = document.querySelector(".scrub");
  if (!vids.length || !list) return;

  list.innerHTML = REEL.map((c, i) => `
    <li data-engine="${c.engine}">
      <button type="button" data-i="${i}" aria-label="Play ${c.title} clip">
        <span class="scrub__bar"><span class="scrub__fill"></span></span>
        <span class="scrub__label">${c.title}</span>
        <span class="scrub__engine">${ENGINE_LABEL[c.engine]}</span>
      </button>
    </li>`).join("");
  const items = [...list.children];

  let cur = 0, front = 0, raf = 0;

  function mark(i) {
    items.forEach((li, k) => {
      li.classList.toggle("is-active", k === i);
      li.classList.toggle("is-past", k < i);
      li.querySelector(".scrub__fill").style.width = k < i ? "100%" : "0";
      li.querySelector("button").setAttribute("aria-current", k === i ? "true" : "false");
    });
  }

  function tick() {
    const v = vids[front];
    if (v.duration) items[cur].querySelector(".scrub__fill").style.width = (v.currentTime / v.duration * 100) + "%";
    raf = requestAnimationFrame(tick);
  }

  function go(i) {
    cur = (i + REEL.length) % REEL.length;
    const back = 1 - front;
    const next = vids[back];
    next.poster = posterSrc(REEL[cur].id);
    next.src = loopSrc(REEL[cur].id);
    mark(cur);
    const show = () => {
      next.classList.add("is-on");
      vids[front].classList.remove("is-on");
      const old = vids[front];
      setTimeout(() => old.pause(), 650);
      front = back;
    };
    if (reduceMotion) { next.load(); show(); return; }
    next.currentTime = 0;
    const p = next.play();
    if (p && p.then) p.then(show).catch(show); else show();
  }

  vids.forEach(v => v.addEventListener("ended", () => { if (v === vids[front]) go(cur + 1); }));
  list.addEventListener("click", e => {
    const b = e.target.closest("button[data-i]");
    if (b) go(+b.dataset.i);
  });

  // first clip goes straight onto the front video
  vids[0].poster = posterSrc(REEL[0].id);
  vids[0].src = loopSrc(REEL[0].id);
  mark(0);
  if (!reduceMotion) {
    vids[0].play().catch(() => {});
    raf = requestAnimationFrame(tick);
  }

  // pause the reel when it is scrolled away, to save battery
  new IntersectionObserver(([e]) => {
    const v = vids[front];
    if (reduceMotion) return;
    if (e.isIntersecting) { v.play().catch(() => {}); if (!raf) raf = requestAnimationFrame(tick); }
    else { v.pause(); cancelAnimationFrame(raf); raf = 0; }
  }, { threshold: 0.15 }).observe(document.querySelector(".reel"));
})();

/* ---------------- Card previews: play when visible ---------------- */
(function previews() {
  const vids = document.querySelectorAll(".card__media video, .mini__media video");
  if (reduceMotion) {
    // no autoplay; hover still plays on desktop
    vids.forEach(v => {
      const host = v.closest(".card, .mini");
      host.addEventListener("mouseenter", () => { v.preload = "auto"; v.play().catch(() => {}); });
      host.addEventListener("mouseleave", () => v.pause());
    });
    return;
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(({ target: v, isIntersecting }) => {
      if (isIntersecting) { v.preload = "auto"; v.play().catch(() => {}); }
      else v.pause();
    });
  }, { threshold: 0.35 });
  vids.forEach(v => io.observe(v));
})();

/* ---------------- Modals ---------------- */
(function modals() {
  const trailer = document.getElementById("trailer");
  const tVideo = trailer.querySelector("video");
  const tTitle = trailer.querySelector(".modal__title");

  function openTrailer(id, title) {
    document.querySelectorAll("dialog[open]").forEach(d => { if (d !== trailer) closeDialog(d); });
    tTitle.textContent = title || "Clip";
    tVideo.poster = posterSrc(id);
    tVideo.src = fullSrc(id);
    trailer.showModal();
    tVideo.play().catch(() => {});
  }
  function closeDialog(d) {
    d.querySelectorAll("video").forEach(v => v.pause());
    d.close();
  }

  document.addEventListener("click", e => {
    const t = e.target.closest("[data-trailer]");
    if (t) { e.preventDefault(); openTrailer(t.dataset.trailer, t.dataset.title); return; }

    const c = e.target.closest("[data-case]");
    if (c) {
      const d = document.getElementById("case-" + c.dataset.case);
      const v = d.querySelector("video[data-src]");
      if (v && !v.src) v.src = v.dataset.src;
      d.showModal();
      d.scrollTop = 0;
      if (v && !reduceMotion) v.play().catch(() => {});
      return;
    }

    if (e.target.closest("[data-close]")) { closeDialog(e.target.closest("dialog")); return; }

    // click on the backdrop closes
    if (e.target.tagName === "DIALOG") closeDialog(e.target);

    // links still waiting for a real URL
    const todo = e.target.closest("a.todo");
    if (todo && todo.getAttribute("href") === "#") e.preventDefault();
  });

  document.querySelectorAll("dialog").forEach(d =>
    d.addEventListener("close", () => d.querySelectorAll("video").forEach(v => v.pause())));
})();

/* ---------------- Skills matrix ---------------- */
(function skills() {
  const chips = [...document.querySelectorAll(".chip[data-skill]")];
  const out = document.querySelector(".matrix__out");
  const grid = document.getElementById("work");
  const projects = [...document.querySelectorAll("[data-skills]")];
  if (!chips.length) return;

  // Where a skill shows up outside the game projects
  const NOTES = {
    python: "Broadcast data tooling at Macrohard: Riot API ingestion and live OBS graphics.",
    c: "Systems coursework for my B.S. in Computer Science at SIUE.",
    git: "Version control on every project here.",
    linux: "Daily development environment.",
    gcp: "Cloud hosting for tournament data services.",
    opencv: "Player-position heatmaps from 1,000+ League of Legends games.",
    mongodb: "Match data store behind live tournament broadcasts.",
    multiplayer: "Reusable Unreal plugin for sessions and matchmaking, plus client-side prediction with server-side rewind.",
    ui: "Redesigned the client-facing UI for Macrohard's broadcast tools.",
  };
  const name = el => el.querySelector("h3, strong").textContent.trim();

  function select(chip) {
    const on = chip.getAttribute("aria-pressed") !== "true";
    chips.forEach(c => c.setAttribute("aria-pressed", "false"));
    projects.forEach(p => p.classList.remove("is-match"));

    if (!on) {
      grid.classList.remove("is-filtering");
      out.innerHTML = `<p class="matrix__hint">Nothing selected. Every project is shown.</p>`;
      return;
    }
    chip.setAttribute("aria-pressed", "true");
    const key = chip.dataset.skill;
    const hits = projects.filter(p => p.dataset.skills.split(" ").includes(key));
    hits.forEach(p => p.classList.add("is-match"));
    grid.classList.toggle("is-filtering", hits.length > 0);

    const label = chip.textContent.trim();
    const parts = [];
    if (hits.length) parts.push(`<p><b>${label}</b> is used in ${hits.map(name).join(", ")}. <a href="#work">Jump to the games</a></p>`);
    if (NOTES[key]) parts.push(`<p>${hits.length ? "Also: " : `<b>${label}</b>: `}${NOTES[key]}</p>`);
    if (!parts.length) parts.push(`<p><b>${label}</b></p>`);
    out.innerHTML = parts.join("");
  }

  chips.forEach(c => c.addEventListener("click", () => select(c)));
})();

/* ---------------- Copy email ---------------- */
(function copyEmail() {
  const btn = document.getElementById("copy-email");
  const addr = document.querySelector(".contact__addr");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const text = addr.textContent.trim();
    const done = () => { btn.textContent = "Copied"; setTimeout(() => (btn.textContent = "Copy email"), 1800); };
    const fallback = () => {
      const r = document.createRange(); r.selectNodeContents(addr);
      const s = getSelection(); s.removeAllRanges(); s.addRange(r);
      btn.textContent = "Press Ctrl+C";
    };
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, fallback); else fallback();
  });
})();
