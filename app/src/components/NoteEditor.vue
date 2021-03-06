<template>
    <form class="card note-editor" @submit.prevent="saveChanges" @keydown.ctrl.enter="saveChanges">
        <div class="card-content" v-if="myNote">
            <b-field label="Title" label-position="inside" grouped>
                <b-input v-model="myNote.title" expanded ref="title"/>
                <Swatches v-model="myNote.color" :swatches="noteColors" shapes="circles"
                          popover-x="left" popover-y="bottom" tabindex="-1"/>
            </b-field>
            <div style="position: relative">
              <b-field label="Content" label-position="inside">
                  <template v-slot:message>
                      You can use Markdown to markup the content. See <a href='https://commonmark.org/help/' target='_blank' tabindex='-1'>here</a> how to do it.
                  </template>
                  <b-input type="textarea" v-model="myNote.content" ref="content" class="content-editor"/>
              </b-field>
              <b-button type="is-default" size="is-small" @click="addTask" accesskey="t"
                        style="position: absolute; right: .5em; top: .5em;">
                Add <span class="is-accesskey">T</span>ask
              </b-button>
            </div>
        </div>
        <footer class="card-footer">
            <div class="buttons">
                <b-button :label="note.pk ? 'Save Changes' : 'Create Note'"
                          type="is-primary" icon-left="save" native-type="submit"
                          :loading="isSaving" :disabled="isExecutingAction"
                          style="margin-left: auto; margin-right: 0; order: 10"/>
                <b-button label="Cancel" @click="$emit('close')" class="is-hidden-mobile"
                          :disabled="isExecutingAction"/>
                <b-button label="Delete Note" type="is-danger" icon-left="delete"
                          :loading="isDeleting" :disabled="isExecutingAction"
                          @click="removeNote" v-if="note.pk"/>
            </div>
        </footer>
    </form>
</template>

<script>
  import { createNote, deleteNote, updateNote } from '../api'

  export default {
    props: {
      note: {
        type: Object,
        required: true
      }
    },
    data () {
      return {
        myNote: null,
        isSaving: false,
        isDeleting: false,
        noteColors: [
          "#EF9A9A", "#F48FB1", "#CE93D8", "#B39DDB", "#9FA8DA", "#90CAF9", "#81D4FA", "#80DEEA", "#80CBC4", "#A5D6A7", "#C5E1A5", "#E6EE9C", "#FFF59D", "#FFE082", "#FFCC80", "#FFAB91", "#BCAAA4", "whitesmoke", "#B0BEC5"
        ]
      }
    },
    computed: {
      isExecutingAction () {
        return this.isSaving || this.isDeleting
      }
    },
    created () {
      this.myNote = {...this.note}
    },
    mounted () {
      if (this.$refs.title) {
        this.$refs.title.focus()
      }
    },
    methods: {
      addTask () {
        this.myNote.content += '\n* [ ] '
        this.$refs.content.focus()
      },
      async saveChanges () {
        try {
          this.isSaving = true
          const note = (
            this.note.pk
              ? await updateNote(this.note.pk, this.myNote)
              : await createNote(this.myNote)
          )
          this.$emit('input', note)
          this.$parent.close()
        } catch (e) {
          // TODO: error handling
        } finally {
          this.isSaving = false
        }
      },
      async removeNote () {
        try {
          this.isDeleting = true
          await deleteNote(this.note.pk)
          this.$emit('remove', this.note)
          this.$parent.close()
        } catch (e) {
          // TODO: error handling
        } finally {
          this.isDeleting = false
        }
      }
    }
  }
</script>

<style lang="scss">
    .note-editor {
        width: 650px;
        max-width: 100vw;
        border-radius: 4px;

        textarea {
            min-height: 50vh !important;
        }

        .vue-swatches > div:first-child {
            display: flex;
            align-items: center;
            height: 100%;
        }

        .card-footer {
            padding: 1rem 1.5rem;
        }

        .buttons {
            width: 100%;
        }
    }
</style>
