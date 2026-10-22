import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from './HikeScreens';
import { difficultyLabels, Hike } from './hikes';
import { CALIBRATION_COUNT, filterHikes, ListFilters, personalScore } from './ranking';

const empty: ListFilters = { location: '', difficulty: 0, duration: 0, length: 0 };
export function YourLists({ hikes, saved, onOpen }: { hikes: Hike[]; saved: Hike[]; onOpen: (hike: Hike) => void }) {
  const [source, setSource] = useState('Ranked');
  const [filters, setFilters] = useState(empty);
  const matches = filterHikes(source === 'Ranked' ? hikes : saved, filters);
  function choices<K extends keyof ListFilters>(key: K, values: { label: string; value: ListFilters[K] }[]) {
    return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.choices}>{values.map(item => <Pressable key={String(item.value)} accessibilityRole="button" accessibilityState={{ selected: filters[key] === item.value }} onPress={() => setFilters(current => ({ ...current, [key]: item.value }))} style={[s.choice, filters[key] === item.value && s.selected]}><Text style={[s.choiceText, filters[key] === item.value && s.selectedText]}>{item.label}</Text></Pressable>)}</ScrollView>;
  }
  return <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.body}>
    <Text accessibilityRole="header" style={s.title}>Your lists</Text><Text style={s.help}>Your trails, sorted for the kind of day you want.</Text>
    <View style={s.choices}>{['Ranked', 'Want to hike'].map(item => <Pressable key={item} accessibilityRole="button" accessibilityState={{ selected: source === item }} style={[s.choice, source === item && s.selected]} onPress={() => setSource(item)}><Text style={[s.choiceText, source === item && s.selectedText]}>{item}</Text></Pressable>)}</View>
    <View style={s.calibration}><Text style={s.label}>{hikes.length < CALIBRATION_COUNT ? `Your scores unlock at 7 hikes · ${hikes.length}/7` : 'Your personal scores are unlocked'}</Text><Text style={s.help}>{hikes.length < CALIBRATION_COUNT ? 'Log and compare seven different hikes to reveal your scores. Your list stays available while we learn your preferences.' : 'Scores reflect your comparisons and update as you rank more hikes.'}</Text></View>
    <Text style={s.label}>Location</Text><TextInput accessibilityLabel="Filter by location" placeholder="Any location" placeholderTextColor={colors.muted} value={filters.location} onChangeText={location => setFilters(current => ({ ...current, location }))} style={s.input} />
    <Text style={s.label}>Difficulty</Text>{choices('difficulty', [{ label: 'Any', value: 0 }, ...difficultyLabels.map((label, i) => ({ label, value: i + 1 }))])}
    <Text style={s.label}>Duration</Text>{choices('duration', [{ label: 'Any', value: 0 }, { label: '≤ 1 hour', value: 60 }, { label: '≤ 2 hours', value: 120 }, { label: '≤ 4 hours', value: 240 }])}
    <Text style={s.label}>Length</Text>{choices('length', [{ label: 'Any', value: 0 }, { label: '≤ 3 miles', value: 3 }, { label: '≤ 6 miles', value: 6 }, { label: '≤ 10 miles', value: 10 }])}
    <Pressable accessibilityRole="button" style={s.reset} onPress={() => setFilters(empty)}><Text style={s.choiceText}>Reset filters</Text></Pressable>
    <Text style={s.help}>{matches.length} {matches.length === 1 ? 'hike' : 'hikes'} · Filters apply automatically. Missing details are excluded when that filter is active.</Text>
    {matches.map(hike => <Pressable key={hike.id} accessibilityRole="button" onPress={() => onOpen(hike)} style={s.row}><View style={{ flex: 1 }}><Text style={s.name}>{hike.name}</Text><Text style={s.help}>{hike.location || 'Location not added'} · {difficultyLabels[hike.difficulty - 1]}</Text><Text style={s.help}>{hike.durationMinutes !== undefined ? `${hike.durationMinutes} min` : 'Duration not added'} · {hike.lengthMiles !== undefined ? `${hike.lengthMiles} mi` : 'Length not added'}</Text></View><Text style={s.score}>{source === 'Ranked' ? personalScore(hike.id, hikes)?.toFixed(1) ?? 'Locked' : 'Saved'}</Text></Pressable>)}
    {!matches.length && <Text style={s.empty}>No hikes match yet. Add a hike, save one from the feed, or loosen your filters.</Text>}
    <Text style={s.help}>Preview · Lists and rankings reset when the app restarts.</Text>
  </ScrollView>;
}
const s = StyleSheet.create({
  body: { padding: 24, gap: 10 }, title: { fontSize: 32, fontWeight: '700', color: colors.ink }, help: { fontSize: 14, lineHeight: 21, color: colors.muted }, label: { fontSize: 16, fontWeight: '600', color: colors.ink, marginTop: 12 }, choices: { flexDirection: 'row', gap: 8, paddingVertical: 5 }, choice: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 16, backgroundColor: colors.soft, borderRadius: 24 }, selected: { backgroundColor: colors.green }, choiceText: { fontSize: 14, color: colors.green, fontWeight: '600' }, selectedText: { color: colors.white }, input: { minHeight: 48, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 14, borderRadius: 10, fontSize: 16, color: colors.ink, backgroundColor: colors.white }, calibration: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.line, gap: 8 }, reset: { minHeight: 48, justifyContent: 'center' }, row: { flexDirection: 'row', gap: 12, alignItems: 'center', paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: colors.line }, name: { fontSize: 19, fontWeight: '600', color: colors.ink }, score: { color: colors.green, fontWeight: '700', fontSize: 16 }, empty: { color: colors.muted, fontSize: 16, lineHeight: 24, paddingVertical: 28 },
});
