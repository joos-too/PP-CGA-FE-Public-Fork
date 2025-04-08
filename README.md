# 

# [PP-CGA - Frontend](https://github.com/phillipc0/PP-CGA-FE) <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Typescript_logo_2020.svg/512px-Typescript_logo_2020.svg.png" alt="Typesript Logo" width="23">

In dieser Readme wird erklärt, wie das Frontend Repository auf dem APS oder Privatrechner / VM aufgesetzt werden kann.
Der Ablauf besteht aus folgenden Komponenten

- [ ] [Setup PC & VM](#setup-pc--vm) folgen
- [ ] [Repository](#repository-setup) und Dependencies einrichten
- [ ] [Run Configurations](#ide-run-configurations-setup) in der IDE einrichten
- [ ] [Android Handy](#android-handy-setup) anschließen und einrichten
- [ ] Bei Bedarf [Android Emulator](#android-emulator-setup) einrichten

Bei Problemen während der Einrichtung oder Entwicklung unter [Troubleshooting](#troubleshooting) nachgucken
***

# Setup PC & VM

## Dependencies installieren
1. [Node.js (LTS)](https://nodejs.org/zh-cn) herunterladen und installieren
2. [Java JDK 17 (x64 Installer)](https://www.oracle.com/de/java/technologies/downloads/#jdk17-windows) herunterladen und installieren

## Android Sdk Setup
1. [Android Studio](https://developer.android.com/studio?hl=de) herunterladen
2. Installieren und Installationsprozess durchlaufen
   1. Install Type `Standard`
   2. **Alle** Lizenzen akzeptieren

## Umgebungsvariablen Setzen
1. Im Windows Start `Umgebungsvariablen bearbeiten` suchen und öffnen

### Android Home
1. Über `Neu` eine neue Variable anlegen
   - Name der Variable: `ANDROID_HOME`
   - Wert der Variablen `C:\Users\%UserProfile%\AppData\Local\Android\Sdk`

### platform-tools
1. Bereits existierende Variable namens `Path` auswählen
2. Über `Bearbeiten` Unterliste öffnen
3. Über `Neu` eine neue Variable anlegen
- Wert: `C:\Users\%UserProfile%\AppData\Local\Android\Sdk\platform-tools`

### Java Home
1. Über `Neu` eine neue Variable anlegen
    - Name: `JAVA_HOME`
    - Wert: `C:\Program Files\Java\jdk-17`
***


## Repository Setup

### [Repository](https://github.com/phillipc0/PP-CGA-FE) klonen
1. Gewünschter JetBrains IDE öffnen (Webstorm für Frontend empfohlen)
2. `Get from VCS` auswählen und mit GitHub Account oder Token anmelden
3. Repository klonen
    ```
    https://github.com/phillipc0/PP-CGA-FE.git
    ```

### Pakete installieren

1. Pakete installieren (In IDE Terminal)
   ```bash
    npm install
    ```
   > Bei problemen gegeneinfalls zuvor `npm audit fix`


### Projekt einrichten
1. Android Package initialisieren
   ```bash
    npx expo run:android
    ```
   
2. Dieser Befehl ist initial und von nun an kann das Projekt über die [Run Configurations](#ide-run-configurations-setup) gestartet werden
***


# IDE Run Configurations Setup
Die Run Configurations sollten automatisch mit Klonen des Repositorys eingerichtet werden, falls nicht dieser Anleitung folgen 

1. Oben rechts auf `Current File` klicken
2. `Edit Configurations` -> `Add New` -> `npm`

## Development Build
- Command: `run`
- Script: `android`
> Startet die App auf dem angeschlossenen Handy oder Emulator, falls eingerichtet


## Expo Go
- Command: `run`
- Script: `expo-go`
> Erstellt einen QR-Code, um in der Expo Go App zu scannen
***


# Android Handy Setup

## USB Debugging aktivieren
1. In Geräteeinstellungen nach `USB Debugging` suchen und aktivieren
2. Falls Option nicht vorhanden, folgende Schritte durchführen
   1. Nach `Telefoninfo` -> `Softwareinformationen` navigieren
   2. 7 Mal auf die Buildnummer klicken
   3. Nun sollten die Entwickleroptionen in den Geräteeinstellungen verfügbar sein
   4. Nach `Entwickleroptionen` -> `Debugging` navigieren und `USB Debugging` suchen und aktivieren

## Gerät verbinden
1. Gerät mit dem PC über ein Kabel verbinden
2. Sämtliche Zugriffe des PCs erlauben

> Im Startverlauf der App kann es sein, dass auf dem Handy erneut der Zugriff erlaubt werden muss
***


# Android Emulator Setup

## Emulator installieren
1. Android Studio öffnen
2. In der Repository Auswahl `More Actions` -> `Virtual Device Manager` öffnen
3. Handy auswählen, z.B. "Pixel 8" -> `next`
4. `UpsideDownCake`|`34` auswählen
5. `next` ->  `finish`

## Emulator Starten
1. [Development-Build](#development-build) configuration starten
2. Sollte der Emulator nicht automatisch gestartet werden, folgende Schritte durchführen
   1. Android Studio öffnen
   2. In der Repository Auswahl `More Actions` -> `Virtual Device Manager` öffnen
   3. Emulator starten
   4. Erneut [Development-Build](#development-build-configuration) configuration starten
***


# EAS Build CLI Setup
Diese Anleitung ist nicht für die Entwicklung notwendig, sondern zur Einrichtung der **Expo Application Services (EAS)**.
Diese wird dazu verwendet um eine APK oder ein App-Bundle für den Play/App-Store zu bauen
> **Wichtig** auf dem APS müssen folgende Dinge beachtet werden
1. Vor jeden `eas` command muss ein `npx` gesetzt werden (z.B. `npx eas signIn`)

## EAS CLI einrichten
1. EAS CLI installieren (In IDE Terminal)
   ```bash
    npm install --global eas-cli
    ```
2. [EAS Account](https://expo.dev/signup) erstellen
3. In IDE einloggen
   ```bash
   eas signIn   
   ```

## Build Configuration erstellen
1. Oben rechts auf `Current File` klicken
2. `Edit Configurations` -> `Add New` -> `Shell Skript`

### Build APK
- Execute: auswählen
- Skript Text: `npx eas build -p android --profile preview`

### Build APK (für APS)
- Execute: auswählen
- Skript Text: `npx eas build -p android --profile preview`
***


# Troubleshooting

## Probleme

### App Änderungen werden nicht übernommen oder allgemeine Gradle Probleme
Falls gewissen Änderungen beim Starten/Bauen nicht übernommen werden (z.B. Icons)
1. `npx expo prebuild` ausführen


## Error Meldungen

### Error: `Outdated Expo Dependencies` || `Error resolving plugin [id: 'com.facebook.react.settings']`
1. Dependencies updaten, um zur zugehörigen SDK zu passen
   ```
    npx expo install --fix
   ```

### Error: `java.io.UncheckedIOException: Could not move temporary workspace`
1. In Repository nach `android\gradle\wrapper\gradle-wrapper.properties` navigieren
2. `distributionUrl` auf `gradle-8.6` setzen

### Error: `request to https://api.expo.dev/graphql failed`
1. Lesen lernen [EAS Build CLI Setup](#eas-build-cli-setup)

### Error: `Error resolving plugin [id: 'com.facebook.react.settings']`
1. Packages überprüfen
   ```
    npm audit fix
   ```
   
### Error: `Expo Failure [INSTALL_FAILED_UPDATE_INCOMPATIBLE: Existing package de.xtc.fitnessapp signatures do not match newer version; ignoring!]`
1. Existierende App deinstallieren (Name kann lokal anders sein)
   ```
   adb uninstall "de.pp.cga"
   ```

### Error: `CommandError: Required property 'android.package' is not found in the project app.json. This is required to open the app.`
1. Lesen lernen [Projekt einrichten](#projekt-einrichten)
