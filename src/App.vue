<template>
  <div id="app">
    <!-- <b-button block variant="primary"  v-if="updateExists" @click="refreshApp">
    New version {{$appVersion}} available!
    </b-button> -->
    <!-- <fullscreen :fullscreen.sync="fullscreen" background="#ffffff"> -->
    <b-container fluid class="p-2">
        <!-- <div class="row">
           <div class="col-xs-12"> -->
                <app-header></app-header>
                <router-view></router-view>
            <!-- </div>
        </div> -->
    </b-container>
  </div>
</template>

<script>
import Header from './components/Header.vue'
import update from './components/mixins/update'

export default {
  components: {
    appHeader: Header
  },
  icons: {
    iconfont: 'fa'
  },
  data () {
    return {
      fullscreen: false
    }
  },
  mixins: [update],
  methods: {
    toggle () {
      this.fullscreen = !this.fullscreen
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  /* This disables pull-to-refresh in chrome  */
  overscroll-behavior: none;
}
#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
