import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { colors, FriendsFeed, Press, TrailPhoto } from './HikeScreens';
import { friendReviews, FriendReview } from './hikes';

type Filter = 'All hikes' | 'Easy days' | 'Big climbs' | 'Next up';
export function HomeScreen({ saved, onSave, onOpen }: { saved: string[]; onSave: (id: string) => void; onOpen: (hike: FriendReview) => void }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('All hikes');
  const reviews = friendReviews.filter(hike =>
    `${hike.name} ${hike.location} ${hike.author}`.toLowerCase().includes(query.trim().toLowerCase()) &&
    (filter === 'Easy days' ? hike.difficulty <= 2 : filter === 'Big climbs' ? hike.difficulty >= 4 : filter === 'Next up' ? saved.includes(hike.id) : true));
  const header = <>
    <View style={s.search}><Feather name="search" size={19} color={colors.muted} /><TextInput accessibilityLabel="Search hikes, places, or friends" placeholder="Search hikes, places, or friends" placeholderTextColor={colors.muted} value={query} onChangeText={setQuery} style={s.searchInput} returnKeyType="search" />{query.length > 0 && <Press accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => setQuery('')} style={s.clear}><Feather name="x" size={18} color={colors.green} /></Press>}</View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filters}>
      {(['All hikes', 'Easy days', 'Big climbs', 'Next up'] as const).map(item => <Press key={item} accessibilityRole="button" accessibilityState={{ selected: item === filter }} onPress={() => setFilter(item)} hitSlop={{ top: 6, bottom: 6 }} style={[s.chip, item === filter && s.activeChip]}><Text style={[s.chipText, item === filter && s.activeText]}>{item}</Text></Press>)}
    </ScrollView>
    {!query && filter === 'All hikes' && <>
      <Press accessibilityRole="button" onPress={() => setFilter('Next up')} style={s.nextUp}><View style={s.nextIcon}><Feather name="bookmark" size={23} color={colors.green} /></View><View style={s.grow}><Text style={s.nextTitle}>A little list of what’s next.</Text><Text style={s.help}>{saved.length ? `${saved.length} ${saved.length === 1 ? 'hike' : 'hikes'} saved for another day` : 'Save a friend’s hike. Make it your next one.'}</Text></View><Feather name="chevron-right" size={20} color={colors.green} /></Press>
      <View style={s.heading}><Text accessibilityRole="header" style={s.section}>Find your kind of trail</Text></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.collections}>
        {[{ title: 'Take the scenic route', subtitle: 'Easy days · Sample collection', photo: friendReviews[2].photo!, filter: 'Easy days' as Filter }, { title: 'Earn the view', subtitle: 'Big climbs · Sample collection', photo: friendReviews[1].photo!, filter: 'Big climbs' as Filter }].map(item => <Press accessibilityRole="button" accessibilityLabel={`Browse ${item.title}`} key={item.title} onPress={() => setFilter(item.filter)} style={s.collection}><TrailPhoto uri={item.photo} /><Text style={s.collectionTitle}>{item.title}</Text><Text style={s.help}>{item.subtitle}</Text></Press>)}
      </ScrollView>
    </>}
    <View style={s.heading}><Text accessibilityRole="header" style={s.section}>{query ? 'Search results' : filter === 'Next up' ? 'Your next adventures' : filter === 'All hikes' ? 'From your people' : filter}</Text>{filter !== 'All hikes' && <Press accessibilityRole="button" onPress={() => { setFilter('All hikes'); setQuery(''); }} style={s.clear}><Text style={s.reset}>Reset</Text></Press>}</View>
  </>;
  return <FriendsFeed header={header} reviews={reviews} saved={saved} onSave={onSave} onOpen={onOpen} />;
}

export function SettingsScreen({ onBack }: { onBack: () => void }) {
  return <View style={s.grow}><View style={s.settingsHeader}><Press accessibilityRole="button" accessibilityLabel="Back" onPress={onBack} style={s.clear}><Feather name="arrow-left" size={23} color={colors.green} /></Press><Text style={s.section}>Settings</Text></View><ScrollView contentContainerStyle={s.settingsBody}>
    <Text style={s.settingsTitle}>Make yourself at home.</Text><Text style={s.settingsIntro}>Your Viewpoint preferences and app information.</Text>
    <Text style={s.groupTitle}>Appearance</Text><View style={s.settingRow}><Text style={s.rowTitle}>Theme</Text><Text style={s.help}>Light · Evergreen & cream</Text></View>
    <Text style={s.groupTitle}>Your data</Text><View style={s.settingRow}><Text style={s.rowTitle}>Preview storage</Text><Text style={s.description}>Hikes and your Next up list stay for this session. They reset when the app restarts.</Text></View>
    <View style={s.settingRow}><Text style={s.rowTitle}>Accounts & friends</Text><Text style={s.description}>Coming after the app layout is ready. The feed currently shows fictional reviews and illustrative photos.</Text></View>
    <Text style={s.groupTitle}>About</Text><View style={s.settingRow}><Text style={s.rowTitle}>Viewpoint</Text><Text style={s.description}>A place for the trails you love, and the ones still ahead.</Text><Text style={s.help}>Version 1.0 · Frontend preview</Text></View>
  </ScrollView></View>;
}

const s = StyleSheet.create({
  grow: { flex: 1 }, search: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.fill, borderRadius: 10, paddingLeft: 12, minHeight: 48, gap: 9 }, searchInput: { flex: 1, minWidth: 0, fontSize: 15, color: colors.ink, paddingVertical: 13 }, clear: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  filters: { gap: 8, paddingVertical: 18 }, chip: { minHeight: 36, paddingHorizontal: 15, borderRadius: 18, backgroundColor: colors.soft, justifyContent: 'center' }, activeChip: { backgroundColor: colors.green }, chipText: { fontSize: 14, fontWeight: '600', color: colors.green }, activeText: { color: colors.white },
  nextUp: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 19, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line }, nextIcon: { width: 40, alignItems: 'center' }, nextTitle: { fontSize: 16, fontWeight: '600', color: colors.ink }, help: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 4 },
  heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 26, marginBottom: 12, minHeight: 30 }, section: { fontSize: 20, lineHeight: 25, fontWeight: '600', letterSpacing: -0.2, color: colors.ink, flexShrink: 1 }, collections: { gap: 16, paddingBottom: 3 }, collection: { width: 220 }, collectionTitle: { fontSize: 17, fontWeight: '600', color: colors.ink, marginTop: 12 }, reset: { color: colors.green, fontSize: 14, fontWeight: '600' },
  settingsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderBottomColor: colors.line, borderBottomWidth: StyleSheet.hairlineWidth }, settingsBody: { padding: 24 }, settingsTitle: { fontSize: 34, lineHeight: 41, color: colors.ink, fontWeight: '700', letterSpacing: -0.4 }, settingsIntro: { fontSize: 16, lineHeight: 24, color: colors.muted, marginTop: 10 }, groupTitle: { color: colors.green, fontSize: 15, fontWeight: '600', marginTop: 30, marginBottom: 8 }, settingRow: { paddingVertical: 18, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line }, rowTitle: { fontSize: 17, color: colors.ink, fontWeight: '500' }, description: { fontSize: 15, lineHeight: 23, color: colors.muted, marginTop: 6 },
});
