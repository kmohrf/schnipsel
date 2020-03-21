<template>
    <section class="hero is-info is-fullheight">
        <div class="hero-body">
            <div class="container">
                <div class="columns hello-page">
                    <div class="column is-5-widescreen is-6-desktop is-8-tablet">
                        <h1 class="title is-1">
                            Hi there!
                        </h1>
                        <h2 class="subtitle">
                            This is Schnipsel - a digital sticky note board
                        </h2>

                        <div class="content">
                            <p>
                                Login to create your own boards.
                            </p>
                        </div>
                    </div>
                    <div class="column is-1 has-border is-hidden-mobile"></div>
                    <div class="column is-3-widescreen is-4-desktop is-3-tablet">
                        <LoginForm/>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
    import LoginForm from '../components/LoginForm'

    export default {
      components: {
        LoginForm
      }
    }
</script>

<style>
    .column.has-border {
        border-left: 1px solid rgba(255, 255, 255, 0.25);
    }

    @media (min-width: 800px) {
        .hello-page .column {
            min-height: 350px;
        }
    }
</style>
