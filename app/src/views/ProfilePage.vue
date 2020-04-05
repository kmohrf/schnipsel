<template>
    <div class="section profile-page" v-if="userData">
        <div class="container">
            <div class="is-flex" style="justify-content: center; text-align: center">
                <div>
                    <Avatar v-model="userData.avatar" :editable="true" v-if="userData.avatar"/>
                    <h1 class="title is-1">{{ label }}</h1>
                </div>
            </div>
            <hr>
            <div class="columns is-centered">
                <div class="column is-4-widescreen is-6-desktop is-8-tablet">
                    <b-field label="Name" label-position="inside">
                        <b-input v-model="userData.name"/>
                    </b-field>

                    <b-field label="Language" label-position="inside" v-if="settings">
                        <b-select v-model="userData.language" expanded>
                            <option v-for="language in settings.ui_language_choices"
                                    :key="language.code"
                                    :value="language.code">{{ language.name }}
                            </option>
                        </b-select>
                    </b-field>

                    <footer class="buttons is-centered" style="margin-top: 1.5rem">
                        <b-button @click="saveChanges" icon-left="save" type="is-primary"
                                  :disabled="!hasChanges || isSavingChanges"
                                  :loading="isSavingChanges">Save Changes
                        </b-button>
                    </footer>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
  import { formatErrors, rsplit } from '../util'
  import { getSettings, updateUser, userMixin } from '../api'
  import Avatar from '../components/Avatar'

  export default {
    components: {Avatar},
    mixins: [userMixin],
    data () {
      return {
        hasChanges: false,
        isSavingChanges: false,
        userData: null,
        errors: {},
        settings: null
      }
    },
    computed: {
      label () {
        if (this.userData?.name) {
          return this.userData.name
        } else if (this.userData?.email) {
          return rsplit(this.userData.email, '@')[0]
        } else {
          return ''
        }
      }
    },
    methods: {
      async loadSettings () {
        this.settings = await getSettings()
      },
      errorMessages () {
        return formatErrors(this.errors)
      },
      async saveChanges () {
        this.isSavingChanges = true
        try {
          await updateUser(this.user.pk, this.userData)
        } catch (e) {
          this.errors = e.errors
        } finally {
          this.isSavingChanges = false
        }
      }
    },
    async created () {
      await this.loadSettings()
    },
    watch: {
      user: {
        immediate: true,
        handler (user) {
          this.userData = {...user}
        }
      },
      userData: {
        deep: true,
        handler (newUserData, oldUserData) {
          this.hasChanges = oldUserData !== null && JSON.stringify(newUserData) !== JSON.stringify(this.user)
        }
      }
    }
  }
</script>

<style lang="scss">
    .profile-page hr {
        max-width: 75%;
        margin-left: auto;
        margin-right: auto;
    }
</style>
