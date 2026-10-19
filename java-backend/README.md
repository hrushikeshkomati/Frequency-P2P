# Frequency: E2EE Cross-Platform P2P Messaging & File-Sharing System

A modular Java 21 / JavaFX architecture targeting Windows Desktop (.exe) and Android (.apk) devices with zero internet dependency.

## Binary Artifact Output Paths
* **Windows Installer (.exe)**: `target\installer\Frequency-1.0.0.exe`
* **Android Package (.apk)**: `target/gluonfx/arm64-v8a/gvm/Frequency.apk`

## Building Windows .exe
Requirements: JDK 21+ with `jlink` and `jpackage` (included in standard JDK), Maven 3.9+.
```cmd
package-windows.bat
```
Output: `target\installer\Frequency-1.0.0.exe`

## Building Android .apk
Requirements: GraalVM JDK 21 with native-image and Android NDK installed.
```bash
chmod +x build-android.sh
./build-android.sh
```
Output: `target/gluonfx/arm64-v8a/gvm/Frequency.apk`
