# EZShare — Premium Web-Based P2P File Sharing App

Build a **Nearby Share / AirDrop style** web-based file sharing application with a stunning **Glassmorphism UI theme**, WebRTC P2P transfers, and QR code pairing.

## Scope — Phase 1 (What We Build Now)

We'll build Phases 1-5 from the roadmap in one shot — enough for a **fully functional, beautiful MVP**:

1. ✅ Premium Landing Page (Glassmorphism + animations)
2. ✅ QR Code generation & scanning for pairing
3. ✅ WebRTC P2P connection
4. ✅ Single & multiple file transfer with drag & drop
5. ✅ Progress bar, speed, ETA display
6. ✅ Dark mode (default) with glassmorphism theme
7. ✅ Responsive (mobile + desktop)
8. ✅ PWA ready (manifest + service worker)

---

## User Review Required

> [!IMPORTANT]
> **Tech Stack Choice**: The requirements mention Next.js + Tailwind + shadcn/ui. However, since you said **"Morphism UI theme rakhna"** (glassmorphism), I'll use **vanilla CSS with custom glassmorphism** instead of Tailwind/shadcn for maximum visual control. Next.js will still be the framework.

> [!IMPORTANT]
> **Signaling Server**: WebRTC needs a signaling server (Socket.IO). For local dev, I'll include a built-in signaling server. For production, you'll need to deploy it to Railway/Render separately.

> [!WARNING]
> **WebRTC Limitations**: P2P only works on same network or with STUN/TURN servers. I'll include Google's free STUN servers and a public TURN fallback for cross-network transfers.

---

## Open Questions

> [!IMPORTANT]
> **App Name**: Should it be "EZShare" or do you want a different name?

> [!NOTE]
> **Domain**: You mentioned `ezshare.vercel.app` as an example domain. Is that what you'll deploy to?

---

## Architecture

```
┌──────────────────────────────────────────────────┐
│                   Frontend (Next.js)              │
│                                                   │
│  Landing → Connect (QR) → Transfer → History      │
│                                                   │
│  Glassmorphism UI + Framer Motion Animations      │
└──────────────┬───────────────────────┬────────────┘
               │                       │
      Socket.IO Signaling        WebRTC Data Channel
      (connect devices)          (transfer files P2P)
               │                       │
┌──────────────▼──────────────┐        │
│    Signaling Server          │        │
│    (Node.js + Socket.IO)     │◄───────┘
│    Railway/Render deploy     │
└──────────────────────────────┘
```

---

## Proposed Changes

### 1. Project Setup

#### [NEW] `package.json`
Next.js 15 project with dependencies:
- `next`, `react`, `react-dom` — core framework
- `socket.io-client` — signaling
- `qrcode.react` — QR generation
- `html5-qrcode` — QR scanning
- `framer-motion` — animations
- `lucide-react` — icons

#### [NEW] `next.config.js`
Next.js configuration with PWA headers.

#### [NEW] `tsconfig.json`
TypeScript strict mode configuration.

---

### 2. Glassmorphism Design System

#### [NEW] `src/styles/globals.css`
Complete design system with:
- **CSS custom properties** for glassmorphism (blur, transparency, borders)
- **Color palette**: Deep purple → cyan gradient backgrounds, frosted glass cards
- **Typography**: Inter + JetBrains Mono from Google Fonts
- **Animations**: Pulse glow, float, shimmer effects
- **Glass card components**: `.glass-card`, `.glass-button`, `.glass-input`
- **Dark mode** as default with subtle neon accents

---

### 3. Core Components

#### [NEW] `src/components/layout/Header.tsx`
Glassmorphism navbar with logo, nav links, theme toggle.

#### [NEW] `src/components/layout/Footer.tsx`
Minimal footer with glass effect.

#### [NEW] `src/components/ui/GlassCard.tsx`
Reusable frosted glass card with hover animations.

#### [NEW] `src/components/ui/GlassButton.tsx`
Animated glass-style buttons with glow effects on hover.

#### [NEW] `src/components/ui/ProgressBar.tsx`
Animated neon progress bar showing transfer speed, ETA, percentage.

#### [NEW] `src/components/ui/DeviceCard.tsx`
Shows connected device info with animated connection status.

#### [NEW] `src/components/ui/QRGenerator.tsx`
QR code generation with glass frame and session ID display.

#### [NEW] `src/components/ui/QRScanner.tsx`
Camera-based QR scanner with glass overlay and scan animation.

#### [NEW] `src/components/ui/FileDropZone.tsx`
Drag & drop zone with animated border, file type icons, glass background.

#### [NEW] `src/components/ui/TransferCard.tsx`
Individual file transfer progress card with speed, ETA, cancel button.

#### [NEW] `src/components/ui/ParticleBackground.tsx`
Animated floating particles/orbs for the background effect.

---

### 4. Pages

#### [NEW] `src/app/layout.tsx`
Root layout with fonts, metadata, glassmorphism background.

#### [NEW] `src/app/page.tsx` — Landing Page
Hero section with:
- Animated gradient background with floating orbs
- Glass hero card with tagline: "Fast • Secure • P2P"
- "Send Files" and "Receive Files" CTAs
- Feature cards with icons
- How It Works section (3 steps)

#### [NEW] `src/app/send/page.tsx` — Send Page
- Generate QR code for session
- Show session code
- Wait for connection
- File drop zone appears after connection
- Transfer progress UI

#### [NEW] `src/app/receive/page.tsx` — Receive Page
- QR scanner camera view
- Manual code entry input
- Connection status
- Incoming file preview
- Auto-download with progress

---

### 5. WebRTC & Signaling Logic

#### [NEW] `src/lib/signaling.ts`
Socket.IO client for:
- Creating/joining rooms
- Exchanging WebRTC offers/answers
- ICE candidate exchange

#### [NEW] `src/lib/webrtc.ts`
WebRTC manager class:
- Create peer connection
- Handle data channel
- File chunking (64KB chunks)
- Resume/cancel support
- Speed calculation
- Progress tracking

#### [NEW] `src/lib/fileTransfer.ts`
File transfer utilities:
- File → ArrayBuffer chunking
- Chunk → File reassembly
- Transfer metadata protocol
- Multiple file queue

#### [NEW] `src/hooks/useWebRTC.ts`
React hook wrapping WebRTC logic with state management.

#### [NEW] `src/hooks/useFileTransfer.ts`
React hook for file transfer state (progress, speed, ETA).

---

### 6. Signaling Server

#### [NEW] `server/index.ts`
Standalone Socket.IO signaling server:
- Room creation with unique session IDs
- WebRTC signaling relay
- Device info exchange
- Auto-cleanup on disconnect

---

### 7. PWA

#### [NEW] `public/manifest.json`
PWA manifest with app name, icons, theme colors.

#### [NEW] `public/sw.js`
Basic service worker for offline support.

---

## Verification Plan

### Manual Verification
1. Run `npm run dev` — landing page loads with glassmorphism UI
2. Open in 2 browser tabs — generate QR in one, enter code in other
3. Connection establishes via WebRTC
4. Drag & drop file — transfer completes with progress bar
5. Test on mobile viewport — responsive layout works
6. Check PWA installability in Chrome DevTools

### Visual Check
- Glassmorphism effects render correctly (backdrop-filter blur)
- Animations are smooth (60fps)
- Dark mode looks premium
- Mobile layout is usable
