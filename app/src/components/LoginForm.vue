<template>
    <form class="box" @submit.prevent="doAction">
        <b-field label="Username" v-bind="errorMessages.username">
            <b-input icon="user" v-model="username" ref="username"/>
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
            <b-field label="Email" v-bind="errorMessages.email">
                <b-input type="email" icon="mail" v-model="email"/>
            </b-field>
        </template>

        <div v-if="loginFailed" class="notification is-danger">
            Username or password was wrong.
        </div>

        <div class="buttons">
            <b-button type="is-text" @click="mode = 'register'" v-if="mode === 'login'">
                Register
            </b-button>

            <b-button native-type="submit" @click="doAction" type="is-primary" icon-left="login"
                      style="margin-left: auto"
                      :disabled="isLoading" :loading="isLoading">
                {{ mode === 'register' ? 'Register' : 'Login' }}
            </b-button>
        </div>
    </form>
</template>

<script>
  import { register, login } from '../api'

  export default {
    data () {
      return {
        username: '',
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
        return Object.fromEntries(
          Object.entries(this.errors)
            .map(([field, errors]) => [field, {
              message: errors.join('\n\n'),
              type: 'is-danger'
            }])
            .concat(
              this.password === this.passwordRepeat
                ? []
                : [
                  ['passwordRepeat', {
                    message: 'Not equal with password',
                    type: 'is-danger'
                  }]
                ])
        )
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
          const {username, password, email} = this
          await register({
            username, password, email
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
        if (await login(this.username, this.password)) {
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
          this.$refs.username.focus()
        })
      }
    }
  }
</script>
