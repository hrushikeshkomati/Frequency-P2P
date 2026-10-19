# Frequency: E2EE Cross-Platform P2P Messaging & File-Sharing System

**Frequency** is a high-performance, privacy-first peer-to-peer (P2P) messaging and multithreaded file-sharing platform designed for air-gapped, zero-trust, and offline communication between Windows workstations and Android mobile devices.

The system features end-to-end encryption via the **Noise Protocol Framework** (`Noise_XX_25519_ChaChaPoly_BLAKE2s`), simultaneous **adaptive bandwidth multiplexing** across Bluetooth Low Energy (BLE 5.2) and local LAN/Wi-Fi, and dual-native output pipelines producing standalone Windows **`.exe`** installers and Android **`.apk`** packages.

---

## Table of Contents
1. [Core Features](#core-features)
2. [Cryptographic Architecture](#cryptographic-architecture)
3. [Dual-Transport Multiplexing Engine](#dual-transport-multiplexing-engine)
4. [Languages & Technologies](#languages--technologies)
5. [Project Structure](#project-structure)
6. [How to Generate the Binaries](#how-to-generate-the-binaries)
   - [Windows Desktop Installer (.exe)](#1-windows-desktop-installer-exe)
   - [Android Mobile Package (.apk)](#2-android-mobile-package-apk)
7. [Running the Web Simulator & Diagnostic Console](#running-the-web-simulator--diagnostic-console)
8. [Troubleshooting & FAQs](#troubleshooting--faqs)

---

## Core Features

- **Zero-Cloud Dependency**: Direct peer-to-peer mesh over Bluetooth Low Energy (BLE) and local Wi-Fi/LAN. Requires no internet connection, external servers, or central relay infrastructure.
- **Mutual Zero-Knowledge Authentication**: Employs the `Noise_XX` handshake pattern with mutual identity hiding, forward secrecy, and visual Short Authentication String (SAS) verification.
- **Simultaneous Bandwidth Multiplexing**: Dynamically balances traffic across BLE and LAN. Control signals and short chat messages route over BLE for low-power proximity, while large file transfers bond across parallel LAN worker sockets (85–90%) and BLE auxiliary channels (10–15%).
- **Seamless Failover**: Instant, transparent failover between transports. If Wi-Fi degrades or disconnects, 100% of the active chunk stream automatically shifts to BLE without dropping the encrypted session.
- **Multithreaded Parallel Chunking**: Files are partitioned into cryptographically authenticated chunks and transmitted across configurable worker thread pools (1 to 8 threads) with sliding-window acknowledgment and BLAKE2s verification.
- **Native Cross-Platform Deliverables**: Complete, modular Java 21 / JavaFX codebase with automated packaging scripts for Windows `.exe` (`jpackage`) and Android `.apk` (GluonFX / GraalVM).

---

## Cryptographic Architecture

Frequency implements the **`Noise_XX_25519_ChaChaPoly_BLAKE2s`** pattern from the Noise Protocol Framework:

```
    Initiator (Windows)                          Responder (Android)
           |                                              |
           | ---------> Msg 1: -> e --------------------> | (Ephemeral PubKey)
           |                                              |
           | <--------- Msg 2: <- e, ee, s, es ---------- | (Ephemeral + DH Agreement)
           |                                              |
           | ---------> Msg 3: -> s, se ----------------> | (Static Identity + Verified)
           |                                              |
     [ESTABLISHED]                                  [ESTABLISHED]
  256-bit Ratchet Keys                           256-bit Ratchet Keys
  Strict Counter Nonce                           Strict Counter Nonce
```

### Key Primitives
* **Key Exchange (DH)**: Curve25519 / X25519 (RFC 7748) Montgomery ladder scalar multiplication.
* **Symmetric Cipher**: ChaCha20-Poly1305 (RFC 8439) Authenticated Encryption with Associated Data (AEAD).
* **Integrity Tag**: 128-bit Poly1305 MAC tag verified on every frame before decryption.
* **Key Derivation (HKDF)**: SHA-256 / BLAKE2s key derivation function producing independent 32-byte chaining keys (`ck`) and 32-byte cipher keys (`k`).
* **Visual Verification (SAS)**: 6-digit Short Authentication String and 3-word mnemonic to prevent Man-in-the-Middle (MitM) attacks out-of-band.

---

## Dual-Transport Multiplexing Engine

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Frequency Routing Plane                         │
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

| Transport Channel | Maximum MTU | Best For | Adaptive Routing Strategy |
| :--- | :--- | :--- | :--- |
| **Bluetooth Low Energy (BLE 5.2)** | 512 Bytes | Peer discovery, signaling, short chat messages | Always active; default route for small packets (<1 KB) and failover sink. |
| **Local Wi-Fi / Ethernet LAN** | 65,536 Bytes (64 KB) | Bulk multithreaded file chunk streams | Bonded route; handles 85–90% of file data over parallel NIO sockets. |

---

## Languages & Technologies

### 1. Native Desktop & Mobile Stack
* **Java 21**: Core application backend, Java 9+ Modules (`module-info.java`), Java 21 **Virtual Threads** (`Executors.newVirtualThreadPerTaskExecutor()`), and NIO Socket Channels.
* **JavaFX 21 & FXML**: Cross-platform desktop and mobile UI layout with declarative FXML views.
* **JavaFX CSS**: Formal monochromatic dark theme with high-contrast emerald security markers.
* **Bouncy Castle (`bcprov-jdk18on`)**: RFC 7748 X25519 agreement and RFC 8439 ChaCha20-Poly1305.

### 2. Build & Packaging Automation
* **Windows Batch (`.bat`)**: `package-windows.bat` orchestrating Maven, `jlink` runtime trimming, and `jpackage` to emit native Windows `.exe`.
* **POSIX Bash (`.sh`)**: `build-android.sh` orchestrating GluonFX and GraalVM Substrate VM Ahead-of-Time (AOT) ARM64 native `.apk` compilation.
* **XML**: Maven `pom.xml` build definitions and `AndroidManifest.xml` hardware permissions.

### 3. Interactive Web Simulator & Diagnostic Console
* **TypeScript (ES2022)**: Pure Curve25519 scalar arithmetic, ChaCha20-Poly1305 cipher implementation, adaptive multiplexer, and JSZip project exporter.
* **React 19**: Component state for dual-device simulator, live chunk matrix, protocol inspector, and codebase explorer.
* **Tailwind CSS (v4)**: Formal dark graphite design adhering to the Universal Frontend Design Constitution (anti-slop, no fake pills, tabular numbers).

---

## Project Structure

```text
├── java-backend/                          # Production Java/JavaFX source tree
│   ├── module-info.java                   # Java 9+ module descriptor
│   ├── pom.xml                            # Maven project build configuration
│   ├── package-windows.bat                # Windows .exe packaging script
│   ├── build-android.sh                   # Android .apk GluonFX build script
│   ├── AndroidManifest.xml                # Android BLE & Wi-Fi system permissions
│   ├── README.md                          # Backend architecture documentation
│   └── src/
│       └── main/
│           ├── java/com/frequency/
│           │   ├── Main.java              # JavaFX application entrypoint
│           │   ├── crypto/
│           │   │   └── NoiseEngine.java   # Noise_XX Bouncy Castle crypto engine
│           │   ├── network/
│           │   │   ├── AdaptiveMultiplexer.java # Virtual thread dual-transport router
│           │   │   └── ChunkTransferManager.java# Multithreaded chunk partitioner
│           │   └── ui/
│           │       └── FrequencyController.java # JavaFX modular UI controller
│           └── resources/com/frequency/ui/
│               ├── main.fxml              # Declarative UI markup
│               └── style.css              # Formal dark theme stylesheet
│
├── src/                                   # Interactive Web Simulator & Console
│   ├── crypto/
│   │   ├── noiseProtocol.ts               # Pure TypeScript Noise & ChaChaPoly engine
│   │   └── types.ts                       # Packet and session data structures
│   ├── engine/
│   │   ├── adaptiveEngine.ts              # Real-time state machine & transfer pipeline
│   │   └── transferTypes.ts               # Worker thread and chunk matrix types
│   ├── components/
│   │   ├── TopBar.tsx                     # 3-zone header and zip export button
│   │   ├── DualDeviceView.tsx             # Side-by-side Windows & Android simulator
│   │   ├── TransferMatrixView.tsx         # Live chunk matrix & thread pool telemetry
│   │   ├── ProtocolInspectorView.tsx      # Real-time cryptographic packet inspector
│   │   └── CodebaseExporterModal.tsx      # In-browser source code & binary guide
│   ├── export/
│   │   └── javaCodebase.ts                # Java source templates & JSZip bundler
│   ├── App.tsx                            # Root application component
│   ├── main.tsx                           # React entrypoint
│   └── index.css                          # Tailwind CSS v4 design tokens
├── index.html                             # Web entrypoint with typography fonts
├── metadata.json                          # AI Studio application metadata
└── package.json                           # Web dependencies
```

---

## How to Generate the Binaries

### 1. Windows Desktop Installer (`.exe`)

#### Prerequisites
1. **Windows 10/11 x64**.
2. **Java 21 JDK**: [Eclipse Temurin 21](https://adoptium.net/) or Oracle JDK 21. Set `JAVA_HOME`.
3. **Apache Maven 3.9+**: Added to `PATH`.
4. **WiX Toolset (v3.11)**: Required by `jpackage` for building `.exe` installers ([Download WiX](https://github.com/wixtoolset/wix3/releases)).

#### Build Steps
Open **PowerShell** or **Command Prompt** in the project directory:

```powershell
# In PowerShell (use .\):
.\package-windows.bat

# In Command Prompt (CMD):
package-windows.bat
```

#### What It Produces
```text
target\installer\Frequency-1.0.0.exe
```
This is a self-contained installer that embeds its own private, stripped Java runtime via `jlink`. End-users do not need to install Java to run it.

---

### 2. Android Mobile Package (`.apk`)

#### Prerequisites
1. **Linux, macOS, or Windows WSL2**.
2. **GraalVM JDK 21**: With native-image support (`gu install native-image`).
3. **Android SDK & NDK (r25c+)**: Set `ANDROID_SDK_ROOT` and `ANDROID_NDK_HOME`.
4. **Apache Maven 3.9+**.

#### Build Steps
Open a terminal in the project directory:

```bash
chmod +x build-android.sh
./build-android.sh
```

*(Or run directly via Maven: `mvn gluonfx:build gluonfx:package -Dgluonfx.target=android`)*

#### What It Produces
```text
target/gluonfx/arm64-v8a/gvm/Frequency.apk
```

#### Install on Android Device
```bash
adb install target/gluonfx/arm64-v8a/gvm/Frequency.apk
```

---

## Running the Web Simulator & Diagnostic Console

The browser application provides an interactive engineering workstation to test the protocol before compiling native binaries:

1. **Device Mesh Tab**:
   - View the **Windows 11 Workstation** on the left and the **Android 14 Handset** on the right.
   - Click **"Initiate Noise_XX Handshake"** to execute the 3-step DH exchange and verify the 6-digit SAS code.
   - Send live encrypted chat messages between devices with delivery status and MAC tags.
   - Toggle **BLE 5.2** or **LAN / Wi-Fi** on and off to observe real-time transport failover.
   - Toggle **Packet Loss Simulation** to observe automatic chunk retransmissions.

2. **Multithreaded Transfer Tab**:
   - Drag and drop any real file from your computer or select a pre-seeded payload (Audit PDF, Kernel Image, Raw Telemetry).
   - Adjust concurrency using the worker thread slider (1T to 8T).
   - Watch the interactive chunk grid update in real-time across threads and verify the final bit-perfect SHA-256 digest match.

3. **Noise Inspector Tab**:
   - Inspect captured frames with hex dumps of ciphertexts, 128-bit Poly1305 MAC tags, nonces, and decrypted payload previews.
   - Export captured packet traces as JSON.

4. **JavaFX Codebase Tab**:
   - Browse all modular Java source files, build scripts, FXML layouts, and manifests directly in the browser.
   - Click **"Export JavaFX (.zip)"** to download the complete ready-to-build project archive.

---

## Troubleshooting & FAQs

#### Q: PowerShell gives `'package-windows.bat' is not recognized`
**A:** In PowerShell, executable files in the current folder must be prefixed with `.\`. Run:
```powershell
.\package-windows.bat
```
Also verify you have navigated into the folder containing the file (`cd frequency-javafx-engine`).

#### Q: How does adaptive multiplexing handle dropped packets?
**A:** Each chunk is assigned a unique index, offset, and 128-bit Poly1305 MAC tag. If an ACK is not received within the sliding-window timeout (or if simulated jitter corrupts a chunk), the chunk status changes to `retried` and the worker pool re-dispatches it without aborting the overall transfer session.

#### Q: Can I build without internet access?
**A:** Once Maven dependencies (`openjfx`, `bouncycastle`) are cached in your local `.m2` repository, both `package-windows.bat` and `build-android.sh` operate completely offline.
