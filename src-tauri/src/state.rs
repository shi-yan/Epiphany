use std::path::Path;
extern crate directories;
use directories::{BaseDirs, ProjectDirs, UserDirs};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct Config {
    workspace_paths: Vec<String>,
}

pub struct State {
    pub workspace_path: String,
}

impl State {
    pub fn new() -> Self {
        State {
            workspace_path: String::new(),
        }
    }

    pub fn load_config(&mut self) -> bool {
        if let Some(proj_dirs) = ProjectDirs::from("com", "Epiphany", "Epiphany") {
            let path = proj_dirs.config_dir();
            let rs = path.exists();

            if rs == true {
                println!("File exists");
            } else {
                println!("File does not exist");
            }

            // Lin: /home/alice/.config/barapp
            // Win: C:\Users\Alice\AppData\Roaming\Foo Corp\Bar App\config
            // Mac: /Users/Alice/Library/Application Support/com.Foo-Corp.Bar-App
        }

        false
    }
}
