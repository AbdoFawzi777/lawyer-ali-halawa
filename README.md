# ⚖️ LegalFlow Enterprise — Automated Legal Intake & Case Triage Platform

[![Production Status](https://img.shields.io/badge/Production-Live%20on%20Firebase-0284c7?style=for-the-badge&logo=firebase&logoColor=white)](https://mostashar-ali-halawa.web.app)
[![Hosting](https://img.shields.io/badge/Hosting-Google%20Cloud%20Edge%20CDN-ea4335?style=for-the-badge&logo=googlecloud&logoColor=white)](https://mostashar-ali-halawa.web.app)
[![Architecture](https://img.shields.io/badge/Architecture-Zero--Cost%20Serverless-10b981?style=for-the-badge&logo=serverless&logoColor=white)]()
[![Security](https://img.shields.io/badge/Security-Salted%20SHA--256%20%7C%20Anti--XSS%20%7C%20Anti--CSRF-f59e0b?style=for-the-badge&logo=auth0&logoColor=white)]()
[![Responsive](https://img.shields.io/badge/Design-Mobile--First%20%26%20Touch%20Optimized-8b5cf6?style=for-the-badge&logo=tailwindcss&logoColor=white)]()

A high-performance, mobile-first, enterprise-grade web application engineered to solve high-volume client intake, unstructured communications, and case triage for law practices. 

Built on a **Zero-Operational-Cost (0$ OpEx) Serverless Stack**, this platform features an automated multi-step intake engine, asynchronous dual-action cloud pipelining, deep-link protocol automation, and a cybersecurity-hardened administrative operations console.

---

## 📌 Executive Architecture & Engineering Vision

Traditional legal practices suffer from severe workflow bottlenecks: disorganized phone inquiries, unstructured messaging, spam, unclassified dispute briefs, and high manual triage overhead.

**LegalFlow Enterprise** eliminates these operational frictions through a self-service, guided intake and validation pipeline that:
1. **Filters and classifies inquiries upfront** across jurisdictional taxonomies (Criminal, Family, Civil Contracts, Administrative/State Council, Corporate).
2. **Computes urgency heuristics** (Routine, Urgent 24h, Emergency Legal Custody 24/7) to prioritize counsel interventions.
3. **Executes a dual-action pipeline**: simultaneously commits structured payloads asynchronously to cloud CRM storage while dynamically constructing pre-formatted, URL-encoded deep-link protocol messages for immediate attorney follow-up.
4. **Protects case dossiers and client records** inside an encrypted administrative cockpit hardened against XSS, CSV formula injection, brute-force attacks, and session abandonment.

---

## 🏗️ System Architecture & Technology Stack

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           CLIENT BROWSER (RTL & MOBILE-FIRST)                   │
│  Tailwind CSS  │  Vanilla ES6+ Modules  │  Touch Engine  │  Web Crypto API       │
└────────┬────────────────────────────────┬──────────────────────┬────────────────┘
         │                                │                      │
         ▼ (1. Async REST POST)           ▼ (2. Deep-Link URI)   ▼ (3. Auth Verification)
┌───────────────────────┐      ┌─────────────────────────┐  ┌───────────────────────┐
│  Google Apps Script   │      │  WhatsApp Protocol URI  │  │  Web Crypto Engine    │
│  Serverless Web API   │      │  (Native Client Handover)│  │  Salted SHA-256 Hash  │
└────────┬──────────────┘      └─────────────────────────┘  └───────────┬───────────┘
         │                                                              │
         ▼ (Commit Record)                                              ▼ (Session Guard)
┌───────────────────────┐                                   ┌───────────────────────┐
│  Google Sheets API    │                                   │  Admin Dashboard      │
│  Cloud Relational CRM │                                   │  (Anti-XSS Safe DOM)  │
└───────────────────────┘                                   └───────────────────────┘
```

| Layer | Technology | Engineering Rationale |
| :--- | :--- | :--- |
| **Frontend Runtime** | Pure HTML5, Vanilla ES6+ | Zero runtime overhead, sub-50ms First Contentful Paint (FCP), zero framework baggage |
| **Design System** | Tailwind CSS (CDN Engine) | Utility-first responsive design, bespoke luxury gold/navy palette, mobile-first layout |
| **Edge Hosting** | Google Firebase Hosting | Global Google Cloud Edge CDN, HTTP/2 multiplexing, automatic SSL/TLS termination |
| **Serverless Compute** | Google Apps Script Web App | Zero-cost serverless REST microservice with CORS support and automated header scaffolding |
| **Cloud Database** | Google Sheets API (via GAS) | Free cloud relational spreadsheet database with automatic column binding & ISO 8601 timestamps |
| **Local Cache & CRM** | Browser LocalStorage API | Resilient offline-first fallback, zero-network dossier retrieval, instantaneous query response |
| **Cryptography** | Web Crypto API (`SubtleCrypto`) | Hardware-accelerated client-side SHA-256 cryptographic digest with proprietary salt string |

---

## ⚡ Key Engineering Modules & Workflows

### 1. Smart Multi-Step Intake Wizard
- **Stateful Validation Engine:** Validates required fields, Egyptian mobile phone regex (`^01[0125][0-9]{8}$`), and dispute summaries step-by-step prior to stage advancement.
- **Dynamic Heuristic Triage:** Classifies requests by judicial practice area and urgency level (Normal, 24h Urgent, Emergency Police/Prosecution Inquest).
- **Reactive Live Preview:** Real-time DOM renderer that mirrors user inputs into an authentic WhatsApp chat bubble simulation, showing the exact synthesized brief counsel will receive.

### 2. Dual-Action Submission Pipeline
When the user triggers **"إرسال وتواصل عبر الواتساب" (Submit & Connect)**:
1. **Background Cloud Commit (`fetch` async):** Sends an asynchronous JSON payload to the Google Apps Script REST endpoint, logging the lead, unique reference code (`HALAWA-XXXXXX`), and Egypt-timezone timestamp without blocking the UI.
2. **Foreground Protocol Handover:** Computes and launches a native deep-link URI (`https://wa.me/{counsel_phone}?text={encoded_summary}`) directly to the messaging client.
3. **Cross-Device Handover Modal:** For desktop visitors, dynamically renders a QR Code and one-click copy button enabling seamless continuation on physical mobile devices.

### 3. Touch-Optimized Media Carousel
- **Infinite Modulo Rotation:** Seamless transition between high-resolution attorney profile assets with 3.5s auto-play interval.
- **Passive Touch Vector Engine:** Utilizes `{ passive: true }` touch event listeners (`touchstart`, `touchend`) calculating `deltaX` and `deltaY` to distinguish between intentional horizontal swipes and vertical page scrolling.
- **Micro-Interactions:** Automatically pauses on mouse hover and touch contact (`mouseenter` / `touchstart`) to allow undisturbed asset examination.

---

## 🛡️ Cybersecurity Hardening & Threat Mitigation Matrix

The application implements defense-in-depth security principles across public intake forms and the administrative console:

```
                                CYBERSECURITY THREAT MATRIX
┌─────────────────────────┬──────────────────────────────────────────────────────────────┐
│ Attack Vector           │ Implemented Architectural Countermeasure                    │
├─────────────────────────┼──────────────────────────────────────────────────────────────┤
│ Credential Leakage      │ Salted SHA-256 cryptographic digest via Web Crypto API.      │
│                         │ Zero plaintext credentials stored in source code or DOM.     │
├─────────────────────────┼──────────────────────────────────────────────────────────────┤
│ Brute-Force Attacks     │ Strict client-side rate limiting: 5 failed attempts trigger   │
│                         │ an irreversible 15-minute lockout timer with storage lock.   │
├─────────────────────────┼──────────────────────────────────────────────────────────────┤
│ Session Abandonment     │ Automatic inactivity logout after 15 minutes of idle time    │
│                         │ with reactive user activity tracking (mouse, touch, keys).   │
├─────────────────────────┼──────────────────────────────────────────────────────────────┤
│ Stored XSS Attacks      │ Strict Safe DOM instantiation (`createElement`, `textContent`)│
│                         │ eliminating `innerHTML` usage for all dynamic lead records.  │
├─────────────────────────┼──────────────────────────────────────────────────────────────┤
│ CSV / Formula Injection │ Prepending single quote (`'`) on dangerous formula triggers   │
│                         │ (`=`, `+`, `-`, `@`) + UTF-8 BOM encoding for Excel Arabic. │
├─────────────────────────┼──────────────────────────────────────────────────────────────┤
│ Clickjacking & Framing  │ Hardened HTTP headers: `X-Frame-Options: DENY`,              │
│                         │ `X-Content-Type-Options: nosniff`, and custom CSP meta tags. │
└─────────────────────────┴──────────────────────────────────────────────────────────────┘
```

### Cryptographic Authentication Implementation
```javascript
// Hardware-accelerated client-side salted SHA-256 verification
async function computeSaltedHash(passkey, salt) {
  const enc = new TextEncoder();
  const data = enc.encode(passkey + salt);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
```

### Formula Injection Sanitization Engine
```javascript
// Sanitizes tabular data prior to spreadsheet export
function sanitizeCell(val) {
  if (val === null || val === undefined) return '""';
  let str = String(val).replace(/"/g, '""');
  // Neutralize formula triggers in spreadsheet applications
  if (/^[=+@\-\t\r]/.test(str)) {
    str = "'" + str;
  }
  return `"${str}"`;
}
```

---

## 📱 Mobile-First Ergonomics & Responsiveness

Engineered strictly to Apple Human Interface Guidelines (HIG) and Google Material Design standards:
- **iOS Safari Auto-Zoom Prevention:** All input fields enforce `font-size: 16px !important` to prevent disruptive automated viewport zooming on iOS touch focus.
- **Minimum Tap Targets:** All touch targets, buttons, and navigation anchors enforce a minimum dimension of `44x44px`.
- **Slide-in Responsive Drawer:** Seamless mobile navigation with backdrop blur filter, backdrop-click dismiss, body scroll lock, and Escape key listeners.
- **Horizontal Table Scrolling:** Data grids are wrapped in `-webkit-overflow-scrolling: touch` containers with a mobile-only gesture hint indicator.
- **Safe Area Insets:** Fixed action elements leverage `env(safe-area-inset-bottom)` to ensure zero collision with modern iPhone home indicator bars.

---

## 📂 Project Structure & Module Organization

```
E:\law\
│
├── index.html                           # Production Landing Page & Intake Wizard (RTL Layout)
├── admin.html                           # Hardened Administrative Operations Dashboard
├── firebase.json                        # Google Firebase Hosting & Security Headers Config
├── .firebaserc                          # Firebase Project Association
├── package.json                         # Project Metadata & Dev Script Configuration
├── README.md                            # Technical Engineering Architecture Specification
│
├── assets\                              # Optimized Visual Assets & Profile Photography
│   ├── lawyer-justice-ministry.png      # Courtroom Attire & Ministry of Justice Asset
│   ├── lawyer-court-entrance.png        # Courthouse Portico & Jurisdiction Asset
│   ├── lawyer-courtroom-gown.png        # Egyptian Bar Association Robe Asset
│   └── lawyer-portrait-suit.jpg         # Executive Portrait Asset
│
├── css\
│   └── style.css                        # Custom RTL Typography, Keyframe Animations & Safe Insets
│
├── js\
│   ├── app.js                           # Form Wizard, IntersectionObserver, WhatsApp Generator & Carousel
│   ├── crm.js                           # Offline Local CRM Query Engine & CSV Exporter
│   ├── admin-auth.js                    # Web Crypto API Salted Hashing & Inactivity Session Watchdog
│   └── admin-dashboard.js               # Safe DOM Table Renderer & Anti-CSV Injection Handler
│
├── google-apps-script\
│   ├── Code.gs                          # Serverless REST API Endpoint for Google Sheets CRM
│   └── SETUP_GUIDE_AR.md                # Serverless Endpoint Deployment Documentation
│
├── whatsapp-business-guide\
│   └── WHATSAPP_BUSINESS_STRATEGY_AR.md # Omnichannel Quick-Replies & Case Labeling Architecture
│
└── deployment-guide\
    └── DEPLOYMENT_GUIDE_AR.md           # Multi-Cloud Zero-Cost Deployment Reference
```

---

## 🌐 Live Production Deployments

| Environment | Provider | URL | Status |
| :--- | :--- | :--- | :---: |
| **Primary Production** | Google Firebase Hosting | [mostashar-ali-halawa.web.app](https://mostashar-ali-halawa.web.app) | 🟢 Active (HTTP/2) |
| **Secondary Redundancy** | Google Firebase (Alt) | [mostashar-ali-halawa.firebaseapp.com](https://mostashar-ali-halawa.firebaseapp.com) | 🟢 Active |
| **Source & Pages Mirror** | GitHub Pages CDN | [abdofawzi777.github.io/lawyer-ali-halawa](https://abdofawzi777.github.io/lawyer-ali-halawa/) | 🟢 Active |
| **Source Repository** | GitHub Enterprise/Public | [github.com/AbdoFawzi777/lawyer-ali-halawa](https://github.com/AbdoFawzi777/lawyer-ali-halawa) | 📂 Main Branch |

---

## 💻 Technical & Development Lead

```
Project Architecture, Full-Stack Implementation & Cybersecurity Hardening:
Eng. Abdallah Fawzy Ali
Lead Full-Stack Software Engineer & Cybersecurity Specialist
GitHub: @AbdoFawzi777
```

---

<p align="center">
  <sub>Engineered with precision for zero-cost operation, high conversion, and resilient cybersecurity.</sub>
</p>
