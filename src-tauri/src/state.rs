use std::io::{Read, Write};
use std::path::{Path, PathBuf};
extern crate directories;
use anyhow::{anyhow, Ok, Result};
use blake3::hash;
use cuid2;
use directories::{BaseDirs, ProjectDirs, UserDirs};
use rust_embed::RustEmbed;
use serde::{Deserialize, Serialize};
use std::ffi::OsStr;
use std::fs::{create_dir_all, metadata, rename, File};
use tauri::utils::config;
use tauri::api::http::{ClientBuilder, HttpRequestBuilder, ResponseType};
use std::time::SystemTime;

use slugify::slugify;

#[derive(Debug, Serialize, Deserialize)]
struct Config {
    workspace_paths: Vec<String>,
}

#[derive(RustEmbed)]
#[folder = "assets/"]
struct Assets;

pub struct State {
    pub workspace_path: String,
    workspace_content: Option<WorkspaceContent>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ContentItem {
    name: String,
    filename: String,
    id: String,
    children: Vec<ContentItem>,
    created_at: Option<u64>,
    modified_at: Option<u64>
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct WorkspaceContent {
    workspace_title: String,
    absolute_path: String,
    content_table: Vec<ContentItem>
}

fn mkdir_p<P: AsRef<Path>>(path: &P) -> Result<()> {
    if let Err(e) = create_dir_all(path) {
        if e.kind() != std::io::ErrorKind::AlreadyExists {
            return Err(e.into());
        }
    }
    Ok(())
}

impl State {
    pub fn new() -> Self {
        State {
            workspace_path: String::new(),
            workspace_content: None,
        }
    }

    async fn fetch_tweet() {
        let client = ClientBuilder::new().build().unwrap();
        let response = client.send(
          HttpRequestBuilder::new("GET", "https://www.rust-lang.org")
            .unwrap()
            .response_type(ResponseType::Binary)
        ).await;
        if let std::result::Result:: Ok(response) = response {
          let bytes = response.bytes();
        }
      }

    fn move_and_content_index_asset(&self, src: &str) -> String {
        let workspace_assets_path_buf = PathBuf::new()
            .join(self.workspace_path.as_str())
            .join("assets");

        let mut hasher = blake3::Hasher::new();

        let mut f = File::open(src).expect("no file found");
        let temp_filename = cuid2::cuid();
        let mut buffer = vec![0; 1024 * 1024 * 1024];
        println!("{:?}", src);
        let mut actual_read_bytes = f.read(&mut buffer).expect("buffer overflow");

        let mut f2 = File::create(workspace_assets_path_buf.join(temp_filename.as_str()))
            .expect("unable to read");
        while actual_read_bytes > 0 {
            hasher.update(&buffer[0..actual_read_bytes]);
            // println!("{:?}", &buffer[0..actual_read_bytes]);
            f2.write_all(&buffer[0..actual_read_bytes]).unwrap();
            actual_read_bytes = f.read(&mut buffer).expect("buffer overflow");
        }
        f2.flush().unwrap();
        drop(f2);
        drop(f);
        let hash2 = hasher.finalize();

        let encoded = bs58::encode(hash2.as_bytes()).into_string();
        println!("{:?} {:?}", hash2, encoded);

        let final_filename =
            if let Some(extension) = Path::new(src).extension().and_then(OsStr::to_str) {
                format!("{}.{}", encoded, extension)
            } else {
                format!("{}", encoded)
            };

        rename(
            workspace_assets_path_buf.join(temp_filename.as_str()),
            workspace_assets_path_buf.join(final_filename.as_str()),
        )
        .expect("rename");

        return final_filename;
    }

    pub fn save_image(&mut self, image_filename: &str) -> Result<String> {
        let new_filename = self.move_and_content_index_asset(image_filename);
        Ok(new_filename)
    }

    pub fn to_asset_absolute_path(&mut self, image_filename: &str) -> Result<String> {
        let workspace_assets_path_buf = PathBuf::new()
            .join(self.workspace_path.as_str())
            .join("assets");

        Ok(String::from(
            workspace_assets_path_buf
                .join(image_filename)
                .to_str()
                .unwrap(),
        ))
    }

    pub fn save_file(
        &mut self,
        id: &str,
        title: &str,
        current_filename: &str,
        content: &str,
    ) -> Result<String> {
        let workspace_path = Path::new(&self.workspace_path);
        let workspace_notes_path_buf = PathBuf::new().join(workspace_path).join("notes");

        let new_filename =
            if !title.eq("Unnamed Note") && current_filename.eq(format!("{}.djot", id).as_str()) {
                let slug = slugify!(title, separator = "_");
                let mut new_filename = format!("{}.djot", slug.as_str());

                new_filename = if !workspace_notes_path_buf.join(&new_filename).exists() {
                    new_filename
                } else {
                    let mut num = 1;

                    while workspace_notes_path_buf
                        .join(format!("{}_{}.djot", slug.as_str(), num).as_str())
                        .exists()
                    {
                        num += 1;
                        if num > 25 {
                            break;
                        }
                    }

                    if num > 25 {
                        format!("{}_{}.djot", slug.as_str(), id)
                    } else {
                        format!("{}_{}.djot", slug.as_str(), num)
                    }
                };
                new_filename
            } else {
                let slug = slugify!(title, separator = "_");
                let new_filename = format!("{}.djot", slug.as_str());

                if !new_filename.eq(current_filename)
                    && !workspace_notes_path_buf.join(&new_filename).exists()
                {
                    new_filename
                } else {
                    String::from(current_filename)
                }
            };

        if !new_filename.eq(current_filename) {
            std::fs::rename(
                workspace_notes_path_buf.join(current_filename),
                workspace_notes_path_buf.join(&new_filename),
            )
            .unwrap();
        }

        let mut file = File::create(workspace_notes_path_buf.join(&new_filename))?;

        file.write_all(content.as_bytes())?;

        Ok(new_filename)
    }

    pub fn create_new_file(&mut self, file_id: &str) -> Result<()> {
        let workspace_path = Path::new(&self.workspace_path);

        let workspace_notes_path_buf = PathBuf::new()
            .join(workspace_path)
            .join("notes")
            .join(format!("{}.djot", file_id));
        let mut new_file = File::create(&workspace_notes_path_buf)?;
        let empty_djot = Assets::get("empty.djot").unwrap();

        new_file.write_all(empty_djot.data.as_ref())?;
        Ok(())
    }

    pub fn load_note(&mut self, filename: &str) -> Result<String> {
        let workspace_path = Path::new(&self.workspace_path);

        let workspace_notes_path_buf = PathBuf::new()
            .join(workspace_path)
            .join("notes")
            .join(filename);

        println!("loading {:?}", &workspace_notes_path_buf.display());

        let mut note_file = File::open(&workspace_notes_path_buf)?;

        let mut buf = Vec::<u8>::new();

        note_file.read_to_end(&mut buf)?;

        return Ok(String::from_utf8(buf)?);
    }

    pub fn update_workspace_content(&mut self, workspace_content: &WorkspaceContent) -> Result<()> {
        let workspace_path = Path::new(&self.workspace_path).join("epiphany.json");
        let mut content_table_file = File::create(&workspace_path)?;
        let serialized_content_table = serde_json::to_vec_pretty(&workspace_content)?;
        content_table_file.write_all(&serialized_content_table)?;
        self.workspace_content = Some(workspace_content.clone());
        Ok(())
    }

    pub fn first_time_setup(&mut self, workspace_path_str: &str) -> Result<WorkspaceContent> {
        if let Some(proj_dirs) = ProjectDirs::from("com", "Epiphany", "Epiphany") {
            let config_dir_path = proj_dirs.config_dir();

            let config_filename = "epiphany.conf.json";
            let config_file_path = PathBuf::new().join(config_dir_path).join(config_filename);

            let config = Config {
                workspace_paths: vec![String::from(workspace_path_str)],
            };

            let serialized_config = serde_json::to_vec_pretty(&config)?;

            if !config_dir_path.exists() {
                mkdir_p(&config_dir_path).unwrap();
            }
            let mut file = File::create(config_file_path)?;
            file.write_all(&serialized_config)?;

            let workspace_path = Path::new(workspace_path_str);

            if !workspace_path.exists() {
                mkdir_p(&workspace_path).unwrap();
            }

            let workspace_assets_path_buf = PathBuf::new().join(workspace_path).join("assets");

            if !workspace_assets_path_buf.exists() {
                mkdir_p(&workspace_assets_path_buf).unwrap();
            }

            let workspace_notes_path_buf = PathBuf::new().join(workspace_path).join("notes");

            if !workspace_notes_path_buf.exists() {
                mkdir_p(&workspace_notes_path_buf).unwrap();
            }

            self.workspace_path = String::from(workspace_path.to_str().unwrap());

            let content_table = if !workspace_path.join("epiphany.json").exists() {
                let welcome_djot = Assets::get("welcome.djot").unwrap();

                let welcome_file_path = workspace_notes_path_buf.join("welcome_to_epiphany.djot");

                let mut welcome_file = File::create(&welcome_file_path)?;
                welcome_file.write_all(welcome_djot.data.as_ref())?;
                let id = cuid2::create_id();

                let now = SystemTime::now().duration_since(SystemTime::UNIX_EPOCH).unwrap();


                let content_table = WorkspaceContent {
                    workspace_title: "notes".to_string(),
                    absolute_path: String::from(workspace_path.to_str().unwrap()),
                    content_table: vec![ContentItem {
                        name: "Welcome to Epiphany".to_string(),
                        filename: "welcome_to_epiphany.djot".to_string(),
                        id: id,
                        children: Vec::new(),
                        created_at: Some(now.as_secs()),
                        modified_at: Some(now.as_secs())
                    }],
                };

                let mut content_table_file = File::create(&workspace_path.join("epiphany.json"))?;
                let serialized_content_table = serde_json::to_vec_pretty(&content_table)?;
                content_table_file.write_all(&serialized_content_table)?;

                content_table
            } else {
                let mut content_table_file = File::open(&workspace_path.join("epiphany.json"))?;
                let mut buf = Vec::<u8>::new();
                content_table_file.read_to_end(&mut buf)?;
                let content_table: WorkspaceContent = serde_json::from_slice(&buf)?;

                content_table
            };
            return Ok(content_table);
        }

        Err(anyhow!("No config directory found."))
    }

    pub fn load_config(&mut self) -> Result<WorkspaceContent> {
        if let Some(proj_dirs) = ProjectDirs::from("com", "Epiphany", "Epiphany") {
            let path = proj_dirs.config_dir();

            let path_buf = PathBuf::new();
            let config_file_path = path_buf.join(path).join("epiphany.conf.json");

            println!("{:?}", config_file_path);

            let rs = config_file_path.exists();

            if rs == true {
                let mut file = File::open(config_file_path).unwrap();
                let mut file_buf: Vec<u8> = Vec::new();
                file.read_to_end(&mut file_buf).unwrap();

                let config: Config = serde_json::from_slice(&file_buf).unwrap();

                println!("exisiting config, {:?}", config);

                if config.workspace_paths.len() > 0 {
                    self.workspace_path = config.workspace_paths[0].clone();
                    let workspace_content_table_filepath = PathBuf::new()
                        .join(&self.workspace_path)
                        .join("epiphany.json");
                    let mut content_table_file_buf = Vec::<u8>::new();
                    let mut content_table_file =
                        File::open(workspace_content_table_filepath).unwrap();
                    content_table_file
                        .read_to_end(&mut content_table_file_buf)
                        .unwrap();
                    let content_table: WorkspaceContent =
                        serde_json::from_slice(&content_table_file_buf).unwrap();
                    return Ok(content_table);
                } else {
                    return Err(anyhow!("No workspace directories in the config."));
                }
            }

            // Lin: /home/alice/.config/barapp
            // Win: C:\Users\Alice\AppData\Roaming\Foo Corp\Bar App\config
            // Mac: /Users/Alice/Library/Application Support/com.Foo-Corp.Bar-App
        }

        Err(anyhow!("Not configed."))
    }
}
