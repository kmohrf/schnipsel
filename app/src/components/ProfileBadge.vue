<template>
    <span class="profile-badge is-flex">
        <span class="image">
            <img class="is-rounded" :src="user.avatar" alt="" height="128" width="128">
        </span>
        <strong>{{ user.label }}</strong>
    </span>
</template>

<script>
  export default {
    props: {
      user: {
        type: Object,
        required: true
      }
    }
  }
</script>

<style lang="scss">
    .profile-badge {
        align-items: center;
        min-width: 5em;
    }

    .profile-badge > .image {
        margin-right: .5em;
        height: 1.75em;
        width: 1.75em;
        flex: 0 0 auto;
    }

    .profile-badge > strong {
        overflow: hidden;
        text-overflow: ellipsis;
    }
</style>
