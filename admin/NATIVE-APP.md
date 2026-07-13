# Steamy Bites Admin — Native App (iOS + Android)

The admin dashboard is wrapped as a native iOS + Android app using **Capacitor 8**.
It's the **same** React app in `admin/src` — the native shells just load the built
web bundle (`dist/`) and talk to the live backend. No separate codebase.

- **App name:** Steamy Bites Admin
- **App / bundle ID:** `shop.steamybites.admin`
- **API base (baked at build time):** `https://steamybitesbackend.onrender.com/api`
  (from `admin/.env.production`; the dev server is unaffected)

## Prerequisites
- **Node** (installed)
- **Android:** JDK **21** + Android SDK. Android Studio bundles JDK 21 at
  `/Applications/Android Studio.app/Contents/jbr/Contents/Home` (used below).
- **iOS:** **Xcode** only. This project uses **Swift Package Manager (SPM)**, so
  **CocoaPods is NOT required.**

## Rebuild after any web/UI change
```bash
cd admin
npm run build          # produces dist/ (uses .env.production -> live backend)
npx cap sync           # copies dist/ + plugins into android/ and ios/
```

## Android — build an installable APK
```bash
cd admin/android
JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home" ./gradlew assembleDebug
# -> app/build/outputs/apk/debug/app-debug.apk   (sideload onto any phone)
```
Or open `admin/android` in **Android Studio** and press Run (it uses its own JDK 21).

**Play Store release** needs a signing keystore (you create it, it has a password —
keep it secret) and a Google Play account ($25 one-time):
```bash
JAVA_HOME=".../jbr/Contents/Home" ./gradlew bundleRelease   # after configuring signing
```

## iOS — run / build
```bash
open admin/ios/App/App.xcodeproj
```
In Xcode: select the **App** target → **Signing & Capabilities** → pick your Team →
Run on a simulator or device. (Simulator needs no account; a real device / App Store
needs an Apple Developer account, $99/yr.)

## App icon & splash
Sources live in `admin/assets/` (green badge on brand green/cream). Regenerate all
sizes with:
```bash
cd admin && npx @capacitor/assets generate
```

## New-order alerts (native)
Built with `@capacitor/local-notifications` + `@capacitor-community/keep-awake`
(all gated on `Capacitor.isNativePlatform()`, so the web admin is unaffected):
- Each new **paid** order fires an OS notification (sound + vibration + heads-up).
- While any paid order is unaccepted, the in-app bell loops **and** the device is kept
  awake (screen won't sleep) — so a kitchen phone/tablet left on the Orders screen keeps
  ringing. It's released once every order is accepted.
- On app resume, orders refetch immediately.
- Android 13+ prompts for notification permission on first launch — allow it.

**Limitation:** these fire while the app is running (foreground / on-screen). To alert a
**fully-closed / backgrounded-and-suspended** app you need push (FCM for Android, APNs for
iOS). That needs a Firebase project + Apple push key + a server push service (secrets you
create) — not yet wired. See the "push (Tier 2)" plan when ready.

## Backend requirement (already in code, needs a Render deploy)
`server/server.js` CORS allowlist includes the Capacitor origins
(`capacitor://localhost`, `https://localhost`, `http://localhost`). Without these the
app cannot log in, fetch orders, or receive the realtime new-order stream. **This
change only takes effect after the backend is deployed on Render.**
