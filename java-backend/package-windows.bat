@echo off
echo ==========================================================
echo Frequency - Standalone Windows .exe Package Pipeline
echo ==========================================================

REM 1. Clean and compile modular JAR
call mvn clean package
if %errorlevel% neq 0 (
    echo [ERROR] Maven build failed!
    exit /b %errorlevel%
)

REM 2. Create minimal modular runtime image via jlink
echo [INFO] Generating custom lightweight JRE runtime with jlink...
rmdir /s /q target\custom-runtime 2>nul
call jlink ^
    --module-path "%JAVA_HOME%\jmods;target\frequency-p2p-1.0.0.jar;target\libs" ^
    --add-modules com.frequency,javafx.controls,javafx.fxml,org.bouncycastle.provider ^
    --strip-debug ^
    --no-man-pages ^
    --no-header-files ^
    --compress=2 ^
    --output target\custom-runtime

REM 3. Package into native Windows installer .exe via jpackage
echo [INFO] Packaging native Frequency.exe installer via jpackage...
rmdir /s /q target\installer 2>nul
call jpackage ^
    --name "Frequency" ^
    --app-version "1.0.0" ^
    --vendor "Frequency P2P" ^
    --description "End-to-End Encrypted P2P Messaging & File-Sharing System" ^
    --runtime-image target\custom-runtime ^
    --module com.frequency/com.frequency.Main ^
    --type exe ^
    --win-dir-chooser ^
    --win-menu ^
    --win-shortcut ^
    --dest target\installer

echo ==========================================================
echo [SUCCESS] Windows Installer created at target\installer\Frequency-1.0.0.exe
echo ==========================================================
pause
