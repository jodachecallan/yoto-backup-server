# 🎵🎶 **Yoto JSON Extractor** 🎶🎵

![Latest Release](https://img.shields.io/github/v/release/afsenovilla/YOTO-json-extractor) ![Code Size](https://img.shields.io/github/languages/code-size/afsenovilla/YOTO-json-extractor) ![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg) ![Python 3.8+](https://img.shields.io/badge/python-3.8%2B-blue.svg)

**Yoto JSON Extractor** is a local web app that downloads Yoto cards from their URLs. Each card is kept as a folder you can browse — cover, audio, and track list — and a zip copy is written to a separate backup folder.

> 🛠️ **v1.3.0 maintenance note:** the app and its design are entirely [@afsenovilla](https://github.com/afsenovilla)'s work. This release's dependency updates, bug fixes, and the automated multi-platform build workflow were done with the help of Claude.

---

## ✨ Features

- **Card library**: Browse downloaded cards by cover, with the author and the track list.
- **Batch download**: Paste one or more Yoto URLs and download them in one run.
- **Audio and images**: Saves the audio files (AAC/MP3 and the other formats Yoto serves) and the cover and track icons.
- **Backups**: Writes a zip copy of each card to a folder you choose, separate from the library. The library files stay in place.

---

## 💾 Compiled Version

### **Executable File Available!**
A **compiled version** of the YOTO JSON Extractor is available as an executable file (`.exe`). 

#### **Benefits of the Executable Version:**
- **No Installation Required:** Users can run the application without needing to install Python or any dependencies.
- **Opens in the browser:** The executable starts a local page on this computer and opens it for you. Closing the console window stops the app.

To get started with the executable version, just download the `.exe` file from the [Releases](https://github.com/afsenovilla/YOTO-json-extractor/releases) section and double-click to run!

> As of the latest release, the `.exe` is built automatically by a GitHub Actions workflow whenever a new release is published, so it always matches the source code and dependency versions in this repo.

---

## ⚙️ Installation 

### 1. Clone the Repository

Clone this repository to your local machine using the following command:

```bash
git clone https://github.com/afsenovilla/YOTO-json-extractor.git
cd YOTO-json-extractor
```

### 2. Install Dependencies

Make sure you have Python installed. Then install the required Python packages by running:

```bash
pip install -r requirements.txt
```

#### 📦 Dependencies

This project requires the following Python libraries:

- **requests**: For handling HTTP requests to download JSON and media.
- **beautifulsoup4**: To parse HTML and extract relevant data.
- **fastapi** and **uvicorn**: To serve the local library page in your browser.

---

## 🛠️ Usage 

1. Run the script using Python:

   ```bash
   python YOTO.py
   ```

   This starts a page on this computer only (`127.0.0.1`) and opens it in your browser. Closing the terminal stops the app.

2. In **Settings**, choose a library folder and a different backup folder. On the first run these default to `library` and `backups` next to the app.
3. Open **Add cards**, paste one or more Yoto URLs (one per line), and download.
4. Each card is stored as `library/<card id>/` with `card.json`, the cover, `audio/`, and `images/`. A zip of that folder is written to the backup folder. Downloading the same card again replaces its library folder and writes a new dated zip.
5. The backup folder also holds `recovery.json`: the card id, title, and Yoto URL for every card saved. That list is what you use to download the library again if the card files are lost. A card stays on the list even if you later remove its folder.

---

## 📋 Fequently Asked Questions 

### 1. How do I get the URL from a YOTO card?
To extract the URL from a physical YOTO card, you'll need a smartphone and the **NXP TagInfo** app, available for both iOS and Android.

**Steps:**
1. Download and install the **NXP TagInfo** app from the [App Store](https://apps.apple.com/es/app/nfc-taginfo-by-nxp/id1246143596) or [Google Play Store](https://play.google.com/store/apps/details?id=com.nxp.taginfolite).
2. Open the app and touch the **Scan & Launch** button.
2. Tap the YOTO card against the NFC reader on your smartphone.
3. The app will read the NFC tag and display the URL associated with the YOTO card.
4. Copy the URL and paste it in **Add cards**.

### 2. What should I do if the download fails?
Ensure that the provided YOTO URL is correct. If the issue persists, check your internet connection.

### 3. Can I process multiple URLs at once?
Yes. Paste multiple Yoto URLs in **Add cards**, one per line, and download them in one run.

### 4. What file formats are supported?
The tool currently supports downloading audio files in **AAC** or **MP3** format, depending on what’s available in the YOTO JSON data.

---

## 📝 To-Do List

- [X] Add progress bar to the GUI for download status
- [X] Add user settings for customizing download options
- [X] Implement support for more audio formats
- [X] Optimize error handling for specific network issues (network failures during download no longer die silently — they're now caught and logged)
- [ ] Test cross-platform compatibility — macOS/Linux builds now exist (see below), pending someone actually running them and confirming
- [~] Make the app available for macOS users — build wired up via GitHub Actions, unverified until the next release run
- [~] Make the app available for Linux users — build wired up via GitHub Actions, unverified until the next release run
- [X] Create a logo
- [X] Automate `.exe` builds with GitHub Actions on release (now also builds macOS/Linux binaries alongside the Windows `.exe`)
- [X] Fix known bug: URL queue index going out of range — audited `process_urls`/`update_progress`; the indexing itself was already safe post-refactor, but found and fixed a real bug where `attempts` was double-counted on retries (so "tried 10 times" fired after ~5), plus network-level failures inside the download thread were previously swallowed silently instead of being caught and logged


---

## License 📝

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
