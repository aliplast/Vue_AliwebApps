<template>
  <div>
    <form>
      <b-container fluid class="p-0">
        <b-row>
          <b-col cols="12">
            <div v-bind:class="getClass()">
              <h2>
                {{ $t("linkcontainer.title") }} {{info}}
                <h6>{{feedback}}</h6>
              </h2>
            </div>
          </b-col>
        </b-row>
        <div class="vdivider" />
        <b-row>
          <b-col cols="9">
            <!-- container -->
            <b-form-input
              @focus="$event.target.select()"
              id="container"
              ref="container"
              type="text"
              @input="$v.container.$touch()"
              v-model="container"
              :placeholder="this.$t('general.scancontainer')"
              v-on:keyup.enter="getdetails"
            />
          </b-col>
          <b-col cols="3">
            <b-button block v-b-tooltip.hover :title="this.$t('general.reset')" variant="secondary"
              type="button"
              @click.prevent="cancel"
            ><b-icon icon="life-preserver"></b-icon></b-button>
          </b-col>
        </b-row>
        <div class="vdivider" />
        <b-row>
          <b-col cols="9">
            <!-- real -->
            <b-form-input
              @focus="$event.target.select()"
              id="real"
              ref="real"
              type="number"
              @input="$v.real.$touch()"
              v-model="real"
              :placeholder="this.$t('general.scanreal')"
              v-on:keyup.enter="linkcontainer"
            />
          </b-col>
          <b-col cols="3">
            <b-button block v-b-tooltip.hover :title="this.$t('linkcontainer.link')" variant="success"
              @click.prevent="linkcontainer"
            ><b-icon icon="link" scale="2"></b-icon></b-button>
          </b-col>
        </b-row>
        <div class="vdivider" />
      </b-container>
    </form>
  </div>
</template>

<script>
import { beep } from './beep'
import { required } from 'vuelidate/lib/validators'
import { mapState } from 'vuex'
import axios from 'axios'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

export default {
  data () {
    return {
      // company: process.env.VUE_APP_COMPANY,
      container: '',
      real: '',
      feedback: '',
      message: '',
      info: '',
      userinfo: '',
      errorfound: false
    }
  },
  computed: {
    ...mapState(['loginError', 'loginSuccessful', 'loggedinuser', 'test']),
    company: function () {
      if (this.test === true) {
        return process.env.VUE_APP_COMPANYUAC
      } else {
        return process.env.VUE_APP_COMPANY
      }
    }
  },
  mixins: [beep],
  validations: {
    container: { required },
    real: { required }
  },
  watch: {
    container: function (v) {
      this.container = v.toUpperCase().trim()
    },
    real: function (v) {
      this.real = v.toUpperCase().trim()
    }
  },
  mounted () {
    this.$nextTick(() => {
      if (this.loginSuccessful === false) {
        this.$router.push('/')
      } else {
        this.container = ''
        this.$refs.container.focus()
        this.feedback = this.$t('general.waiting')
      }
    })
  },
  methods: {
    movetonextcontrol: function (event) {
      this.$refs.real.focus()
    },
    movetofirstcontrol: function (event) {
      this.$refs.container.focus()
    },
    cancel: function (event) {
      this.errorfound = false
      this.feedback = this.$t('general.waiting')
      this.container = ''
      this.real = ''
      this.$refs.container.focus()
    },
    getClass () {
      if (this.errorfound) {
        return 'bg-danger text-white'
      } else {
        return 'bg-success text-white'
      }
    },
    getdetails () {
      this.retval = ''
      this.feedback = ''
      this.info = ''
      this.real = ''
      if (this.loggedinuser !== '' && this.loginSuccessful === true) {
        if (this.container !== '') {
          this.errorfound = false
          this.feedback = this.$t('general.busy')
          NProgress.start()
          axios
            .get(
              '/GetInfoByContainerOrReal?company=' +
                this.company +
                '&container=' +
                this.container
            )
            .then(res => {
              const data = res.data
              const resultArray = []
              for (let key in data) {
                resultArray.push(data[key])
              }
              if (!resultArray.length) {
                this.playSound(true)
                this.errorfound = true
                this.feedback = this.container + ' ' + this.$t('general.notfound')
                this.$refs.container.focus()
                this.$refs.container.select()
              } else {
                this.playSound(false)
                this.real = resultArray[0].Real
                this.$refs.real.focus()
                this.$refs.real.select()
              }
            })
            .catch(error => {
              this.playSound(true)
              this.errorfound = true
              this.feedback = error.message
              this.container = ''
              this.$refs.container.focus()
            })
            .finally(() => (NProgress.done()))
        } else {
          this.errorfound = true
          this.feedback = this.$t('general.waiting')
          this.$refs.container.focus()
        }
      } else {
        this.errorfound = true
        this.feedback = this.$t('general.login')
        this.$router.push('/')
      }
    },
    linkcontainer () {
      this.message = ''
      if (this.loggedinuser !== '' && this.loginSuccessful === true) {
        if (this.container !== '' & this.real !== '') {
          NProgress.start()
          this.errorfound = false
          axios
            .post(
              '/LinkContainer?company=' +
                  this.company +
                  '&real=' +
                  this.real +
                  '&container=' +
                  this.container +
                  '&user=' + this.loggedinuser.substring(0, 25)
            )
            .then(response => {
              if (response.status === 200) {
                this.errorfound = false
                this.playSound(false)
                this.cancel()
              } else {
                this.errorfound = true
                this.playSound(true)
              }
              this.feedback = response.data
            })
            .catch(error => {
              this.playSound(true)
              this.errorfound = true
              this.feedback = error.response.data
            })
            .finally(() => (NProgress.done()))
        } else {
          this.errorfound = true
          this.feedback = this.$t('general.waiting')
          this.$refs.container.focus()
        }
      } else {
        this.errorfound = true
        this.feedback = this.$t('general.login')
        this.$router.push('/')
      }
    }
  }
}
</script>

<style>
.vdivider {
  margin-top: 10px;
  margin-bottom: 10px;
}
</style>
