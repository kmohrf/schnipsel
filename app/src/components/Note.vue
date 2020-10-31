<template>
    <div class="note" :style="{ backgroundColor: note.color }">
        <header class="note-header">
            <h2 class="has-text-weight-bold">{{ note.title }}</h2>
        </header>
        <div class="note-body">
            <div class="content" v-html="noteContent" @change="toggleNoteTask" ref="content"></div>
        </div>
        <footer class="note-footer">
            <time class="is-size-7"
                  :datetime="lastChangedDateTime"
                  :title="lastChangedTitle">Last Change: {{ lastChangedLabel }}
            </time>
            <b-button label="Edit" size="is-small" icon-left="edit" type="is-white"
                      @click="editNote"/>
        </footer>
    </div>
</template>

<script>
  import { formatDistance } from 'date-fns'
  import { createTimeMixin, renderMarkdown } from '../util'
  import NoteEditor from './NoteEditor'
  import { updateNote } from '@/api'

  function toggleTask (noteContent, newState, numOccurrence) {
    const taskRegex = /^(\s*(?:[*+-]|\d+[.)])\s*)(\[[ xX]\]) /gm
    let occurrence = 0

    return noteContent.replace(taskRegex, (match, leadingContent) => {
      if (occurrence++ === numOccurrence) {
        return leadingContent + (newState ? '[x] ' : '[ ] ')
      } else {
        return match
      }
    })
  }

  export default {
    mixins: [
      createTimeMixin('nowMinute')
    ],
    props: {
      note: {
        type: Object,
        required: true
      }
    },
    model: {
      prop: 'note'
    },
    data () {
      return {
        noteContent: null
      }
    },
    computed: {
      lastChangedDate () {
        return new Date(this.note.updated_at || this.note.created_at)
      },
      lastChangedDateTime () {
        return this.lastChangedDate.toISOString()
      },
      lastChangedTitle () {
        return this.lastChangedDate.toLocaleString()
      },
      lastChangedLabel () {
        return formatDistance(new Date(this.lastChangedDate), this.nowMinute, {addSuffix: true})
      }
    },
    methods: {
      editNote () {
        this.$buefy.modal.open({
          parent: this,
          component: NoteEditor,
          hasModalCard: true,
          trapFocus: true,
          scroll: 'keep',
          props: {
            note: this.note
          },
          events: {
            remove: note => { this.$emit('remove', note) },
            input: note => { this.$emit('input', note) }
          }
        })
      },
      async toggleNoteTask (event) {
        if (event.target.nodeName === 'INPUT' && event.target.getAttribute('type') === 'checkbox') {
          const inputIndex = Array.from(this.$refs.content.querySelectorAll('input[type="checkbox"]')).indexOf(event.target)
          const newNote = await updateNote(this.note.pk, {
            ...this.note,
            content: toggleTask(this.note.content, event.target.checked, inputIndex)
          })
          this.$emit('input', newNote)
        }
      }
    },
    watch: {
      'note.content': {
        immediate: true,
        async handler (content) {
          if (content) {
            this.noteContent = await renderMarkdown(content, {
              baseHeadingLevel: 2,
              displayHeadingLevel: 4
            })
          } else {
            this.noteContent = ''
          }

          this.$emit('require-redraw')
        }
      }
    }
  }
</script>

<style lang="scss">
    .note {
        border-radius: 4px;
        margin-bottom: 1.5rem;
        overflow: hidden;
    }

    .note-body {
        padding: 1rem;
    }

    .note-header {
        padding: .75rem 1rem;
        background-color: rgba(0, 0, 0, .4);
        color: white;
    }

    .note-footer {
        border-top: 1px solid rgba(0, 0, 0, 0.05);
        padding: .5rem 1rem;
        color: rgba(0, 0, 0, 0.4);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .note .content {
        h3, h4, h5 {
            margin-top: 0;
        }

        h3 {
            margin-bottom: 0.8888em;
        }

        h4 {
            margin-bottom: 0.6666em;
        }

        h5 {
            margin-bottom: 0.4444em;
        }

        :last-child {
            margin-bottom: 0 !important;
        }
    }
</style>
