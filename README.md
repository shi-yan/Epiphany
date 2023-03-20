# Epiphany

https://user-images.githubusercontent.com/326807/226399629-66cf21b3-0a0c-4004-9a8b-537eb0e8be3a.mp4

Epiphany is an open-source note-taking app that draws inspiration from Notion. I created Epiphany on a whim because I wanted a platform to document my AI learning journey. After researching various options such as Medium, dev.to, and Substack, I found that they were not suitable for technical writing. Additionally, blogging platforms come and go, and I didn't want to risk losing my content due to platform shutdowns or migrations. With Epiphany, I have complete control over my content, and I don't have to worry about losing it. I can easily export my data in an open format (djot [https://djot.net/](https://djot.net/)) and use it in other applications. 

I also considered static site generators, but I found that editing raw markdown files was less than ideal, particularly when it came to previewing math equations. With Epiphany, you have the best of both worlds: a user-friendly interface for organizing and taking notes, the ability to save your data in open formats and publish them as a blog.

As someone who has started and abandoned many projects, I'm committed to keeping Epiphany alive and improving it over time. I use it as my sole note-taking app and believe that it can be a valuable tool for others as well.

## Build

1. Install [tauri-cli](https://tauri.app/v1/guides/getting-started/setup/html-css-js). I prefer using Cargo.
```bash
cargo install tauri-cli
```

2. Build
```bash
cd ./frontend
npm i
cd ../src-tauri
cargo tauri dev
```

## How to use

For installers, please check the release page. Only Mac is currently supported.

Create a folder first for your notes. (Tauri doesn't support creating new folders within the folder picking dialog, we have to create a folder heforehand.)

In the app, hit backslash `\` to show the menu. To format text, select the range you want to update, the formatter menu will show.

## Note

This project is at its early stage. It contains known bugs and missing features. It's not recommended for daily use yet.
