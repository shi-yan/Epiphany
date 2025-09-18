# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Epiphany is a Tauri-based desktop note-taking application that stores notes in open format (djot). It's built with a Rust backend (Tauri v2) and a JavaScript frontend using ProseMirror for rich text editing.

## Architecture

- **Backend**: Rust (Tauri v2) in `src-tauri/`
  - Main entry point: `src-tauri/src/main.rs`
  - Application state management: `src-tauri/src/state.rs`
  - Window extensions: `src-tauri/src/win_ext.rs`
  - Uses djot format for note storage

- **Frontend**: Vanilla JavaScript in `frontend/src/`
  - Built with Vite
  - Uses ProseMirror for rich text editing
  - Main entry point: `frontend/src/main.js`
  - Editor schema: `frontend/src/textschema.js`
  - Djot integration: `frontend/src/djot.js`

## Development Commands

### Build and Run
```bash
# Install Tauri CLI first (if not installed)
cargo install tauri-cli

# Development build
cd ./frontend
npm i
cd ../src-tauri
cargo tauri dev

# Production build
cd ./frontend
npm run build
cd ../src-tauri
cargo tauri build
```

### Frontend Development
```bash
cd frontend
npm run dev        # Vite dev server
npm run build      # Build frontend
npm run preview    # Preview build
```

## Key Technologies

- **Tauri v2**: Desktop app framework with Rust backend
- **ProseMirror**: Rich text editor framework
- **Djot**: Markup language for note storage (open format alternative to Markdown)
- **Vite**: Frontend build tool
- **CodeMirror 6**: Code block editing
- **KaTeX**: Math equation rendering

## Project Structure

- `frontend/src/`: Frontend JavaScript modules
  - Editor plugins: `slashmenu.js`, `formatter_view.js`, `limpid_plugin.js`
  - Node views: `equation.js`, `code.js`, `gallery.js`, `tags.js`, `video.js`
  - Tree interface: `tree.js`, `tree_utils.js`, `tree_input.js`
- `src-tauri/`: Rust backend
  - Tauri commands for file operations, workspace management
  - State management for workspace and notes
- `frontend_new/`: Alternative frontend (appears to be experimental)

## Important Notes

- Notes are stored in djot format, not Markdown
- The app uses a workspace-based approach where users select a folder for their notes
- Frontend builds to `src/` directory (configured in `vite.config.js`)
- Currently only supports macOS (per README)
- Project is in early stage with known bugs