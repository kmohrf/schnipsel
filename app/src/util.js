import { wrap } from 'comlink'
import Vue from 'vue'
import MarkedWorker from 'worker-loader!./worker/marked';

const time = Vue.observable({
  now: new Date(),
  nowMinute: new Date(),
})

export const renderMarkdown = (renderer => {
  return async function (content, options) {
    return await renderer(content, options)
  }
})(wrap(new MarkedWorker))

setInterval(() => { time.now = new Date() }, 1000)
setInterval(() => { time.nowMinute = new Date() }, 1000 * 60)

export function createTimeMixin (name) {
  return {
    computed: {
      [name] () {
        return time[name]
      }
    }
  }
}

export function rsplit(text, delimiter) {
  // TODO: late-night brain meltdown… there is most likely a better way to do this
  return text
    .split('')
    .reverse()
    .join('')
    .split(delimiter)
    .map(token =>
      token
        .split('')
        .reverse()
        .join('')
    )
    .reverse()
}

export function formatErrors (errors) {
  return Object.fromEntries(
    Object.entries(errors)
      .map(([field, errors]) => [field, {
        message: errors.join('\n\n'),
        type: 'is-danger'
      }])
  )
}

export async function* readFiles (files, loader = 'readAsDataURL') {
  function loadFile (file) {
    return new Promise (resolve => {
      const reader = new window.FileReader()
      reader.addEventListener('load', () => {
        resolve(reader.result)
      })
      reader[loader](file)
    })
  }
  for (const file of files) {
    yield await loadFile(file)
  }
}
