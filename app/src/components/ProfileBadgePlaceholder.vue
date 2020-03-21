<template>
    <ProfileBadge :user="user"/>
</template>

<script>
  import ProfileBadge from './ProfileBadge'
  import portraitPlaceholder from '../assets/portrait-placeholder.png'

  export default {
    components: {ProfileBadge},
    data () {
      return {
        user: {
          label: 'Loading...',
          avatar: portraitPlaceholder
        }
      }
    }
  }
</script>
