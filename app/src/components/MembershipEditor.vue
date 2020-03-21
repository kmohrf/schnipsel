<template>
    <div class="membership box">
        <b-loading :active="true" :is-full-page="false" v-if="!user"/>
        <button class="delete is-pulled-right" @click="$emit('remove')"
                v-if="allowRemove"></button>
        <b-field style="margin-bottom: 1.5rem">
            <div class="is-size-4">
                <ProfileBadge :user="user" v-if="user"/>
                <ProfileBadgePlaceholder v-else/>
            </div>
        </b-field>
        <b-field grouped>
            <b-field style="margin-bottom: 0">
                <b-switch v-model="membership.can_modify"
                          :disabled="membership.is_owner">Allow changes
                </b-switch>
            </b-field>
            <b-field style="margin-bottom: 0">
                <b-switch v-model="membership.is_owner"
                          :disabled="membership.is_owner && !canDisableOwner">Is Owner
                </b-switch>
            </b-field>
        </b-field>
    </div>
</template>

<script>
  import ProfileBadge from './ProfileBadge'
  import ProfileBadgePlaceholder from './ProfileBadgePlaceholder'
  import { getUser } from '../api'

  export default {
    components: {ProfileBadgePlaceholder, ProfileBadge},
    props: {
      membership: {
        type: Object,
        required: true
      },
      canDisableOwner: Boolean,
      canRemove: Boolean
    },
    computed: {
      allowRemove () {
        if (!this.canRemove) {
          return false
        } else {
          return !(!this.canDisableOwner && this.membership.is_owner)
        }
      }
    },
    model: {
      prop: 'membership'
    },
    data () {
      return {
        user: null
      }
    },
    watch: {
      membership (membership) {
        this.$emit('input', {...membership})
      }
    },
    async created () {
      this.user = await getUser(this.membership.user)
    }
  }
</script>

<style>
    .membership {
        position: relative;
        margin-bottom: 0 !important;
        min-height: 135px;
    }
</style>
