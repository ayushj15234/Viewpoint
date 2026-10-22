import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Alert, BackHandler, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { difficultyLabels, friendReviews, Hike, FriendReview } from './src/hikes';
import { YourLists } from './src/YourLists';
import { comparisonBounds, personalScore } from './src/ranking';
import { colors, HikeDetails } from './src/HikeScreens';
import { HomeScreen, SettingsScreen } from './src/HomeScreen';
import { RankingsScreen, ProfileScreen } from './src/PersonalScreens';
type Tab = 'My hikes' | 'Friends' | 'Rankings' | 'Profile';
const green = colors.green;

export default function App() {
  const [tab, setTab] = useState<Tab>('Friends');
  const [settings, setSettings] = useState(false);
  const [saved, setSaved] = useState<string[]>([]);
  const [hikes, setHikes] = useState<Hike[]>([]);
  const [adding, setAdding] = useState(false);
  const [selectedHike, setSelectedHike] = useState<Hike | FriendReview | null>(null);
  const [name, setName] = useState('');
  const [initialName, setInitialName] = useState('');
  const [notes, setNotes] = useState('');
  const [sentiment, setSentiment] = useState<Hike['sentiment']>();
  const [location, setLocation] = useState('');
  const [duration, setDuration] = useState('');
  const [length, setLength] = useState('');
  const [bounds, setBounds] = useState<{ low: number; high: number } | null>(null);
  const [formError, setFormError] = useState('');
  const [difficulty, setDifficulty] = useState(0);
  useEffect(() => {
    if (!selectedHike && !settings) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => { setSelectedHike(null); setSettings(false); return true; });
    return () => subscription.remove();
  }, [selectedHike, settings]);
  function openLog(hikeName = '') {
    setInitialName(hikeName);
    setName(hikeName); setNotes(''); setSentiment(undefined); setDifficulty(0); setLocation(''); setDuration(''); setLength(''); setBounds(null); setFormError(''); setAdding(true);
  }
  function saveHike() {
    if (!canSave) return;
    if (hikes.some(hike => hike.name.toLowerCase() === name.trim().toLowerCase())) { setFormError('This hike is already ranked. Add a different hike to build your list.'); return; }
    const next = comparisonBounds(hikes, sentiment);
    if (next.low === next.high) finishRanking(next.low); else setBounds(next);
  }
  function finishRanking(index: number) {
    const hike: Hike = { id: Date.now().toString(), name: name.trim(), sentiment, difficulty, notes: notes.trim(), location: location.trim() || undefined, durationMinutes: duration.trim() ? Number(duration) : undefined, lengthMiles: length.trim() ? Number(length) : undefined };
    setHikes(current => [...current.slice(0, index), hike, ...current.slice(index)]);
    setBounds(null);
    setAdding(false); setSelectedHike(null); setTab('My hikes');
  }
  function compare(preferNew: boolean) {
    if (!bounds) return;
    const mid = Math.floor((bounds.low + bounds.high) / 2);
    const next = preferNew ? { low: bounds.low, high: mid } : { low: mid + 1, high: bounds.high };
    if (next.low === next.high) finishRanking(next.low); else setBounds(next);
  }
  function closeLog() {
    if (name !== initialName || notes.trim() || sentiment || difficulty || location.trim() || duration.trim() || length.trim()) {
      if (Platform.OS === 'web') {
        if (window.confirm('Discard this hike? Your changes haven’t been saved.')) setAdding(false);
        return;
      }
      Alert.alert('Discard this hike?', 'Your changes haven’t been saved.', [
        { text: 'Keep editing', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => setAdding(false) },
      ]);
    } else setAdding(false);
  }
  const canSave = Boolean(name.trim() && sentiment && difficulty && (!duration.trim() || (Number.isFinite(Number(duration)) && Number(duration) > 0)) && (!length.trim() || (Number.isFinite(Number(length)) && Number(length) > 0)));
  return (
    <SafeAreaProvider>
      <SafeAreaView style={s.safe}>
        <StatusBar style="dark" />
        {settings ? <SettingsScreen onBack={() => setSettings(false)} /> : selectedHike ? <HikeDetails hike={selectedHike} onBack={() => setSelectedHike(null)} onLog={openLog} personalScore={personalScore(selectedHike.id, hikes)} rankedCount={hikes.length} backLabel={tab === 'Rankings' ? 'Your rankings' : tab === 'Friends' ? 'Feed' : 'Your lists'} /> : <>
        <View style={s.header}>
          <View style={s.brand}><FontAwesome5 name="mountain" size={22} color={green} /><Text style={s.wordmark}>viewpoint</Text></View>
          <Pressable accessibilityRole="button" accessibilityLabel="Open settings" onPress={() => setSettings(true)} style={s.menu}><Feather name="menu" size={25} color={green} /></Pressable>
        </View>
        {tab === 'Friends' ? <HomeScreen saved={saved} onSave={id => setSaved(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id])} onOpen={setSelectedHike} /> : tab === 'Rankings' ? <RankingsScreen hikes={hikes} onOpen={setSelectedHike} onAdd={() => openLog()} /> : tab === 'Profile' ? <ProfileScreen hikes={hikes} savedCount={saved.length} onLists={() => setTab('My hikes')} onRankings={() => setTab('Rankings')} onSettings={() => setSettings(true)} /> : <YourLists hikes={hikes} saved={friendReviews.filter(hike => saved.includes(hike.id))} onOpen={setSelectedHike} />}

        <View style={s.bottomNav}>
          {([{ tab: 'Friends', label: 'Feed', icon: 'home' }, { tab: 'My hikes', label: 'Your lists', icon: 'list' }, { tab: 'add', label: 'Log a hike', icon: 'plus' }, { tab: 'Rankings', label: 'Rankings', icon: 'bar-chart-2' }, { tab: 'Profile', label: 'Profile', icon: 'user' }] as const).map(item => item.tab === 'add' ? <View key="add" style={s.navSlot}><Pressable accessibilityRole="button" accessibilityLabel="Log a hike" onPress={() => openLog()} style={s.logAction}><Feather name="plus" size={26} color="white" /></Pressable></View> : <Pressable key={item.tab} accessibilityRole="tab" accessibilityLabel={item.tab === 'Rankings' ? 'Your rankings' : item.label} accessibilityState={{ selected: tab === item.tab }} onPress={() => setTab(item.tab)} style={s.navItem}><Feather name={item.icon} size={23} color={tab === item.tab ? green : colors.muted} /><Text style={[s.navLabel, tab === item.tab && s.navSelected]}>{item.label}</Text></Pressable>)}
        </View>
        </>}
        <Modal visible={adding} animationType="slide" presentationStyle="pageSheet" onRequestClose={closeLog}>
          <SafeAreaView style={s.safe}>
            <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
              <View style={s.sheetHeader}>
                <Pressable onPress={closeLog} accessibilityRole="button" style={s.textButton}><Text style={s.link}>Cancel</Text></Pressable>
                <Text style={s.sheetTitle}>{bounds ? 'Compare hikes' : 'Log a hike'}</Text>
                <Pressable onPress={saveHike} disabled={!canSave || !!bounds} accessibilityRole="button" accessibilityState={{ disabled: !canSave || !!bounds }} style={s.textButton}><Text style={[s.link, (!canSave || !!bounds) && s.disabled]}>Save</Text></Pressable>
              </View>
              <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.form}>
{bounds ? <View style={{ gap: 20 }}><Text style={s.title}>Which hike did you enjoy more?</Text><Text style={s.subtitle}>Think about the whole experience.</Text><Pressable accessibilityRole="button" onPress={() => compare(true)} style={s.primary}><Text style={s.primaryText}>{name.trim()}</Text></Pressable><Pressable accessibilityRole="button" onPress={() => compare(false)} style={s.primary}><Text style={s.primaryText}>{hikes[Math.floor((bounds.low + bounds.high) / 2)].name}</Text></Pressable><Pressable accessibilityRole="button" onPress={() => setBounds(null)} style={s.textButton}><Text style={s.link}>Back to details</Text></Pressable></View> : <>
                <Text style={s.label}>Hike name</Text>
                <TextInput accessibilityLabel="Hike name" placeholder="e.g. Mount Tammany" placeholderTextColor={colors.muted} value={name} onChangeText={setName} maxLength={120} style={s.input} autoCapitalize="words" />
                <Text style={[s.label, { marginTop: 24 }]}>How was the hike?</Text><View style={{ gap: 8 }}>{(['Loved it', 'It was okay', 'Not for me'] as const).map(value => <Pressable key={value} accessibilityRole="radio" accessibilityState={{ checked: sentiment === value }} onPress={() => setSentiment(value)} style={[s.input, sentiment === value && { backgroundColor: colors.soft, borderColor: green }]}><Text style={s.link}>{value}</Text></Pressable>)}</View><Text style={s.subtitle}>Compare with past hikes. Scores unlock after seven ranked hikes.</Text>
                <Rating label="Difficulty" description="How hard did it feel to you?" value={difficulty} onChange={setDifficulty} />
                {[{ label: 'Location', value: location, change: setLocation, numeric: false }, { label: 'Duration in minutes', value: duration, change: setDuration, numeric: true }, { label: 'Length in miles', value: length, change: setLength, numeric: true }].map(field => <View key={field.label} style={{ marginBottom: 20 }}><Text style={s.label}>{field.label} (optional)</Text><TextInput accessibilityLabel={field.label} value={field.value} onChangeText={field.change} keyboardType={field.numeric ? 'decimal-pad' : 'default'} style={s.input} maxLength={field.numeric ? 8 : 120} /></View>)}<Text style={s.subtitle}>Duration and length must be positive numbers.</Text>{!!formError && <Text accessibilityRole="alert" style={s.notes}>{formError}</Text>}<Text style={s.label}>Notes <Text style={s.optional}>(optional)</Text></Text>
                <TextInput accessibilityLabel="Hike notes" placeholder="What would you want to remember?" placeholderTextColor={colors.muted} value={notes} onChangeText={setNotes} multiline maxLength={2000} style={[s.input, s.notesInput]} textAlignVertical="top" />
                </>}
              </ScrollView>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
function Rating({ label, description, value, onChange }: { label: string; description: string; value: number; onChange: (value: number) => void }) {
  return <View style={s.rating}>
    <Text style={s.label}>{label}</Text><Text style={s.ratingHelp}>{description}</Text>
    <View style={s.ratingOptions}>{difficultyLabels.map((option, i) => <Pressable key={option} accessibilityRole="radio" accessibilityLabel={`${label}: ${option}`} accessibilityState={{ checked: value === i + 1 }} onPress={() => onChange(i + 1)} style={[s.ratingButton, value === i + 1 && s.selectedRating]}><Text style={[s.ratingNumber, value === i + 1 && s.primaryText]}>{option}</Text></Pressable>)}</View>
  </View>;
}
const s = StyleSheet.create({
  menu: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  bottomNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 4, paddingVertical: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line, backgroundColor: colors.white },
  navSlot: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 52, minWidth: 48, gap: 5 },
  navLabel: { color: colors.muted, fontSize: 11, textAlign: 'center' }, navSelected: { color: green, fontWeight: '700' },
  logAction: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: green, borderRadius: 26, width: 52, justifyContent: 'center', minHeight: 52 },
  safe: { flex: 1, backgroundColor: colors.cream }, flex: { flex: 1 },
  header: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  wordmark: { fontSize: 23, fontWeight: '600', letterSpacing: -0.8, color: colors.green },
  add: { width: 48, height: 48, backgroundColor: green, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.7 },
  intro: { paddingHorizontal: 24, paddingBottom: 24 },
  title: { fontSize: 34, fontWeight: '700', letterSpacing: -0.9, color: colors.ink },
  subtitle: { fontSize: 16, lineHeight: 23, color: colors.muted, marginTop: 7 },
  tabs: { flexDirection: 'row', paddingHorizontal: 24, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line, gap: 28 },
  tab: { minHeight: 48, justifyContent: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: green }, tabText: { fontSize: 16, color: colors.muted, fontWeight: '500' }, activeText: { color: green, fontWeight: '600' },
  empty: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32, paddingVertical: 48 },
  emptyTitle: { fontSize: 22, fontWeight: '600', color: colors.ink, textAlign: 'center', marginTop: 24 },
  emptyBody: { fontSize: 16, color: colors.muted, lineHeight: 24, textAlign: 'center', maxWidth: 300, marginTop: 10 },
  primary: { marginTop: 28, minHeight: 50, paddingHorizontal: 24, paddingVertical: 14, backgroundColor: green, borderRadius: 12, justifyContent: 'center' },
  primaryText: { fontSize: 16, fontWeight: '600', color: colors.white, textAlign: 'center' },
  previewNote: { fontSize: 12, color: colors.muted, textAlign: 'center', paddingHorizontal: 24, paddingVertical: 16 },
  list: { paddingHorizontal: 24, paddingBottom: 24 }, count: { fontSize: 13, color: colors.muted, marginTop: 22, marginBottom: 4 },
  hikeHeading: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  hike: { paddingVertical: 22, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line }, hikeName: { fontSize: 20, fontWeight: '600', color: colors.ink },
  ratingLine: { fontSize: 14, lineHeight: 22, color: green, marginTop: 7 }, notes: { fontSize: 16, lineHeight: 24, color: colors.muted, marginTop: 10 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line, paddingHorizontal: 12, paddingVertical: 8 },
  textButton: { minWidth: 64, minHeight: 48, justifyContent: 'center', alignItems: 'center' }, link: { color: green, fontSize: 17 }, disabled: { color: colors.muted },
  sheetTitle: { color: colors.ink, fontSize: 17, fontWeight: '600' }, form: { padding: 24, paddingBottom: 48 },
  label: { fontSize: 17, color: colors.ink, fontWeight: '600', marginBottom: 10 }, optional: { fontWeight: '400', color: colors.muted, fontSize: 15 },
  input: { borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 14, fontSize: 17, color: colors.ink, backgroundColor: colors.white, minHeight: 52 }, notesInput: { minHeight: 120 },
  rating: { marginVertical: 28 }, ratingHelp: { color: colors.muted, fontSize: 14, marginBottom: 14 }, ratingOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  ratingButton: { minHeight: 48, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  selectedRating: { backgroundColor: green, borderColor: green }, ratingNumber: { color: colors.ink, fontSize: 17, fontWeight: '500' },
});

