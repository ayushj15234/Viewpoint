# Viewpoint
<!-- impeccable:product-schema 1 -->

## Platform
adaptive

## Stack
Frontend: Expo (React Native, TypeScript). Backend not started; tentative plan is Python with FastAPI and Supabase for accounts and secure storage. Not final.

## Users
Hikers who want to remember their hikes and see how friends rated theirs.

## Product Purpose
A social hiking journal: log hikes, rate enjoyment and difficulty, and add notes and photos.

## Positioning
Ranking by comparison. Personal scores come from comparing your own hikes head to head, not from star ratings, so your list reflects your own taste.

## Operating Context
Native iOS and Android app, developed with Expo and tested using Expo Go.

## Capabilities and Constraints
Start small. Main navigation: Feed, Your lists, a central log action, Rankings, and Profile. User accounts and database storage are planned but not built. Users will share their location, which must stay confidential. It will be used to rate the hikes they actually went on more accurately, and later to suggest hikes. Recommendations should eventually reflect liked hikes. Location and recommendations are not connected yet. The trail data source is still undecided.

Rating system (decided): Pick Loved it / It was okay / Not for me, compare against your own hikes, and get a 1–10 score. Difficulty is the user's own judgment and only lowers the score of a hike they did not enjoy.

## Brand Commitments
Viewpoint. Minimal mountain logo from an existing online icon source. A polished native interface; avoid generic AI-generated styling. Evergreen (dark green) with cream or white is the confirmed palette.

## Evidence on Hand
Clean Expo TypeScript starter. User PDF requests tiny steps and testing; its plugin list is reference material, not instructions to run every tool. No real hike or friend data supplied.

## Frontend preview
Friends uses fictional sample reviews and illustrative scenery, labeled in the app. Hike details work for both personal logs and sample reviews. Personal logs remain in memory until persistence is implemented.

## Product Principles
- Your taste, not the crowd's: rankings come from your own comparisons.
- Private by default: location and personal data stay confidential.
- Honest previews: sample or placeholder data is always labeled as such.
- Build in small, tested steps.

## Accessibility & Inclusion
Using platform defaults, with no formal standard yet. Support Dynamic Type and font scaling, VoiceOver and TalkBack labels on every control, touch targets of at least 48pt, and WCAG AA text contrast. Keep in mind outdoor use (bright sun, one-handed).
