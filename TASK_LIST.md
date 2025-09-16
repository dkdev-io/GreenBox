# Green Box Development Task List
**Total: 109 tasks across 9 weeks**

## Phase 0: Critical Vertical Slice (Weeks 1-2)
**Goal**: Prove entire E2EE location sharing concept with hardcoded users

### Environment & Security Infrastructure Setup
- [x] **0.0** Set up environment configuration library (react-native-config) and create .env.development and .env.production files - Complete - Session 1
- [x] **0.1** Create separate Supabase projects for development and production environments - Complete - Session 1

### Backend Foundation
- [x] **0.2** Set up Supabase development project and obtain API keys - Complete - Session 1
- [x] **0.3** Create database schema (users, friendships, encrypted_locations tables) - Complete - Session 1
- [x] **0.4** Implement Row Level Security (RLS) policies for all tables - Complete - Session 1
- [x] **0.5** Create Edge Function for automatic data purging (10-minute retention) - Complete - Session 1
- [x] **0.6** Test RLS policies with manual data insertion via Supabase dashboard - Complete - Session 1

### Manual Test Data Setup
- [x] **0.7** Manually create User A in Supabase Auth (dan@dkdev.io) - Complete - Session 1
- [x] **0.8** Manually create User B in Supabase Auth (test-user-b@dkdev.io) - Complete - Session 1
- [x] **0.9** Generate public/private key pairs for both users (using libsodium) - Complete - Session 1
- [x] **0.10** Upload public keys to users table for both test users - Complete - Session 1
- [x] **0.11** Manually insert active friendship row linking User A and User B - Complete - Session 1

### Basic React Native App Setup
- [x] **0.12** Initialize React Native project with Expo/CLI - Complete - Session 1
- [x] **0.13** Configure project to use port 3010 - Complete - Session 1
- [x] **0.14** Install core dependencies (react-native-maps, @supabase/supabase-js) - Complete - Session 1
- [x] **0.15** Install cryptography library (react-native-libsodium) - Complete - Session 1
- [x] **0.15a** Install and configure secure storage library (expo-secure-store) - Complete - Session 1
- [ ] **0.16** Create basic app structure with navigation

### Hardcoded User Selection
- [ ] **0.17** Create simple user selection screen (button for "Login as User A" / "Login as User B")
- [ ] **0.18** Implement hardcoded authentication using supabase.auth.setSession with manually generated JWTs for test users
- [ ] **0.19** Store selected user ID and retrieve their private key from secure storage

### Location Capture & Encryption
- [ ] **0.20** Request location permissions (When In Use only for now)
- [ ] **0.21** Implement basic location tracking (foreground only)
- [ ] **0.22** Fetch friend's public key from Supabase users table
- [ ] **0.23** Create encryption function (location JSON → friend's public key → Base64 payload)
- [ ] **0.24** Send encrypted location to encrypted_locations table

### Real-time Reception & Decryption
- [ ] **0.25** Set up Supabase Realtime client
- [ ] **0.26** Subscribe to INSERT events on encrypted_locations for current user
- [ ] **0.27** Create decryption function (Base64 payload → private key → location JSON)
- [ ] **0.28** Log decrypted location data to console

### Basic Map Integration
- [ ] **0.29** Create basic map screen using react-native-maps
- [ ] **0.30** Plot user's own current location as blue dot
- [ ] **0.31** Plot friend's received location as red dot
- [ ] **0.32** Update friend's marker position in real-time

### Phase 0 Security Audit
- [ ] **0.33** Verify private keys are stored in device keychain/keystore
- [ ] **0.34** Test RLS policies: User A cannot read User B's incoming messages
- [ ] **0.35** Confirm no decrypted location data appears in logs/storage
- [ ] **0.36** Manual testing: Verify end-to-end location sharing between devices

---

## Phase 1: Authentication & Core Mobile (Weeks 3-4)
**Goal**: Replace hardcoded setup with proper OAuth and dynamic user creation

### OAuth Implementation
- [ ] **1.1** Configure Apple Sign-In provider in Supabase
- [ ] **1.2** Configure Google Sign-In provider in Supabase
- [ ] **1.3** Create authentication screens (landing, login)
- [ ] **1.4** Implement Apple Sign-In flow
- [ ] **1.5** Implement Google Sign-In flow
- [ ] **1.6** Handle authentication state management

### Dynamic Key Generation
- [ ] **1.7** Generate key pairs on first login
- [ ] **1.8** Store private key in secure device storage
- [ ] **1.9** Upload public key to users table
- [ ] **1.10** Handle key regeneration for new devices

### Onboarding Flow
- [ ] **1.11** Create permission primer screens
- [ ] **1.12** Implement progressive permission requests
- [ ] **1.13** Create main app screen with empty state
- [ ] **1.14** Add "Invite Your First Friend" call-to-action

### Enhanced Location Services
- [ ] **1.15** Improve location accuracy settings
- [ ] **1.16** Add location update frequency optimization
- [ ] **1.17** Implement basic error handling for denied permissions
- [ ] **1.18** Add location sharing pause/resume functionality

### Phase 1 Security Audit
- [ ] **1.19** Audit OAuth token storage and handling
- [ ] **1.20** Verify no authentication credentials in logs
- [ ] **1.21** Test key generation across different devices
- [ ] **1.22** Confirm secure key storage implementation

---

## Phase 2: Background Services Deep Dive (Weeks 5-6)
**Goal**: Implement and thoroughly test background location sharing

### Background Location Implementation
- [ ] **2.1** Research platform-specific background location requirements
- [ ] **2.2** Implement iOS background location service
- [ ] **2.3** Implement Android foreground service with persistent notification
- [ ] **2.4** Create battery-optimized background tracking modes
- [ ] **2.5** Implement significant location change detection

### Permission Management
- [ ] **2.6** Create "Always Allow" permission upgrade flow
- [ ] **2.7** Handle background permission denial gracefully
- [ ] **2.8** Implement permission status monitoring
- [ ] **2.9** Create informative error messages for permission issues

### Cross-Device Testing Infrastructure
- [ ] **2.10** Set up testing on multiple Android devices (Samsung, Pixel, OnePlus)
- [ ] **2.11** Set up testing on multiple iOS versions (15, 16, 17)
- [ ] **2.12** Create battery usage monitoring tools
- [ ] **2.13** Implement background service health monitoring

### Battery Optimization
- [ ] **2.14** Implement smart location batching
- [ ] **2.15** Add device sleep/wake detection
- [ ] **2.16** Create user-configurable update frequencies
- [ ] **2.17** Implement location change significance thresholds

### Reliability Testing
- [ ] **2.18** Test background service across device reboots
- [ ] **2.19** Test service persistence across app force-closes
- [ ] **2.20** Test location sharing during device sleep/wake cycles
- [ ] **2.21** Validate service behavior under low battery conditions
- [ ] **2.22** Test network interruption recovery

---

## Phase 3: Social Features (Weeks 7-8)
**Goal**: Build invitation system and friendship management

### Contact Integration
- [ ] **3.1** Implement contact picker integration
- [ ] **3.2** Create manual phone number entry fallback
- [ ] **3.3** Add contact permission handling
- [ ] **3.4** Implement contact search and filtering

### Invitation System
- [ ] **3.5** Generate unique invite tokens (UUID-based)
- [ ] **3.6** Create SMS invite message templates
- [ ] **3.7** Implement native SMS interface integration
- [ ] **3.8** Create local invite redirect page for development
- [ ] **3.9** Add task reminder to update domain when deployed

### Deep Linking
- [ ] **3.10** Implement deep link URL scheme
- [ ] **3.11** Create invite acceptance detection
- [ ] **3.12** Handle app installation via invite links
- [ ] **3.13** Implement post-onboarding invite context

### Friendship Management
- [ ] **3.14** Create friendship state management (pending/active)
- [ ] **3.15** Implement sharing preference selection (Precise vs General)
- [ ] **3.16** Build privacy rule application (coordinate fuzzing)
- [ ] **3.17** Create "Decide Later" functionality for pending invites

### UI for Social Features
- [ ] **3.18** Build friend list interface
- [ ] **3.19** Create pending invitation indicators
- [ ] **3.20** Implement invite acceptance modal dialogs
- [ ] **3.21** Add friendship status management screens
- [ ] **3.22** Create sharing preference configuration UI

---

## Phase 4: Polish & Final Security Review (Week 9)
**Goal**: UI improvements and comprehensive security validation

### Map Interface Enhancement
- [ ] **4.1** Improve map styling and user experience
- [ ] **4.2** Add smooth marker animations for location updates
- [ ] **4.3** Implement map clustering for multiple friends
- [ ] **4.4** Add location accuracy indicators
- [ ] **4.5** Create map controls and user interaction improvements

### UI Polish
- [ ] **4.6** Refine onboarding flow visual design
- [ ] **4.7** Improve friend list and status indicators
- [ ] **4.8** Polish invitation flow user experience
- [ ] **4.9** Add loading states and error handling UI
- [ ] **4.10** Implement accessibility features

### Testing & Quality Assurance
- [ ] **4.11** Write unit tests for cryptography functions
- [ ] **4.12** Create integration tests for location sharing flow
- [ ] **4.13** Test cross-platform compatibility thoroughly
- [ ] **4.14** Perform end-to-end user journey testing

### Final Security Review
- [ ] **4.15** Comprehensive audit of E2EE implementation
- [ ] **4.16** Review all data storage and transmission paths
- [ ] **4.17** Validate privacy policy compliance
- [ ] **4.18** Test security against common attack vectors
- [ ] **4.19** Final verification of zero-knowledge architecture

### Deployment Preparation
- [ ] **4.20** Prepare app store metadata and screenshots
- [ ] **4.21** Update invite domain configuration for production
- [ ] **4.22** Configure production Supabase environment
- [ ] **4.23** Create deployment documentation
- [ ] **4.24** Set up analytics and monitoring