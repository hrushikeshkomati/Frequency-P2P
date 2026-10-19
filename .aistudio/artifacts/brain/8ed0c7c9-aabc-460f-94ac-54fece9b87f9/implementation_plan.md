# AeroMesh: E2EE Cross-Platform P2P Messaging & File-Sharing System

A high-performance, privacy-first peer-to-peer messaging and multithreaded chunked file-sharing platform featuring end-to-end encryption via the Noise Protocol Framework (`Noise_XX_25519_ChaChaPoly_BLAKE2s`), simultaneous adaptive bandwidth multiplexing across Bluetooth Low Energy (BLE) and local LAN/Wi-Fi, an interactive multi-device desktop and mobile runtime simulator, and a complete exportable Java 21 / JavaFX codebase with native build scripts for Windows `.exe` (`jpackage`) and Android `.apk` (GluonFX / GraalVM Substrate).

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The architectural foundation and security profile have been configured based on your confirmed preferences:

- **Confirmed Runtime & Experience**: Interactive multi-device simulator running side-by-side (Windows JavaFX Desktop Client and Android Mobile Client) paired with an in-browser Java/JavaFX source code inspector and complete downloadable project exporter.
- **Confirmed Cryptographic Protocol**: Noise Protocol Framework using the `Noise_XX` handshake pattern with Curve25519 key exchange, ChaCha20-Poly1305 AEAD symmetric cipher, and BLAKE2s hashing for forward secrecy and zero metadata leakage.
- **Confirmed Transport & Routing**: Adaptive bandwidth multiplexing engine that routes low-latency signaling, session handshakes, and short messages over BLE while dynamically bonding parallel multithreaded LAN socket workers for high-throughput file chunk transfers.

---

## 1. Overview & Core Concept

### What It Does
AeroMesh allows devices on Windows and Android to discover each other locally without internet access or centralized relays. Once paired via BLE beacons and mDNS/NSD (Network Service Discovery), devices establish mutual zero-knowledge trust using Noise Protocol handshakes. Files are split into verifiable cryptographic chunks and distributed concurrently across worker threads over both BLE and LAN channels according to real-time link quality and throughput.

### Target Persona
Security-conscious teams, field engineers, journalists, and cross-platform power users needing offline, air-gapped, or zero-trust file transmission and instant messaging between Windows workstations and Android mobile hardware.

### Key Value
- **Zero-Cloud Dependency**: Direct peer-to-peer mesh over BLE and local Wi-Fi/LAN.
- **Cryptographic Rigor**: Noise Protocol `Noise_XX` with ephemeral key rotation and authenticated ChaCha20-Poly1305 streams.
- **Maximized Throughput**: Multithreaded chunk pipeline utilizing multiple parallel sockets, sliding-window acknowledgment, and automatic transport bonding.
- **Production Java/JavaFX Artifacts**: Ready-to-build source tree with automated packaging scripts for Windows `.exe` installers and Android `.apk` bundles.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Local Discovery & Mutual Handshake**:
   - The user selects the active node (or views both Desktop & Mobile nodes side-by-side).
   - BLE beacon broadcasts an ephemeral peer advertisement; mDNS simultaneously announces LAN availability.
   - Peers click **"Pair & Connect"**, initiating the 3-message `Noise_XX` handshake (`-> e`, `<- e, ee, s, es`, `-> s, se`), displaying public key fingerprints and establishing verified cryptographic session keys.

2. **Secure Real-Time Messaging**:
   - Users exchange end-to-end encrypted messages with instant delivery status, verified MAC tags, and ratchet sequence counters.
   - Low-latency chat packets route opportunistically through BLE when in proximity, seamlessly transitioning or duplicating over LAN if payload size or connection quality changes.

3. **Multithreaded Encrypted File Transfer**:
   - The sender drops any file (document, archive, video, or folder) into the transfer interface.
   - The file is hashed, partitioned into encrypted chunks (e.g., 64KB for LAN, 512B for BLE), and dispatched across a pool of parallel worker threads.
   - The UI displays a live chunk matrix grid, per-thread throughput gauges, transfer telemetry (effective MB/s, ETA, retries), and real-time cryptographic verification progress.
   - On completion, the recipient automatically verifies the BLAKE2s integrity hash and saves the reconstructed file.

4. **Protocol & Network Telemetry Inspection**:
   - Users can toggle a technical protocol inspector displaying raw frame headers, Noise handshake state transitions, MTU allocation, and packet routing breakdown (BLE vs LAN split).

5. **Full Java / JavaFX Codebase & Build Exporter**:
   - An integrated code studio allows users to browse the complete Java modular structure (`module-info.java`, JavaFX views, Noise engine, multithreaded socket pools, BLE handlers).
   - A single click packages and downloads the complete project archive (`aeromesh-java-fx.zip`) including `pom.xml`, Windows packaging batch scripts (`package-exe.bat`), and Android Gluon build scripts (`build-apk.sh`).

### Visual Identity & Theme
- **Aesthetic Direction**: High-precision engineering console, utilitarian dark aesthetic inspired by modern network diagnostic tools and developer IDEs.
- **Color Palette**:
  - Neutral Canvas: Deep Obsidian (`#0B0F19`) and Charcoal Slate (`#111827`)
  - Structural Surfaces: Bordered panels (`#1F2937`) with subtle hairline dividers
  - Accent Color: Emerald / Cyan Signal (`#10B981` / `#06B6D4`) for encrypted verified channels and active worker threads
  - Secondary Accents: Indigo (`#6366F1`) for BLE signaling and Amber (`#F59E0B`) for transport failover/retransmission
- **Typography**:
  - Display / Headings: `Plus Jakarta Sans` (bold, clean geometric sans)
  - Body Copy: `DM Sans` (balanced, readable)
  - Data / Telemetry: `JetBrains Mono` with `tabular-nums` for packet sizes, thread IDs, hash fingerprints, and bandwidth rates
- **Layout Structure**:
  - **Top Navigation Bar**: Brand mark (`AeroMesh`), device topology switcher, view selector (Multi-Device Simulator, Protocol Inspector, Java Source & Exporter), and primary action button (`Download JavaFX Project`).
  - **Workspace Split**: Dual-node view (Windows Desktop Workstation on the left, Android Mobile Device on the right) with an interactive bridge showing active BLE/LAN packets flowing between them.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Cryptographic Engine Implementation
- **Chosen Approach**: Native WebCrypto and optimized TypeScript ChaCha20-Poly1305 + Curve25519 implementation for the web simulator, mirrored 1:1 with Java 21 standard crypto and BouncyCastle in the exported Java code.
- **Why**: Ensures zero simulated "fakes"—actual cryptographic key pairs, real handshakes, and actual ciphertext decryption run inside the browser and the exported Java app.
- **Alternatives Considered**: Mock status indicators; rejected because genuine encryption verification proves protocol correctness.

### Decision 2: Multithreading in Web Simulator vs. Native Java Backend
- **Chosen Approach**: Web Workers simulate parallel multithreaded chunk transmission in the browser with configurable thread concurrency (1–8 threads), while the exported Java project provides a high-performance `VirtualThread` / `ExecutorService` NIO channel pool.
- **Why**: Allows users to visually observe thread chunk contention, reordering, and reassembly in the web UI while obtaining production-ready multithreaded Java code.

### Decision 3: Adaptive BLE + LAN Bandwidth Multiplexing
- **Chosen Approach**: Dynamic split ratio based on payload type: small payloads (<1KB) and keepalive beacons prefer BLE; larger chunked files distribute 90% across LAN parallel TCP/UDP sockets and 10% over BLE auxiliary streams, with instant dynamic failover if one transport drops.
- **Why**: Combines BLE's zero-infrastructure, low-power discovery with LAN's gigabit multithreaded capacity.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        AeroMesh Control Plane                          │
└──────┬───────────────────────────────────────────────────┬─────────────┘
       │                                                   │
┌──────▼──────────────────────────┐         ┌──────────────▼─────────────┐
│    Peer A: Windows Workstation  │         │    Peer B: Android Device  │
│  ┌───────────────────────────┐  │         │  ┌──────────────────────┐  │
│  │ JavaFX Desktop UI Module  │  │         │  │ GluonFX Mobile View  │  │
│  └─────────────┬─────────────┘  │         │  └──────────┬───────────┘  │
│  ┌─────────────▼─────────────┐  │         │  ┌──────────▼───────────┐  │
│  │ Noise_XX Handshake Engine │  │         │  │ Noise_XX Handshake   │  │
│  │ (Curve25519 + ChaChaPoly) │  │         │  │ (Curve25519 + Poly)  │  │
│  └─────────────┬─────────────┘  │         │  └──────────┬───────────┘  │
│  ┌─────────────▼─────────────┐  │         │  ┌──────────▼───────────┐  │
│  │ Multithreaded Chunk Mgr   │  │         │  │ Chunk Reassembler    │  │
│  │ (BLAKE2s Hash Partition)  │  │         │  │ & Hash Verifier      │  │
│  └─────────────┬─────────────┘  │         │  └──────────┬───────────┘  │
│  ┌─────────────▼─────────────┐  │         │  ┌──────────▼───────────┐  │
│  │ Dynamic Adaptive Router   │  │         │  │ Dual Inbound Sinks   │  │
│  └───────┬───────────┬───────┘  │         │  └──────┬───────────┬───┘  │
└──────────┼───────────┼──────────┘         └─────────┼───────────┼──────┘
           │           │                              │           │
      BLE  │           │  LAN Socket Mesh             │ BLE       │ LAN
   (512B)  │           │  (Multithreaded 64KB)        │ (512B)    │ (64KB)
           ▼           ▼                              ▼           ▼
   ═════════════════════════════════════════════════════════════════════════
                       Air-Gapped P2P Transport Layer
   ═════════════════════════════════════════════════════════════════════════
```

### Core Modules & Responsibilities

1. **`src/crypto/`**:
   - `noiseProtocol.ts`: Implements state machine for `Noise_XX` handshake pattern, ephemeral keypair generation, symmetric key derivation (HKDF), and ChaCha20-Poly1305 encryption/decryption with nonce increments.
   - `fingerprint.ts`: Visual security fingerprints and SAS (Short Authentication Strings) for peer verification.

2. **`src/transfer/`**:
   - `chunkEngine.ts`: Slices arbitrary file blobs into numbered, hashed chunks.
   - `multiplexer.ts`: Dispatches chunks across simulated BLE and multithreaded LAN sockets with adaptive load balancing and simulated network latency/jitter.
   - `reassembler.ts`: Reconstructs files, verifies chunk SHA-256/BLAKE2s hashes, and triggers automatic retransmission of lost chunks.

3. **`src/components/`**:
   - `TopNavigation.tsx`: Brand wordmark, view switcher, device selection, and project exporter button.
   - `DualDeviceSimulator.tsx`: Interactive side-by-side Windows desktop and Android mobile frames with real-time peer interactions.
   - `MessagingView.tsx`: End-to-end encrypted chat stream with transport badge (BLE/LAN) and message delivery acknowledgments.
   - `FileTransferView.tsx`: Drag-and-drop file upload, active chunk stream grid, speed telemetry, and download actions.
   - `ProtocolInspector.tsx`: Live frame visualizer showing raw packet structure, header metadata, encryption payloads, and handshake transitions.
   - `CodebaseExporterModal.tsx`: Complete file tree viewer with syntax-highlighted Java 21 / JavaFX code and one-click ZIP exporter.

4. **`src/java-project/`**:
   - Comprehensive source templates for:
     - `src/main/java/com/aeromesh/Main.java`: Modular JavaFX application entrypoint.
     - `src/main/java/com/aeromesh/crypto/NoiseEngine.java`: Pure Java 21 Noise Protocol implementation.
     - `src/main/java/com/aeromesh/network/BleTransport.java`: Cross-platform BLE central/peripheral manager.
     - `src/main/java/com/aeromesh/network/LanMultiplexer.java`: Multithreaded NIO socket pool with virtual threads.
     - `src/main/java/com/aeromesh/ui/MainController.java`: JavaFX modular controller.
     - `pom.xml`: Maven configuration with JavaFX, BouncyCastle, and GluonFX plugins.
     - `package-windows.bat`: Script running `jlink` and `jpackage` to emit a standalone Windows `.exe` installer.
     - `build-android.sh`: Script using GluonFX CLI to compile ahead-of-time (AOT) GraalVM native binary and build the `.apk`.

---

## 5. Verification Plan

1. **Cryptographic Validation**: Test `Noise_XX` handshake and ensure ciphertext cannot be read without the shared ratchet session key.
2. **Dual-Transport Multiplexing**: Test file chunking across concurrent worker threads, verify BLE/LAN adaptive splitting, and simulate link failover without data corruption.
3. **End-to-End File Integrity**: Verify that transmitted files are reconstructed with 100% bit-for-bit checksum equality.
4. **Codebase Compilation & Verification**: Build the React application via `compile_applet`, verify TypeScript strict typing, and test that all user interactions are fully wired.
