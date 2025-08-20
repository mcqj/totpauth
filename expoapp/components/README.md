# Components

This folder contains reusable UI components used across the app.

## CredentialCard
Props:
- `credential: Credential` — the credential object. See `../types/credential.ts` for the shape.
- `onDelete: () => void` — callback when the delete button is pressed.

Behavior:
- Renders account name, issuer, and a live TOTP code (updates every second).
- Shows a trash icon button that calls `onDelete`.

## CameraScanner
Props:
- `onScanned: (data: string) => void` — called when a QR code is scanned.
- `onCancel?: () => void` — optional cancel handler.

Behavior:
- Handles camera permission checks and renders a scanner view when permission is granted.

## ManualEntry
Props:
- `onSave: (payload) => Promise<void> | void` — invoked with `{ accountName, issuer, secret }` when the user saves.
- `onCancel?: () => void` — optional cancel handler.

Behavior:
- Provides keyboard-aware manual entry form and basic missing-field validation.
