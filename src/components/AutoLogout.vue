<template>
    <div v-if="warningZone">
        <b-alert show variant="danger">Sessie wordt beëindigd binnen {{warningtimer}} minuten...</b-alert>
    </div>
</template>

<script>
import { mapActions } from 'vuex'
export default {
  name: 'AutoLogout',

  data: function () {
    return {
      events: ['click', 'mousemove', 'mousedown', 'scroll', 'keypress', 'load'],

      warningTimer: null,
      logoutTimer: null,
      warningZone: false,
      warningtimer: process.env.VUE_APP_WARNING
    }
  },
  mounted () {
    this.events.forEach(function (event) {
      window.addEventListener(event, this.resetTimer)
    }, this)
    this.setTimers()
  },
  destroyed () {
    this.events.forEach(function (event) {
      window.removeEventListener(event, this.resetTimer)
    }, this)
    this.resetTimer()
  },

  methods: {
    ...mapActions(['logout']),
    setTimers: function () {
      this.warningTimer = setTimeout(this.warningMessage, process.env.VUE_APP_WARNING * 60 * 1000)
      this.logoutTimer = setTimeout(this.logoutUser, process.env.VUE_APP_LOGOUT * 60 * 1000)
      this.warningZone = false
    },
    warningMessage: function () {
      this.warningZone = true
    },
    logoutUser: function () {
      this.logout()
    },
    resetTimer: function () {
      clearTimeout(this.warningTimer)
      clearTimeout(this.logoutTimer)
      this.setTimers()
    }
  }

}
</script>

<style scoped>

</style>
