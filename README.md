# Elite Lucky Draw System

A modern, multi-stage lucky draw application built with Tauri v2 and IndexedDB. Perfect for corporate events, galas, and prize drawings with multi-monitor support.

## ✨ Features

* **Multi-Stage Drawing** – Multiple prize stages with configurable quotas.
* **Multi-Monitor Support** – Separate windows for Operator Control Panel and Projector Screen.
* **CSV Import** – Import attendee data with pre-assigned lucky codes.
* **Real-time Communication** – Seamless event-based communication between windows.
* **Local Database** – IndexedDB storage (no server required).
* **Beautiful UI** – Premium design with animations and video backgrounds.
* **Fullscreen Mode** – Toggle fullscreen with `SPACE` key, exit with `ESC`.

---

## 📋 Prerequisites

* **Node.js** (v18 or later)
* **Rust** (latest stable)
* **Platform-specific dependencies for Tauri:**
  * **Windows:** Microsoft Visual Studio C++ Build Tools
  * **macOS:** Xcode Command Line Tools
  * **Linux:** `webkit2gtk` and build essentials

---

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone [https://github.com/yourusername/elite-lucky-draw.git](https://github.com/yourusername/elite-lucky-draw.git)
cd elite-lucky-draw
2. Install DependenciesBashnpm install
3. Run in Development ModeBashnpm run tauri dev
4. Build for ProductionBashnpm run tauri build
The compiled application will be available in src-tauri/target/release/.📁 Project StructurePlaintextelite-lucky-draw/
├── src/
│   ├── assets/
│   │   ├── db-config.js        # Database configuration
│   │   ├── prizes.json         # Prize configuration
│   │   ├── jquery.min.js
│   │   └── tailwind.min.js
│   ├── index.html              # Main Dashboard
│   ├── register.html           # CSV Import Page
│   ├── lucky-draw.html         # Projector Screen
│   └── lucky-draw-action.html  # Control Panel
├── src-tauri/
│   ├── src/
│   │   └── lib.rs              # Tauri backend
│   ├── icons/                  # Application icons
│   └── tauri.conf.json         # Tauri configuration
├── package.json
└── Cargo.toml
🎮 Usage GuideStep 1: Import AttendeesLaunch the application.Click "Import Attendance".Upload your CSV file with the following required columns:ID – Unique identifier (required)Full Name – Attendee name (required)Lucky Number – 4-digit code (required)Company – Company name (optional)Email, Phone, Name – Optional fieldsCSV Format Example:Code snippetID,Full Name,Name,Email,Phone,Company,Lucky Number
01kt63jzg8915x1e9qf8rb5me6,Nanang Hidayatulloh,nanang,email@example.com,08123456789,PT ABC,8702
Step 2: Configure PrizesEdit src/assets/prizes.json to customize your prize stages:JSON{
  "stages": [
    {
      "id": 1,
      "stage_name": "Legacy Gala Dinner 2026",
      "prize_name": "Apple Watch Series 11",
      "prize_price": 1799,
      "quota": 250,
      "sequence": 1
    }
  ]
}
Step 3: Run the DrawFrom Dashboard, click "Control Panel" (opens in a new window).Click "Launch Projector Screen" (opens fullscreen display).Select a prize stage from the cards.Click "START DRAW" to begin rolling animation.Click "STOP & SELECT WINNER" to randomly select a winner.Winner is displayed on the projector screen and logged in the table.Step 4: Multi-Monitor SetupDashboard: Main navigation (Monitor 1)Control Panel: Operator controls (Monitor 2)Projector Screen: Stage display (Monitor 3 / Projector)Simply drag each window to the desired monitor.Projector Screen ControlsKeyActionSPACEToggle FullscreenESCExit Fullscreen🗄️ Database StructureThe application uses IndexedDB with the following object stores:StorePurposeattendancesAttendee data (ID, lucky_code, name, company, etc.)draw_stagesPrize stages (prize_name, quota, drawn_count, etc.)winnersWinner history (attendance_id, stage_id, drawn_at)🔧 ConfigurationDatabase VersionUpdate assets/db-config.js to increment the database version when schema changes:JavaScriptconst DB_VERSION = 10; // Increment when schema changes
Application Name & IdentifierEdit src-tauri/tauri.conf.json:JSON{
  "productName": "elite-lucky-draw",
  "identifier": "com.elite.luckydraw"
}
Application IconsReplace icons in src-tauri/icons/ with your own:icon.ico – Windowsicon.icns – macOS32x32.png, 128x128.png, 256x256.png, 512x512.png – Cross-platform📦 Building for DistributionWindowsBashnpm run tauri build -- --target x86_64-pc-windows-msvc
Output: src-tauri/target/release/elite-lucky-draw_0.1.0_x64_en-US.msimacOSBash# For Intel Macs
npm run tauri build -- --target x86_64-apple-darwin

# For Apple Silicon (M1/M2/M3/M4)
npm run tauri build -- --target aarch64-apple-darwin
Output: src-tauri/target/release/bundle/macos/elite-lucky-draw.appLinuxBashnpm run tauri build -- --target x86_64-unknown-linux-gnu
Output: .deb and .AppImage files in src-tauri/target/release/bundle/🐛 TroubleshootingDatabase Version ErrorSymptoms: "Storage Error: Corrupted Schema"Fix: Open DevTools (Ctrl+Shift+I) ➔ Go to Application ➔ IndexedDB ➔ Delete EliteLuckyDrawDB ➔ Refresh the application.Popup BlockerSymptoms: Popup windows don't open.Fix: Allow popups for the application or click the launch button manually (not auto-open).CSV Import IssuesEnsure CSV is UTF-8 encoded.Use comma (,) as the delimiter.Verify column names match exactly: ID, Full Name, Lucky Number.🛠️ Development CommandsCommandDescriptionnpm run tauri devRun in development modenpm run tauri buildBuild production appnpm run tauri iconGenerate app iconscargo cleanClean Rust build artifacts📄 LicenseMIT License - See LICENSE file for details.🤝 ContributingContributions are welcome! Please submit a Pull Request.📧 SupportFor issues or questions, please open an issue on GitHub.