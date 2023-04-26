<template>
  <div>
      <b-container fluid class="p-0">
        <b-row>
          <b-col cols="12">
            <div class="vdivider" />
            <div v-bind:class="getClass()">
              <h2>
                {{ $t("receivereturn.title") }} {{info}}
                <h6>{{feedback}}</h6>
              </h2>
            </div>
          </b-col>
        </b-row>
          <div class="vdivider" />
           <b-row>
          <b-col cols="9">
            <b-form-input
              @focus="$event.target.select()"
              id="bcreturn"
              ref="bcreturn"
              type="text"
              v-model="bcreturn"
              :placeholder= "this.$t('receivereturn.scanreturn')"
              v-on:keyup.enter="loaddetails(), movetonextcontrol()"
            />
          </b-col>
           <b-col cols="3">
              <b-button variant="primary" block
                type="submit"
                id="btnRefresh"
                ref="btnRefresh"
                @click.prevent="reset()"
              ><b-icon icon="life-preserver"></b-icon></b-button>
            </b-col>
        </b-row>
        <div class="vdivider" />
        <b-row>
          <b-col cols="9">
            <b-form-input
              @focus="$event.target.select()"
              id="location"
              ref="location"
              type="text"
              v-model="location"
              :placeholder= "this.$t('receivereturn.locationremark')"
              v-on:keyup.enter="test()"
            />
          </b-col>
        </b-row>
        <div class="vdivider" />
           <b-row>
          <b-col cols="6">
              <b-button block variant="success"
                type="submit"
                id="btnPickupOk"
                ref="btnPickupOk"
                @click.prevent="receivereturn(1)"
              ><b-icon icon="hand-thumbs-up"></b-icon> {{ $t("receivereturn.pickupok") }}</b-button>
          </b-col>
           <b-col cols="6">
              <b-button block variant="danger"
                type="submit"
                id="btnNoPickup"
                ref="btnNoPickup"
                @click.prevent="receivereturn(0)"
              ><b-icon icon="hand-thumbs-down"></b-icon> {{ $t("receivereturn.nopickup") }}</b-button>
            </b-col>
        </b-row>
            <div class="vdivider" />
        <b-row v-if="returndetails.length > 0">
          <b-col cols="12">
            <!-- Goodtable plugin -->
            <vue-good-table
              :columns="columns"
              :rows="returndetails"
              @on-cell-click="onCellClick"
              :line-numbers="false"
                styleClass="vgt-table condensed"
                :search-options="{ enabled: false }"
                :sort-options="{ enabled: false, }">
                <template slot="table-row" slot-scope="props">
                  <span v-if="props.column.field == 'NotPresent'">
                    <b-form-checkbox size="lg" v-model="props.row[props.column.field]"></b-form-checkbox>
                  </span>
                </template>
            </vue-good-table>
          </b-col>
        </b-row>
      </b-container>
  </div>
</template>

<script>
import { beep } from './beep'
import { mapState } from 'vuex'
import axios from 'axios'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

export default {
  data () {
    return {
      bcreturn: '',
      location: '',
      info: '',
      userinfo: '',
      retval: '',
      feedback: '',
      docid: '',
      docnr: '',
      customerid: '',
      errorfound: false,
      splitvalues: [],
      returnlines: [],
      selecteddata: [],
      returndetails: [],
      lineid: '',
      headerid: '',
      columns: [
        {
          label: 'Item',
          field: 'Item',
          thClass: 'header',
          tdClass: 'cell',
          hidden: false
        },
        {
          label: '#',
          field: 'Number',
          thClass: 'header',
          tdClass: 'cell',
          hidden: false
        },
        {
          label: 'Descr',
          field: 'ItemDescription',
          thClass: 'header',
          tdClass: 'cell',
          hidden: false
        },
        {
          label: 'QReason',
          field: 'QReason',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        },
        {
          label: 'N/A',
          field: 'NotPresent',
          thClass: 'header',
          tdClass: 'cell',
          hidden: false
        },
        {
          label: 'ID',
          field: 'ID',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        },
        {
          label: 'HeaderId',
          field: 'HeaderId',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        }
      ]
    }
  },
  computed: {
    ...mapState(['loginError', 'loginSuccessful', 'loggedinuser', 'activecompany'])
  },
  mixins: [beep],
  watch: {
    bcreturn: function (v) {
      this.splitvalues = v.toString().split('$')
      this.docnr = this.splitvalues[0]
      this.customerid = this.splitvalues[1]
      this.docid = this.splitvalues[2]
      console.log(this.splitvalues)
    },
    location: function (v) {
      this.location = v.toUpperCase().trim()
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
      if (this.bcreturn !== '') {
        this.$refs.location.focus()
      } else {
        this.$refs.bcreturn.focus()
      }
    },
    movetofirstcontrol: function (event) {
      this.$refs.bcreturn.focus()
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
      this.info = ''
      this.bcreturn = ''
      this.location = ''
      this.returndetails = []
      this.$refs.bcreturn.focus()
    },
    loaddetails () {
      this.feedback = this.docnr
      console.log(this.docid)
      NProgress.start()
      axios
        .post('/GetReturnDetails?company=' + this.activecompany + '&headerid=' + this.docid)
        .then(response => {
          this.returndetails = response.data
          console.log(this.returndetails)
        })
      NProgress.done()
    },
    onCellClick (params) {
      // console.log(params.column)
      if (params.column.field === 'NotPresent') {
        // console.log(params.row.ID + '->' + params.row.NotPresent)
        NProgress.start()
        console.log('/ReceivePresent?company=' + this.activecompany + '&lineid=' + params.row.ID + '&check=' + params.row.NotPresent)
        this.errorfound = false
        axios
          .post('/ReceivePresent?company=' + this.activecompany + '&lineid=' + params.row.ID + '&check=' + params.row.NotPresent)
          .then((res) => {
            this.playSound(false)
            this.errorfound = false
            this.feedback = res.data
          })
          .catch((error) => {
            this.playSound(true)
            this.errorfound = true
            this.feedback = error.message
            this.logdata = error.message
          })
        NProgress.done()
      }
    },
    receivereturn (status) {
      this.message = ''
      if (this.loggedinuser !== '' && this.loginSuccessful === true) {
        if (this.docid !== '') {
          NProgress.start()
          this.errorfound = false
          axios
            .post('/ReturnsReceive?company=' + this.activecompany +
                  '&status=' + '40' +
                  '&docnr=' + this.docnr +
                  '&docid=' + this.docid +
                  '&user=' + this.loggedinuser +
                  '&rcvstatus=' + status +
                  '&location=' + this.location
            ).then(response => {
              NProgress.done()
              this.playSound(false)
              this.feedback = response.data
              this.reset()
            })
            .catch(error => {
              NProgress.done()
              this.playSound(true)
              this.errorfound = true
              this.feedback = error.response.data
              this.bcreturn = ''
              this.location = ''
              this.$refs.bcreturn.focus()
            })
        } else {
          this.errorfound = true
          this.feedback = this.$t('general.waiting')
          this.$refs.bcreturn.focus()
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
