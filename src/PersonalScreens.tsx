import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { colors } from './HikeScreens';
import { difficultyLabels, Hike } from './hikes';
import { CALIBRATION_COUNT, personalScores } from './ranking';

export function RankingsScreen({ hikes, onOpen, onAdd }: { hikes: Hike[]; onOpen: (hike: Hike) => void; onAdd: () => void }) {
  const unlocked = hikes.length >= CALIBRATION_COUNT;
  const scores = personalScores(hikes);
  return <ScrollView contentContainerStyle={s.body}>
    <Text accessibilityRole="header" style={s.title}>Your rankings</Text>
    <Text style={s.help}>The trails you love, in your own order.</Text>
    <View style={s.notice}><Feather name={unlocked ? 'check-circle' : 'lock'} size={22} color={colors.green} /><View style={s.grow}><Text style={s.name}>{unlocked ? 'Your scores are unlocked' : `${hikes.length}/7 hikes ranked`}</Text><Text style={s.help}>{unlocked ? 'Your comparisons shape these scores. They update with each new hike.' : 'Rank seven different hikes to reveal your personal scores. Keep comparing as you go.'}</Text></View></View>
    {hikes.map((hike, index) => <Pressable key={hike.id} accessibilityRole="button" accessibilityLabel={`Rank ${index + 1}: ${hike.name}`} onPress={() => onOpen(hike)} style={s.row}><Text style={s.position}>{index + 1}</Text><View style={s.grow}><Text style={s.name}>{hike.name}</Text><Text style={s.help}>{hike.location || 'Location not added'} · {difficultyLabels[hike.difficulty - 1]}</Text></View>{unlocked ? <Text style={s.score}>{scores.get(hike.id)?.toFixed(1)}</Text> : <Feather name="lock" size={18} color={colors.muted} />}</Pressable>)}
    {!hikes.length && <View style={s.empty}><Feather name="bar-chart-2" size={36} color={colors.green} /><Text style={s.emptyTitle}>Your favorite view goes first.</Text><Text style={s.help}>Log a hike, then compare it with the next one. Your own trail ranking will grow from there.</Text><Pressable accessibilityRole="button" onPress={onAdd} style={s.primary}><Text style={s.primaryText}>Add your first hike</Text></Pressable></View>}
  </ScrollView>;
}

export function ProfileScreen({ hikes, savedCount, onLists, onRankings, onSettings }: { hikes: Hike[]; savedCount: number; onLists: () => void; onRankings: () => void; onSettings: () => void }) {
  return <ScrollView contentContainerStyle={s.body}><Text accessibilityRole="header" style={s.title}>Profile</Text><View style={s.identity}><View style={s.avatar}><Feather name="user" size={30} color={colors.green} /></View><View style={s.grow}><Text style={s.emptyTitle}>Your trail journal</Text><Text style={s.help}>Local preview · No account connected</Text></View></View><Text style={s.help}>A home for the hikes you remember and the ones still ahead.</Text>
    {[{ title: 'Your lists', detail: `${savedCount} saved for another day`, icon: 'list' as const, action: onLists }, { title: 'Your rankings', detail: `${hikes.length} hikes ranked`, icon: 'bar-chart-2' as const, action: onRankings }, { title: 'Settings', detail: 'Appearance and app information', icon: 'settings' as const, action: onSettings }].map(item => <Pressable key={item.title} accessibilityRole="button" onPress={item.action} style={s.row}><Feather name={item.icon} size={22} color={colors.green} /><View style={s.grow}><Text style={s.name}>{item.title}</Text><Text style={s.help}>{item.detail}</Text></View><Feather name="chevron-right" size={20} color={colors.muted} /></Pressable>)}
    <Text style={s.help}>Your hikes, saved trails, and rankings stay for this session. Accounts and storage come later.</Text>
  </ScrollView>;
}

const s = StyleSheet.create({
  body: { padding: 24, paddingBottom: 40, gap: 12 }, grow: { flex: 1 }, title: { fontSize: 32, fontWeight: '700', color: colors.ink, letterSpacing: -0.7 }, help: { fontSize: 14, lineHeight: 22, color: colors.muted, marginTop: 4 }, name: { fontSize: 17, fontWeight: '600', color: colors.ink }, notice: { flexDirection: 'row', gap: 12, paddingVertical: 22, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line }, row: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 20, minHeight: 64, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line }, position: { width: 24, color: colors.muted, fontSize: 17, fontWeight: '600' }, score: { fontSize: 21, color: colors.green, fontWeight: '700' }, empty: { alignItems: 'center', paddingVertical: 40, gap: 14 }, emptyTitle: { fontSize: 22, fontWeight: '600', color: colors.ink }, primary: { minHeight: 48, backgroundColor: colors.green, borderRadius: 12, paddingHorizontal: 20, justifyContent: 'center', marginTop: 10 }, primaryText: { color: colors.white, fontSize: 16, fontWeight: '600' }, identity: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 16, marginBottom: 8 }, avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.soft, alignItems: 'center', justifyContent: 'center' },
});
