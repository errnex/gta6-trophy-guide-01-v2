// Leonida Platinum — offline GTA VI trophy tracker.
// Loads app/data/trophies.json (the app's own file), keeps earned trophies in
// localStorage, and renders the checklist, detail guide, roadmap and missables.
// No network use at all: no fetch beyond the local JSON, no external script.
const STORAGE_KEY = 'leonida-platinum-v1';
const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);

const state = {
  trophies: [],
  sources: [],
  note: '',
  earned: new Set(),
  kind: 'all',
  grade: 'all',
  query: '',
  spoiler: false,
  selectedId: null,
  view: 'checklist',
};

function loadEarned() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) state.earned = new Set(JSON.parse(raw));
  } catch { state.earned = new Set(); }
}

function saveEarned() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...state.earned]));
}

function isHidden(trophy) {
  return state.spoiler && trophy.kind === 'story' && !state.earned.has(trophy.name);
}

function displayName(trophy) {
  return isHidden(trophy) ? 'Story trophy #' + trophy.id + ' — hidden until earned' : trophy.name;
}

function displayDesc(trophy) {
  return isHidden(trophy) ? 'Spoiler-free mode hides this story trophy until you earn it.' : trophy.description;
}

function gradeBadge(trophy) {
  const span = document.createElement('span');
  span.className = 'badge ' + trophy.grade;
  span.textContent = trophy.grade;
  return span;
}

function kindBadge(trophy) {
  const span = document.createElement('span');
  span.className = 'badge kind';
  span.textContent = trophy.kind;
  return span;
}

function missableBadge() {
  const span = document.createElement('span');
  span.className = 'badge missable';
  span.textContent = 'possibly missable';
  return span;
}

function matchesFilters(trophy) {
  if (state.kind === 'missable') {
    if (!trophy.missable) return false;
  } else if (state.kind !== 'all' && trophy.kind !== state.kind) {
    return false;
  }
  if (state.grade !== 'all' && trophy.grade !== state.grade) return false;
  if (state.query) {
    const hay = (trophy.name + ' ' + trophy.description + ' ' + trophy.guide).toLowerCase();
    if (!hay.includes(state.query)) return false;
  }
  return true;
}

function renderProgress() {
  const total = state.trophies.length;
  const earned = state.earned.size;
  const pct = total ? Math.round((earned / total) * 100) : 0;
  $('progressCount').textContent = earned + ' of ' + total + ' earned';
  $('progressPct').textContent = pct + '% to platinum';
  $('progressFill').style.width = pct + '%';
  const counts = ['platinum', 'gold', 'silver', 'bronze']
    .map((g) => {
      const n = state.trophies.filter((t) => t.grade === g && state.earned.has(t.name)).length;
      const all = state.trophies.filter((t) => t.grade === g).length;
      return g + ' ' + n + '/' + all;
    })
    .join(' · ');
  $('gradeCounts').textContent = counts;
}

function renderList() {
  const list = $('trophyList');
  list.replaceChildren();
  const shown = state.trophies.filter(matchesFilters);
  for (const trophy of shown) {
    const li = document.createElement('li');
    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'trophy' + (state.earned.has(trophy.name) ? ' earned' : '') +
      (state.selectedId === trophy.id ? ' selected' : '');
    row.addEventListener('click', (event) => {
      if (event.target.tagName === 'INPUT') return;
      selectTrophy(trophy.id);
    });
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = state.earned.has(trophy.name);
    box.setAttribute('aria-label', 'Earned: ' + trophy.name);
    box.addEventListener('click', (event) => event.stopPropagation());
    box.addEventListener('change', () => {
      if (box.checked) state.earned.add(trophy.name);
      else state.earned.delete(trophy.name);
      saveEarned();
      renderAll();
    });
    const body = document.createElement('span');
    const name = document.createElement('span');
    name.className = 'trophy-name';
    name.textContent = displayName(trophy);
    const desc = document.createElement('span');
    desc.className = 'trophy-desc';
    desc.textContent = displayDesc(trophy);
    const meta = document.createElement('span');
    meta.className = 'trophy-meta';
    meta.append(gradeBadge(trophy), kindBadge(trophy));
    if (trophy.missable) meta.append(missableBadge());
    body.append(name, document.createElement('br'), desc, meta);
    const right = document.createElement('span');
    right.className = 'trophy-meta';
    row.append(box, body, right);
    li.append(row);
    list.append(li);
  }
  $('emptyState').hidden = shown.length > 0 ||
    (state.kind === 'online' && state.query === '' && state.grade === 'all');
  if (state.kind === 'online') {
    $('emptyState').hidden = false;
    $('emptyState').textContent = 'No online trophies: the official 55-trophy list has no online trophy, so this filter is empty by design.';
  } else {
    $('emptyState').textContent = 'No trophies match these filters. Try clearing the search or picking another kind.';
  }
  $('resultCount').textContent = shown.length + ' of ' + state.trophies.length + ' trophies shown';
}

function renderMissables() {
  const list = $('missableList');
  list.replaceChildren();
  for (const trophy of state.trophies.filter((t) => t.missable)) {
    const li = document.createElement('li');
    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'trophy';
    const name = document.createElement('span');
    name.className = 'trophy-name';
    name.textContent = trophy.name + ' — ' + trophy.description;
    const guide = document.createElement('span');
    guide.className = 'trophy-desc';
    guide.textContent = trophy.guide;
    row.append(name, guide);
    row.addEventListener('click', () => {
      showView('checklist');
      selectTrophy(trophy.id);
    });
    li.append(row);
    list.append(li);
  }
}

function sourceLinks() {
  const wrap = document.createElement('p');
  wrap.className = 'source';
  wrap.textContent = 'Sources: ';
  state.sources.forEach((source, index) => {
    if (index > 0) wrap.append(document.createTextNode(' · '));
    const a = document.createElement('a');
    a.href = source.url;
    a.rel = 'noopener';
    a.textContent = source.name;
    wrap.append(a);
  });
  return wrap;
}

function renderDetail() {
  const panel = $('detail');
  panel.replaceChildren();
  const trophy = state.trophies.find((t) => t.id === state.selectedId) || state.trophies[0];
  if (!trophy) {
    panel.textContent = 'Loading trophies…';
    return;
  }
  const title = document.createElement('h3');
  title.textContent = displayName(trophy);
  const meta = document.createElement('p');
  meta.className = 'trophy-meta';
  meta.append(gradeBadge(trophy), kindBadge(trophy));
  if (trophy.missable) meta.append(missableBadge());
  const official = document.createElement('p');
  official.className = 'official';
  official.textContent = 'Official: "' + displayDesc(trophy) + '"';
  const guideHead = document.createElement('h4');
  guideHead.textContent = 'Guide — in our own words';
  const guide = document.createElement('p');
  guide.textContent = isHidden(trophy)
    ? 'Earn this story trophy to reveal its guide.'
    : trophy.guide;
  const sourceHead = document.createElement('h4');
  sourceHead.textContent = 'Where this comes from';
  const source = document.createElement('p');
  source.className = 'source';
  source.textContent = trophy.source + '.';
  const cta = document.createElement('div');
  cta.className = 'cta';
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.textContent = state.earned.has(trophy.name) ? 'Mark as not earned' : 'Mark as earned';
  toggle.addEventListener('click', () => {
    if (state.earned.has(trophy.name)) state.earned.delete(trophy.name);
    else state.earned.add(trophy.name);
    saveEarned();
    renderAll();
  });
  cta.append(toggle);
  panel.append(title, meta, official, guideHead, guide, sourceHead, source, sourceLinks(), cta);
}

function renderAll() {
  renderProgress();
  renderList();
  renderMissables();
  renderDetail();
}

function selectTrophy(id) {
  state.selectedId = id;
  renderList();
  renderDetail();
}

function showView(view) {
  state.view = view;
  document.querySelectorAll('.tab').forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.view === view);
  });
  document.querySelectorAll('.view').forEach((section) => {
    section.hidden = section.id !== 'view-' + view;
  });
}

function exportProgress() {
  const blob = new Blob([JSON.stringify({ earned: [...state.earned] }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'leonida-platinum-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

function importProgress(file) {
  file.text().then((text) => {
    const data = JSON.parse(text);
    const names = Array.isArray(data) ? data : data.earned;
    const known = new Set(state.trophies.map((t) => t.name));
    state.earned = new Set(names.filter((name) => known.has(name)));
    saveEarned();
    renderAll();
  }).catch(() => {
    alert('That file is not a Leonida Platinum progress export.');
  });
}

async function init() {
  loadEarned();
  const doc = await (await fetch('data/trophies.json')).json();
  state.trophies = doc.trophies;
  state.sources = doc.sources || [];
  state.note = doc.note || '';

  // Screenshot / deep-link params: ?view=roadmap|missables, ?trophy=<id>,
  // ?spoiler=1, and ?demo=1 seeds a few earned trophies for a lived-in look.
  if (params.get('demo') === '1' && !localStorage.getItem(STORAGE_KEY + ':demo')) {
    for (const id of [3, 4, 5, 8, 15, 21, 35, 46]) {
      const trophy = state.trophies.find((t) => t.id === id);
      if (trophy) state.earned.add(trophy.name);
    }
    saveEarned();
    localStorage.setItem(STORAGE_KEY + ':demo', '1');
  }
  if (params.get('spoiler') === '1') state.spoiler = true;
  if (params.get('view') && ['checklist', 'roadmap', 'missables'].includes(params.get('view'))) {
    showView(params.get('view'));
  }
  const wanted = Number(params.get('trophy'));
  state.selectedId = state.trophies.some((t) => t.id === wanted) ? wanted : 17;

  $('spoiler').checked = state.spoiler;
  $('spoiler').addEventListener('change', (event) => {
    state.spoiler = event.target.checked;
    renderAll();
  });
  document.querySelectorAll('.kind').forEach((button) => {
    button.addEventListener('click', () => {
      state.kind = button.dataset.kind;
      document.querySelectorAll('.kind').forEach((b) => b.classList.toggle('active', b === button));
      renderAll();
    });
  });
  document.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => showView(tab.dataset.view));
  });
  $('grade').addEventListener('change', (event) => {
    state.grade = event.target.value;
    renderAll();
  });
  $('search').addEventListener('input', (event) => {
    state.query = event.target.value.trim().toLowerCase();
    renderAll();
  });
  $('export').addEventListener('click', exportProgress);
  $('import').addEventListener('change', (event) => {
    if (event.target.files[0]) importProgress(event.target.files[0]);
    event.target.value = '';
  });
  $('reset').addEventListener('click', () => {
    if (confirm('Clear all earned trophies?')) {
      state.earned.clear();
      saveEarned();
      renderAll();
    }
  });

  renderAll();
  window.__shotReady = true;
}

init();
