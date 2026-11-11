import './style.css';
import { GEISHA, geishaSVG, itemSVG, backSVG, markerSVG, favorSVG, lanternSVG } from './art.js';
import { aiChooseAction, aiPickGift, aiPickComp } from './ai.js';

const HUMAN = 0, AI = 1;
const ACTIONS = ['secret', 'trade', 'gift', 'comp'];
const INFO = {
  secret: { name: 'Secret', n: 1, desc: 'Hide 1 card face-down. It scores at the end of the round.' },
  trade: { name: 'Trade-off', n: 2, desc: 'Discard 2 cards face-down. They do not score this round.' },
  gift: { name: 'Gift', n: 3, desc: 'Offer 3 cards. Your opponent takes 1, you keep the other 2.' },
  comp: { name: 'Competition', n: 4, desc: 'Offer 2 pairs. Your opponent takes a pair, you keep the other.' },
};
const COLORS = ['#c4162a', '#2b4f8c'];

let S;
let uid = 0;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const app = document.getElementById('app');

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function log(msg) {
  S.log.unshift(msg);
  S.log = S.log.slice(0, 40);
}

function markFresh(cards) {
  cards.forEach((c) => S.fresh.add(c.id));
  setTimeout(() => cards.forEach((c) => S.fresh.delete(c.id)), 900);
}

function newGame() {
  S = { round: 0, starter: HUMAN, favor: Array(7).fill(-1), log: [], fresh: new Set(), summary: null, busy: false };
  startRound();
}

function resetUI() {
  S.ui = { action: null, sel: [], groups: {} };
}

function startRound() {
  S.round++;
  const deck = [];
  GEISHA.forEach((g, i) => { for (let k = 0; k < g.v; k++) deck.push({ id: uid++, g: i }); });
  shuffle(deck);
  S.removed = deck.pop();
  S.hands = [deck.splice(0, 6), deck.splice(0, 6)];
  S.deck = deck;
  S.used = [{}, {}];
  S.secret = [null, null];
  S.trade = [[], []];
  S.board = [0, 1].map(() => GEISHA.map(() => []));
  S.turns = [0, 0];
  S.current = S.starter;
  S.pending = null;
  S.summary = null;
  S.revealed = false;
  resetUI();
  log(`— Round ${S.round} — ${S.starter === HUMAN ? 'You start.' : 'The AI starts.'}`);
  beginTurn();
}

const sortHand = (h) => h.sort((a, b) => a.g - b.g || a.id - b.id);

async function beginTurn() {
  const p = S.current;
  const c = S.deck.pop();
  S.hands[p].push(c);
  sortHand(S.hands[p]);
  S.drawn = p === HUMAN ? c.id : null;
  if (p === HUMAN) markFresh([c]);
  render();
  if (p === AI) {
    S.busy = true;
    render();
    await sleep(1000);
    await aiTurn();
  }
}

function boardCounts(p, withSecret) {
  const c = S.board[p].map((a) => a.length);
  if (withSecret && S.secret[p]) c[S.secret[p].g]++;
  return c;
}

function aiView() {
  return {
    hand: S.hands[AI],
    me: boardCounts(AI, true),
    opp: boardCounts(HUMAN, false),
    favor: S.favor.map((f) => (f === AI ? 1 : f === HUMAN ? -1 : 0)),
    used: S.used[AI],
  };
}

const removeFromHand = (p, cards) => { S.hands[p] = S.hands[p].filter((c) => !cards.includes(c)); };
const place = (p, cards) => { cards.forEach((c) => S.board[p][c.g].push(c)); markFresh(cards); };

async function aiTurn() {
  const mv = aiChooseAction(aiView());
  const name = INFO[mv.type].name;
  if (mv.type === 'secret') {
    removeFromHand(AI, mv.cards);
    S.secret[AI] = mv.cards[0];
    log('AI hid a card under its Secret marker.');
  } else if (mv.type === 'trade') {
    removeFromHand(AI, mv.cards);
    S.trade[AI] = mv.cards;
    log('AI discarded 2 cards with Trade-off.');
  } else if (mv.type === 'gift') {
    removeFromHand(AI, mv.cards);
    const idx = await new Promise((resolve) => {
      S.pending = { type: 'gift', cards: mv.cards, resolve };
      S.busy = false;
      render();
    });
    const mine = mv.cards[idx];
    S.pending = null;
    place(HUMAN, [mine]);
    place(AI, mv.cards.filter((c) => c !== mine));
    log(`AI used Gift — you took ${GEISHA[mine.g].item}.`);
  } else {
    const all = [...mv.sets[0], ...mv.sets[1]];
    removeFromHand(AI, all);
    const idx = await new Promise((resolve) => {
      S.pending = { type: 'comp', sets: mv.sets, resolve };
      S.busy = false;
      render();
    });
    S.pending = null;
    place(HUMAN, mv.sets[idx]);
    place(AI, mv.sets[1 - idx]);
    log(`AI used Competition — you took ${mv.sets[idx].map((c) => GEISHA[c.g].item).join(' + ')}.`);
  }
  S.busy = false;
  endAction(AI, mv.type, name);
}

async function humanConfirm() {
  const { action, sel } = S.ui;
  const cards = sel.map((id) => S.hands[HUMAN].find((c) => c.id === id));
  S.busy = true;
  removeFromHand(HUMAN, cards);
  if (action === 'secret') {
    S.secret[HUMAN] = cards[0];
    log(`You hid ${GEISHA[cards[0].g].item} as your Secret.`);
  } else if (action === 'trade') {
    S.trade[HUMAN] = cards;
    log(`You discarded ${cards.map((c) => GEISHA[c.g].item).join(' + ')}.`);
  } else if (action === 'gift') {
    S.offer = { type: 'gift', cards };
    resetUI();
    render();
    await sleep(1200);
    const idx = aiPickGift(aiView(), cards);
    S.offer.pick = idx;
    render();
    await sleep(1100);
    S.offer = null;
    place(AI, [cards[idx]]);
    place(HUMAN, cards.filter((_, k) => k !== idx));
    log(`Your Gift — AI took ${GEISHA[cards[idx].g].item}.`);
  } else {
    const sets = [cards.filter((c) => S.ui.groups[c.id] === 0), cards.filter((c) => S.ui.groups[c.id] === 1)];
    S.offer = { type: 'comp', sets };
    resetUI();
    render();
    await sleep(1200);
    const idx = aiPickComp(aiView(), sets);
    S.offer.pick = idx;
    render();
    await sleep(1100);
    S.offer = null;
    place(AI, sets[idx]);
    place(HUMAN, sets[1 - idx]);
    log(`Your Competition — AI took ${sets[idx].map((c) => GEISHA[c.g].item).join(' + ')}.`);
  }
  S.busy = false;
  resetUI();
  endAction(HUMAN, action);
}

function endAction(p, type) {
  S.used[p][type] = true;
  S.turns[p]++;
  if (S.turns[0] === 4 && S.turns[1] === 4) {
    scoreRound();
    return;
  }
  S.current = 1 - p;
  beginTurn();
}

function tally() {
  const r = [0, 1].map((p) => ({ geisha: 0, points: 0 }));
  S.favor.forEach((f, i) => { if (f >= 0) { r[f].geisha++; r[f].points += GEISHA[i].v; } });
  return r;
}

async function scoreRound() {
  render();
  await sleep(700);
  S.revealed = true;
  [HUMAN, AI].forEach((p) => { if (S.secret[p]) place(p, [S.secret[p]]); });
  log(`Secrets revealed: you ${GEISHA[S.secret[HUMAN].g].item}, AI ${GEISHA[S.secret[AI].g].item}.`);
  render();
  await sleep(1100);
  for (let i = 0; i < 7; i++) {
    const h = S.board[HUMAN][i].length, a = S.board[AI][i].length;
    if (h > a) S.favor[i] = HUMAN;
    else if (a > h) S.favor[i] = AI;
  }
  render();
  await sleep(1200);
  const t = tally();
  const reached = t.map((x) => x.points >= 11 || x.geisha >= 4);
  let winner = null;
  if (reached[0] && reached[1]) winner = t[0].points >= 11 ? HUMAN : AI;
  else if (reached[0]) winner = HUMAN;
  else if (reached[1]) winner = AI;
  S.summary = { t, winner };
  if (winner !== null) log(winner === HUMAN ? 'You win the game!' : 'The AI wins the game.');
  render();
}

function nextRound() {
  S.starter = 1 - S.starter;
  startRound();
}

// ---------- Interaction ----------
function clickCard(id) {
  const ui = S.ui;
  if (!ui.action) return;
  const n = INFO[ui.action].n;
  if (ui.action === 'comp') {
    const g = ui.groups[id];
    const countG = (k) => Object.values(ui.groups).filter((x) => x === k).length;
    if (g === undefined) {
      if (ui.sel.length >= 4) return;
      ui.groups[id] = countG(0) < 2 ? 0 : 1;
      ui.sel.push(id);
    } else if (g === 0 && countG(1) < 2) {
      ui.groups[id] = 1;
    } else {
      delete ui.groups[id];
      ui.sel = ui.sel.filter((x) => x !== id);
    }
  } else if (ui.sel.includes(id)) {
    ui.sel = ui.sel.filter((x) => x !== id);
  } else if (n === 1) {
    ui.sel = [id];
  } else if (ui.sel.length < n) {
    ui.sel.push(id);
  }
  render();
}

function canConfirm() {
  const { action, sel, groups } = S.ui;
  if (!action) return false;
  if (sel.length !== INFO[action].n) return false;
  if (action === 'comp') return Object.values(groups).filter((x) => x === 0).length === 2;
  return true;
}

app.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]');
  if (!el) return;
  const act = el.dataset.act;
  const myTurn = S.current === HUMAN && !S.busy && !S.pending && !S.summary;
  if (act === 'new') newGame();
  else if (act === 'next') nextRound();
  else if (act === 'rules') { S.showRules = !S.showRules; render(); }
  else if (act === 'marker' && myTurn) {
    const t = el.dataset.type;
    if (S.used[HUMAN][t]) return;
    S.ui = { action: S.ui.action === t ? null : t, sel: [], groups: {} };
    render();
  } else if (act === 'card' && myTurn) clickCard(Number(el.dataset.id));
  else if (act === 'confirm' && myTurn && canConfirm()) humanConfirm();
  else if (act === 'cancel' && myTurn) { resetUI(); render(); }
  else if (act === 'pick' && S.pending) S.pending.resolve(Number(el.dataset.idx));
});

// ---------- Rendering ----------
const itemCard = (c, cls = '', extra = '') =>
  `<div class="card item ${cls} ${S.fresh.has(c.id) ? 'fresh' : ''}" ${extra}>${itemSVG(c.g)}</div>`;
const backCard = (cls = '') => `<div class="card back ${cls}">${backSVG()}</div>`;

function renderMarkers(p) {
  return `<div class="markers">${ACTIONS.map((t) => {
    const used = S.used[p][t];
    const active = p === HUMAN && S.ui.action === t;
    const clickable = p === HUMAN && !used && S.current === HUMAN && !S.busy && !S.pending;
    return `<div class="marker ${used ? 'used' : ''} ${active ? 'active' : ''} ${clickable ? 'clickable' : ''}"
      ${p === HUMAN ? `data-act="marker" data-type="${t}"` : ''} title="${INFO[t].name}: ${INFO[t].desc}">
      ${markerSVG(t, COLORS[p])}<span>${INFO[t].name}</span></div>`;
  }).join('')}</div>`;
}

function renderHidden(p) {
  const sec = S.secret[p];
  const tr = S.trade[p];
  const showMine = p === HUMAN;
  const secHtml = sec && !S.revealed
    ? (showMine ? itemCard(sec, 'mini peek') : backCard('mini'))
    : '<div class="slot mini"></div>';
  const trHtml = tr.length
    ? tr.map((c) => (showMine || S.summary ? itemCard(c, 'mini peek') : backCard('mini'))).join('')
    : '<div class="slot mini"></div>';
  return `<div class="hidden-zone">
    <div class="hz"><label>Secret</label><div class="hz-cards">${secHtml}</div></div>
    <div class="hz"><label>Trade-off</label><div class="hz-cards">${trHtml}</div></div>
  </div>`;
}

function renderBoard() {
  return `<div class="board">${GEISHA.map((g, i) => {
    const f = S.favor[i];
    const pos = f === HUMAN ? 'pos-hu' : f === AI ? 'pos-ai' : 'pos-mid';
    const a = S.board[AI][i].length, h = S.board[HUMAN][i].length;
    return `<div class="col">
      <div class="stack top">${S.board[AI][i].map((c) => itemCard(c, 'mini')).join('')}</div>
      <div class="geisha" style="--gc:${g.color}">
        ${geishaSVG(i)}
        <div class="favor ${pos}">${favorSVG(f)}</div>
        <div class="tally"><b class="ai">${a}</b><b class="hu">${h}</b></div>
      </div>
      <div class="stack bottom">${S.board[HUMAN][i].map((c) => itemCard(c, 'mini')).join('')}</div>
    </div>`;
  }).join('')}</div>`;
}

function renderHand() {
  const hand = S.hands[HUMAN];
  const ui = S.ui;
  return `<div class="hand">${hand.map((c, k) => {
    const sel = ui.sel.includes(c.id);
    const grp = ui.action === 'comp' && sel ? ui.groups[c.id] : undefined;
    const badge = grp !== undefined ? `<div class="badge g${grp}">${grp === 0 ? 'A' : 'B'}</div>` : '';
    const rot = (k - (hand.length - 1) / 2) * 3;
    return `<div class="hand-slot" style="--r:${rot}deg">${itemCard(c, `${sel ? 'selected' : ''} ${ui.action ? 'pickable' : ''} ${grp !== undefined ? 'grp' + grp : ''} ${S.drawn === c.id ? 'drawn' : ''}`, `data-act="card" data-id="${c.id}"`)}${badge}</div>`;
  }).join('')}</div>`;
}

function renderPrompt() {
  if (S.summary) return '';
  if (S.current === AI || S.busy) return `<div class="prompt thinking"><span class="dots"></span> ${S.offer ? 'AI is choosing…' : S.current === AI ? 'AI is thinking…' : '…'}</div>`;
  if (!S.ui.action) return `<div class="prompt">Your turn — choose an action marker.</div>`;
  const info = INFO[S.ui.action];
  let extra = '';
  if (S.ui.action === 'comp') extra = ' Click cards to assign them to pair <b class="ga">A</b> / <b class="gb">B</b> (click again to move or remove).';
  return `<div class="prompt"><b>${info.name}:</b> ${info.desc} Select ${info.n} card${info.n > 1 ? 's' : ''}.${extra}
    <button class="btn" data-act="confirm" ${canConfirm() ? '' : 'disabled'}>Confirm</button>
    <button class="btn ghost" data-act="cancel">Cancel</button></div>`;
}

function renderOverlay() {
  if (S.pending) {
    const p = S.pending;
    const body = p.type === 'gift'
      ? `<div class="offer">${p.cards.map((c, k) => `<div class="offer-opt" data-act="pick" data-idx="${k}">${itemCard(c)}</div>`).join('')}</div>`
      : `<div class="offer">${p.sets.map((s, k) => `<div class="offer-opt pair" data-act="pick" data-idx="${k}">${s.map((c) => itemCard(c)).join('')}<span>Pair ${k ? 'B' : 'A'}</span></div>`).join('')}</div>`;
    return `<div class="overlay pick"><div class="modal">
      <h2>${p.type === 'gift' ? 'The AI offers a Gift' : 'The AI calls a Competition'}</h2>
      <p>${p.type === 'gift' ? 'Choose 1 card to take. The AI keeps the other two.' : 'Choose a pair to take. The AI keeps the other pair.'}</p>
      ${body}</div></div>`;
  }
  if (S.offer) {
    const o = S.offer;
    const body = o.type === 'gift'
      ? o.cards.map((c, k) => `<div class="offer-opt ${o.pick === k ? 'taken' : o.pick !== undefined ? 'kept' : ''}">${itemCard(c)}</div>`).join('')
      : o.sets.map((s, k) => `<div class="offer-opt pair ${o.pick === k ? 'taken' : o.pick !== undefined ? 'kept' : ''}">${s.map((c) => itemCard(c)).join('')}<span>Pair ${k ? 'B' : 'A'}</span></div>`).join('');
    return `<div class="overlay soft"><div class="modal">
      <h2>${o.pick === undefined ? 'The AI is considering your offer…' : 'The AI made its choice'}</h2>
      <div class="offer">${body}</div></div></div>`;
  }
  if (S.summary) {
    const { t, winner } = S.summary;
    const title = winner === null ? `Round ${S.round} complete` : winner === HUMAN ? '🌸 Victory! 🌸' : 'Defeat';
    const sub = winner === null
      ? 'Nobody reached 4 Geisha or 11 Charm Points. Favor markers stay where they are.'
      : winner === HUMAN ? 'The geisha of Hanamikoji favour you.' : 'The AI has won the geisha’s favour.';
    return `<div class="overlay"><div class="modal summary ${winner === HUMAN ? 'win' : winner === AI ? 'lose' : ''}">
      <h2>${title}</h2><p>${sub}</p>
      <div class="sum-grid">
        <div><h3>You</h3><div class="big">${t[0].geisha}</div><small>Geisha</small><div class="big">${t[0].points}</div><small>Charm Points</small></div>
        <div><h3>AI</h3><div class="big">${t[1].geisha}</div><small>Geisha</small><div class="big">${t[1].points}</div><small>Charm Points</small></div>
      </div>
      ${winner === null ? '<button class="btn" data-act="next">Next Round</button>' : '<button class="btn" data-act="new">Play Again</button>'}
    </div></div>`;
  }
  if (S.showRules) {
    return `<div class="overlay" data-act="rules"><div class="modal rules">
      <h2>How to Play</h2>
      <p>Win <b>4 Geisha</b> or <b>11 Charm Points</b>. A Geisha favours whoever has more of her item at round end (ties keep the marker where it was).</p>
      <p>Each round: 1 card is removed unseen, both players get 6 cards. Players alternate turns: draw a card, then use one unused action marker. Each action is used exactly once per round.</p>
      <ul>
        <li><b>Secret</b> — hide 1 card; it scores at round end.</li>
        <li><b>Trade-off</b> — discard 2 cards face-down.</li>
        <li><b>Gift</b> — show 3 cards; the opponent takes 1, you keep 2.</li>
        <li><b>Competition</b> — show 2 pairs; the opponent takes a pair, you keep the other.</li>
      </ul>
      <p>If one player has 4 Geisha and the other has 11 points, the points win. Click anywhere to close.</p>
    </div></div>`;
  }
  return '';
}

function render() {
  const t = tally();
  app.innerHTML = `
  <div class="lanterns">${[0, 1, 2, 3, 4, 5].map((k) => `<div class="lantern l${k}">${lanternSVG(k % 2 ? '#e88b3c' : '#d6513f')}</div>`).join('')}</div>
  <header>
    <h1><span class="kanji">花見小路</span> Hanamikoji</h1>
    <div class="hdr-right">
      <div class="score ai"><span>AI</span><b>${t[1].geisha}</b> geisha · <b>${t[1].points}</b> pts</div>
      <div class="score hu"><span>You</span><b>${t[0].geisha}</b> geisha · <b>${t[0].points}</b> pts</div>
      <div class="round">Round ${S.round}</div>
      <button class="btn ghost" data-act="rules">Rules</button>
      <button class="btn ghost" data-act="new">New Game</button>
    </div>
  </header>
  <main>
    <section class="table">
      <div class="player-zone ai ${S.current === AI ? 'turn' : ''}">
        <div class="who"><div class="avatar ai">AI</div><div>Opponent<small>${S.hands[AI].length} cards in hand</small></div></div>
        <div class="ai-hand">${S.hands[AI].map(() => backCard('mini')).join('')}</div>
        ${renderHidden(AI)}
        ${renderMarkers(AI)}
      </div>
      <div class="mid">
        ${renderBoard()}
        <div class="deck">
          <div class="pile">${S.deck.length ? backCard() : '<div class="slot"></div>'}<b>${S.deck.length}</b></div>
          <small>Item deck</small>
          <div class="pile removed">${backCard('mini')}</div><small>Removed</small>
        </div>
      </div>
      <div class="player-zone hu ${S.current === HUMAN ? 'turn' : ''}">
        <div class="who"><div class="avatar hu">You</div><div>Player<small>${S.hands[HUMAN].length} cards in hand</small></div></div>
        ${renderHidden(HUMAN)}
        ${renderMarkers(HUMAN)}
      </div>
      ${renderPrompt()}
      ${renderHand()}
    </section>
    <aside class="log"><h3>Chronicle</h3>${S.log.map((l) => `<p>${l}</p>`).join('')}</aside>
  </main>
  ${renderOverlay()}`;
}

newGame();
