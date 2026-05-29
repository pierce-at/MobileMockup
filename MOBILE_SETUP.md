# Mobile Setup

This app is now prepared for a Capacitor workflow.

## What is already wired

- Safe-area aware shell and bottom navigation
- `viewport-fit=cover` for iPhone notch/home-indicator devices
- Capacitor runtime setup for:
  - status bar styling
  - keyboard resize behavior
  - splash screen dismissal
- Static export via `next build` to `out/`

## Main commands

```powershell
npm run mobile:build
npm run mobile:doctor
npm run mobile:add:ios
npm run mobile:add:android
npm run mobile:sync
```

After platforms exist:

```powershell
npm run mobile:open:ios
npm run mobile:open:android
```

## First device QA checklist

- Header clears notch and dynamic island
- Bottom nav clears home indicator
- Inputs do not zoom on iPhone
- Keyboard does not cover focused fields
- Map screen remains usable in portrait
- My Week scroll stays inside agenda panel
- Long speaker/session text wraps cleanly

## Notes

- `webDir` is `out`, so Capacitor consumes the exported Next build.
- If native projects are not added yet, `mobile:sync` will warn until `ios` or `android` is added.
- Recommended order:
  - `npm run mobile:doctor`
  - `npm run mobile:add:ios`
  - `npm run mobile:add:android`
  - `npm run mobile:build`
  - `npm run mobile:sync`
