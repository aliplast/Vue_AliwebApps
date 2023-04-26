<template>
  <div>
    <form>
      <b-container fluid class="p-0">
        <b-row>
          <b-col cols="12">
            <div v-bind:class="getClass()">
              <h2>
                {{ $t("signshipment.title") }} {{info}}
                <h6>{{feedback}}</h6>
              </h2>
            </div>
          </b-col>
        </b-row>
        <b-row>
          <b-col cols="12">
            <!-- Shipment -->
            <b-form-input
              @focus="$event.target.select()"
              id="shipment"
              ref="shipment"
              type="text"
              @input="$v.shipment.$touch()"
              v-model="shipment"
              :placeholder= "this.$t('signshipment.scanshipment')"
              v-on:keyup.enter="getShipmentDetails"
            />
          </b-col>
        </b-row>
        <div class="vdivider" />
        <b-row>
          <b-col cols="12">
            <!-- Customer -->
            <b-form-select name="partySelect" v-model="savepath" @change="onChange()">
              <option v-for="party in parties" v-bind:key="party.POD" v-bind:value="party.POD"> {{ party.DP_Customer }} </option>
            </b-form-select>
          </b-col>
        </b-row>
        <div class="vdivider" />
        <b-row align-h="center" class="border border-dark" v-if="showpad">
        <VueSignaturePad
            id="signature"
            width="90%"
            height="250px"
            ref="signaturePad"
            :options="options"
          />
        </b-row>
        <div class="vdivider" />
        <b-row v-if="showpad">
           <b-col cols="3">
            <b-button  variant="primary" block
              type="submit"
              id="btnSave"
              ref="btnSave"
              @click.prevent="save"
              v-b-tooltip.hover :title= "this.$t('signshipment.createpod')"
            ><b-icon icon="pen-fill"></b-icon></b-button>
          </b-col>
          <b-col cols="3">
            <b-button  variant="primary" block
              type="submit"
              id="btnClear"
              ref="btnClear"
              @click.prevent="undo"
              v-b-tooltip.hover :title= "this.$t('signshipment.deletesignature')"
            ><b-icon icon="trash"></b-icon></b-button>
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
      options: {
        penColor: '#000'
      },
      info: '',
      userinfo: '',
      retval: '',
      feedback: '',
      errorfound: false,
      showpad: false,
      shipment: '',
      customer: '',
      parties: [],
      savepath: ''
    }
  },
  computed: {
    ...mapState(['loginError', 'loginSuccessful', 'loggedinuser', 'test', 'activecompany'])
  },
  mixins: [beep],
  validations: {
    shipment: { required },
    customer: { required }
  },
  watch: {
    shipment: function (v) {
      this.shipment = v.toUpperCase().trim()
    },
    customer: function (v) {
      this.customer = v.toUpperCase().trim()
    }
  },
  mounted () {
    this.$nextTick(() => {
      if (this.loginSuccessful === false) {
        this.$router.push('/')
      } else {
        this.feedback = this.$t('general.waiting')
      }
    })
  },
  methods: {
    movetonextcontrol: function (event) {
      this.$refs.customer.focus()
    },
    movetofirstcontrol: function (event) {
      this.$refs.shipment.focus()
    },
    onChange: function (event) {
      this.showpad = true
    },
    undo () {
      this.$refs.signaturePad.undoSignature()
    },
    save () {
      const { isEmpty, data } = this.$refs.signaturePad.saveSignature()
      if (!isEmpty) {
        this.saveImage(data)
      } else {
        this.feedback = this.$t('signshipment.nosignature')
      }
    },
    change () {
      this.options = {
        penColor: '#00f'
      }
    },
    reset () {
      this.showpad = false
      this.shipment = ''
      this.customer = ''
      this.parties = []
      this.savepath = ''
      this.$refs.shipment.focus()
    },
    getClass () {
      if (this.errorfound) {
        return 'bg-danger text-white'
      } else {
        return 'bg-success text-white'
      }
    },
    getShipmentDetails () {
      NProgress.start()
      axios
        .get(
          '/GetInfoPOD?company=' +
                   this.activecompany +
                   '&shipment=' +
                   this.shipment
        )
        .then(res => {
          NProgress.done()
          const data = res.data
          const resultArray = []
          for (let key in data) {
            resultArray.push(data[key])
          }
          if (!resultArray.length) {
            this.playSound(true)
            this.errorfound = true
            this.feedback = this.$t('general.nodata')
          } else {
            this.playSound(false)
            this.parties = resultArray
            this.errorfound = false
            this.feedback = this.$t('signshipment.selectcustomer')
          }
        })
    },
    saveImage (signaturedata) {
      // console.log(JSON.stringify(signaturedata))
      NProgress.start()
      this.errorfound = false
      axios
        .post('/SavePODSignature',
          JSON.stringify(signaturedata),
          {
            headers: { 'Content-Type': 'application/json' },
            params: {
              company: this.activecompany,
              user: this.loggedinuser,
              savepath: this.savepath
            } })
        .then(res => {
          this.playSound(false)
          this.errorfound = false
          this.reset()
          this.feedback = res.data
        })
        .catch(error => {
          this.playSound(true)
          this.errorfound = true
          this.reset()
          this.feedback = error.message
        })
      NProgress.done()
    }
  }
}
</script>

<style>
.vdivider {
  margin-top: 10px;
  margin-bottom: 10px;
}
.dot {
  height: 15px;
  width: 15px;
  border-radius: 50%;
  border-color: lightgray;
  border-width: 1px;
  display: inline-block;
}
</style>
