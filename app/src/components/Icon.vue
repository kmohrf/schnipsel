<template>
    <component :is="iconComponent" :size="size"/>
</template>

<script>
  import {
    ChevronLeftIcon,
    ChevronRightIcon,
    EyeIcon,
    EyeOffIcon,
    KeyIcon,
    SaveIcon,
    LogInIcon,
    LogOutIcon,
    MailIcon,
    UserIcon,
    SettingsIcon,
    PlusIcon,
    EditIcon,
    Trash2Icon,
    RefreshCwIcon,
    UploadIcon
  } from 'vue-feather-icons'

  export default {
    props: {
      icon: {
        type: [Array, String],
        required: true
      },
      size: String
    },
    computed: {
      iconComponent () {
        return {
          'chevron-left': ChevronLeftIcon,
          'chevron-right': ChevronRightIcon,
          'key': KeyIcon,
          'mail': MailIcon,
          'user': UserIcon,
          'settings': SettingsIcon,
          'login': LogInIcon,
          'logout': LogOutIcon,
          'eye': EyeIcon,
          'eye-off': EyeOffIcon,
          'save': SaveIcon,
          'plus': PlusIcon,
          'edit': EditIcon,
          'delete': Trash2Icon,
          'refresh': RefreshCwIcon,
          'upload': UploadIcon
        }[Array.isArray(this.icon) ? this.icon[1] : this.icon]
      }
    }
  }
</script>

<style>
    .icon svg {
        fill: none;
        background-color: transparent;
        stroke-width: 2;
        width: unset;
        height: unset;
    }
</style>
