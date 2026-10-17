import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

type Hike = { id: string; name: string; enjoyment: number; difficulty: number; notes: string };
type Tab = 'My hikes' | 'Friends';
const green = '#245B45';

export default function App() {
  const [tab, setTab] = useState<Tab>('My hikes');
  const [hikes, setHikes] = useState<Hike[]>([]);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [enjoyment, setEnjoyment] = useState(0);
  const [difficulty, setDifficulty] = useState(0);
  function openLog() {
    setName(''); setNotes(''); setEnjoyment(0); setDifficulty(0); setAdding(true);
  }
  function saveHike() {
    if (!name.trim() || !enjoyment || !difficulty) return;
    setHikes(current => [{ id: Date.now().toString(), name: name.trim(), enjoyment, difficulty, notes: notes.trim() }, ...current]);
    setAdding(false); setTab('My hikes');
  }
  function closeLog() {
    if (name.trim() || notes.trim() || enjoyment || difficulty) {
      Alert.alert('Discard this hike?', 'Your changes haven’t been saved.', [
        { text: 'Keep editing', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => setAdding(false) },
      ]);
    } else setAdding(false);
  }
  const canSave = Boolean(name.trim() && enjoyment && difficulty);
  return (
    <SafeAreaProvider>
      <SafeAreaView style={s.safe}>
        <StatusBar style="dark" />
        <View style={s.header}>
          <View style={s.brand}><FontAwesome5 name="mountain" size={22} color={green} /><Text style={s.wordmark}>viewpoint</Text></View>
          <Pressable accessibilityRole="button" accessibilityLabel="Log a hike" onPress={openLog} style={({ pressed }) => [s.add, pressed && s.pressed]}><Feather name="plus" size={24} color="white" /></Pressable>
        </View>
        <View style={s.intro}>
          <Text accessibilityRole="header" style={s.title}>{tab}</Text>
          <Text style={s.subtitle}>{tab === 'My hikes' ? 'Every trail has a story. Keep yours here.' : 'A little inspiration from your people.'}</Text>
        </View>
        <View accessibilityRole="tablist" style={s.tabs}>
          {(['My hikes', 'Friends'] as const).map(item => <Pressable key={item} accessibilityRole="tab" accessibilityState={{ selected: tab === item }} onPress={() => setTab(item)} style={[s.tab, tab === item && s.activeTab]}><Text style={[s.tabText, tab === item && s.activeText]}>{item}</Text></Pressable>)}
        </View>
        {tab === 'My hikes' && hikes.length > 0 ? (
          <ScrollView contentContainerStyle={s.list}>
            <Text style={s.count}>{hikes.length} {hikes.length === 1 ? 'hike' : 'hikes'} logged</Text>
            {hikes.map(hike => <View key={hike.id} style={s.hike}><Text style={s.hikeName}>{hike.name}</Text><Text style={s.ratingLine}>Enjoyment {hike.enjoyment}/5 · Difficulty {hike.difficulty}/5</Text>{!!hike.notes && <Text style={s.notes}>{hike.notes}</Text>}</View>)}
          </ScrollView>
        ) : (
          <ScrollView contentContainerStyle={s.empty}>
            <Feather name={tab === 'My hikes' ? 'map' : 'users'} size={36} color={green} />
            <Text style={s.emptyTitle}>{tab === 'My hikes' ? 'Your first hike starts here' : 'Better trails, together'}</Text>
            <Text style={s.emptyBody}>{tab === 'My hikes' ? 'Log a hike you’ve done. Rate the climb, remember the view.' : 'Your friends’ hikes and ratings will appear here once friend accounts are connected.'}</Text>
            {tab === 'My hikes' && <Pressable accessibilityRole="button" onPress={openLog} style={({ pressed }) => [s.primary, pressed && s.pressed]}><Text style={s.primaryText}>Log your first hike</Text></Pressable>}
          </ScrollView>
        )}
        <Text style={s.previewNote}>Early preview · Hikes stay until the app restarts</Text>
        <Modal visible={adding} animationType="slide" presentationStyle="pageSheet" onRequestClose={closeLog}>
          <SafeAreaView style={s.safe}>
            <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
              <View style={s.sheetHeader}>
                <Pressable onPress={closeLog} accessibilityRole="button" style={s.textButton}><Text style={s.link}>Cancel</Text></Pressable>
                <Text style={s.sheetTitle}>Log a hike</Text>
                <Pressable onPress={saveHike} disabled={!canSave} accessibilityRole="button" accessibilityState={{ disabled: !canSave }} style={s.textButton}><Text style={[s.link, !canSave && s.disabled]}>Save</Text></Pressable>
              </View>
              <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.form}>
                <Text style={s.label}>Hike name</Text>
                <TextInput accessibilityLabel="Hike name" placeholder="e.g. Mount Tammany" placeholderTextColor="#70776F" value={name} onChangeText={setName} maxLength={120} style={s.input} autoCapitalize="words" />
                <Rating label="Enjoyment" description="1 = not for me · 5 = loved it" value={enjoyment} onChange={setEnjoyment} />
                <Rating label="Difficulty" description="1 = easy · 5 = very hard" value={difficulty} onChange={setDifficulty} />
                <Text style={s.label}>Notes <Text style={s.optional}>(optional)</Text></Text>
                <TextInput accessibilityLabel="Hike notes" placeholder="What would you want to remember?" placeholderTextColor="#70776F" value={notes} onChangeText={setNotes} multiline maxLength={2000} style={[s.input, s.notesInput]} textAlignVertical="top" />
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
    <View style={s.ratingOptions}>{[1, 2, 3, 4, 5].map(number => <Pressable key={number} accessibilityRole="radio" accessibilityLabel={`${label}: ${number} out of 5`} accessibilityState={{ checked: value === number }} onPress={() => onChange(number)} style={[s.ratingButton, value === number && s.selectedRating]}><Text style={[s.ratingNumber, value === number && s.primaryText]}>{number}</Text></Pressable>)}</View>
  </View>;
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAFBF8' }, flex: { flex: 1 },
  header: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  wordmark: { fontSize: 23, fontWeight: '600', letterSpacing: -0.8, color: '#253C30' },
  add: { width: 48, height: 48, backgroundColor: green, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.7 },
  intro: { paddingHorizontal: 24, paddingBottom: 24 },
  title: { fontSize: 34, fontWeight: '700', letterSpacing: -0.9, color: '#1F2B24' },
  subtitle: { fontSize: 16, lineHeight: 23, color: '#626B64', marginTop: 7 },
  tabs: { flexDirection: 'row', paddingHorizontal: 24, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#CFD5CE', gap: 28 },
  tab: { minHeight: 48, justifyContent: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: green }, tabText: { fontSize: 16, color: '#626B64', fontWeight: '500' }, activeText: { color: green, fontWeight: '600' },
  empty: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32, paddingVertical: 48 },
  emptyTitle: { fontSize: 22, fontWeight: '600', color: '#1F2B24', textAlign: 'center', marginTop: 24 },
  emptyBody: { fontSize: 16, color: '#626B64', lineHeight: 24, textAlign: 'center', maxWidth: 300, marginTop: 10 },
  primary: { marginTop: 28, minHeight: 50, paddingHorizontal: 24, paddingVertical: 14, backgroundColor: green, borderRadius: 12, justifyContent: 'center' },
  primaryText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', textAlign: 'center' },
  previewNote: { fontSize: 12, color: '#626B64', textAlign: 'center', paddingHorizontal: 24, paddingVertical: 16 },
  list: { paddingHorizontal: 24, paddingBottom: 24 }, count: { fontSize: 13, color: '#626B64', marginTop: 22, marginBottom: 4 },
  hike: { paddingVertical: 22, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#CFD5CE' }, hikeName: { fontSize: 20, fontWeight: '600', color: '#1F2B24' },
  ratingLine: { fontSize: 14, lineHeight: 22, color: green, marginTop: 7 }, notes: { fontSize: 16, lineHeight: 24, color: '#626B64', marginTop: 10 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#CFD5CE', paddingHorizontal: 12, paddingVertical: 8 },
  textButton: { minWidth: 64, minHeight: 48, justifyContent: 'center', alignItems: 'center' }, link: { color: green, fontSize: 17 }, disabled: { color: '#777C76' },
  sheetTitle: { color: '#1F2B24', fontSize: 17, fontWeight: '600' }, form: { padding: 24, paddingBottom: 48 },
  label: { fontSize: 17, color: '#1F2B24', fontWeight: '600', marginBottom: 10 }, optional: { fontWeight: '400', color: '#626B64', fontSize: 15 },
  input: { borderWidth: 1, borderColor: '#BCC6BC', borderRadius: 10, padding: 14, fontSize: 17, color: '#1F2B24', backgroundColor: '#FFFFFF', minHeight: 52 }, notesInput: { minHeight: 120 },
  rating: { marginVertical: 28 }, ratingHelp: { color: '#626B64', fontSize: 14, marginBottom: 14 }, ratingOptions: { flexDirection: 'row', gap: 10 },
  ratingButton: { flex: 1, minHeight: 48, borderRadius: 10, borderWidth: 1, borderColor: '#BCC6BC', alignItems: 'center', justifyContent: 'center' },
  selectedRating: { backgroundColor: green, borderColor: green }, ratingNumber: { color: '#1F2B24', fontSize: 17, fontWeight: '500' },
});

