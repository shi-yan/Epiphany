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

import tweet_sample from './tweet_sample.json';
import content_table_sample from './content_table_sample.json'
import sample_djot from './welcome.djot'

async function invoke(cmd, payload) {
  return new Promise((resolve, reject) => {
    switch (cmd) {
      case 'fetch_tweet':
        resolve(tweet_sample);
        break;
      case 'load_config':
        resolve(content_table_sample);
        break;
      case 'first_time_setup':
        resolve(content_table_sample);
        break;
      case 'load_note':
        resolve(sample_djot);
        break;
        case 'save_file':
          resolve(payload.currentFilename);
          break;
      default:
        console.error("unimplemented ", cmd);
        break;
    }
  })
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

export { tauri_invoke, tauri_dialog };