#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::Manager;
use tauri::State;

mod win_ext;
mod state;

use win_ext::WindowExt;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(state: tauri::State<state::State>) -> String {
    format!("Hello, {}! You've been greeted from Rust!", state.workspace_path)
}

fn main() {
    tauri::Builder::default()  .manage(state::State::new())
    .setup(|app| {
        let window = app.get_window("main").unwrap();
       // window.open_devtools();
        window.set_transparent_titlebar(true);
        window.maximize().unwrap();

        Ok(())
    })
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
