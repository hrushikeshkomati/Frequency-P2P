# Frequency: E2EE Cross-Platform P2P Messaging & File-Sharing System

A modular Java 21 / JavaFX architecture targeting Windows Desktop (.exe) and Android (.apk) devices with zero internet dependency.

## Key Capabilities
- **Noise Protocol Framework**: `Noise_XX_25519_ChaChaPoly_BLAKE2s` mutual zero-knowledge authentication.
- **Adaptive Transport Multiplexer**: Simultaneously bonds Bluetooth Low Energy (BLE 5.2) and high-speed LAN sockets.
- **High-Speed Multithreading**: Parallel NIO socket workers with Java 21 Virtual Threads.
- **Native Packaging**: Produces self-contained Windows `.exe` and Android `.apk` binaries.

## Binary Artifact Output Paths
* **Windows Installer (.exe)**: `target\installer\Frequency-1.0.0.exe`
* **Android Package (.apk)**: `target/gluonfx/arm64-v8a/gvm/Frequency.apk`

## Building Windows .exe
Requirements: JDK 21+ with `jlink` and `jpackage` (included in standard JDK), Maven 3.9+, WiX Toolset v3.11+.

In Windows PowerShell:
```powershell
.\package-windows.bat
```

In Command Prompt (cmd):
```cmd
package-windows.bat
```

Output: `target\installer\Frequency-1.0.0.exe`

## Building Android .apk
Requirements: GraalVM JDK 21 with native-image, Android SDK & NDK (r25c+), Maven 3.9+.
```bash
chmod +x build-android.sh
./build-android.sh
```
Output: `target/gluonfx/arm64-v8a/gvm/Frequency.apk`

Install on device:
```bash
adb install target/gluonfx/arm64-v8a/gvm/Frequency.apk
```
