<template>
    <div style="overscroll-behavior-y: contain">
        <b-loading :active="!board"/>

        <div class="container" v-if="board">
            <section class="section">
                <h1 class="title is-1">{{ board.title }}</h1>
                <b-field
                        message="You can search for multiple words. Use asterisks for partial matches (*ism) or minus for exclusions (-help). See <a href='https://lunrjs.com/guides/searching.html' target='_blank'>reference</a> for more.">
                    <b-field grouped style="margin-bottom: 0">
                        <b-field expanded label="Search" label-position="on-border"
                                 style="margin-bottom: 0">
                            <b-input placeholder="Keywords..." type="search" size="is-large"
                                     v-model="keywords" :disabled="!canSearch"
                                     :loading="isUpdatingSearchIndex"
                                     expanded></b-input>
                        </b-field>
                        <p class="control is-hidden-mobile">
                            <b-button :loading="isLoadingNotes" icon-left="refresh" title="Refresh"
                                      @click="loadNotes" type="is-light" size="is-large"/>
                        </p>
                        <p class="control" v-if="userAccessRights.is_owner">
                            <router-link
                                    :to="{ name: 'board-settings', params: { token: board.pk } }"
                                    class="button is-large is-light" title="Settings">
                                <b-icon icon="settings"/>
                            </router-link>
                        </p>
                        <p class="control" v-if="userAccessRights.can_modify">
                            <button type="button" class="button is-large is-primary"
                                    @click="addNote">
                                <b-icon icon="plus" style="margin: 0 calc(-0.375em - 1px)"/>
                                <span class="is-hidden-mobile" style="margin-left: 0.375em">Add Note</span>
                            </button>
                        </p>
                    </b-field>
                </b-field>
            </section>
        </div>

        <div style="position: relative">
            <b-loading :active="isLoadingNotes" :is-full-page="false"/>

            <div class="board-grid section" role="presentation">
                <div class="board-grid-item" ref="gridItem"></div>
                <div class="board-grid-item"></div>
                <div class="board-grid-item"></div>
                <div class="board-grid-item"></div>
                <div class="board-grid-item"></div>
            </div>

            <main class="section" v-if="notes.length > 0" :lang="board ? board.language : null">
                <div v-masonry="'notes'" transition-duration="0.3s" item-selector=".note"
                     :column-width="columnWidth" gutter="24" fit-width="true"
                     style="margin: 0 auto">
                    <template v-for="noteIndex in filteredNoteIds">
                        <Note v-model="notes[noteIndex]" v-masonry-tile
                              @require-redraw="redrawMasonry"
                              :style="{ width: `${columnWidth}px` }" :key="noteIndex"
                              @remove="removeNote"/>
                    </template>
                </div>
            </main>
        </div>
    </div>
</template>

<script>
  import { debounce } from 'throttle-debounce'

  import { createNote } from '../api'
  import { createBoardMixin, createSearchIndexMixin } from '../mixins'
  import Note from '../components/Note'
  import NoteEditor from '../components/NoteEditor'
  import { pullRefreshController } from '../dom'

  export default {
    mixins: [
      createBoardMixin(),
      createSearchIndexMixin({
        configureIndex (index) {
          index.ref('pk')
          index.field('title', {boost: 2})
          index.field('content')

          for (const note of this.notes) {
            index.add(note)
          }
        },
        searchLanguageProp: 'board.language',
        documentsProp: 'notes'
      })
    ],
    components: {Note},
    metaInfo () {
      return {
        title: this.board?.title,
        meta: [
          { name: 'description', content: this.board?.description }
        ]
      }
    },
    data () {
      return {
        isLoading: false,
        notes: [],
        index: null,
        keywords: '',
        columnWidth: 300
      }
    },
    computed: {
      filteredNoteIds () {
        if (this.searchIndex === null) {
          // if the search index is not ready yet, just return all notes
          return this.notes.map((_, index) => index)
        }

        const matchingNoteIds = this.searchIndex
          .search(this.keywords)
          .map(entry => parseInt(entry.ref))
        return this.notes
          .map((note, index) => matchingNoteIds.includes(note.pk) ? index : null)
          .filter(index => index !== null)
      },
      userAccessRights () {
        return this.user
          ? this.board.memberships.find(membership => membership.user === this.user.url)
          : {}
      }
    },
    methods: {
      async refresh () {
        await this.loadNotes()
      },
      updateColumnWidth () {
        const {gridItem} = this.$refs
        if (gridItem) {
          this.columnWidth = Math.round(gridItem.getBoundingClientRect().width)
        }
      },
      redrawMasonry: debounce(200, function () {
        this.$nextTick(() => {
          this.$redrawVueMasonry('notes')
        })
      }),
      addNote () {
        this.$buefy.modal.open({
          parent: this,
          component: NoteEditor,
          hasModalCard: true,
          trapFocus: true,
          scroll: 'keep',
          props: {
            note: {
              title: '',
              content: '',
              color: 'whitesmoke',
              board: this.board.url
            }
          },
          events: {
            input: note => {
              this.notes.unshift(note)
            }
          }
        })
      },
      removeNote (note) {
        const noteIndex = this.notes.findIndex(n => n.pk === note.pk)
        this.notes.splice(noteIndex, 1)
        this.$buefy.snackbar.open({
          message: `Deleted note <em>${note.title}</em>.`,
          type: 'is-danger',
          position: 'is-top',
          actionText: 'Undo',
          duration: 6000,
          onAction: async () => {
            const noteData = {...note}
            delete noteData.pk
            const newNote = await createNote(noteData)
            this.notes.splice(noteIndex, 0, newNote)
          }
        })
      }
    },
    async created () {
      try {
        this.isLoading = true
        await Promise.all([
          this.loadBoard(),
          this.loadNotes()
        ])
      } finally {
        this.isLoading = false
      }

      pullRefreshController.subscribe(this)
      window.addEventListener('resize', this.updateColumnWidth)
    },
    beforeDestroy () {
      pullRefreshController.unsubscribe(this)
      window.removeEventListener('resize', this.updateColumnWidth)
    },
    mounted () {
      this.$nextTick(() => {
        this.updateColumnWidth()
      })
    },
    watch: {
      columnWidth: 'redrawMasonry'
    }
  }
</script>

<style lang="scss">
    .board-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(var(--min-width), 1fr));
        gap: 24px;
        height: 0;
        padding-top: 0;
        padding-bottom: 0;
        margin-top: 0;
        margin-bottom: 0;

        @media (min-width: 800px) {
            --min-width: 400px;
        }
    }

    .field.is-grouped .field:not(:last-child) {
        margin-right: 0;
    }

    .field.is-grouped > .field:not(:last-child) {
        margin-right: .75rem;
    }
</style>
