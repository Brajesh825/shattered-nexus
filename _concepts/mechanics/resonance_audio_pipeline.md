# 🗂️ Concept Blueprint: Resonance Audio Scraper Pipeline (MCP)

## 📋 Executive Summary
The Shattered Nexus engine currently relies on placeholder, repetitive audio assets. To elevate the auditory experience to match the visual fidelity, we require an automated pipeline capable of sourcing, downloading, and converting high-quality, royalty-free audio. This document outlines the proposed architecture for a new MCP tool (`nexus_fetch_audio`) managed by the Resonance AI persona, automating the entire audio acquisition and optimization lifecycle.

---

## 🏗️ Technical Architecture (Aethon & The Curator)

1. **Scraping Target & API Integration**:
   - **Primary Source (SFX)**: Integrate the **Freesound.org API** (requires API key) to search for specific tags (e.g., `sword`, `magic`, `wind`, `ui_click`) with strict royalty-free (CC0) licensing filters.
   - **Primary Source (BGM)**: Utilize a headless scraper (e.g., `yt-dlp` wrapper) pointing strictly to approved royalty-free channels (e.g., YouTube Audio Library, Kevin MacLeod) or integrate AI music generation endpoints (if API access is provided).

2. **The `nexus_fetch_audio` MCP Tool**:
   - Resides within `tools/nexus-mcp/index.js` or as a standalone Python bridge script.
   - **Input Parameters**: `query` (string), `type` (sfx | bgm), `duration_limit` (integer).
   - **Process Flow**:
     1. Search target API based on `query`.
     2. Download top match (raw format).
     3. Pipe directly into `tools/convert_audio.py` (or local `ffmpeg.exe`).
     4. Transcode to `libopus` `.webm` format at 96kbps (for BGM) or 48kbps (for SFX) to ensure PWA featherweight compliance.
     5. Save to `audio/bgm/` or `audio/sfx/` with normalized filenames (e.g., `sfx_sword_heavy_1.webm`).

3. **Data Registration**:
   - Automatically inject the new audio file path into `js/sfx.js` (for SFX) or `js/game.js` (for BGM triggers) to ensure the engine recognizes the asset.

---

## 🎨 Aesthetic & Audio Quality (Resonance AI)

- **Normalization**: Ensure all downloaded audio is peak-normalized to `-3dB` to prevent unexpected loud noises or clipping.
- **Trimming**: The scraper must attempt to trim leading/trailing silence using `ffmpeg` filters (`silenceremove`).
- **Loop Points**: For BGM, establish a standard crossfade or loop-point injection if possible.

---

## 🚀 Implementation Milestones
1. **API Key Provisioning**: Obtain a Freesound API key (or similar) from the USER.
2. **Python Bridge Script**: Create `tools/audio_scraper.py` utilizing `requests` (for APIs) or `yt-dlp` (for BGM scraping), wrapping the existing `ffmpeg` binary.
3. **MCP Registration**: Register the tool inside `tools/nexus-mcp/index.js` to allow the Agent to dynamically summon audio on demand.
4. **Engine Hooks**: Update `js/sfx.js` to dynamically load new asset keys.
