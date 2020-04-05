<template>
    <nav class="navbar is-light has-shadow is-dark is-fixed-top" role="navigation"
         aria-label="main navigation" v-if="isNavbarVisible">
        <div class="navbar-brand">
            <router-link :to="{ name: 'home' }" class="navbar-item">
                <div class="image">
                    <img src="/favicon.svg" alt="" style="width: auto; margin-right: .5rem">
                </div>
                <strong>Schnipsel</strong>
            </router-link>
            <a role="button" class="navbar-burger" aria-label="menu" :aria-expanded="isMenuOpen"
               @click.prevent.stop="isMenuOpen = !isMenuOpen" :class="{ 'is-active': isMenuOpen }">
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
            </a>
        </div>

        <div class="navbar-menu" :class="{ 'is-active': isMenuOpen }"
             v-on-click-outside="() => { isMenuOpen = false }">
            <div class="navbar-start">
                <div class="navbar-item has-dropdown is-hidden-mobile" v-if="boards.length > 0"
                     :class="{ 'is-active': isBoardMenuOpen }">
                    <a class="navbar-link" role="button"
                       @click.prevent="isBoardMenuOpen = true">
                        Your Boards
                    </a>

                    <div class="navbar-dropdown"
                         v-on-click-outside="() => { isBoardMenuOpen = false }">
                        <router-link :to="{ name: 'board-detail', params: { token: board.pk } }"
                                     class="navbar-item" @click.native="isBoardMenuOpen = false"
                                     v-for="board in boards" :key="board.pk">
                            {{ board.title }}
                        </router-link>
                    </div>
                </div>
            </div>

            <div class="navbar-end">
                <div class="navbar-item has-dropdown" :class="{ 'is-active': isUserMenuOpen }">
                    <a role="button" class="navbar-link" @click.prevent="isUserMenuOpen = true">
                        <ProfileBadge :user="user"/>
                    </a>

                    <div class="navbar-dropdown"
                         v-on-click-outside="() => { isUserMenuOpen = false }"
                         @click="() => { isUserMenuOpen = false; isMenuOpen = false }">
                        <router-link :to="{ name: 'profile' }" class="navbar-item">
                            <b-icon icon="user" size="is-small"/>
                            <span>Your Profile</span>
                        </router-link>
                        <a class="navbar-item" @click.prevent="doLogout">
                            <b-icon icon="logout" size="is-small"/>
                            <span>Logout</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </nav>
</template>

<script>
  import { logout, userMixin, userBoardsMixin } from '../api'
  import ProfileBadge from './ProfileBadge'

  export default {
    components: {ProfileBadge},
    mixins: [userMixin, userBoardsMixin],
    data () {
      return {
        isBoardMenuOpen: false,
        isUserMenuOpen: false,
        isMenuOpen: false
      }
    },
    computed: {
      isNavbarVisible () {
        return this.user !== null && this.$route.name !== 'hello'
      }
    },
    methods: {
      async doLogout () {
        await logout()
        this.$router.push({name: 'hello'})
      },
      close () {
        console.log('close')
        this.isBoardMenuOpen = false
        this.isUserMenuOpen = false
        this.isMenuOpen = false
      }
    },
    watch: {
      isNavbarVisible: {
        immediate: true,
        handler (isNavbarVisible) {
          document.body.classList.toggle('has-navbar-fixed-top', isNavbarVisible)
        }
      }
    }
  }
</script>

<style lang="scss">
    .navbar-item,
    .navbar-link {
        border: none;
        outline: none;

        .icon {
            margin-right: .5em;
        }
    }
</style>
