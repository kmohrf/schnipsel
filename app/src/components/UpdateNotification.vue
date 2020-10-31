<template>
  <div class="updater notification" v-if="isAppUpdateAvailable">
    <p>An update is available.</p>
    <b-button type="is-primary" @click="updateApp" :loading="isAppUpdateInProgress">Reload Now</b-button>
  </div>
</template>

<script>
  import { appUpdateMixin } from '@/update'

  export default {
    mixins: [appUpdateMixin],
  }
</script>

<style lang="scss">
  .updater {
    position: fixed;
    z-index: 20000;
    bottom: 1rem;
    right: 1rem;

    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: nowrap;

    padding: 1.25rem 1.5rem;
    min-width: 400px;
    box-shadow: 0 12px 17px 2px rgba(0, 0, 0, 0.14), 0 5px 22px 4px rgba(0, 0, 0, 0.12), 0 7px 8px -4px rgba(0, 0, 0, 0.20);

    @media (max-width: 600px) {
      left: 1rem;
      right: 1rem;
      min-width: auto;
    }

    button {
      margin: 0 0 0 2rem !important;
    }
  }
</style>
