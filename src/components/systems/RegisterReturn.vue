<template>
  <div>
    <form>
      <b-container fluid class="p-0">
        <b-row>
          <b-col cols="12">
            <div v-bind:class="getClass()">
              <h2>
                {{ $t("registerreturn.title") }} {{info}}
                <h6>{{feedback}}</h6>
              </h2>
            </div>
          </b-col>
        </b-row>
        <div class="vdivider" />
        <b-row>
          <b-col cols="8">
            <b-form-input
              @focus="$event.target.select()"
              id="transportnr"
              ref="transportnr"
              type="text"
              v-model="transportnr"
              :placeholder= "this.$t('registerreturn.scantransport')"
              v-on:keyup.enter="movetonextcontrol"
            />
          </b-col>
          <b-col cols="4">
             <b-form-checkbox
                id="noshipment"
                v-model="noshipment"
                name="noshipment"
                value="1"
                unchecked-value="0"
                @input="settransport"
                >{{ $t("registerreturn.noshipment") }}
              </b-form-checkbox>
          </b-col>
        </b-row>
        <div class="vdivider" />
        <b-row>
          <b-col cols="8  ">
            <!-- packto -->
            <label for="bcreturn" class="col-sm-2 col-form-label sr-only">bcreturn</label>
            <b-form-input
              @focus="$event.target.select()"
              id="bcreturn"
              ref="bcreturn"
              type="text"
              v-model="bcreturn"
              :placeholder= "this.$t('registerreturn.scanreturn')"
              v-on:keyup.enter="registerreturn"
            />
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
      transportnr: '',
      bcreturn: '',
      docid: '',
      splitvalues: [],
      customerid: '',
      feedback: '',
      message: '',
      info: '',
      userinfo: '',
      errorfound: false,
      noshipment: 0
    }
  },
  computed: {
    ...mapState(['loginError', 'loginSuccessful', 'loggedinuser', 'test', 'activecompany'])
  },
  mixins: [beep],
  validations: {
    transportnr: { required },
    bcreturn: { required }
  },
  watch: {
    bcreturn: function (v) {
      this.splitvalues = v.toString().split('$')
      this.docid = this.splitvalues[0]
      this.customerid = this.splitvalues[1]
    }
  },
  mounted () {
    this.$nextTick(() => {
      if (this.loginSuccessful === false) {
        this.$router.push('/')
      } else {
        this.$refs.transportnr.focus()
        this.feedback = this.$t('general.waiting')
      }
    })
  },
  methods: {
    movetonextcontrol: function (event) {
      this.$refs.bcreturn.focus()
    },
    movetofirstcontrol: function (event) {
      this.$refs.transportnr.focus()
    },
    settransport () {
      if (this.noshipment === '0') {
        this.transportnr = ''
        this.$refs.transportnr.focus()
      } else {
        this.transportnr = '0'
        this.$refs.bcreturn.focus()
      }
    },
    getClass () {
      if (this.errorfound) {
        return 'bg-danger text-white'
      } else {
        return 'bg-success text-white'
      }
    },
    registerreturn () {
      this.message = ''
      if (this.loggedinuser !== '' && this.loginSuccessful === true) {
        if (this.bcreturn !== '') {
          NProgress.start()
          this.errorfound = false
          axios
            .post(
              '/ReturnsTransport?company=' + this.activecompany +
                  '&status=' + '30' +
                  '&docid=' + this.docid +
                  '&customerid=' + this.customerid +
                  '&user=' + this.loggedinuser +
                  '&transportnr=' + this.transportnr +
                  '&noshipment=' + this.noshipment
            )
            .then(response => {
              this.playSound(false)
              this.errorfound = false
              this.feedback = response.data
              this.transportnr = ''
              this.bcreturn = ''
              this.$refs.transportnr.focus()
            })
            .catch(error => {
              this.playSound(true)
              this.errorfound = true
              this.feedback = error.response.data
              this.transportnr = ''
              this.bcreturn = ''
              this.$refs.transportnr.focus()
            })
            .finally(() => (NProgress.done()))
        } else {
          this.errorfound = true
          this.feedback = this.$t('general.waiting')
          this.$refs.transportnr.focus()
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
