<template>
  <div>
    <b-overlay :show="loading" rounded="sm">
      <form>
        <b-container fluid class="p-0">
          <b-row>
            <b-col cols="12">
              <div v-bind:class="getClass()">
                <h2>
                  {{ $t("pbconfirmation.title") }} {{info}}
                  <h6>{{feedback}}</h6>
                </h2>
              </div>
            </b-col>
          </b-row>
          <div class="vdivider" />
          <b-row>
            <b-col cols="6">
              <!-- Container -->
              <label for="container" class="col-sm-2 col-form-label sr-only">Container</label>
              <b-form-input
                @focus="$event.target.select()"
                id="container"
                ref="container"
                type="text"
                @input="$v.container.$touch()"
                v-model="container"
                :placeholder= "$t('pbconfirmation.scancontainer')"
                v-on:keyup.enter="checkstatus"
              />
            </b-col>
            <b-col cols="6">
              <!-- Real -->
              <label for="real" class="col-sm-2 col-form-label sr-only">Real</label>
              <b-form-input
                @focus="$event.target.select()"
                id="real"
                ref="real"
                type="number"
                @input="$v.real.$touch()"
                v-model.number="real"
                :placeholder= "$t('pbconfirmation.scanreal')"
                v-on:keyup.enter="movetolocation"
              />
            </b-col>
          </b-row>
          <div class="vdivider" />
          <b-row>
            <b-col cols="6">
              <!-- Location -->
              <b-form-input
                @focus="$event.target.select()"
                id="location"
                ref="location"
                type="text"
                @input="$v.location.$touch()"
                v-model="location"
                :placeholder= "$t('pbconfirmation.scanlocation')"
                v-on:keyup.enter="executesql"
              />
            </b-col>
            <b-col cols="3">
              <b-button  v-b-tooltip.hover :title="$t('general.reset')"
                type="button" block
                @click.prevent="resetValues('Values reset')"
              ><b-icon icon="life-preserver"></b-icon></b-button>
            </b-col>
            <b-col cols="3">
              <b-button
                v-b-tooltip.hover :title="$t('general.process')"
                variant="primary" block
                @click.prevent="executesql"
                :disabled="errorfound"
              ><b-icon icon="play-fill"></b-icon></b-button>
            </b-col>
          </b-row>
        </b-container>
      </form>
    </b-overlay>
    </div>
</template>

<script>
import { beep } from '../systems/beep'
import { required } from 'vuelidate/lib/validators'
import { mapState } from 'vuex'
import axios from 'axios'

export default {
  data () {
    return {
      // company: process.env.VUE_APP_COMPANY,
      container: '',
      real: '',
      location: '',
      feedback: '',
      message: '',
      info: '',
      userinfo: '',
      errorfound: false,
      level: '',
      loading: false
    }
  },
  computed: {
    ...mapState(['loginError', 'loginSuccessful', 'loggedinuser', 'test', 'supervisor', 'activecompany']),
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
    real: { required },
    location: { required }
  },
  watch: {
    location: function (v) {
      // this.location = v.toUpperCase().trim()
      this.info = this.location
    },
    container: function (v) {
      this.container = v.toUpperCase().trim()
      this.info = this.container.trim()
    },
    real: function (v) {
      // this.real = v.toUpperCase().trim()
      // check numeric only
      // if (isNaN(this.real)) { this.errorfound = true }
      this.info = this.real
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
    movetocontainer: function (event) {
      this.container = ''
      this.$refs.container.focus()
    },
    movetoreal: function (event) {
      this.real = ''
      this.$refs.real.focus()
    },
    movetolocation: function (event) {
      this.location = ''
      this.$refs.location.focus()
    },
    getClass () {
      if (this.errorfound) {
        return 'bg-danger text-white'
      } else {
        return 'bg-success text-white'
      }
    },
    resetValues (message) {
      this.container = ''
      this.real = ''
      this.location = ''
      this.info = ''
      this.$refs.container.focus()
      this.feedback = message
      this.errorfound = false
    },
    checkstatus () {
      this.feedback = ''
      this.loading = true
      axios
        .post('/CheckPBStatus?company=' + this.activecompany + '&container=' + this.container)
        .then(response => {
          console.log(response.data)
          if (response.data < 60 && response.data !== '') {
            this.movetoreal()
            this.errorfound = false
            this.feedback = this.$t('pbconfirmation.validcontainer')
          } else {
            this.playSound(true)
            this.errorfound = true
            this.feedback = this.$t('pbconfirmation.wrongstatus') + ' ' + response.data
          }
        })
        .catch(error => console.log(error))
        .finally(() => (this.loading = false))
    },
    executesql () {
      if (this.loggedinuser !== '' && this.loginSuccessful === true) {
        if (this.container !== '' && this.container.length < 14 && this.real !== '' && this.location !== '' && this.location.length < 8) {
          this.loading = true
          this.errorfound = false
          this.feedback = this.$t('general.busy')
          axios
            .post(
              '/PBConfirmation?company=' +
                  this.activecompany +
                  '&container=' +
                  this.container +
                  '&location=' +
                  this.location +
                  '&real=' +
                  this.real +
                  '&user=' +
                  this.loggedinuser
            )
            .then(response => {
              this.feedback = response.data
              if (!response.status === 200) {
                this.playSound(true)
                this.errorfound = true
                this.resetValues('Error! ' + response.data)
              } else {
                this.playSound(false)
                this.errorfound = false
                this.info = this.container
                this.resetValues(response.data)
              }
            })
            .catch(error => {
              this.playSound(true)
              this.errorfound = true
              this.resetValues(error.response.data)
            })
            .finally(() => (this.loading = false))
        } else {
          this.errorfound = true
          this.feedback = this.$t('pbconfirmation.wronginput')
          if (this.container === '' || this.container.length > 13) {
            this.movetocontainer()
          } else {
            if (this.real === '' || this.real.length > 12) {
              this.movetoreal()
            } else {
              if (this.location === '' || this.location.length > 7) {
                this.movetolocation()
              }
            }
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
