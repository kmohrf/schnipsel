<template>
    <div id="app">
        <Navbar/>
        <router-view :key="routerViewKey"/>
        <UpdateNotification/>
    </div>
</template>

<script>
  import Navbar from './components/Navbar'
  import UpdateNotification from './components/UpdateNotification'
  import { shouldLogin } from './api'

  export default {
    components: {Navbar, UpdateNotification},
    metaInfo: {
      title: '',
      titleTemplate (title) {
        return title ? `${title} | Schnipsel` : 'Schnipsel'
      }
    },
    computed: {
      routerViewKey () {
        return this.$route.fullPath.split('#')[0]
      }
    },
    async created () {
      if (this.$route.name !== 'hello' && await shouldLogin()) {
        this.$router.replace({name: 'hello'})
      }
    }
  }
</script>
