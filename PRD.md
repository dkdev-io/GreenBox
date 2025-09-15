# Product Requirements Document: "Green Box"

**Version:** 2.0 (Final for MVP)
**Date:** Sep 15, 2025
**Development Port:** 3010

## 1. Vision & Guiding Principles

### 1.1. Vision
To provide a simple, reliable, and secure way for iOS and Android users to share their real-time location with trusted friends and family, overcoming the platform limitations of native "find my" applications.

### 1.2. Guiding Principles
- **Privacy First (Zero-Knowledge):** The system will be architected so that Green Box operators and its backend services have zero knowledge of user location data. All location data is end-to-end encrypted. The user is in full control.
- **User Trust & Transparency:** The application must be transparent about what it's doing, especially regarding location permissions and data sharing. There should be no surprises.
- **Reliability & Efficiency:** Location sharing must be reliable across different network conditions and device models, while being as battery-efficient as possible.

## 2. System Architecture: Zero-Knowledge E2EE

The system is architected to ensure that all precise location data is unreadable by the server.

### Client Application (iOS/Android)
The client is the "smart" component. It is responsible for:
- Managing a user's cryptographic public/private key pair.
- Capturing location data.
- Applying user-defined privacy rules (e.g., "fuzzing" location) on-device.
- Encrypting location data for each specific friend using their public key.
- Uploading the encrypted data blobs to Supabase.
- Downloading encrypted blobs from friends, decrypting them with the user's private key, and displaying them.

### Supabase Backend
The backend is the "secure, dumb" component. It acts as a zero-knowledge message broker and data store. Its responsibilities are limited to:
- **Authentication:** Managing user identity.
- **Public Key Storage:** Storing users' public keys.
- **Encrypted Data Storage:** Storing opaque, encrypted text blobs.
- **Real-time Broker:** Broadcasting notifications when new encrypted data is available.
- **Data Deletion:** Enforcing a strict data retention policy by deleting data after a short period.

## 3. Backend Specifications (Supabase)

### 3.1. Database Schema

#### Table: users
**Description:** Stores public-facing user profile information and the public key required for E2EE.

**Columns:**
- `id` (uuid, Primary Key, FK to auth.users.id)
- `created_at` (timestamptz, not null)
- `full_name` (text)
- `avatar_url` (text)
- `public_key` (text, not null): The user's public cryptographic key, encoded as text.

#### Table: friendships
**Description:** Manages the relationship and sharing permissions between two users.

**Columns:**
- `id` (bigint, Primary Key, identity)
- `user_id_1` (uuid, not null, FK to users.id)
- `user_id_2` (uuid, not null, FK to users.id)
- `status` (text, not null, default 'pending'): Can be pending or active.
- `requested_by` (uuid, not null, FK to users.id): The user who initiated the request.

#### Table: encrypted_locations
**Description:** Stores E2EE location data blobs. This table contains no personally identifiable information in a readable format.

**Columns:**
- `id` (bigint, Primary Key, identity)
- `sender_id` (uuid, not null, FK to users.id)
- `recipient_id` (uuid, not null, FK to users.id)
- `payload` (text, not null): The encrypted data blob, encoded in Base64.
- `created_at` (timestamptz, not null, default now())

### 3.2. Row Level Security (RLS) Policies
- **users:** Any authenticated user can read public_key, full_name, avatar_url. A user can only update their own record.
- **friendships:** A user can only view rows where their ID is in user_id_1 or user_id_2.
- **encrypted_locations:**
  - **INSERT:** A user can only insert a row where sender_id is their own user ID.
  - **SELECT:** A user can only select rows where recipient_id is their own user ID.

### 3.3. Data Retention & Scheduled Functions
- **Policy:** All data in the encrypted_locations table is a privacy liability and must be ephemeral. Rows will be permanently deleted 10 minutes after creation.
- **Implementation:** A scheduled Supabase Edge Function (cron) will execute every minute.
  - **Name:** purge-old-locations
  - **Schedule:** `* * * * *` (every minute)
  - **Logic:** The function will connect with the service_role key and execute `DELETE FROM encrypted_locations WHERE created_at < NOW() - INTERVAL '10 minutes';`.

## 4. Client Application Specifications (iOS & Android)

### 4.1. Core Cryptography & Key Management
- **Library:** libsodium (via swift-sodium for iOS, a trusted wrapper for Kotlin/Android).
- **Key Generation:** On first launch, the app must:
  - Generate a new public/private key pair (crypto_box_keypair).
  - Store the private key in the most secure device storage available (iOS Keychain, Android Keystore). This key must never leave the device.
  - Upload the public key to the user's row in the users table.
- **Device Migration/Loss:** The private key is tied to the device. If a user gets a new device, a new key pair must be generated. The app must include a mechanism to re-establish sharing by having friends re-accept requests, thereby exchanging new public keys.

### 4.2. Permissions & Justifications
- **Info.plist (iOS) / AndroidManifest.xml (Android):** Must include permissions for When In Use / FINE_LOCATION and Always / BACKGROUND_LOCATION.
- **Permission Flow:** The app must use a multi-step request flow. First, ask for "When In Use" permission with a clear rationale. Only after the user is engaged and understands the value, present a second screen explaining the benefit of "Always Allow" for background updates, before triggering the system prompt.

### 4.3. Location Tracking Logic
- **Foreground ("Live"):** Use high-accuracy tracking (kCLLocationAccuracyBest / PRIORITY_HIGH_ACCURACY) with frequent updates (e.g., every 10-15 seconds) when the app is open.
- **Background ("Energy Saver"):**
  - **iOS:** Use startMonitoringSignificantLocationChanges() for a battery-friendly approach. For higher fidelity, use allowsBackgroundLocationUpdates = true but make it clear to the user this consumes more power.
  - **Android:** Must be implemented as a Foreground Service with a persistent notification that is non-dismissible, clearly stating that location is being shared. This is a mandatory OS requirement.

### 4.4. E2EE Data Flow (Client-Side)

#### To Send a Location:
1. Capture the device's current coordinates.
2. For each active friend:
   a. Retrieve the friend's public_key from Supabase.
   b. Apply Privacy Rule: Check for a user-defined "fuzzy" setting for this friend. If active, round the coordinates to 2-3 decimal places.
   c. Create a JSON payload: `{ "lat": 34.052, "lon": -118.243, "ts": 1678886400, "acc": 5.0 }` (latitude, longitude, timestamp, accuracy in meters).
   d. Encrypt this JSON string using the friend's public key (crypto_box_seal).
   e. Encode the resulting ciphertext to a Base64 string.
   f. Insert a new row into encrypted_locations with the sender_id, recipient_id, and the Base64 payload.

#### To Receive Locations:
1. Use Supabase Realtime to subscribe to INSERT events on encrypted_locations where recipient_id is the current user's ID.
2. When a new payload arrives:
   a. Retrieve the user's private key from the secure keychain/keystore.
   b. Decode the Base64 payload and decrypt it using the private key (crypto_box_seal_open).
   c. Parse the resulting JSON.
   d. Validate: Check the timestamp ts to prevent stale updates. Check the acc to decide how to render the location (e.g., a dot vs. a larger circle).
   e. Update the friend's marker on the map.

## 5. Detailed User Workflow & UI Logic

This section details the end-to-end user journey for the core "invite and share" loop.

### 5.1. Onboarding a New User (First Launch)
1. **Landing Screen:** A simple screen explaining the app's value proposition. Buttons: "Get Started" and "Log In".
2. **Authentication:** Tapping "Get Started" or "Log In" leads to the Auth screen. Options: "Continue with Apple" and "Continue with Google".
3. **Permissions Primer:** After successful authentication, the app presents a pre-permission primer screen explaining why location access is needed.
4. **Request "When In Use" Permission:** The app requests When In Use / ACCESS_FINE_LOCATION permission.
5. **Key Generation:** In the background, the app generates the user's public/private key pair and securely stores the private key. The public key is uploaded to Supabase.
6. **Main App Screen:** The user lands on the main map screen. It will be empty, with a prominent "Invite Your First Friend" button.

### 5.2. The Invitation Flow (User A invites User B)
1. **Initiate Invite:** User A taps "Invite a Friend".
2. **Set Permissions First (User A):** A modal dialog appears: "Set Your Sharing Preferences."
   - Options: "Precise Location" (Default) vs. "General Location".
   - A "Continue" button is disabled until a choice is made.
3. **Select Invitee:** After setting preferences, the app requests access to device contacts. The native contact picker is shown, with a fallback to manual phone number entry.
4. **Send Invite:** The app opens the native SMS interface, pre-filled with a message and a unique invite link (localhost:3010 for development). User A presses "Send".
5. **Local Pending State:** On User A's app, the friend list now shows User B's name with a "Pending..." status.

### 5.3. The Acceptance Flow (User B joins)
1. **Receive Text & Redirect:** User B taps the unique link, is redirected via a web page to the correct App Store / Google Play Store, and downloads the app.
2. **Onboard:** User B completes the standard onboarding flow (Auth, permissions, key generation).
3. **The "Magic Moment" (Deep Linking):** Immediately after onboarding, the app displays a modal: "[User A's Name] has invited you!" with buttons "Accept & Share Back" and "Decide Later".
4. **Decline/Decide Later:** Tapping "Decide Later" dismisses the dialog. The request remains in a "Pending Invites" section of the app. The friendships status remains pending.
5. **Accept & Set Preferences (User B):** Tapping "Accept & Share Back" prompts User B to choose their own sharing preference ("Precise" vs. "General") for User A.
6. **Connection Complete:** Upon confirmation, the app updates the friendships status to active. Supabase Realtime broadcasts this change, and both users now see each other on their respective maps.