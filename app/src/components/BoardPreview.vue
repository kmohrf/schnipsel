<template>
    <router-link class="box board-preview"
                 :to="{ name: 'board-detail', params: { token: board.pk } }">
        <p class="title">{{ board.title }}</p>
        <p class="subtitle has-text-grey">{{ board.description }}</p>
    </router-link>
</template>

<script>
  export default {
    props: {
      board: {
        type: Object,
        required: true
      }
    }
  }
</script>

<style>
    .board-preview {
        min-height: 150px;
        margin: 0 !important;
    }
</style>
