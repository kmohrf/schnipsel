import { expose } from 'comlink'

const marked = require('marked/marked.min.js')

expose(function (content, options = {}) {
  const baseHeadingLevel = options.baseHeadingLevel || 0
  const displayHeadingLevel = options.baseHeadingLevel || 0
  const renderer = new marked.Renderer()
  renderer.heading = function (text, level) {
    const escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
    level = baseHeadingLevel + level
    const displayLevel = displayHeadingLevel + level
    return `
          <h${level} class="title is-${displayLevel}">
            <a name="${escapedText}" class="anchor" href="#${escapedText}">
              <span class="header-link"></span>
            </a>
            ${text}
          </h${level}>`
  }
  renderer.checkbox = function (checked) {
    return `<input ${checked ? 'checked="" ' : ''}type="checkbox"${this.options.xhtml ? ' /' : ''}> `
  }
  renderer.listitem = function (text, isTask) {
    return `<li>${isTask ? `<label class="task">${text}</label>` : text}</li>` + '\n'
  }
  return marked(content, {renderer})
})
