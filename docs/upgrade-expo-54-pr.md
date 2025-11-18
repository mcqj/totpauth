# PR: Upgrade to Expo SDK 54 and EAS build config

Summary
-------
This PR upgrades the project to Expo SDK 54 and adds EAS build configuration for reproducible Android builds.

What changed
------------
- Upgraded dependencies to Expo SDK 54-compatible versions.
- Added `expoapp/eas.json` with `preview` (APK) and `production` (AAB) build profiles.
  - `preview` profile produces an installable APK for internal testing.
  - `production` profile produces an app bundle suitable for Google Play.
  - Both profiles set `NPM_CONFIG_LEGACY_PEER_DEPS=true` and `NODE_VERSION=24` to match local install behavior and CI.
  - Android credentials are configured to use remote (EAS-managed) keystore.
- Added `android.package` to `expoapp/app.json` (`com.mcqj.totpauth`).
- Added small TypeScript declaration shims for `crypto-js` and `expo-file-system` to address type issues after the upgrade.
- Extracted several UI and validation improvements in the app (credential flow, CameraScanner, ManualEntry, Totp validation) — see commits for details.

Why this change
----------------
- SDK 54 contains important updates and dependency compatibility for modern Expo workflows.
- EAS build profiles make it straightforward for contributors to produce signed artifacts without a local Android toolchain.
- Setting `NPM_CONFIG_LEGACY_PEER_DEPS` ensures `npm ci` behavior in EAS matches local development where `.npmrc` sets legacy peer deps.

Testing performed
-----------------
- Ran full Jest test suite in `expoapp` (11 suites, 25 tests) — all passing.
- Verified `npx tsc --noEmit` passes after adding declaration shims.
- Performed EAS preview build and installed APK on a physical Android device; performed manual smoke tests (manual entry, TOTP generation, QR scan).

How to review
-------------
- Run `npm install` in `expoapp`, then `npm run test` and `npx tsc --noEmit`.
- To reproduce a build locally, follow `expoapp/README.md` -> Rebuild & Install (EAS) section.

Follow-ups
----------
- Consider cleaning up some `any` casts introduced to work around transient type mismatches.
- Optional: Add CI step to run `eas build` for internal distribution on merge to a release branch (requires storing credentials securely).

---

Please let me know if you want this split across smaller PRs (e.g., SDK upgrade only vs. build config), or if you want me to create the PR branch and open the GitHub PR for you.