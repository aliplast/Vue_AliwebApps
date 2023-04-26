<template>
  <div>
    <form>
      <b-container fluid class="p-0">
        <b-row>
          <b-col cols="12">
            <div v-bind:class="getClass()">
              <h2>
                {{ $t("movecontainer.title") }} {{info}}
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
              :placeholder= "$t('movecontainer.scancontainer')"
              v-on:keyup.enter="checkpackpick"
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
              :placeholder= "$t('movecontainer.scanlocation')"
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
        <div class="vdivider" />
        <b-row  v-if="showlevel">
          <b-col cols="12">
            <b-form-radio-group
              v-model="level"
              id="loclevel"
              ref="loclevel"
              :options="options"
              buttons
              button-variant="outline-primary"
              size="lg"
              value-field="item"
              text-field="name"
            ></b-form-radio-group>
          </b-col>
        </b-row>
        <div class="vdivider" />
          <b-row  v-if="showoccupied">
            <b-col cols="12">
              <b-alert show variant="light"> {{occupiedlocations}} </b-alert>
            </b-col>
          </b-row>
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
      location: '',
      feedback: '',
      message: '',
      info: '',
      userinfo: '',
      errorfound: false,
      level: '',
      showlevel: false,
      showoccupied: false,
      occupiedlocations: '',
      options: [
        { item: 'C', name: 'C' },
        { item: 'D', name: 'D' },
        { item: 'E', name: 'E' },
        { item: 'F', name: 'F' },
        { item: 'G', name: 'G' }
      ]
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
    },
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
    location: { required }
  },
  watch: {
    location: function (v) {
      this.level = ''
      if ((this.location.charAt(0) !== 'A' & (this.location.slice(-1) === 'L' || this.location.slice(-1) === 'R')) || this.location.slice(-1) === '-') {
        this.showlevel = true
      } else {
        this.showlevel = false
      }
      this.feedback = this.location
    },
    container: function (v) {
      this.container = v.toUpperCase().trim()
      // this.feedback = this.container
    },
    level: function (v) {
      if (this.level !== '') {
        // for A-locations Maxibel
        if (this.location.slice(-1) === '-' && this.location.charAt(0) === 'A') {
          this.location = this.location.replace('-', '') + this.level
        }
        // for racks shipping
        if (this.location.slice(-1) === 'L' || this.location.slice(-1) === 'R') {
          this.location = this.location + '-' + this.level
        }
        this.feedback = this.location
      }
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
      this.feedback = this.getoccupied(this.container)
      this.location = ''
      this.$refs.location.focus()
    },
    movetofirstcontrol: function (event) {
      this.container = ''
      this.showoccupied = false
      this.occupiedlocations = ''
      this.$refs.container.focus()
    },
    getClass () {
      if (this.errorfound) {
        return 'bg-danger text-white'
      } else {
        return 'bg-success text-white'
      }
    },
    getoccupied (passedcontainer) {
      axios
        .post(
          '/CheckOccupiedLocation?company=' +
                   this.activecompany +
                   '&container=' +
                   passedcontainer
        )
        .then(response => {
          if (response.data !== '') {
            this.showoccupied = true
            this.occupiedlocations = response.data
          } else {
            this.showoccupied = false
            this.occupiedlocations = ''
          }
        })
    },
    checkpackpick () {
      if (this.container.substring(0, 2) === 'CL') {
        console.log(this.container.substring(0, 2))
        NProgress.start()
        axios
          .post('/CheckPackPick?company=' +
          this.activecompany +
          '&container=' +
          this.container +
          '&user=' +
          this.location + this.loggedinuser +
          '&supervisor=' +
          this.supervisor)
          .then(response => {
            if (response.data !== '') {
              console.log(response.data)
              this.$swal.fire({
                title: this.$t('movecontainer.packingincomplete'),
                html: response.data,
                position: 'top'
              })
            } else {
              this.movetonextcontrol()
            }
          })
        NProgress.done()
      } else {
        this.movetonextcontrol()
      }
    },
    executesql () {
      this.message = ''
      if (this.loggedinuser !== '' && this.loginSuccessful === true) {
        // Move location
        if (this.containerlen <= 13 && this.locationlen <= 7) {
          if (this.container !== '' && this.location !== '') {
            if ((this.level !== '' && this.showlevel === true) || (this.level === '' && this.showlevel === false)) {
              NProgress.start()
              this.errorfound = false
              this.feedback = this.$t('general.busy')
              axios
                .post(
                  '/MoveToLocation?company=' +
                  this.activecompany +
                  '&container=' +
                  this.container +
                  '&location=' +
                  this.location + this.level +
                  '&user=' +
                  this.loggedinuser +
                  '&supervisor=' +
                  this.supervisor
                )
                .then(response => {
                  NProgress.done()
                  this.feedback = response.data
                  // this.info = this.container
                  if (!response.status === 200) {
                    this.playSound(true)
                    this.errorfound = true
                  } else {
                    this.playSound(false)
                    this.errorfound = false
                    this.location = ''
                    this.level = ''
                  }
                  this.movetofirstcontrol()
                })
                .catch(error => {
                  NProgress.done()
                  this.playSound(true)
                  this.errorfound = true
                  this.feedback = error.response.data
                  this.location = ''
                  this.level = ''
                  this.movetofirstcontrol()
                })
            } else {
              this.errorfound = true
              this.feedback = this.$t('general.selectlevel')
              if (this.pack === '') {
                this.$refs.pack.focus()
              } else {
                this.$refs.location.focus()
              }
            }
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
          this.$t('general.incorrectformat') + ' ' +
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
