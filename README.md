
# TOTP Authenticator App

This is a secure, open-source Expo app for generating Time-based One-Time Passwords (TOTP) for two-factor authentication (2FA). It allows users to add, manage, and use multiple TOTP credentials for logging into applications that support 2FA.

---

## Features

- Add new TOTP credentials by scanning QR codes (using device camera)
- Manual credential entry as a fallback
- List all saved credentials with live, auto-updating TOTP codes
- Delete credentials securely
- All secrets stored securely on device (Expo SecureStore)
- Fully offline, no cloud sync or backup
- Accessible UI, supports screen readers and color contrast
- Cross-platform: iOS and Android (Expo-managed)
- Supports both portrait and landscape orientations

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (LTS recommended)
- [Expo CLI](https://docs.expo.dev/get-started/installation/):
  ```bash
  npm install -g expo-cli
  ```

### Setup
1. Install dependencies:
	```bash
	cd expoapp
	npm install
	```
2. Start the app:
	```bash
	npx expo start
	```
3. Open in your device/emulator:
	- iOS: Press `i` in the terminal
	- Android: Press `a` in the terminal
	- Or scan the QR code with Expo Go

---

## Usage

1. **Add Credential:**
	- Tap "Add Application" to scan a QR code or enter details manually.
	- The app parses standard TOTP QR codes (otpauth:// URIs).
2. **View Codes:**
	- All saved credentials are listed with their current TOTP code, which updates every 30 seconds.
3. **Delete Credential:**
	- Tap "Delete" on a credential to remove it from your device.

---

## Project Structure

- `expoapp/` — Main Expo app (React Native, TypeScript)
  - `app/` — Screens and routes (expo-router)
  - `components/` — Reusable UI components
  - `utils/` — Utility functions (TOTP, QR parsing, storage)
  - `assets/` — Images, icons, fonts
- `docs/` — Product requirements and technical specs
- `ui-mockups/` — HTML mockups for reference

---

## Technical Details

- **Framework:** React Native (Expo-managed)
- **Navigation:** expo-router (file-based)
- **Styling:** nativewind (Tailwind CSS for React Native)
- **TOTP Generation:** Custom RFC 6238-compliant implementation using `crypto-js`
- **Secure Storage:** Expo SecureStore
- **Camera:** Expo Camera
- **Testing:** Jest, React Native Testing Library

---

## Documentation

- [Product Requirements (PRD)](docs/totp-authenticator-prd.md)
- [Technical Specification](docs/totp-authenticator-techspec.md)

---

## Development & Contributing

1. Fork and clone the repository
2. Install dependencies and start the app as above
3. Follow the [tech spec](docs/totp-authenticator-techspec.md) for implementation details
4. Run tests:
	```bash
	cd expoapp
	npm test
	```
5. Submit pull requests for improvements or bug fixes

### CI/CD Status

This repository includes automated CI/CD that runs on all pushes and pull requests:

- **Lint checks**: Ensures code quality and style consistency
- **Unit tests**: Validates functionality (currently 25 tests across 11 test suites)

All CI checks must pass before merging. Check the GitHub Actions tab for the latest build status and any failures.

---

## Building an APK (EAS)

Follow these steps to produce a standalone Android APK using EAS (Expo Application Services). This produces an installable APK that uses your app name and icon (unlike Expo Go).

- Ensure `expoapp/app.json` has the correct `name`, `icon`, and `android.package`.
- Log in to Expo and configure EAS if you haven't already:
	```bash
	cd expoapp
	npx eas login
	npx eas build:configure
	```
- Start a preview APK build (preview profile produces an APK):
	```bash
	cd expoapp
	eas build -p android --profile preview
	```
- After the build completes, list and download the artifact:
	```bash
	eas build:list --platform android
	eas build:download --platform android --id <BUILD_ID>
	```
- Install on a connected device (replace path with downloaded APK path):
	```bash
	adb install -r ./app-release.apk
	```

Notes:
- If you need a development client with your icon/name for debugging, build using a `development` profile instead of `preview`.
- If you encounter dependency install errors on EAS, make sure `expoapp/eas.json` sets `NPM_CONFIG_LEGACY_PEER_DEPS` and `NODE_VERSION` appropriately (this repo uses `NODE_VERSION=24` and `NPM_CONFIG_LEGACY_PEER_DEPS=true`).


## Manual Validation

This site allows you to scan QR codes and check the TOPTP codes the App is generating.

https://authenticationtest.com/

This site is useful to get TOTP codes against which you can compare those generated
by the App.

https://localtotp.com/

---

## License

MIT License. See [LICENSE](LICENSE) for details.
