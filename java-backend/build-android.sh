#!/usr/bin/env bash
set -e

echo "=========================================================="
echo "Frequency - Android .apk Build Pipeline (GluonFX / GraalVM)"
echo "=========================================================="

# Check for GraalVM with native-image support
if [ -z "$GRAALVM_HOME" ]; then
    echo "[WARNING] GRAALVM_HOME not set. Using default Java."
fi

# 1. Clean and compile Ahead-Of-Time (AOT) Substrate VM target
echo "[INFO] Running GluonFX compile..."
mvn gluonfx:compile

# 2. Link Android native shared libraries & NDK toolchain
echo "[INFO] Building Ahead-of-Time native binary..."
mvn gluonfx:build

# 3. Package Android Manifest, assets, and classes into signed .apk
echo "[INFO] Packaging Android APK..."
mvn gluonfx:package

echo "=========================================================="
echo "[SUCCESS] Android APK created at target/gluonfx/arm64-v8a/gvm/Frequency.apk"
echo "=========================================================="
