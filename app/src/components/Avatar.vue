<template>
    <div class="avatar" :style="{ 'background-image': `url('${avatar}')`}"
         :class="{ 'is-dragging': isDragging }"
         @drop.prevent.stop="setNewAvatar($event.dataTransfer.files)"
         @dragenter.prevent.stop="isDragging = true"
         @dragover.prevent.stop="isDragging = true"
         @dragleave.prevent.stop="isDragging = false">
        <label role="button" title="Change Avatar" v-if="editable">
            <b-icon icon="upload" size="is-large"/>
            <input type="file" @change="setNewAvatar($event.target.files)" accept="image/*">
        </label>
    </div>
</template>

<script>
  import { readFiles } from '../util'

  export default {
    props: {
      avatar: {
        type: String,
        required: true
      },
      editable: Boolean
    },
    data () {
      return {
        isDragging: false
      }
    },
    model: {
      prop: 'avatar'
    },
    methods: {
      async setNewAvatar (files) {
        if (this.editable) {
          this.$emit('input', (await readFiles(files).next()).value)
        }
        this.isDragging = false
      }
    }
  }
</script>

<style lang="scss">
    $border-width: 2px;

    .avatar {
        width: 128px;
        height: 128px;
        background-color: white;
        background-size: cover;
        background-position: 50% 50%;
        background-repeat: no-repeat;
        border-radius: 50%;
        display: block;
        margin: 0 auto .5rem;
        position: relative;
        border: $border-width solid white;
        background-clip: padding-box;

        &.is-dragging {
            border: solid $border-width transparent;

            &:after {
                content: '';
                position: absolute;
                top: 0;
                right: 0;
                bottom: 0;
                left: 0;
                z-index: -1;
                margin: -$border-width;
                border-radius: inherit;
                background: linear-gradient(to right, yellow, green, cyan, blue, violet);
                animation: rotate-self infinite 2s linear;
                filter: blur(5px);
            }
        }

        > label {
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            background: rgba(0, 0, 0, 0.35);
            opacity: 0;
            pointer-events: none;
            transition: opacity .2s;
            backdrop-filter: blur(2px);
            border-radius: 50%;
        }

        &:hover > label {
            opacity: 1;
            pointer-events: all;
        }

        input[type="file"] {
            opacity: 0;
            height: 0;
            width: 0;
            overflow: hidden;
            pointer-events: none;
            border: none;
        }
    }

    @keyframes rotate-self {
        from {
            transform: rotate(0deg)
        }
        to {
            transform: rotate(360deg);
        }
    }
</style>
