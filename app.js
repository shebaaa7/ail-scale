(function () {
  var L = window.AIL_LEVELS;
  var $ = function (id) { return document.getElementById(id); };
  var byN = function (n) { return L[n - 1]; };
  var color = function (n) { return "hsl(" + (175 + (n - 1) * 10) + ",55%,36%)"; };

  /* ---------- Scale cards ---------- */
  function list(items) {
    return "<ul>" + items.map(function (t) {
      return /—\s*OR\s*—\s*$/.test(t)
        ? "<li>" + esc(t.replace(/\s*—\s*OR\s*—\s*$/i, "")) + '</li><li class="or">or</li>'
        : "<li>" + esc(t) + "</li>";
    }).join("") + "</ul>";
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  $("cards").innerHTML = L.map(function (l) {
    var c = l.n <= 6 ? "var(--assist)" : "var(--direct)";
    return '<article class="card" style="--lc:' + c + '"><h3><small>AIL-' + l.n + "</small>" + esc(l.name) + "</h3>" +
      "<h4>AI does</h4>" + list(l.ai) + "<h4>Human does</h4>" + list(l.human) + "</article>";
  }).join("");

  /* ---------- Badge & statement ---------- */
  var hi = $("hi"), lo = $("lo"), varied = $("varied"), plan = $("plan"), title = $("title");
  L.forEach(function (l) {
    var o = '<option value="' + l.n + '">AIL-' + l.n + " " + esc(l.name) + "</option>";
    hi.insertAdjacentHTML("beforeend", o); lo.insertAdjacentHTML("beforeend", o);
  });
  hi.value = "1"; lo.value = "1";

  function label(h, l) { return l < h ? "AIL-" + l + "–" + h : "AIL-" + h; }
  function badgeSvg(h, l) {
    var left = "AI Involvement", right = label(h, l);
    var lw = 14 + left.length * 6.6, rw = 14 + right.length * 7.4, w = lw + rw;
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + Math.round(w) + '" height="28" viewBox="0 0 ' + Math.round(w) + ' 28" role="img" aria-label="' + left + ": " + right + '">' +
      '<rect width="' + Math.round(w) + '" height="28" rx="5" fill="#2b303b"/>' +
      '<rect x="' + Math.round(lw) + '" width="' + Math.round(rw) + '" height="28" rx="5" fill="' + color(h) + '"/>' +
      '<rect x="' + Math.round(lw) + '" width="8" height="28" fill="' + color(h) + '"/>' +
      '<g fill="#fff" font-family="Verdana,DejaVu Sans,sans-serif" font-size="11" text-anchor="middle">' +
      '<text x="' + Math.round(lw / 2) + '" y="18">' + left + "</text>" +
      '<text x="' + Math.round(lw + rw / 2) + '" y="18" font-weight="bold">' + right + "</text></g></svg>";
  }

  function current() {
    var h = +hi.value, l = varied.checked ? Math.min(+lo.value, h) : h;
    return { h: h, l: l };
  }
  function update() {
    $("loWrap").hidden = !varied.checked;
    var c = current(), h = c.h, l = c.l, lv = byN(h);
    $("planWrap").style.opacity = h >= 7 ? 1 : 0.5;
    $("badgeBox").innerHTML = badgeSvg(h, l);
    var s = (title.value.trim() ? "“" + title.value.trim() + "”: " : "") +
      label(h, l).replace("–", " to AIL-") + " (" + lv.name + ")" + (l < h ? ", varied across the manuscript" : "") + ".\n" +
      "AI role: " + lv.ai.map(function (t) { return t.replace(/\s*—\s*OR\s*—\s*$/, ""); }).join("; ") + ".\n";
    if (h >= 7 && plan.value) s += "Planning materials (outlines, character notes) were developed " + (plan.value === "independent" ? "independently by the author" : "collaboratively with AI") + " before drafting.\n";
    s += "Disclosed using the AIL Scale (AI Involvement Level), July 2026.";
    $("statement").value = s;
  }
  [hi, lo, varied, plan, title].forEach(function (e) { e.addEventListener("input", update); });
  update();

  function toast(t) { $("toast").textContent = t; setTimeout(function () { $("toast").textContent = ""; }, 1800); }
  function copy(text, msg) {
    var done = function () { toast(msg); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback); else fallback();
    function fallback() { var t = document.createElement("textarea"); t.value = text; document.body.appendChild(t); t.select(); document.execCommand("copy"); t.remove(); done(); }
  }
  $("cpStmt").onclick = function () { copy($("statement").value, "Statement copied"); };
  $("cpSvg").onclick = function () { var c = current(); copy(badgeSvg(c.h, c.l), "SVG copied"); };
  $("dlSvg").onclick = function () {
    var c = current(), a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([badgeSvg(c.h, c.l)], { type: "image/svg+xml" }));
    a.download = "ail-" + (c.l < c.h ? c.l + "-" + c.h : c.h) + ".svg"; a.click(); URL.revokeObjectURL(a.href);
  };

  /* ---------- Wizard ---------- */
  var W = $("wizard"), st;
  var Q1 = [
    ["none", "I did not use AI on the manuscript itself (research lookups don't count)"],
    ["1-6", "I wrote every word of the prose myself; AI only helped with editing or expanding my writing"],
    [7, "AI wrote small pieces: paragraphs or mini-scenes, working from my prompts, outlines, or notes"],
    [8, "AI wrote large sections or multi-scene expansions, or partial chapters from my detailed outlines"],
    [9, "AI wrote full chapters from my instructions or outlines, and I heavily edited and rewrote them"],
    [10, "AI wrote most of the prose from my concept, world, and character notes; I edited selected passages"],
    [11, "AI wrote nearly everything from my initial idea; I did a final polish and light edit"],
    [12, "AI wrote everything; I provided only a title or one-line concept"]
  ];
  var Q2 = [
    [1, "Spellcheck, grammar, punctuation, or spacing only. Purely mechanical."],
    [2, "Minor rephrasing, clarity or tone tweaks, simple continuity checks. I accepted or rejected every change."],
    [3, "Read my manuscript and gave editorial notes only (plot holes, pacing, arcs). I made every fix myself."],
    [4, "Suggested dialogue, sentence, or flow fixes and consistency checks. I applied them; it did not rewrite scenes."],
    [5, "Rewrote paragraphs, improved pacing and transitions, fixed continuity. I approved or rejected each passage."],
    [6, "Expanded my scenes with description or dialogue. I reviewed and edited all of it."]
  ];

  function reset() { st = { step: 0, a: {} }; render(); }
  function steps() {
    var s = ["q1"];
    if (st.a.q1 === "1-6") s.push("q2");
    if (st.a.q1 === "none") return s;
    s.push("q3", "q4");
    return s;
  }
  function level() { return st.a.q1 === "1-6" ? st.a.q2 : +st.a.q1; }

  function opt(type, name, val, text, checked) {
    return '<label class="opt' + (checked ? " sel" : "") + '"><input type="' + type + '" name="' + name + '" value="' + val + '"' + (checked ? " checked" : "") + "><span>" + esc(text) + "</span></label>";
  }
  function render() {
    var ss = steps(), id = ss[st.step], total = ss.length, h = "";
    if (st.done || st.a.q1 === "none" && st.step > 0) return result();
    h += '<div class="progress"><i style="width:' + Math.round(st.step / total * 100) + '%"></i></div><div class="q">';
    if (id === "q1") {
      h += "<h3>Who wrote the prose in the final manuscript?</h3><p>Pick the closest match.</p>" +
        Q1.map(function (o) { return opt("radio", "q", o[0], o[1], st.a.q1 === String(o[0])); }).join("");
    } else if (id === "q2") {
      h += "<h3>What did AI do to your writing?</h3><p>Choose the most involved thing it did. (Choose the highest that applies; you can note a range afterwards.)</p>" +
        Q2.map(function (o) { return opt("radio", "q", o[0], o[1], st.a.q2 === o[0]); }).join("");
    } else if (id === "q3") {
      var lv = level();
      if (lv < 7) { st.a.plan = ""; st.step++; return render(); }
      h += "<h3>How were the planning materials made?</h3><p>Outlines, character notes, timelines, worldbuilding files, developed before drafting began.</p>" +
        opt("radio", "q", "independent", "I developed them independently", st.a.plan === "independent") +
        opt("radio", "q", "collaborative", "I developed them collaboratively with AI (brainstorming, structuring)", st.a.plan === "collaborative");
    } else if (id === "q4") {
      h += "<h3>Was your process the same throughout?</h3><p>For example, heavier AI use in some chapters than others.</p>" +
        opt("radio", "q", "same", "Same throughout the manuscript", st.a.varied === "same") +
        opt("radio", "q", "varied", "It varied, so I'd like to report a range", st.a.varied === "varied") +
        '<div id="loPick" ' + (st.a.varied === "varied" ? "" : "hidden") + '><label>Lightest level used in any part<select id="loSel">' +
        L.filter(function (l) { return l.n < level(); }).map(function (l) { return '<option value="' + l.n + '"' + (st.a.lo === l.n ? " selected" : "") + ">AIL-" + l.n + " " + esc(l.name) + "</option>"; }).join("") +
        "</select></label></div>";
    }
    h += '</div><div class="btns">' + (st.step ? '<button class="ghost" id="back">Back</button>' : "") + '<button id="next" disabled>Next</button></div>';
    W.innerHTML = h;

    var next = $("next");
    function ready() {
      var r = W.querySelector("input:checked");
      next.disabled = !r;
      W.querySelectorAll(".opt").forEach(function (o) { o.classList.toggle("sel", o.firstChild.checked); });
      if (id === "q4") $("loPick").hidden = !(r && r.value === "varied");
    }
    W.querySelectorAll("input").forEach(function (i) { i.addEventListener("change", ready); });
    ready();
    if ($("back")) $("back").onclick = function () { st.step--; if (steps()[st.step] === "q3" && level() < 7) st.step--; render(); };
    next.onclick = function () {
      var v = W.querySelector("input:checked").value;
      if (id === "q1") { st.a.q1 = v; if (v !== "1-6") delete st.a.q2; }
      if (id === "q2") st.a.q2 = +v;
      if (id === "q3") st.a.plan = v;
      if (id === "q4") { st.a.varied = v; st.a.lo = v === "varied" ? +$("loSel").value : null; st.done = true; return result(); }
      st.step++; render();
    };
  }

  function result() {
    if (st.a.q1 === "none") {
      W.innerHTML = '<div class="result"><div class="big">No AIL level needed</div><p class="why">If AI touched only your research (lookups of facts or history), the scale does not track that. If you used it on the manuscript itself in any way, go back and choose the closest option.</p><button id="again">Start over</button></div>';
      $("again").onclick = reset; return;
    }
    var h = level(), l = st.a.varied === "varied" && st.a.lo ? st.a.lo : h;
    hi.value = h; varied.checked = l < h; lo.value = l; plan.value = st.a.plan || ""; update();
    W.innerHTML = '<div class="result"><p class="small">Suggested level</p><div class="big" style="color:' + color(h) + '">' + label(h, l) + "</div>" +
      '<p class="why"><strong>' + esc(byN(h).name) + "</strong>" + (l < h ? " (top of your range)" : "") + ". " + (h <= 6 ? "AI assisted your writing." : "You directed AI writing.") + "</p>" +
      '<div class="badgebox">' + badgeSvg(h, l) + '</div><div class="btns" style="justify-content:center">' +
      '<button id="toBadge">Get badge &amp; statement</button><button class="ghost" id="again">Start over</button></div></div>';
    $("again").onclick = reset;
    $("toBadge").onclick = function () { $("badge").scrollIntoView(); };
  }
  reset();
})();
