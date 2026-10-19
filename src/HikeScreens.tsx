import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { friendReviews, FriendReview, Hike } from './hikes';

export const colors = {
  green: '#173F32', cream: '#FAF8F1', ink: '#20382C', muted: '#5F6E63',
  line: '#D6DCCE', soft: '#E9EEDF', white: '#FFFFFF',
};

function TrailPhoto({ uri, large = false }: { uri: string; large?: boolean }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  return <View style={[s.photo, large && s.largePhoto]}>
    {!loaded && <View style={s.photoFallback}>
      <Feather name="image" size={28} color={colors.muted} />
      <Text style={s.photoStatus}>{failed ? 'Photo unavailable' : 'Loading photo…'}</Text>
    </View>}
    {!failed && <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" onLoad={() => setLoaded(true)} onError={() => { setFailed(true); setLoaded(false); }} accessibilityLabel="Illustrative mountain scenery; not a verified photo of this hike" />}
  </View>;
}

export function ReviewRatings({ hike }: { hike: Hike }) {
  return <View style={s.ratings}>
    <Text style={s.rating}><Text style={s.score}>{hike.enjoyment}/5</Text> enjoyment</Text>
    <Text style={s.rating}><Text style={s.score}>{hike.difficulty}/5</Text> difficulty</Text>
  </View>;
}

export function FriendsFeed({ onOpen }: { onOpen: (hike: FriendReview) => void }) {
  return <ScrollView contentContainerStyle={s.feed}>
    <View style={s.preview}>
      <Feather name="info" size={17} color={colors.green} />
      <Text style={s.previewText}>Sample feed · People and reviews are fictional.</Text>
    </View>
    {friendReviews.map(review => <View key={review.id} style={s.post}>
      <View style={s.person}>
        <View style={s.avatar}><Text style={s.initials}>{review.initials}</Text></View>
        <View style={s.personCopy}><Text style={s.author}>{review.author}</Text><Text style={s.time}>Logged a hike · {review.when}</Text></View>
      </View>
      <Pressable onPress={() => onOpen(review)} accessibilityRole="button" accessibilityLabel={`View ${review.name}, reviewed by ${review.author}`} style={({ pressed }) => pressed && s.pressed}>
        <View style={s.trailHeading}><View style={s.trailCopy}><Text style={s.trailName}>{review.name}</Text><Text style={s.location}>{review.location}</Text></View><Feather name="chevron-right" size={22} color={colors.green} /></View>
        <ReviewRatings hike={review} />
        <Text style={s.reviewText} numberOfLines={3}>{review.notes}</Text>
        {review.photo && <TrailPhoto uri={review.photo} />}
        <Text style={s.viewDetails}>View hike & review</Text>
      </Pressable>
    </View>)}
    <Text style={s.end}>You’re all caught up on the sample feed.</Text>
  </ScrollView>;
}

export function HikeDetails({ hike, onBack, onLog }: { hike: Hike | FriendReview; onBack: () => void; onLog: (name: string) => void }) {
  const sample = 'author' in hike;
  return <View style={s.detail}>
    <View style={s.navigation}>
      <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel={`Back to ${sample ? 'Friends' : 'My hikes'}`} style={s.back}><Feather name="arrow-left" size={22} color={colors.green} /><Text style={s.backText}>{sample ? 'Friends' : 'My hikes'}</Text></Pressable>
      <Text style={s.navigationTitle}>Hike details</Text>
    </View>
    <ScrollView contentContainerStyle={s.detailContent}>
      <Text accessibilityRole="header" style={s.detailTitle}>{hike.name}</Text>
      {hike.location && <Text style={s.detailLocation}>{hike.location}</Text>}
      {sample && <Text style={s.sampleLabel}>Sample hike & review</Text>}
      {hike.photo ? <View style={s.detailPhoto}><TrailPhoto uri={hike.photo} large /><Text style={s.caption}>Illustrative scenery · Unsplash</Text></View> : <View style={s.noPhoto}><Feather name="camera" size={24} color={colors.muted} /><Text style={s.noPhotoText}>No photos added to this hike yet.</Text></View>}
      <View style={s.reviewSection}>
        <Text accessibilityRole="header" style={s.sectionTitle}>{sample ? `${hike.author.split(' ')[0]}’s review` : 'Your review'}</Text>
        <Text style={s.sectionHelp}>Personal ratings, each out of 5.</Text>
        <View style={s.detailRatings}>
          <View style={s.ratingColumn}><Text style={s.detailScore}>{hike.enjoyment}<Text style={s.outOf}> / 5</Text></Text><Text style={s.ratingLabel}>Enjoyment</Text><Text style={s.ratingMeaning}>{['Not for me', 'It was okay', 'Liked it', 'Really liked it', 'Loved it'][hike.enjoyment - 1]}</Text></View>
          <View style={s.ratingColumn}><Text style={s.detailScore}>{hike.difficulty}<Text style={s.outOf}> / 5</Text></Text><Text style={s.ratingLabel}>Difficulty</Text><Text style={s.ratingMeaning}>{['Easy', 'Fairly easy', 'Moderate', 'Hard', 'Very hard'][hike.difficulty - 1]}</Text></View>
        </View>
        <Text accessibilityRole="header" style={s.sectionTitle}>Notes</Text>
        <Text style={s.detailNotes}>{hike.notes || 'No notes added to this hike.'}</Text>
      </View>
      {sample && <>
        <Pressable onPress={() => onLog(hike.name)} accessibilityRole="button" accessibilityLabel="Log this hike" style={({ pressed }) => [s.logButton, pressed && s.pressed]}><Feather name="plus" size={20} color={colors.white} /><Text style={s.logText}>Log this hike</Text></Pressable>
        <Text style={s.logHelp}>Been here? Add your own ratings and notes.</Text>
      </>}
    </ScrollView>
  </View>;
}

const s = StyleSheet.create({
  feed: { paddingHorizontal: 24, paddingBottom: 24 },
  preview: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 18 },
  previewText: { flex: 1, fontSize: 13, lineHeight: 19, color: colors.muted },
  post: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line, paddingTop: 12, paddingBottom: 22, marginBottom: 12 },
  person: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.soft, alignItems: 'center', justifyContent: 'center' },
  initials: { color: colors.green, fontSize: 13, fontWeight: '600' },
  personCopy: { flex: 1 }, author: { color: colors.ink, fontSize: 15, fontWeight: '600' },
  time: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 3 },
  trailHeading: { flexDirection: 'row', gap: 12, alignItems: 'center' }, trailCopy: { flex: 1 },
  trailName: { fontSize: 23, fontWeight: '600', letterSpacing: -0.5, color: colors.ink },
  location: { fontSize: 14, color: colors.muted, marginTop: 4 },
  ratings: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 20, rowGap: 8, marginTop: 15 },
  rating: { fontSize: 14, color: colors.muted }, score: { color: colors.green, fontWeight: '700' },
  reviewText: { color: colors.ink, fontSize: 16, lineHeight: 25, marginTop: 13, marginBottom: 16 },
  photo: { height: 185, borderRadius: 12, overflow: 'hidden', backgroundColor: colors.soft }, largePhoto: { height: 240 },
  photoFallback: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 }, photoStatus: { color: colors.muted, fontSize: 13 },
  viewDetails: { color: colors.green, fontWeight: '600', fontSize: 14, paddingTop: 16, paddingBottom: 4 },
  pressed: { opacity: 0.65 }, end: { textAlign: 'center', color: colors.muted, fontSize: 13, lineHeight: 20, paddingVertical: 20 },
  detail: { flex: 1 }, navigation: { paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  back: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 8 }, backText: { color: colors.green, fontSize: 16 },
  navigationTitle: { color: colors.muted, fontSize: 14, flexShrink: 1 }, detailContent: { padding: 24, paddingBottom: 40 },
  detailTitle: { color: colors.ink, fontWeight: '700', fontSize: 32, letterSpacing: -0.8 }, detailLocation: { color: colors.muted, fontSize: 16, marginTop: 7 },
  sampleLabel: { color: colors.muted, fontSize: 13, marginTop: 12 }, detailPhoto: { marginTop: 24 },
  caption: { color: colors.muted, fontSize: 12, marginTop: 8 },
  noPhoto: { backgroundColor: colors.soft, padding: 24, gap: 12, alignItems: 'center', marginTop: 24, borderRadius: 12 }, noPhotoText: { color: colors.muted, fontSize: 14 },
  reviewSection: { paddingTop: 30 }, sectionTitle: { color: colors.ink, fontSize: 21, fontWeight: '600' }, sectionHelp: { color: colors.muted, fontSize: 14, marginTop: 6 },
  detailRatings: { flexDirection: 'row', flexWrap: 'wrap', gap: 24, paddingVertical: 24, marginBottom: 24, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  ratingColumn: { flex: 1, minWidth: 105 }, detailScore: { fontSize: 30, fontWeight: '600', color: colors.green }, outOf: { fontSize: 16, fontWeight: '400', color: colors.muted },
  ratingLabel: { fontSize: 15, fontWeight: '600', color: colors.ink, marginTop: 5 }, ratingMeaning: { fontSize: 13, color: colors.muted, marginTop: 5 },
  detailNotes: { color: colors.ink, fontSize: 17, lineHeight: 27, marginTop: 12 },
  logButton: { backgroundColor: colors.green, borderRadius: 12, minHeight: 52, padding: 15, marginTop: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  logText: { color: colors.white, fontSize: 16, fontWeight: '600' }, logHelp: { color: colors.muted, textAlign: 'center', fontSize: 13, lineHeight: 20, marginTop: 12 },
});
