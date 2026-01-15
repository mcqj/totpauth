
# TOTP Authenticator App

This is a secure, open-source Expo app for generating Time-based One-Time Passwords (TOTP) for two-factor authentication (2FA). It allows users to add, manage, and use multiple TOTP credentials for logging into applications that support 2FA.

---

## Features

- **TOTP Code Generation:** Add new TOTP credentials by scanning QR codes (using device camera) or manual entry
- **Folder Organization:** Create folders and sub-folders to organize your credentials hierarchically
- **Custom Icons:** Add custom avatars/icons to both credentials and folders for easy identification
- **Live Codes:** View all saved credentials with live, auto-updating TOTP codes that refresh every 30 seconds
- **Secure Storage:** All secrets stored securely on device using Expo SecureStore
- **Fully Offline:** No cloud sync or backup required - everything stays on your device
- **Cross-platform:** Works on both iOS and Android (Expo-managed)
- **Accessible:** Supports screen readers, color contrast, and both portrait/landscape orientations
- **Dark Mode:** Full support for light and dark color schemes

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

### Adding Credentials
1. **Scan QR Code:**
	- Tap the "+" icon in the top right of the main screen
	- Choose "Scan QR Code" and point your camera at the TOTP QR code
	- The app automatically parses standard TOTP QR codes (otpauth:// URIs)

2. **Manual Entry:**
	- Tap the "+" icon and choose "Enter Manually"
	- Fill in the account name, issuer, and secret key
	- Optionally select a folder and custom icon
	- Tap "Save Manual Entry"

### Organizing with Folders
1. **Create a Folder:**
	- Tap the folder icon in the top right of the main screen
	- Enter a name for your folder
	- Optionally add a custom avatar image
	- Create sub-folders by navigating into a folder first, then creating a new one

2. **Assign Credentials to Folders:**
	- When adding or editing a credential, use the "Folder (optional)" picker
	- Select a folder or leave as "No folder (root)" for the main view

3. **Navigate Folders:**
	- Tap on a folder to view its contents
	- Use the breadcrumb trail at the top to navigate back
	- Tap "Home" to return to the root view

4. **Manage Folders:**
	- Edit a folder by tapping the pencil icon next to it
	- Delete empty folders by tapping the trash icon
	- Folders containing credentials or sub-folders cannot be deleted

### Viewing and Using Codes
- All credentials are listed with their current TOTP code
- Codes automatically update every 30 seconds
- The countdown timer shows how long until the next code refresh

### Editing and Deleting
- **Edit:** Tap the pencil icon next to a credential to modify its details
- **Delete:** Tap the trash icon to remove a credential (requires confirmation)

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
