import { GEISHA } from './art.js';

const HAND_W = 0.4;

// Score a position from the AI's point of view. favor[i]: 1 = AI, -1 = human, 0 = neutral.
export function evaluate(me, opp, hand, favor) {
  let s = 0;
  let lockedMe = 0, lockedOpp = 0, ptsMe = 0, ptsOpp = 0;
  for (let i = 0; i < 7; i++) {
    const v = GEISHA[i].v;
    const half = v / 2;
    if (me[i] > half) { s += v * 1.25; lockedMe++; ptsMe += v; continue; }
    if (opp[i] > half) { s -= v * 1.25; lockedOpp++; ptsOpp += v; continue; }
    const d = me[i] - opp[i] + HAND_W * hand[i];
    let x = Math.abs(d) < 0.01 ? 0.35 * favor[i] : Math.tanh(d * 0.9);
    s += v * x;
  }
  if (lockedMe >= 4 || ptsMe >= 11) s += 20;
  if (lockedOpp >= 4 || ptsOpp >= 11) s -= 20;
  return s;
}

const counts = (cards) => {
  const c = Array(7).fill(0);
  cards.forEach((k) => c[k.g]++);
  return c;
};
const add = (base, cards) => {
  const c = base.slice();
  cards.forEach((k) => c[k.g]++);
  return c;
};

function combos(arr, k, start = 0, cur = [], out = []) {
  if (cur.length === k) { out.push(cur.slice()); return out; }
  for (let i = start; i < arr.length; i++) { cur.push(arr[i]); combos(arr, k, i + 1, cur, out); cur.pop(); }
  return out;
}

// st: { hand, me, opp, favor, used }
export function aiChooseAction(st) {
  const { hand, me, opp, favor, used } = st;
  const rest = (picked) => counts(hand.filter((c) => !picked.includes(c)));
  let best = null;
  const consider = (score, move) => {
    score += Math.random() * 0.15;
    if (!best || score > best.score) best = { score, ...move };
  };

  if (!used.secret)
    for (const c of hand) consider(evaluate(add(me, [c]), opp, rest([c]), favor), { type: 'secret', cards: [c] });

  if (!used.trade)
    for (const pair of combos(hand, 2)) consider(evaluate(me, opp, rest(pair), favor), { type: 'trade', cards: pair });

  if (!used.gift)
    for (const tri of combos(hand, 3)) {
      const r = rest(tri);
      let worst = Infinity;
      for (const c of tri) {
        const mine = tri.filter((x) => x !== c);
        worst = Math.min(worst, evaluate(add(me, mine), add(opp, [c]), r, favor));
      }
      consider(worst, { type: 'gift', cards: tri });
    }

  if (!used.comp)
    for (const quad of combos(hand, 4)) {
      const r = rest(quad);
      const splits = [
        [[quad[0], quad[1]], [quad[2], quad[3]]],
        [[quad[0], quad[2]], [quad[1], quad[3]]],
        [[quad[0], quad[3]], [quad[1], quad[2]]],
      ];
      for (const [a, b] of splits) {
        const w = Math.min(
          evaluate(add(me, b), add(opp, a), r, favor),
          evaluate(add(me, a), add(opp, b), r, favor),
        );
        consider(w, { type: 'comp', sets: [a, b] });
      }
    }
  return best;
}

export function aiPickGift(st, cards) {
  let best = 0, bs = -Infinity;
  cards.forEach((c, idx) => {
    const others = cards.filter((x) => x !== c);
    const s = evaluate(add(st.me, [c]), add(st.opp, others), counts(st.hand), st.favor);
    if (s > bs) { bs = s; best = idx; }
  });
  return best;
}

export function aiPickComp(st, sets) {
  const s0 = evaluate(add(st.me, sets[0]), add(st.opp, sets[1]), counts(st.hand), st.favor);
  const s1 = evaluate(add(st.me, sets[1]), add(st.opp, sets[0]), counts(st.hand), st.favor);
  return s1 > s0 ? 1 : 0;
}
