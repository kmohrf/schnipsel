import lunr from 'lunr'
import enableStemmerSupport from 'lunr-languages/lunr.stemmer.support'
import Vue from 'vue'

import { getBoard, getNotes, userMixin } from './api'

export function createBoardMixin ({requiredBoardAccessRight} = {}) {
  return {
    mixins: [userMixin],
    data () {
      return {
        isLoadingBoard: false,
        isLoadingNotes: false,
        board: null,
        notes: []
      }
    },
    methods: {
      async loadNotes () {
        this.isLoadingNotes = true
        this.notes = await getNotes(this.$route.params.token)
        this.isLoadingNotes = false
      },
      async loadBoard () {
        let board
        this.isLoadingBoard = true
        try {
          board = await getBoard(this.$route.params.token)
        } catch (e) {
          this.$buefy.snackbar.open({
            message: `Could not find the requested board.`,
            duration: 5000,
            type: 'is-info',
            position: 'is-top'
          })
          return await this.$router.replace({name: 'home'})
        }
        if (requiredBoardAccessRight) {
          const membership = board.memberships.find(membership => membership.user === this.user.url)
          if (!membership[requiredBoardAccessRight]) {
            this.$buefy.snackbar.open({
              message: `You don’t have sufficient rights to access this page.`,
              duration: 5000,
              type: 'is-info',
              position: 'is-top'
            })
            return await this.$router.replace({name: 'board-detail', params: {token: board.pk}})
          }
        }
        this.board = board
        this.isLoadingBoard = false
      }
    }
  }
}

enableStemmerSupport(lunr)
const loadedLanguages = ['en']

async function loadLunrLanguage (language) {
  if (!loadedLanguages.includes(language)) {
    const enableLanguageSupport = await import(`lunr-languages/lunr.${language}.js`).then(m => m.default)
    enableLanguageSupport(lunr)
    loadedLanguages.push(language)
  }
}

export function createSearchIndexMixin ({configureIndex, searchLanguageProp, documentsProp}) {
  function createIndex (owner, language) {
    return lunr(function () {
      if (language && language !== 'en') {
        this.use(lunr[language])
      }
      configureIndex.call(owner, this)
    })
  }

  const undef = Symbol('undef')
  let language = undef
  const state = Vue.observable({
    updateLock: null
  })

  return {
    data () {
      return {
        isUpdatingSearchIndex: false,
        searchIndex: null
      }
    },
    computed: {
      canSearch () {
        return this.searchIndex !== null && state.updateLock === null
      }
    },
    methods: {
      async updateSearchIndex () {
        // do nothing if language support was requested but
        // we didn’t get a language yet
        if ((searchLanguageProp && language === undef)) {
          return
        }
        // wait until the current update lock is passed
        // if there is one
        await (state.updateLock || Promise.resolve())
        // set a new deferred update lock
        let _resolve
        state.updateLock = new Promise(resolve => {
          _resolve = resolve
        })
        try {
          if (language !== undef && language !== null) {
            await loadLunrLanguage(language)
          }
          this.searchIndex = createIndex(this, language)
        } finally {
          // resolve the update lock
          _resolve()
          state.updateLock = null
        }
      }
    },
    watch: {
      [documentsProp] () {
        this.updateSearchIndex()
      },
      ...(searchLanguageProp ? {
        [searchLanguageProp] (_language) {
          language = _language
          this.updateSearchIndex()
        }
      } : {})
    }
  }
}
