# TOTP Authenticator App - Technical Specification

## 1. Document Overview
- **Title:** TOTP Authenticator App Technical Specification
- **Related PRD:** [docs/totp-authenticator-prd.md](totp-authenticator-prd.md)
- **Author(s):** Architecture Team
- **Date:** 2025-07-04
- **Status:** Draft

---

## 2. Implementation Overview

This document provides a step-by-step technical design for implementing the TOTP Authenticator App as described in the PRD. It covers all required features, user flows, and technical considerations, ensuring the acceptance criteria are met.

---

## 3. Architecture & Technology Stack

- **Framework:** React Native with Expo-managed workflow
- **Navigation:** expo-router (file-based routing)
- **Styling:** nativewind (utility classes)
- **Device APIs:** Expo Camera, Expo SecureStore
- **TOTP Generation:** RFC 6238-compliant library (e.g., `otplib`)
- **Testing:** Jest, React Native Testing Library
- **Platforms:** iOS and Android

---

## 4. Step-by-Step Implementation Guide

### 4.1. Project Setup

- Initialize a new Expo project with TypeScript.
- Install required dependencies using `expo install` for Expo modules and `npm/yarn` for others.
- Set up nativewind for styling.
- Configure expo-router for navigation.

### 4.2. Folder Structure

- `components/` — Reusable UI components (e.g., CredentialCard, QRScanner)
- `app/` — Screens and routes (login, account list, add credential, OTP entry)
- `utils/` — Utility functions (TOTP generation, QR parsing, secure storage)
- `assets/` — Images, icons, and fonts
- `ui-mockups/` — Reference HTML mockups (for design consistency)

### 4.3. Core Features

#### 4.3.1. Add Credential via QR Code

- Implement a screen with camera access using Expo Camera.
- Parse QR code data to extract TOTP URI (otpauth://).
- Validate and extract secret, issuer, and account name.
- Store credential securely using Expo SecureStore.
- Provide fallback for manual entry if camera permission is denied.

#### 4.3.2. List Credentials & Display TOTP Codes

- Fetch all stored credentials from SecureStore.
- For each credential, display:
  - App/account name
  - Current TOTP code (auto-refresh every 30 seconds)
- Use a reusable component for each credential row.
- Ensure codes are generated using RFC 6238 (e.g., via `otplib`).

#### 4.3.3. Delete Credential

- Add a delete action (e.g., swipe or button) for each credential.
- Confirm deletion with the user.
- Remove the credential from SecureStore and update the list.

#### 4.3.4. Secure Storage

- Store all secrets and credential metadata in Expo SecureStore.
- Do not store secrets in plain text elsewhere.
- Use unique keys for each credential.

#### 4.3.5. Accessibility

- Ensure all screens/components are accessible via screen readers.
- Use sufficient color contrast and large tap targets.
- Add accessibility labels to interactive elements.

### 4.4. User Flows

- **Add Credential:** Home → Add Application → Camera/Manual Entry → Save → List
- **View Codes:** Home → List of Credentials → View/Copy Code
- **Delete Credential:** Home → List → Delete → Confirm

### 4.5. Navigation

- Use expo-router for file-based navigation.
- Implement a bottom navigation bar as per UI mockups.
- Ensure navigation is accessible and consistent.

### 4.6. UI/UX

- Follow the provided HTML mockups for layout, spacing, and navigation.
- Use nativewind utility classes for styling.
- Ensure responsiveness and mobile-first design.

### 4.7. TOTP Generation

- Use a well-maintained library (e.g., `otplib`) for TOTP code generation.
- Ensure codes update every 30 seconds.
- Validate against RFC 6238.

### 4.8. Error Handling

- Handle camera permission errors gracefully.
- Show user-friendly error messages for invalid QR codes or failed actions.
- Validate all user input.

### 4.9. Testing

- Write unit tests for utility functions (TOTP, QR parsing, storage).
- Write component and integration tests for all screens.
- Place test files alongside components with `.test.tsx` or `.test.ts` extensions.

### 4.10. Analytics & Tracking

- Integrate event tracking for:
  - Credential added
  - Credential deleted
  - QR code scanned
- Track KPIs as defined in the PRD.

### 4.11. Documentation

- Update README with setup, usage, and testing instructions.
- Add JSDoc comments for complex functions/components.

---

## 5. Assumptions

- All QR codes follow the standard TOTP URI format.
- Users have a device with a working camera.
- No cloud sync or backup is required.
- No push notifications or web version in scope.

---

## 6. Open Questions

- Should biometric authentication be considered for accessing the app or credentials?
- Should there be an onboarding/tutorial for first-time users?
- Is there a need for import/export of credentials in the future?

---

## 7. References

- [TOTP Authenticator PRD](totp-authenticator-prd.md)
- [Expo Camera](https://docs.expo.dev/versions/latest/sdk/camera/)
- [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/)
- [otplib](https://github.com/yeojz/otplib)
- [nativewind](https://www.nativewind.dev/)
- [expo-router](https://expo.github.io/router/docs)

---
