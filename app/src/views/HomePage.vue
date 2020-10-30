<template>
    <div class="container">
        <section class="section">
            <h1 class="title is-1">Your Boards</h1>

            <div class="grid">
                <div class="board-preview box is-adder">
                    <b-button @click="enableNewBoardEditor" v-if="!enableAdd" type="is-light"
                              accesskey="a" icon-left="plus" title="Create Board" rounded
                              size="is-large"/>
                    <form style="display: flex; flex-direction: column; align-items: center"
                          @submit.prevent="doCreateBoard" v-if="enableAdd">
                        <b-field>
                            <b-field label="Board name" label-position="inside">
                                <b-input v-model="newBoardName" :disabled="isCreating"
                                         ref="boardName"/>
                            </b-field>
                        </b-field>
                        <b-field>
                            <b-button label="Create Board" type="is-primary" native-type="submit"
                                      :disabled="isCreating" :loading="isCreating"/>
                        </b-field>
                    </form>
                </div>
                <BoardPreview :board="board" v-for="board in boards" :key="board.pk"/>
            </div>
        </section>
    </div>
</template>

<script>
  import { createBoard, userBoardsMixin, userMixin } from '../api'
  import BoardPreview from '../components/BoardPreview'

  export default {
    components: {BoardPreview},
    mixins: [userMixin, userBoardsMixin],
    metaInfo: {
      title: 'Your Boards'
    },
    data () {
      return {
        enableAdd: false,
        newBoardName: '',
        isCreating: false
      }
    },
    methods: {
      async enableNewBoardEditor () {
        this.enableAdd = true
        await this.$nextTick()
        this.$refs.boardName.focus()
      },
      async doCreateBoard () {
        try {
          this.isCreating = true
          const newBoard = await createBoard({
            title: this.newBoardName,
            memberships: [
              {
                user: this.user.url,
                is_owner: true,
                can_modify: true
              }
            ]
          })
          this.boards.unshift(newBoard)
          this.$router.push({name: 'board-detail', params: {token: newBoard.pk}})
        } catch (e) {
          // TODO: error handling
        } finally {
          this.isCreating = false
        }
      }
    }
  }
</script>

<style lang="scss">
    .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, 306px);
        grid-auto-rows: 1fr;
        grid-gap: 1.5rem;

        @media (max-width: 767px) {
            grid-template-columns: repeat(auto-fit, minmax(306px, 1fr));
        }
    }
</style>
