# Deployment Guide: RPG+ Shattered Nexus

This project is configured to be hosted on **GitHub Pages**.

## 🚀 One-Time Setup on GitHub

Once you push these changes to your repository, follow these steps to enable the live website:

1.  Go to your repository on GitHub.com.
2.  Click the **Settings** tab.
3.  In the left sidebar, click **Pages**.
4.  Under **Build and deployment** > **Source**, change the dropdown to **GitHub Actions**.
5.  GitHub will now automatically deploy your game whenever you push to the `main` branch.

## 🛠 Local Development

To run the game on your own computer with live-reloading:

1.  Open a terminal in the project folder.
2.  Run: `npm install` (optional, for local `browser-sync`).
3.  Run: `npm run dev`.
4.  The game will open in your browser automatically.

## ⚠️ Important Deployment Notes

*   **Case Sensitivity**: GitHub Pages runs on Linux, which is case-sensitive. Ensure all file names in your code (e.g., `images/Character.png`) exactly match the files on your computer (e.g., `images/character.png`).
*   **Data Updates**: If you add new characters or enemies in the `data/` folder, just push the changes to GitHub and they will be live within a few minutes.
