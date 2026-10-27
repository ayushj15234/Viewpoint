import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Alert, BackHandler, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { difficultyLabels, friendReviews, Hike, FriendReview } from './src/hikes';
import { YourLists } from './src/YourLists';
import { comparisonBounds, personalScore } from './src/ranking';
import { colors, HikeDetails, Press } from './src/HikeScreens';
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
  const positive = (value: string) => !value.trim() || (Number.isFinite(Number(value)) && Number(value) > 0);
  const missing = [!name.trim() && 'a hike name', !sentiment && 'how it went', !difficulty && 'the difficulty'].filter(Boolean);
  const canSave = Boolean(!missing.length && positive(duration) && positive(length));
  return (
    <SafeAreaProvider>
      <SafeAreaView style={s.safe}>
        <StatusBar style="dark" />
        {settings ? <SettingsScreen onBack={() => setSettings(false)} /> : selectedHike ? <HikeDetails hike={selectedHike} onBack={() => setSelectedHike(null)} onLog={openLog} personalScore={personalScore(selectedHike.id, hikes)} rankedCount={hikes.length} backLabel={tab === 'Rankings' ? 'Your rankings' : tab === 'Friends' ? 'Feed' : 'Your lists'} /> : <>
        <View style={s.header}>
          <View style={s.brand}><FontAwesome5 name="mountain" size={22} color={green} /><Text style={s.wordmark}>viewpoint</Text></View>
          <Press accessibilityRole="button" accessibilityLabel="Open settings" onPress={() => setSettings(true)} style={s.menu}><Feather name="menu" size={25} color={green} /></Press>
        </View>
        {tab === 'Friends' ? <HomeScreen saved={saved} onSave={id => setSaved(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id])} onOpen={setSelectedHike} /> : tab === 'Rankings' ? <RankingsScreen hikes={hikes} onOpen={setSelectedHike} onAdd={() => openLog()} /> : tab === 'Profile' ? <ProfileScreen hikes={hikes} savedCount={saved.length} onLists={() => setTab('My hikes')} onRankings={() => setTab('Rankings')} onSettings={() => setSettings(true)} /> : <YourLists hikes={hikes} saved={friendReviews.filter(hike => saved.includes(hike.id))} onOpen={setSelectedHike} />}

        <View style={s.bottomNav}>
          {([{ tab: 'Friends', label: 'Feed', icon: 'home' }, { tab: 'My hikes', label: 'Your lists', icon: 'list' }, { tab: 'add', label: 'Log a hike', icon: 'plus' }, { tab: 'Rankings', label: 'Rankings', icon: 'bar-chart-2' }, { tab: 'Profile', label: 'Profile', icon: 'user' }] as const).map(item => item.tab === 'add' ? <Press key="add" accessibilityRole="button" accessibilityLabel="Log a hike" onPress={() => openLog()} style={s.navItem}><View style={s.logIcon}><Feather name="plus" size={24} color={colors.white} /></View></Press> : <Press key={item.tab} accessibilityRole="tab" accessibilityLabel={item.tab === 'Rankings' ? 'Your rankings' : item.label} accessibilityState={{ selected: tab === item.tab }} onPress={() => setTab(item.tab)} style={s.navItem}><Feather name={item.icon} size={23} color={tab === item.tab ? green : colors.muted} /><Text style={[s.navLabel, tab === item.tab && s.navSelected]}>{item.label}</Text></Press>)}
        </View>
        </>}
        <Modal visible={adding} animationType="slide" presentationStyle="pageSheet" onRequestClose={closeLog}>
          <SafeAreaView style={s.safe}>
            <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
              <View style={s.sheetHeader}>
                <Press onPress={closeLog} accessibilityRole="button" style={s.textButton}><Text style={s.link}>Cancel</Text></Press>
                <Text style={s.sheetTitle}>{bounds ? 'Compare hikes' : 'Log a hike'}</Text>
                <Press onPress={saveHike} disabled={!canSave || !!bounds} accessibilityRole="button" accessibilityState={{ disabled: !canSave || !!bounds }} style={s.textButton}><Text style={[s.link, (!canSave || !!bounds) && s.disabled]}>Save</Text></Press>
              </View>
              <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.form}>
{bounds ? <View style={{ gap: 20 }}><Text style={s.title}>Which hike did you enjoy more?</Text><Text style={s.subtitle}>Think about the whole experience.</Text><Press accessibilityRole="button" accessibilityLabel={`I enjoyed ${name.trim()} more`} onPress={() => compare(true)} style={s.choiceCard}><Text style={s.choiceMeta}>New hike</Text><Text style={s.choiceName}>{name.trim()}</Text></Press><Text style={s.or}>or</Text><Press accessibilityRole="button" accessibilityLabel={`I enjoyed ${hikes[Math.floor((bounds.low + bounds.high) / 2)].name} more`} onPress={() => compare(false)} style={s.choiceCard}><Text style={s.choiceMeta}>Ranked #{Math.floor((bounds.low + bounds.high) / 2) + 1}</Text><Text style={s.choiceName}>{hikes[Math.floor((bounds.low + bounds.high) / 2)].name}</Text></Press><Press accessibilityRole="button" onPress={() => setBounds(null)} style={s.textButton}><Text style={s.link}>Back to details</Text></Press></View> : <>
                {missing.length > 0 && <Text style={[s.subtitle, { marginTop: 0, marginBottom: 20 }]}>To save, add {missing.join(', ').replace(/, ([^,]*)$/, ' and $1')}.</Text>}
                <Text style={s.label}>Hike name</Text>
                <TextInput accessibilityLabel="Hike name" placeholder="e.g. Mount Tammany" placeholderTextColor={colors.muted} value={name} onChangeText={value => { setName(value); setFormError(''); }} maxLength={120} style={s.input} autoCapitalize="words" />{!!formError && <Text accessibilityRole="alert" style={s.fieldError}>{formError}</Text>}
                <Text style={[s.label, { marginTop: 24 }]}>How was the hike?</Text><View style={{ gap: 8 }}>{(['Loved it', 'It was okay', 'Not for me'] as const).map(value => <Press key={value} accessibilityRole="radio" accessibilityState={{ checked: sentiment === value }} onPress={() => setSentiment(value)} style={[s.input, s.option, sentiment === value && { backgroundColor: colors.soft, borderColor: green }]}><Text style={s.link}>{value}</Text>{sentiment === value && <Feather name="check" size={20} color={green} />}</Press>)}</View><Text style={s.subtitle}>Compare with past hikes. Scores unlock after seven ranked hikes.</Text>
                <Rating label="Difficulty" description="How hard did it feel to you?" value={difficulty} onChange={setDifficulty} />
                {[{ label: 'Location', value: location, change: setLocation, numeric: false }, { label: 'Duration in minutes', value: duration, change: setDuration, numeric: true }, { label: 'Length in miles', value: length, change: setLength, numeric: true }].map(field => <View key={field.label} style={{ marginBottom: 20 }}><Text style={s.label}>{field.label} (optional)</Text><TextInput accessibilityLabel={field.label} value={field.value} onChangeText={field.change} keyboardType={field.numeric ? 'decimal-pad' : 'default'} style={s.input} maxLength={field.numeric ? 8 : 120} />{!positive(field.value) && <Text accessibilityRole="alert" style={s.fieldError}>Enter a number greater than 0.</Text>}</View>)}<Text style={s.label}>Notes <Text style={s.optional}>(optional)</Text></Text>
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
    <View style={s.ratingOptions}>{difficultyLabels.map((option, i) => <Press key={option} accessibilityRole="radio" accessibilityLabel={`${label}: ${option}`} accessibilityState={{ checked: value === i + 1 }} onPress={() => onChange(i + 1)} style={[s.ratingButton, value === i + 1 && s.selectedRating]}><Text style={[s.ratingNumber, value === i + 1 && s.primaryText]}>{option}</Text></Press>)}</View>
  </View>;
}
const s = StyleSheet.create({
  menu: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  bottomNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 4, paddingVertical: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line, backgroundColor: colors.white },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 52, minWidth: 48, gap: 5 },
  // Matches the other tabs' icon + gap + label height (23 + 5 + ~14).
  logIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: green, alignItems: 'center', justifyContent: 'center' },
  navLabel: { color: colors.muted, fontSize: 11, textAlign: 'center' }, navSelected: { color: green, fontWeight: '600' },
  safe: { flex: 1, backgroundColor: colors.cream }, flex: { flex: 1 },
  header: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  wordmark: { fontSize: 23, fontWeight: '600', letterSpacing: -0.5, color: colors.green },
  add: { width: 48, height: 48, backgroundColor: green, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  intro: { paddingHorizontal: 24, paddingBottom: 24 },
  title: { fontSize: 28, lineHeight: 34, fontWeight: '700', letterSpacing: -0.4, color: colors.ink },
  subtitle: { fontSize: 16, lineHeight: 23, color: colors.muted, marginTop: 7 },
  tabs: { flexDirection: 'row', paddingHorizontal: 24, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line, gap: 28 },
  tab: { minHeight: 48, justifyContent: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: green }, tabText: { fontSize: 16, color: colors.muted, fontWeight: '500' }, activeText: { color: green, fontWeight: '600' },
  empty: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32, paddingVertical: 48 },
  emptyTitle: { fontSize: 20, lineHeight: 25, fontWeight: '600', color: colors.ink, textAlign: 'center', marginTop: 24 },
  emptyBody: { fontSize: 16, color: colors.muted, lineHeight: 24, textAlign: 'center', maxWidth: 300, marginTop: 10 },
  choiceCard: { minHeight: 88, padding: 20, borderRadius: 12, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, justifyContent: 'center', gap: 4 },
  choiceMeta: { fontSize: 13, color: colors.muted }, choiceName: { fontSize: 20, lineHeight: 25, fontWeight: '600', color: colors.ink },
  or: { textAlign: 'center', fontSize: 15, color: colors.muted, marginVertical: -8 },
  option: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  primaryText: { fontSize: 16, fontWeight: '600', color: colors.white, textAlign: 'center' },
  previewNote: { fontSize: 13, color: colors.muted, textAlign: 'center', paddingHorizontal: 24, paddingVertical: 16 },
  list: { paddingHorizontal: 24, paddingBottom: 24 }, count: { fontSize: 13, color: colors.muted, marginTop: 22, marginBottom: 4 },
  hikeHeading: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  hike: { paddingVertical: 22, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line }, hikeName: { fontSize: 20, fontWeight: '600', color: colors.ink },
  fieldError: { fontSize: 15, lineHeight: 21, color: colors.error, marginTop: 8 },
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

