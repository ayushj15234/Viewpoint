import { Hike } from './hikes';

export const CALIBRATION_COUNT = 7;
export function comparisonBounds(hikes: Hike[], sentiment: Hike['sentiment']) {
  const tier = (value: Hike['sentiment']) => value === 'Loved it' ? 0 : value === 'It was okay' ? 1 : 2;
  const first = hikes.findIndex(hike => tier(hike.sentiment) >= tier(sentiment));
  const last = hikes.findIndex(hike => tier(hike.sentiment) > tier(sentiment));
  return { low: first === -1 ? hikes.length : first, high: last === -1 ? hikes.length : last };
}

// Each sentiment owns a band of the 1-10 scale, so a loved hike never scores below an okay one.
const bands = { 'Loved it': [7, 10], 'It was okay': [4, 6.9], 'Not for me': [1, 3.9] } as const;
// Only a hike the user disliked loses points for feeling hard; a hard hike they loved keeps its score.
const difficultyDock = (hike: Hike) => hike.sentiment === 'Not for me' ? Math.max(0, hike.difficulty - 3) * 0.4 : 0;

// Scores describe relative preference within this user's list, not trail quality.
export function personalScores(ranked: Hike[]): Map<string, number> {
  const scores = new Map<string, number>();
  if (ranked.length < CALIBRATION_COUNT) return scores;
  let previous = 10;
  for (const hike of ranked) {
    const group = ranked.filter(other => other.sentiment === hike.sentiment);
    const [min, max] = bands[hike.sentiment ?? 'It was okay'];
    const position = group.indexOf(hike);
    const raw = group.length > 1 ? max - (max - min) * position / (group.length - 1) : max;
    // Never above a higher-ranked hike, so the numbers always agree with the list order.
    previous = Math.min(previous, Math.max(1, raw - difficultyDock(hike)));
    scores.set(hike.id, Math.round(previous * 10) / 10);
  }
  return scores;
}
export const personalScore = (id: string, ranked: Hike[]) => personalScores(ranked).get(id);

export type ListFilters = { location: string; difficulty: number; duration: number; length: number };
export function filterHikes(hikes: Hike[], filters: ListFilters) {
  return hikes.filter(hike =>
    (!filters.location || (hike.location ?? '').toLowerCase().includes(filters.location.trim().toLowerCase())) &&
    (!filters.difficulty || hike.difficulty === filters.difficulty) &&
    (!filters.duration || (hike.durationMinutes !== undefined && hike.durationMinutes <= filters.duration)) &&
    (!filters.length || (hike.lengthMiles !== undefined && hike.lengthMiles <= filters.length)));
}
