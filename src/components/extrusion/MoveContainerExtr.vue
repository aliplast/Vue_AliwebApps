<template>
  <div>
    <form>
      <b-container fluid class="p-0">
        <b-row>
          <b-col cols="12">
            <div v-bind:class="getClass()">
              <h2>
                {{ $t("movecontainerextr.title") }} {{info}}
                <h6>{{feedback}}</h6>
              </h2>
            </div>
          </b-col>
        </b-row>
        <div class="vdivider" />
        <b-row>
          <b-col cols="12">
            <!-- Container -->
            <b-form-input
              @focus="$event.target.select()"
              id="container"
              ref="container"
              type="text"
              @input="$v.container.$touch()"
              v-model="container"
              :placeholder= "$t('movecontainerextr.scancontainer')"
              v-on:keyup.enter="movetonextcontrol"
            />
          </b-col>
        </b-row>
        <div class="vdivider" />
        <b-row>
          <b-col cols="9">
            <!-- Location -->
            <b-form-input
              @focus="$event.target.select()"
              id="location"
              ref="location"
              type="text"
              @input="$v.location.$touch()"
              v-model="location"
              :placeholder= "$t('movecontainerextr.scanlocation')"
              v-on:keyup.enter="executesql"
            />
          </b-col>
          <b-col cols="3">
            <b-button block
              variant="primary"
              @click="executesql"
              :disabled="$v.$error"
            ><b-icon icon="plus-circle"></b-icon></b-button>
          </b-col>
        </b-row>
      </b-container>
    </form>
  </div>
</template>

<script>
import { beep } from '../systems/beep'
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
      location: '',
      feedback: '',
      message: '',
      info: '',
      userinfo: '',
      errorfound: false
    }
  },
  computed: {
    ...mapState(['loginError', 'loginSuccessful', 'loggedinuser', 'test', 'supervisor', 'activecompany']),
    containerlen: function () {
      if (this.container) {
        return this.container.length
      }
      return ''
    },
    locationlen: function () {
      if (this.location) {
        return this.location.length
      }
      return ''
    }
  },
  mixins: [beep],
  validations: {
    container: { required },
    location: { required }
  },
  watch: {
    container: function (v) {
      this.container = v.toUpperCase().trim()
      this.info = this.container
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
      this.location = ''
      this.$refs.location.focus()
    },
    movetofirstcontrol: function (event) {
      this.container = ''
      this.$refs.container.focus()
    },
    getClass () {
      if (this.errorfound) {
        return 'bg-danger text-white'
      } else {
        return 'bg-success text-white'
      }
    },
    executesql () {
      this.message = ''
      if (this.loggedinuser !== '' && this.loginSuccessful === true) {
        // Move location
        if (this.containerlen <= 13 && this.locationlen <= 7) {
          if (this.container !== '' && this.location !== '') {
            NProgress.start()
            this.errorfound = false
            this.feedback = this.$t('general.busy')
            axios
              .post(
                '/MoveLocationExtrusion?company=' +
                  this.activecompany +
                  '&container=' +
                  this.container +
                  '&location=' +
                  this.location +
                  '&user=' +
                  this.loggedinuser
              )
              .then(response => {
                NProgress.done()
                this.feedback = response.data + ' ' + this.location
                if (!this.feedback.startsWith('OK')) {
                  this.playSound(true)
                  this.errorfound = true
                  this.movetofirstcontrol()
                } else {
                  this.playSound(false)
                  this.errorfound = false
                  this.info = this.container
                  this.location = ''
                  this.level = ''
                  this.movetofirstcontrol()
                }
              })
              .catch(error => {
                NProgress.done()
                this.playSound(true)
                this.errorfound = true
                this.feedback = error.message
                this.location = ''
                this.level = ''
                this.movetofirstcontrol()
              })
          } else {
            this.errorfound = true
            this.feedback = this.$t('general.waiting')
            if (this.container === '') {
              this.movetofirstcontrol()
            } else {
              this.$refs.location.focus()
            }
          }
        } else {
          this.errorfound = true
          this.feedback =
            this.$t('general.incorrectformat') +
            this.containerlen +
            '/' +
            this.locationlen
          if (this.container === '') {
            this.movetofirstcontrol()
          } else {
            this.$refs.location.focus()
          }
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
