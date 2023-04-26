<template>
  <div>
    <form>
      <b-container fluid class="p-0">
        <b-row>
          <b-col cols="12">
            <div v-bind:class="getClass()">
              <h2>
                {{ $t("movepacktorack.title") }} {{info}}
                <h6>{{feedback}}</h6>
              </h2>
            </div>
          </b-col>
        </b-row>
        <div class="vdivider" />
        <b-row>
          <b-col cols="12">
            <!-- pack -->
            <b-form-input
              @focus="$event.target.select()"
              id="pack"
              ref="pack"
              type="text"
              @input="$v.pack.$touch()"
              v-model="pack"
              :placeholder= "this.$t('movepacktorack.scanpack')"
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
              :placeholder= "this.$t('general.scanlocation')"
              v-on:keyup.enter="executesql"
            />
          </b-col>
          <b-col cols="3">
            <b-button
              variant="primary" block
              @click.self="executesql"
              :disabled="$v.$error"
            ><b-icon icon="play-fill"></b-icon></b-button>
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
      pack: '',
      location: '',
      feedback: '',
      message: '',
      info: '',
      userinfo: '',
      errorfound: false,
      level: '',
      showlevel: false,
      check: 0,
      options: [
        { item: '-A', name: 'A' },
        { item: '-B', name: 'B' },
        { item: '-C', name: 'C' },
        { item: '-D', name: 'D' },
        { item: '-E', name: 'E' },
        { item: '-F', name: 'F' }
      ]
    }
  },
  computed: {
    ...mapState(['loginError', 'loginSuccessful', 'loggedinuser', 'test', 'activecompany'])
  },
  mixins: [beep],
  validations: {
    pack: { required },
    location: { required }
  },
  watch: {
    location: function (v) {
      // this.location = v.toUpperCase().trim()
      // this.feedback = this.location.substring(4, 5)
      if (this.location.substring(4, 5) === 'L' || this.location.substring(4, 5) === 'R') {
        this.showlevel = true
      } else {
        this.showlevel = false
      }
      // console.log(this.showlevel)
    },
    pack: function (v) {
      this.pack = v.toUpperCase().trim()
    },
    level: function (v) {
      if (this.level !== '') {
        this.feedback = this.location + this.level
        this.executesql()
      }
    },
    packlen: function () {
      if (this.pack) {
        return this.pack.length
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
  mounted () {
    this.$nextTick(() => {
      if (this.loginSuccessful === false) {
        this.$router.push('/')
      } else {
        this.pack = ''
        this.$refs.pack.focus()
        this.feedback = this.$t('general.waiting')
      }
    })
  },
  methods: {
    movetonextcontrol: function (event) {
      this.$refs.location.focus()
    },
    movetofirstcontrol: function (event) {
      this.$refs.pack.focus()
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
        this.feedback = this.location + this.level
        if (this.pack !== '' && this.location !== '') {
          if ((this.level !== '' && this.showlevel === true) || (this.level === '' && this.showlevel === false)) {
            NProgress.start()
            this.errorfound = false
            this.feedback = this.location + this.level
            console.log(this.check++)
            axios
              .post(
                '/MovePackToLocation?company=' +
                  this.activecompany +
                  '&pack=' +
                  this.pack +
                  '&location=' +
                  this.location + this.level
              )
              .then(response => {
                NProgress.done()
                this.feedback = response.data
                if (!this.feedback.startsWith('OK')) {
                  this.playSound(true)
                  this.errorfound = true
                  this.$refs.pack.focus()
                  this.location = ''
                  this.level = ''
                } else {
                  this.playSound(false)
                  this.errorfound = false
                  this.info = this.pack
                  this.location = ''
                  this.pack = ''
                  this.level = ''
                  this.$refs.pack.focus()
                }
              })
              .catch(error => {
                NProgress.done()
                this.playSound(true)
                this.errorfound = true
                this.feedback = error.message
                this.pack = ''
                this.location = ''
                this.level = ''
                this.$refs.pack.focus()
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
          if (this.pack === '') {
            this.$refs.pack.focus()
          } else {
            this.$refs.location.focus()
          }
          this.level = ''
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
