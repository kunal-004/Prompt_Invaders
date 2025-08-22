// Minimal spaced repetition ledger using localStorage
// API:
// - recordOutcome(concept, wasCorrect)
// - getConcept(concept)
// - getAll()
// - nextDue(concept)

const STORAGE_KEY = "debugquest_srs_v1";

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function save(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

function computeInterval(streak) {
  // Simple intervals: 1m, 10m, 1h, 1d, 3d, 7d
  const mins = [1, 10, 60, 1440, 4320, 10080];
  const idx = Math.min(streak, mins.length - 1);
  return mins[idx] * 60 * 1000;
}

export function recordOutcome(concept, wasCorrect) {
  const state = load();
  const entry = state[concept] || {
    concept,
    streak: 0,
    lastSeen: 0,
    nextDue: Date.now(),
    successes: 0,
    failures: 0,
  };

  if (wasCorrect) {
    entry.streak += 1;
    entry.successes += 1;
  } else {
    entry.streak = 0;
    entry.failures += 1;
  }
  entry.lastSeen = Date.now();
  entry.nextDue = entry.lastSeen + computeInterval(entry.streak);
  state[concept] = entry;
  save(state);
  return entry;
}

export function getConcept(concept) {
  const state = load();
  return state[concept] || null;
}

export function getAll() {
  return load();
}

export function nextDue(concept) {
  const entry = getConcept(concept);
  return entry?.nextDue || Date.now();
}

export default { recordOutcome, getConcept, getAll, nextDue };
