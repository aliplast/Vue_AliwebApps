<template>
  <div>
    <div class="d-flex justify-content-center align-items-center container">
      <!-- Login geslaagd -->
      <div v-if="loginSuccessful" class="mt-4">
        <p class="text-left">{{ $t("home.welcome") }}, {{loggedinuser}}</p>
        <p class="text-left">{{ $t("home.chooseappl") }}</p>
      </div>
    </div>
    <div class="d-flex justify-content-center align-items-center container">
      <!-- Login todo -->
      <div class="row" v-if="!loginSuccessful">
        <form>
          <div class="form-group mt-4">
            <h4>{{ $t("home.signin") }}</h4>
          <!--  <b-badge variant="success">{{ $t("home.9999") }}</b-badge> -->
          </div>
          <!-- <b-alert show variant="danger" v-if="loginError!=''">{{ loginError }}</b-alert> -->
          <div class="form-group">
            <b-form-input
              type="password"
              class="form-control"
              id="badgenr"
              ref="badgenr"
              :state="errorstate"
              :placeholder="displaytext"
              v-model="badgenr"
              v-on:keyup.enter="onSubmit"
            />
          </div>
          <b-button block variant="primary"
          @click.prevent="onSubmit">{{ $t("home.btnsignin") }} <b-spinner v-if="this.loading" small></b-spinner></b-button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
export default {
  data () {
    return {
      badgenr: '',
      loading: false,
      displaytext: this.$t('home.scan'),
      errorstate: null
    }
  },
  computed: {
    ...mapState(['loginError', 'loginSuccessful', 'loggedinuser', 'test', 'prtlab', 'prtdoc'])
  },
  // mounted () {
  //   this.$nextTick(() => {
  //     this.badgenr = ''
  //     // this.$refs.badgenr.focus()
  //   })
  // },
  methods: {
    ...mapActions(['login']),
    onSubmit () {
      // this.errorstate = null
      this.loading = true
      this.login({
        id: this.badgenr
      })
        .then(() => {
          if (!this.loginSuccessful) {
            this.errorstate = false
            this.badgenr = ''
            this.displaytext = this.$t('home.badgenotfound')
            this.$refs.badgenr.focus()
          } else {
            this.errorstate = true
          }
        })
        .catch(error => console.log(error))
        // .finally(() => (this.loading = this.Vue.prototype.$loading))
      this.loading = this.Vue.prototype.$loading
    }
  }
}
</script>

<style>
.form-inline .form-group {
  margin-right: 4px;
}
.form-inline .form-group .control-label {
  margin-right: 4px;
}
.vdivider {
  margin-top: 25;
  margin-bottom: 25px;
}
</style>
