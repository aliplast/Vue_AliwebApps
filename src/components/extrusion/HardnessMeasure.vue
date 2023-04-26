<template>
  <div>
    <form>
      <b-container fluid class="p-0">
        <b-row>
          <b-col cols="12">
            <div v-bind:class="getClass()">
              <h2>
                {{ $t("hardnessmeasure.title") }}
                <h6>{{feedback}}</h6>
              </h2>
            </div>
          </b-col>
        </b-row>
        <div class="vdivider" />
        <b-row>
          <b-col cols="8">
            <!-- Container -->
            <b-form-input
              id="container"
              ref="container"
              type="text"
              @input="$v.container.$touch()"
              v-model="container"
              :placeholder= "$t('hardnessmeasure.scancontainer')"
              @submit.prevent
              v-on:keyup.enter="GetContainer()"
              @focus="modal = true"
            />
          </b-col>
          <b-col cols="4">
            <b-button block
              v-b-tooltip.hover :title="this.$t('general.process')"
              variant="primary"
              @click="executesql"
              :disabled="errorfound">
             <b-spinner v-if="loading" small></b-spinner>
            <b-icon v-if="!loading" icon="play-fill"></b-icon></b-button>
          </b-col>
        </b-row>
        <div class="vdivider" />
        <b-row>
            <b-col cols="4" >
            <!-- M1 -->
            <b-badge variant="light">{{ $t('hardnessmeasure.measure1') }}</b-badge>
          </b-col>
          <b-col cols="4">
            <!-- M2 -->
            <b-badge variant="light">{{ $t('hardnessmeasure.measure2') }}</b-badge>
          </b-col>
          <b-col cols="4">
          </b-col>
        </b-row>
        <b-row>
            <b-col cols="4" >
            <!-- M1 -->
            <b-form-input
              @focus="$event.target.select()"
              id="measure1"
              ref="measure1"
              type="number"
              @input="$v.measure1.$touch()"
              v-model.number="measure1"
              :placeholder="$t('hardnessmeasure.measure1')"
              v-on:keyup.enter="movetom2"
              @submit.prevent
            />
          </b-col>
          <b-col cols="4">
            <!-- M2 -->
            <b-form-input
              @focus="$event.target.select()"
              id="measure2"
              ref="measure2"
              type="number"
              @input="$v.measure2.$touch()"
              v-model.number="measure2"
              :placeholder="$t('hardnessmeasure.measure2')"
              v-on:keyup.enter="executesql()"
            />
          </b-col>
          <b-col cols="4">
            <b-button block v-b-tooltip.hover :title="this.$t('general.reset')"
              type="button"
              @submit.prevent
              @click="resetValues($t('hardnessmeasure.resetvalues'), '', true)"
            ><b-icon icon="life-preserver"></b-icon></b-button>
          </b-col>
        </b-row>
        <div class="vdivider" />
         <b-row  class="bottom">
          <b-col cols="12">
            <b-row>
              <b-col cols="12">
                <div class="textsmall">{{userinfo}}</div>
              </b-col>
            </b-row>
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
      container: '',
      measure1: '0',
      measure2: '0',
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
    ...mapState(['loginError', 'loginSuccessful', 'loggedinuser', 'test', 'supervisor', 'activecompany'])
  },
  mixins: [beep],
  validations: {
    container: { required },
    measure1: { required },
    measure2: { required }
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
    movetocontainer: function (event) {
      this.container = ''
      this.$refs.container.focus()
    },
    movetom1: function (event) {
      this.$refs.measure1.focus()
    },
    movetom2: function (event) {
      this.$refs.measure2.focus()
    },
    getClass () {
      if (this.errorfound) {
        return 'bg-danger text-white'
      } else {
        return 'bg-success text-white'
      }
    },
    resetValues (message, info, reset) {
      this.container = ''
      this.measure1 = '0'
      this.measure2 = '0'
      this.userinfo = info
      this.$refs.container.focus()
      this.feedback = message
      if (reset) { this.errorfound = false }
    },
    async GetContainer () {
      this.userinfo = ''
      this.loading = true
      await axios
        .post('/ContainerfromBasket?container=' + this.container + '&company=' + this.activecompany)
        .then(response => {
          this.container = response.data
        })
        .finally(() => {
          this.loading = false
        })
      this.feedback = this.container === '' ? this.$t('hardnessmeasure.notfound') : this.container
    },
    executesql () {
      this.userinfo = ''
      if (this.loggedinuser !== '' && this.loginSuccessful === true) {
        if (this.container !== '') {
          NProgress.start()
          this.errorfound = false
          this.feedback = this.$t('general.busy')
          axios
            .post(
              '/HardnessMeasure?company=' +
                  this.activecompany +
                  '&container=' +
                  this.container +
                  '&measure1=' +
                  this.measure1 +
                  '&measure2=' +
                  this.measure2 +
                  '&user=' +
                  this.loggedinuser
            )
            .then(response => {
              NProgress.done()
              if (!response.status === 200) {
                console.log(response.data)
                this.playSound(true)
                this.errorfound = true
                this.resetValues(this.$t('general.error'), response.data, true)
              } else {
                console.log(response.data)
                this.playSound(false)
                this.errorfound = false
                this.info = this.container
                this.resetValues(this.$t('general.succes'), response.data, true)
              }
            })
            .catch(error => {
              console.log(error.response.data)
              NProgress.done()
              this.playSound(true)
              this.errorfound = true
              this.resetValues(this.$t('general.error'), error.response.data, true)
            })
        } else {
          this.errorfound = true
          this.feedback = this.$t('general.waiting')
          if (this.container === '') {
            this.movetocontainer()
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
.textsmall {
  font-size:small;
  text-align: left;
  color:black;
}
.bottom {
  position: absolute;
  bottom: 10px;
  width: 100%;
  /* background: whitesmoke; */
}
</style>
