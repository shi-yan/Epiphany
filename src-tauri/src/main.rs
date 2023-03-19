#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]
#[macro_use] extern crate slugify;

use tauri::Manager;
use tauri::State;
use std::sync::Mutex;
mod win_ext;
mod state;

use win_ext::WindowExt;
use anyhow::{anyhow, Result};
// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(state: tauri::State<Mutex<state::State>>) -> String {
    format!("Hello, {}! You've been greeted from Rust!", state.lock().unwrap().workspace_path)
}

#[tauri::command]
fn load_config(state: tauri::State<Mutex<state::State>>) -> Result<state::WorkspaceContent, String> {
    println!("inside load config");
    if let Ok(content) =state.lock().unwrap().load_config() {
        return Ok(content);
    }

    Err("Failed to load config".to_string())
}

#[tauri::command]
fn first_time_setup(state: tauri::State<Mutex<state::State>>, workspace_path: &str)  -> Result<state::WorkspaceContent, String>  {
    println!("inside first time setup {:?}", workspace_path);
    if let Ok(content) = state.lock().unwrap().first_time_setup(workspace_path) {
        return Ok(content);
    }
    Err("Can't initialize workspace.".to_string())
}

#[tauri::command]
fn create_new_file(state: tauri::State<Mutex<state::State>>, new_file_id: &str ) -> Result<(), String> {
    if let Ok(()) = state.lock().unwrap().create_new_file(new_file_id) {
        return Ok(());
    }
    Err("Can't create a new file".to_string())
}

#[tauri::command]
fn update_workspace_content(state: tauri::State<Mutex<state::State>>, new_workspace_content: state::WorkspaceContent ) -> Result<(), String> {
    if let Ok(()) = state.lock().unwrap().update_workspace_content(&new_workspace_content) {
        return Ok(());
    }
    Err("Can't save new workspace content".to_string())
}

#[tauri::command]
fn load_note(state: tauri::State<Mutex<state::State>>, filename: &str) -> Result<String, String> {
    if let Ok(content) = state.lock().unwrap().load_note(filename) {
        return Ok(content);
    }
    Err("Can't load note".to_string())
}

#[tauri::command]
fn save_file(state: tauri::State<Mutex<state::State>>, id: &str, title: &str, current_filename: &str, content: &str) -> Result<String, String> {
    if let Ok(new_filename) = state.lock().unwrap().save_file(id, title, current_filename, content) {
        return Ok(new_filename);
    }
    Err("Can't save note".to_string())
}

fn main() {
    tauri::Builder::default()  .manage(Mutex::<state::State>::new( state::State::new()))
    .setup(|app| {
        let window = app.get_window("main").unwrap();
       // window.open_devtools();
        window.set_transparent_titlebar(true);
        window.maximize().unwrap();

        Ok(())
    })
        .invoke_handler(tauri::generate_handler![greet, load_config, first_time_setup,create_new_file,update_workspace_content,load_note,save_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
