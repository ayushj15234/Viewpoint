import { Hike } from './hikes';

export const CALIBRATION_COUNT = 7;
export function comparisonBounds(hikes: Hike[], sentiment: Hike['sentiment']) {
  const tier = (value: Hike['sentiment']) => value === 'Loved it' ? 0 : value === 'It was okay' ? 1 : 2;
  const first = hikes.findIndex(hike => tier(hike.sentiment) >= tier(sentiment));
  const last = hikes.findIndex(hike => tier(hike.sentiment) > tier(sentiment));
  return { low: first === -1 ? hikes.length : first, high: last === -1 ? hikes.length : last };
}

// Scores describe relative preference within this user's list, not trail quality.
export function personalScore(id: string, ranked: Hike[]): number | undefined {
  const index = ranked.findIndex(hike => hike.id === id);
  if (ranked.length < CALIBRATION_COUNT || index < 0) return undefined;
  return Math.round((10 - 10 * index / (ranked.length - 1)) * 10) / 10;
}

export type ListFilters = { location: string; difficulty: number; duration: number; length: number };
export function filterHikes(hikes: Hike[], filters: ListFilters) {
  return hikes.filter(hike =>
    (!filters.location || (hike.location ?? '').toLowerCase().includes(filters.location.trim().toLowerCase())) &&
    (!filters.difficulty || hike.difficulty === filters.difficulty) &&
    (!filters.duration || (hike.durationMinutes !== undefined && hike.durationMinutes <= filters.duration)) &&
    (!filters.length || (hike.lengthMiles !== undefined && hike.lengthMiles <= filters.length)));
}
