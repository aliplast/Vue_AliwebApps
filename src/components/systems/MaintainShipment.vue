<template>
  <div>
    <b-overlay :show="loading" rounded="sm" spinner-variant="danger">
    <form>
      <b-container fluid class="p-0">
        <b-row>
          <b-col cols="12">
            <div v-bind:class="getClass()">
              <h2>
                {{ $t("maintainshipment.title") }} {{info}}
                <h6>{{feedback}}</h6>
              </h2>
            </div>
          </b-col>
        </b-row>
        <div class="vdivider" />
        <b-row>
          <b-col cols="8">
            <!-- packfrom -->
            <b-form-input
              @focus="$event.target.select()"
              id="packfrom"
              ref="packfrom"
              type="text"
              @input="$v.packfrom.$touch()"
              v-model="packfrom"
              :placeholder= "this.$t('maintainshipment.scanfrom')"
              @keydown.enter.exact.stop.prevent="getDetails"
            />
          </b-col>
          <b-col cols="2">
            <b-button variant="primary"
              type="submit"
              id="btnSearch"
              ref="btnSearch"
              @click.prevent="getDetails"
            ><b-icon icon="search"></b-icon></b-button>
          </b-col>
          <b-col cols="2">
            <b-button variant="secondary"
              type="submit"
              id="btnReset"
              ref="btnReset"
              @click.prevent="reset()"
            ><b-icon icon="life-preserver"></b-icon></b-button>
          </b-col>
        </b-row>
        <div class="vdivider" />
        <b-row v-if="!parentcontainer">
          <b-col cols="8">
            <!-- packto -->
            <b-form-input
              @focus="$event.target.select()"
              id="packto"
              ref="packto"
              type="text"
              @input="$v.packto.$touch()"
              v-model="packto"
              :placeholder= "this.$t('maintainshipment.scanto')"
              @keydown.enter.exact.stop.prevent="updateParent('update')"
            />
          </b-col>
          <b-col cols="4">
            <b-button variant="success" block
              type="submit"
              id="btnProcess"
              ref="btnProcess"
              @click.prevent="updateParent('update')"
            ><b-icon icon="box-seam"></b-icon></b-button>
          </b-col>
        </b-row>
        <div class="vdivider" />
         <b-row v-if="parentcontainer">
          <b-col cols="12" v-b-tooltip.hover :title="this.$t('maintainshipment.removefromcontainer')">
            <b-button
              variant="primary" block
              @click.self="updateParent('remove')"
            ><b-icon-upload></b-icon-upload> {{parentcontainer}} ({{customerid}})</b-button>
          </b-col>
        </b-row>
        <div class="vdivider" />
        <b-row v-if="customerid">
         <b-col cols="12">
          <b-alert show variant="dark">{{customerid}} ({{customer}} - {{zip}})</b-alert>
         </b-col>
        </b-row>
      </b-container>
    </form>
    </b-overlay>
  </div>
</template>

<script>
import { beep } from './beep'
import { required } from 'vuelidate/lib/validators'
import { mapState } from 'vuex'
import axios from 'axios'

export default {
  data () {
    return {
      packfrom: '',
      packto: '',
      parentcontainer: '',
      feedback: '',
      message: '',
      loading: false,
      info: '',
      userinfo: '',
      errorfound: false,
      customer: '',
      customerid: '',
      zip: ''
    }
  },
  computed: {
    ...mapState(['loginError', 'loginSuccessful', 'loggedinuser', 'test', 'activecompany'])
  },
  mixins: [beep],
  validations: {
    packfrom: { required },
    packto: { required }
  },
  watch: {
    packto: function (v) {
      this.packto = v.toUpperCase().trim()
    },
    packfrom: function (v) {
      this.packfrom = v.toUpperCase().trim()
      if (this.packfrom === '') {
        this.parentcontainer = ''
      }
    }
  },
  mounted () {
    this.$nextTick(() => {
      if (this.loginSuccessful === false) {
        this.$router.push('/')
      } else {
        this.packfrom = ''
        this.$refs.packfrom.focus()
        this.feedback = this.$t('general.waiting')
      }
    })
  },
  methods: {
    movetonextcontrol: function (event) {
      this.$refs.packto.focus()
    },
    movetofirstcontrol: function (event) {
      this.$refs.packfrom.focus()
    },
    getClass () {
      if (this.errorfound) {
        return 'bg-danger text-white'
      } else {
        return 'bg-success text-white'
      }
    },
    reset () {
      this.errorfound = false
      this.feedback = ''
      this.packfrom = ''
      this.packto = ''
      this.customer = ''
      this.customerid = ''
      this.zip = ''
      this.$refs.packfrom.focus()
    },
    updateParent (processtype) {
      this.message = ''
      this.errorfound = false
      if (this.packto !== '' && (/^[A-Z]{2}[0-9]{6,7}$/.test(this.packto) === false || /^[A-Z]{2}[0-9]{6,7}$/.test(this.packfrom) === false)) {
        this.playSound(true)
        this.errorfound = true
        this.feedback = this.$t('general.incorrectformat')
        return
      }
      if (this.loggedinuser !== '' && this.loginSuccessful === true) {
        if (this.packfrom !== '') {
          this.loading = true
          axios
            .post(
              '/UpdateParentContainer?company=' +
                  this.activecompany +
                  '&container=' +
                  this.packfrom +
                  '&parent=' +
                  this.packto +
                  '&processtype=' +
                  processtype
            )
            .then(response => {
              this.feedback = this.packfrom + '->' + this.packto // + ':' + response.data
              this.reset()
              // this.getDetails()
            })
            .catch(error => {
              this.playSound(true)
              this.errorfound = true
              this.feedback = error.response.data
              this.reset()
              this.$refs.packfrom.focus()
            })
            .finally(() => { this.loading = false })
        } else {
          this.feedback = this.$t('general.waiting')
          this.$refs.packfrom.focus()
        }
      } else {
        this.feedback = this.$t('general.login')
        this.$router.push('/')
      }
    },
    getDetails () {
      this.errorfound = false
      this.feedback = ''
      this.message = ''
      if (this.packfrom !== '') {
        this.loading = true
        axios
          .get(
            '/GetParentContainer?company=' +
                  this.activecompany +
                  '&container=' +
                  this.packfrom
          )
          .then(response => {
            console.log(response.data)
            this.parentcontainer = String(response.data.parentcontainer)
            this.customer = String(response.data.customer)
            this.customerid = String(response.data.customerid)
            this.zip = String(response.data.zip)
            if (this.customer.trim() === '') {
              this.errorfound = true
              this.feedback = this.$t('maintainshipment.badregistration')
            } else {
              this.$refs.packto.focus()
            }
          })
          .catch(error => {
            console.log(error)
            this.playSound(true)
            this.errorfound = true
            this.feedback = error
            this.packfrom = ''
            this.packto = ''
            this.customer = ''
            this.customerid = ''
            this.zip = ''
            this.$refs.packfrom.focus()
          })
          .finally(() => { this.loading = false })
      } else {
        this.feedback = this.$t('general.waiting')
        if (this.packfrom === '') {
          this.$refs.packfrom.focus()
        } else {
          this.$refs.packto.focus()
        }
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
