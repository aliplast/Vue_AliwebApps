<template>
  <div>
    <auto-logout v-if="loginSuccessful"></auto-logout>
    <b-navbar variant="light">
        <b-link v-if="loginSuccessful">
             <b-avatar size="2em" :variant="companycolor" button @click="onClick()">{{activecompany}}</b-avatar>
          </b-link>
      <b-navbar-nav>
        <b-nav-item>
          <b-link v-if="!loginSuccessful"><b-badge>{{$appVersion}}</b-badge></b-link>
        </b-nav-item>
        <b-nav-item v-if="mnuextrusion">
          <b-link v-if="loginSuccessful" active-class="active" to="/extrusion" @click="changecompany('Extrusion')">{{ $t("header.extrusion") }}</b-link>
        </b-nav-item>
        <b-nav-item v-if="mnusystems">
          <b-link v-if="loginSuccessful" active-class="active" to="/systems" @click="changecompany('Systems')">{{ $t("header.systems") }}</b-link>
        </b-nav-item>
      </b-navbar-nav>
      <b-navbar-nav class="ml-auto">
        <b-nav-item disabled >{{loggedinuser}}</b-nav-item>
        <!-- <b-nav-item>
          <b-form-select v-model="$i18n.locale" size="sm" class="mb-0">
            <b-form-select-option value="nl">NL</b-form-select-option>
            <b-form-select-option value="en">EN</b-form-select-option>
          </b-form-select>
        </b-nav-item> -->
      </b-navbar-nav>
    </b-navbar>
      <!--
      <b-toast id="toast" variant="info" title="Settings">
      <span>Env: {{activecompany}} - Test: {{test}}
      <br>Email: {{supervisor}}
      <br>Lastlogin: {{ lastlogin | moment("D/MM/YYYY HH:mm") }}
      <br>PrtLab: {{prtlab}}
      <br>PrtDoc: {{prtdoc}}
      </span>
      </b-toast>
      -->
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
export default {
  data () {
    return {
      version: process.env.VUE_APP_VERSION,
      // company: 'AL',
      avatarcolor: 'light'
      // env: process.env.VUE_APP_COMPANY
    }
  },
  computed: {
    ...mapState(['loginError', 'loginSuccessful', 'loggedinuser', 'test', 'lastlogin', 'activecompany', 'supervisor', 'defworkcenter', 'prtlab', 'prtdoc', 'mnuextrusion', 'mnusystems']),
    companycolor: function () {
      return this.avatarcolor
    }
  },
  methods: {
    ...mapActions(['logout']),
    onClick () {
      this.logout()
    },
    changecompany (pcompany) {
      if (pcompany === 'Systems') {
        this.avatarcolor = 'primary'
        if (this.test === true) {
          this.$store.commit('changeactivecompany', process.env.VUE_APP_COMPANYUAC)
          return process.env.VUE_APP_COMPANYUAC
        } else {
          this.$store.commit('changeactivecompany', process.env.VUE_APP_COMPANY)
          return process.env.VUE_APP_COMPANY
        }
      } else {
        this.avatarcolor = 'danger'
        if (this.test === true) {
          this.$store.commit('changeactivecompany', process.env.VUE_APP_COMPANYEXUAC)
          return process.env.VUE_APP_COMPANYEXUAC
        } else {
          this.$store.commit('changeactivecompany', process.env.VUE_APP_COMPANYEX)
          return process.env.VUE_APP_COMPANYEX
        }
      }
    }
  }
}
</script>

<style>
.active {
    color: #28a745;
  }
</style>
