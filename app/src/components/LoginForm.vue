<template>
    <form class="box" @submit.prevent="doAction">
        <b-field label="Email" v-bind="errorMessages.email">
            <b-input type="email" icon="user" v-model="email" ref="email"/>
        </b-field>
        <b-field label="Password" v-bind="errorMessages.password">
            <b-input type="password" icon="key" v-model="password"
                     :password-reveal="Boolean(password)"/>
        </b-field>
        <template v-if="mode === 'register'">
            <b-field label="Password (repeat)" v-bind="errorMessages.passwordRepeat">
                <b-input type="password" icon="key" v-model="passwordRepeat"
                         :password-reveal="Boolean(passwordRepeat)"/>
            </b-field>
        </template>

        <div v-if="loginFailed" class="notification is-danger">
            Email or password was wrong.
        </div>

        <div class="buttons">
            <b-button native-type="submit" @click="doAction" type="is-primary" icon-left="login"
                      style="margin-left: auto; margin-right: 0; order: 10"
                      :disabled="isLoading" :loading="isLoading">
              {{ mode === 'register' ? 'Register' : 'Login' }}
            </b-button>

            <b-button type="is-text" @click="mode = 'register'" v-if="mode === 'login'">
                Register
            </b-button>
            <b-button type="is-text" @click="mode = 'login'" v-else>
                Login
            </b-button>
        </div>
    </form>
</template>

<script>
  import { register, login } from '../api'
  import { formatErrors } from '../util'

  export default {
    data () {
      return {
        password: '',
        passwordRepeat: '',
        email: '',
        loginFailed: false,
        mode: 'login',
        errors: {},
        isLoading: false
      }
    },
    computed: {
      errorMessages () {
        const messages = formatErrors(this.errors)
        if (this.password !== this.passwordRepeat) {
          messages.passwordRepeat = {
            message: 'Not equal with password',
            type: 'is-danger'
          }
        }
        return messages
      }
    },
    methods: {
      doAction () {
        if (this.mode === 'login') {
          return this.doLogin()
        } else if (this.mode === 'register') {
          return this.doRegister()
        }
      },
      async doRegister () {
        this.isLoading = true
        try {
          const {email, password} = this
          await register({
            email, password
          })
          this.$router.replace({name: 'home'})
        } catch (e) {
          this.errors = e.errors
        } finally {
          this.isLoading = false
        }
      },
      async doLogin () {
        this.isLoading = true
        this.loginFailed = false
        if (await login(this.email, this.password)) {
          this.$router.replace({name: 'home'})
        } else {
          this.loginFailed = true
        }
        this.isLoading = false
      }
    },
    mounted () {
      if (window.innerWidth > 1024) {
        this.$nextTick(() => {
          this.$refs.email.focus()
        })
      }
    }
  }
</script>
