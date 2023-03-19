/*let tauri =  window.__TAURI__;

console.log(tauri);

(async () => {
const files = await tauri.dialog.open({
  multiple: true,
  filters: [{
    name: 'Image',
    extensions: ['png', 'jpeg']
  }]
});

console.log("selected", files)

let apiPath = window.__TAURI__.tauri.convertFileSrc(files[0])
console.log('API Path', apiPath)
let img = document.createElement('img');
img.src = apiPath
document.body.appendChild(img)
})();*/

//import tweet_sample from './dummy/tweet_sample.json';
//import content_table_sample from './dummy/content_table_sample.json'
//import sample_djot from './dummy/welcome.djot'

let tweet_sample = null;
let content_table_sample = null;
let sample_djot = null;

async function invoke(cmd, payload) {
    switch (cmd) {
      case 'fetch_tweet':
        if (!tweet_sample){
          tweet_sample = await import('./dummy/tweet_sample.json');
        }
        return tweet_sample.default;
      case 'load_config':
        if (!content_table_sample){
          content_table_sample = await import('./dummy/content_table_sample.json');
        }
        return content_table_sample.default;
      case 'first_time_setup':
        if (!content_table_sample){
          content_table_sample = await import('./dummy/content_table_sample.json');
        }
        return content_table_sample.default;
      case 'load_note':
        if (!sample_djot){
          sample_djot = await import('./dummy/welcome.djot');
        }
        return sample_djot.default;
        case 'save_file':
          return payload.currentFilename;
          
      default:
        console.error("unimplemented ", cmd);
        break;
    }
}

async function tauri_invoke(cmd, payload) {
  if (window.__TAURI__) {
    return window.__TAURI__.invoke(cmd, payload);
  }
  else {
    return invoke(cmd, payload);
  }
}

function tauri_dialog() {
  if (window.__TAURI__) {
    return window.__TAURI__.dialog;
  }
  else {
    return {
      open: async (config) => {
        return '/Users/xxx/work/notes';
      }
    }
  }
}

async function tauri_convertFileSrc(file) {
  if (window.__TAURI__) {
    return window.__TAURI__.tauri.convertFileSrc(file);
  }
  else {
    return "https://www.cam.ac.uk/sites/www.cam.ac.uk/files/styles/content-885x432/public/news/research/news/crop_178.jpg"
  }
}

export { tauri_invoke, tauri_dialog,tauri_convertFileSrc };