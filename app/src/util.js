import { wrap } from 'comlink'
import Vue from 'vue'
import MarkedWorker from 'worker-loader!./worker/marked'

const DOMPurify = import('dompurify').then(m => m.default)

const time = Vue.observable({
  now: new Date(),
  nowMinute: new Date(),
})

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

export const renderMarkdown = (renderer => {
  return async function (content, options) {
    const markdown = await renderer(content, options)
    return (await DOMPurify).sanitize(markdown)
  }
})(wrap(new MarkedWorker))

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
