<template>
    <div id="app">
        <Navbar/>
        <router-view :key="routerViewKey"/>
    </div>
</template>

<script>
  import Navbar from './components/Navbar'
  import { shouldLogin } from './api'

  export default {
    components: {Navbar},
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

<style lang="scss">
    .is-adder {
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;

        > .button {
            width: 3em;
            height: 3em;
        }
    }
</style>
