<template>
    <div>
        <b-loading :active="true" v-if="!(board && user)"/>
        <template v-if="board && user">
            <section class="hero">
                <div class="hero-body">
                    <header class="container">
                        <h1 class="title is-1">Settings</h1>
                        <p class="subtitle">{{ board.title }}</p>
                    </header>

                    <main class="container" style="margin-top: 2rem">
                        <div class="columns">
                            <div class="column is-5-desktop is-4-widescreen"
                                 style="margin-bottom: 2rem">
                                <h2 class="title is-3">General</h2>
                                <div>
                                    <b-field label="Title" label-position="inside">
                                        <b-input v-model="board.title"/>
                                    </b-field>

                                    <b-field label="Description" label-position="inside">
                                        <b-input type="textarea" v-model="board.description"/>
                                    </b-field>

                                    <b-field style="align-items: center" grouped>
                                        <b-field label="Language" label-position="inside" expanded
                                                 style="margin-bottom: 0" v-if="settings">
                                            <b-select v-model="board.language" expanded>
                                                <option v-for="language in settings.board_language_choices"
                                                        :key="language.code"
                                                        :value="language.code">{{ language.name }}
                                                </option>
                                            </b-select>
                                        </b-field>
                                        <b-field>
                                            <b-switch v-model="board.is_private">Private Board
                                            </b-switch>
                                        </b-field>
                                    </b-field>
                                </div>
                            </div>
                            <div class="column is-offset-1-desktop is-6-desktop is-7-widescreen">
                                <h2 class="title is-3">Members</h2>

                                <b-field style="margin-bottom: 2rem">
                                    <div class="user-grid">
                                        <form class="membership is-adder box"
                                              @submit.prevent="addUser">
                                            <b-button @click="enableAdd = true" v-if="!enableAdd"
                                                      type="is-light"
                                                      icon-left="plus" title="Add Member" rounded
                                                      size="is-large"/>
                                            <b-field label="New Member Email Address"
                                                     label-position="inside"
                                                     v-if="enableAdd" grouped
                                                     style="align-items: center">
                                                <b-input type="email" v-model="newUserEmail"/>
                                                <b-button native-type="submit" label="Add"
                                                          icon-left="plus" type="is-light"
                                                          :loading="isAddingUser"
                                                          :disabled="isAddingUser"/>
                                            </b-field>
                                        </form>
                                        <template v-for="(membership, index) in board.memberships">
                                            <MembershipEditor v-model="board.memberships[index]"
                                                              :can-disable-owner="canDisableOwner"
                                                              :can-remove="canRemove"
                                                              :key="membership.user"
                                                              @remove="removeMembership(membership)"/>
                                        </template>
                                    </div>
                                </b-field>
                            </div>
                        </div>

                        <footer class="buttons">
                            <b-button @click="saveChanges" icon-left="save" type="is-primary"
                                      :disabled="!hasChanges || isSavingChanges"
                                      :loading="isSavingChanges">Save Changes
                            </b-button>
                        </footer>
                    </main>
                </div>
            </section>
        </template>
    </div>
</template>

<script>
  import { getSettings, getUsers, updateBoard } from '../api'
  import MembershipEditor from '../components/MembershipEditor'
  import { createBoardMixin } from '../mixins'

  export default {
    mixins: [
      createBoardMixin({
        requiredBoardAccessRight: 'is_owner'
      })
    ],
    components: {MembershipEditor},
    metaInfo () {
      return {
        title: `${this.board?.title} Settings`
      }
    },
    data () {
      return {
        isLoading: false,
        board: null,
        hasChanges: false,
        isAddingUser: false,
        isSavingChanges: false,
        enableAdd: false,
        settings: null,
        newUserEmail: ''
      }
    },
    computed: {
      currentUsers () {
        return this.board.memberships.map(membership => membership.user)
      },
      canDisableOwner () {
        return this.board.memberships
          .filter(membership => membership.is_owner === true)
          .length > 1
      },
      canRemove () {
        return this.board.memberships.length > 1
      }
    },
    methods: {
      async loadSettings () {
        this.settings = await getSettings()
      },
      async addUser () {
        this.isAddingUser = true
        try {
          const users = await getUsers({email: this.newUserEmail})
          if (users.length > 0) {
            this.addMembership(users[0])
            this.newUserEmail = ''
          } else {
            this.$buefy.snackbar.open({
              message: `Could not find a user with that email address.`,
              type: 'is-danger',
              position: 'is-top',
              duration: 6000,
            })
          }
        } finally {
          this.isAddingUser = false
        }
      },
      addMembership (user) {
        this.board.memberships.unshift({
          user: user.url,
          is_owner: false,
          can_modify: true
        })
      },
      removeMembership (membership) {
        this.board.memberships = this.board.memberships
          .filter(m => m.user !== membership.user)
      },
      async saveChanges () {
        try {
          this.isSavingChanges = true
          // TODO: this totally breaks the page by causing 100% CPU load.
          //       It’s unclear why this happens, because devtools break too :(.
          // this.board = await updateBoard(this.board.pk, this.board)
          await updateBoard(this.board.pk, this.board)
          window.location.reload()
        } catch (e) {
          this.errors = e.errors
        } finally {
          this.isSavingChanges = false
        }
      }
    },
    async created () {
      try {
        this.isLoading = true
        await Promise.all([
          this.loadBoard(),
          this.loadSettings()
        ])
      } finally {
        this.isLoading = false
      }
    },
    watch: {
      board: {
        deep: true,
        handler (newBoard, oldBoard) {
          this.hasChanges = oldBoard !== null
        }
      }
    }
  }
</script>

<style>
    .user-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1.5rem;
    }
</style>
