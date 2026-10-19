# Viewpoint design

Native app screen, operate mode. Follow the user's Beli reference with restrained social-list conventions: system typography, flat content rows, white-green surfaces, and a single forest-green action color. Friend activity uses explicitly labeled fictional reviews until accounts are connected. No decorative metrics.

Tokens: background #FAF8F1; ink #20382C; secondary #5F6E63; action #173F32; divider #D6DCCE. Main spacing 24, control minimum 48, input radius 10, button radius 12. Screen titles 34/700; body 16�17. Typography scales with system settings.

Use safe-area insets and a keyboard-aware sheet for logging. Two content tabs; the plus is an action, never a navigation destination. The initial mountain mark comes from the Font Awesome 5 icon set bundled through Expo vector icons. Launcher assets and favicon use that same evergreen mountain on cream; Android includes transparent adaptive foreground and monochrome layers.

Current scope: tappable My hikes list, labeled sample Friends feed, hike details with personal ratings and notes, illustrative photos with loading/error states, and temporary session logging. Details include a back action and Android hardware-back support. Log this hike prefills the name and saves a separate personal review. Light appearance matches app.json. Native visual verification is pending a phone or emulator.
