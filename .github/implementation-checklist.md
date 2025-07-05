# Implementation Checklist for TOTP Authenticator App

**Purpose:** Ensure every step from the tech spec and PRD is followed exactly. Do not skip, combine, or reorder steps. For each step:
- State which section/bullet of the tech spec/PRD you are addressing.
- Describe the action you are about to take.
- After completion, confirm the step is done before moving to the next.
- Provide a status summary after each major section.

---

## Checklist

### 1. Project Setup
- [ ] Initialize Expo-managed React Native project with TypeScript
- [ ] Install nativewind, expo-router, and required Expo modules
- [ ] Set up folder structure: src/components, src/app, src/utils, src/assets
- [ ] Configure nativewind for styling and dark mode

### 2. Core Features
- [ ] Add Credential via QR Code (Camera, QR parsing, SecureStore)
- [ ] List Credentials & Display TOTP Codes (auto-refresh, RFC 6238)
- [ ] Delete Credential (UI, SecureStore update)
- [ ] Secure Storage (Expo SecureStore, unique keys)
- [ ] Accessibility (screen reader, color contrast, tap targets)

### 3. User Flows
- [ ] Add Credential flow
- [ ] View Codes flow
- [ ] Delete Credential flow

### 4. Navigation
- [ ] Implement expo-router navigation
- [ ] Add bottom navigation bar as per mockups

### 5. UI/UX
- [ ] Match all screens to provided HTML mockups
- [ ] Use nativewind utility classes
- [ ] Ensure responsiveness and mobile-first design
- [ ] Support dark mode

### 6. TOTP Generation
- [ ] Integrate otplib or equivalent for TOTP
- [ ] Ensure 30s code refresh
- [ ] Validate against RFC 6238

### 7. Error Handling
- [ ] Camera permission errors
- [ ] Invalid QR/user input
- [ ] User-friendly error messages

### 8. Testing
- [ ] Unit tests for utils (TOTP, QR, storage)
- [ ] Component/integration tests for screens
- [ ] Place test files alongside components

### 9. Analytics & Tracking
- [ ] Integrate event tracking (credential add/delete, QR scan)
- [ ] Track KPIs as per PRD

### 10. Documentation
- [ ] Update README with setup, usage, and testing
- [ ] Add JSDoc for complex functions/components

---

**Instruction:**
- Do not proceed to the next checklist item until the current one is complete and confirmed.
- Reference the relevant tech spec/PRD section for each action.
- Provide a status summary after each major section.
