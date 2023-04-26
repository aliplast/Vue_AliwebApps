<template>
  <div>
      <b-container fluid class="p-0">
        <b-row>
          <b-col cols="12">
            <div class="vdivider" />
            <div v-bind:class="getClass()">
              <h2>
                {{ $t("checkreturn.title") }} {{info}}
                <h6>{{feedback}}</h6>
              </h2>
            </div>
          </b-col>
        </b-row>
          <div class="vdivider" />
          <b-row>
            <b-col cols="6">
              <b-form-input
              :placeholder= "$t('checkreturn.searchreturn')"
              ref="selectedreturn"
              id="selectedreturn"
              type="text"
              autocomplete="off"
              v-model="selectedreturn"
              @click="loaddetails()"
              @focus="modal = true, focused=''"
            />
             <div v-if="filteredItems && modal">
              <b-list-group>
                <b-list-group-item
                  v-for="filteredItem in filteredItems" :key="filteredItem.Value"
                  @click="setState(filteredItem)"
                >{{ filteredItem.Description }}
                </b-list-group-item>
              </b-list-group>
            </div>
            </b-col>
            <b-col cols="3">
              <b-button block
                variant=""
                type="submit"
                id="btnReset"
                ref="btnReset"
                @click.prevent="reset()"
              ><b-icon icon="life-preserver"></b-icon></b-button>
            </b-col>
            <b-col cols="3">
              <b-button block variant="primary"
                type="submit"
                id="btnLoad"
                ref="btnLoad"
                @click.prevent="loaddetails()"
              ><b-icon icon="play-fill"></b-icon></b-button>
            </b-col>
            </b-row>
            <div class="vdivider" />
        <b-row v-if="returndetails.length > 0">
          <b-col cols="12">
            <!-- Goodtable plugin -->
            <vue-good-table
              :columns="columns"
              :rows="returndetails"
              :line-numbers="true"
              @on-row-click="onrowclick"
              styleClass="vgt-table condensed">
              <template slot="table-row" slot-scope="props">
                  <span v-if="props.column.field == 'QRCheck'">
                    <b-form-checkbox disabled v-model="props.row[props.column.field]"></b-form-checkbox>
                  </span>
                  <span v-else>
                    <span v-if="props.column.field == 'Item'">
                      <span v-if="props.row.NotPresent">
                        <span style="color: red;">{{props.row.Item}}</span>
                      </span>
                      <span v-else>
                        {{props.formattedRow[props.column.field]}}
                      </span>
                    </span>
                    <span v-else>
                      {{props.formattedRow[props.column.field]}}
                    </span>
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
      info: '',
      userinfo: '',
      retval: '',
      feedback: '',
      errorfound: false,
      selectedreturn: '',
      returndetails: [],
      reasons: [],
      actions: [],
      returns: [],
      filteredItems: [],
      modal: false,
      currentreason: '',
      newreason: '',
      currentaction: '',
      newaction: '',
      qremark: '',
      newcheck: '',
      number: '',
      length: '',
      numberrcv: '',
      lengthrcv: '',
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
          label: 'm',
          field: 'Length',
          thClass: 'header',
          tdClass: 'cell',
          hidden: false
        },
        {
          label: 'Reason',
          field: 'Reason1',
          thClass: 'header',
          tdClass: 'cell',
          hidden: false
        },
        {
          label: 'QReason',
          field: 'QReason',
          thClass: 'header',
          tdClass: 'cell',
          hidden: false
        },
        {
          label: 'QRemark',
          field: 'QRemark',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        },
        {
          label: 'OK',
          field: 'QRCheck',
          thClass: 'header',
          tdClass: 'cell',
          hidden: false
        },
        {
          label: 'NotPresent',
          field: 'NotPresent',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
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
    selectedreturn (v) {
      if (this.selectedreturn.length > 2 && this.selectedreturn.trim() !== '') {
        this.filterItems()
      } else {
        this.returndetails = []
      }
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
    getClass () {
      if (this.errorfound) {
        return 'bg-danger text-white'
      } else {
        return 'bg-success text-white'
      }
    },
    reset () {
      this.errorfound = false
      this.feedback = this.$t('general.waiting')
      this.info = ''
      this.selectedreturn = ''
      this.returndetails = []
      this.$refs.selectedreturn.focus()
    },
    onrowclick (params) {
      this.currentreason = params.row.QReason
      this.headerid = params.row.HeaderID
      this.lineid = params.row.ID
      this.number = params.row.Number
      this.length = params.row.Length
      this.qremark = params.row.QRemark
      this.$swal.mixin({
        title: params.row.Item,
        html: '<p style="text-align:center">O/L ' +
            params.row.SalesOrder + '/' + params.row.SOLine + '<BR>' +
            '</p>',
        position: 'center',
        width: 350,
        input: 'text',
        confirmButtonText: 'Next &rarr;',
        showCancelButton: true,
        progressSteps: ['1', '2', '3', '4', '5']
      }).queue([
        {
          title: this.$t('checkreturn.qreason'),
          input: 'select',
          inputOptions: this.getreasons(this.currentreason),
          inputValidator: (value) => {
            if (!value) {
              return 'Mandatory'
            } else { this.newreason = this.reasons[value] }
          }
        },
        {
          title: this.$t('checkreturn.qaction'),
          input: 'select',
          inputOptions: this.getactions(this.currentaction),
          inputValidator: (value) => {
            if (!value) {
              return 'Mandatory'
            } else { this.newaction = this.actions[value] }
          }
        },
        {
          title: this.$t('checkreturn.qremark'),
          input: 'text',
          inputValue: this.qremark,
          inputValidator: (value) => {
            this.qremark = value
          }
        },
        {
          title: this.$t('checkreturn.qrcv'),
          text: this.$t('checkreturn.qrcvtext'),
          input: 'number',
          inputValue: this.number,
          inputValidator: (value) => {
            if (!value) {
              return this.$t('general.mandatory')
            } else {
              if (value > this.number) {
                return this.$t('checkreturn.mustbesmallerthen') + ' ' + this.number
              } else {
                this.numberrcv = value
              }
            }
          }
        },
        {
          title: this.$t('checkreturn.qlenrcv'),
          text: this.$t('checkreturn.qlenrcvtext'),
          input: 'number',
          inputValue: this.length,
          inputValidator: (value) => {
            if (!value) {
              return this.$t('general.mandatory')
            } else { this.lengthrcv = value }
          }
        },
        {
          title: this.$t('checkreturn.done'),
          input: 'checkbox',
          inputValue: 1,
          inputPlaceholder: 'Checked',
          inputValidator: (value) => {
            this.newcheck = value
          }
        }
      ]).then((result) => {
        if (result.value) {
          this.$swal.fire({
            title: this.$t('checkreturn.confirm'),
            html: `<p>Reason: ${this.newreason}<BR>
            Action: ${this.newaction}<BR>
            Remark: ${this.qremark}<BR>            
            Rcv: ${this.number} -> ${this.numberrcv}<BR>            
            Length: ${this.length} -> ${this.lengthrcv}<BR>            
            Check: ${this.newcheck}</p>`,
            confirmButtonText: 'Check OK?',
            showCancelButton: true
          }).then((result) => {
            if (result.value) {
              this.executesql()
            }
          })
        }
      })
    },
    getreasons (pdefault) {
      return axios
        .post(
          '/GetReturnValues?Company=' + this.activecompany + '&code=' + 'QREASON'
        )
        .then(res => {
          this.reasons = res.data.map(data => (data.Value))
          if (pdefault !== '') { this.reasons.unshift(pdefault) }
          // console.log(this.reasons)
          return this.reasons
        })
    },
    getactions (pdefault) {
      return axios
        .post(
          '/GetReturnValues?Company=' + this.activecompany + '&code=' + 'QACTION'
        )
        .then(res => {
          this.actions = res.data.map(data => (data.Value))
          if (pdefault !== '') { this.actions.unshift(pdefault) }
          console.log(this.actions)
          return this.actions
        })
    },
    filterItems () {
      NProgress.start()
      this.returndetails = []
      axios
        .post('/GetOpenReturns?company=' + this.activecompany + '&status=' + '40' + '&docid=' + this.selectedreturn)
        .then(response => {
          this.returns = response.data
        })
      this.filteredItems = this.returns.filter(selectedreturn => {
        return selectedreturn.Description.toLowerCase().startsWith(
          this.selectedreturn.toLowerCase()
        )
      })
      NProgress.done()
    },
    loaddetails () {
      if (this.selectedreturn.trim() === '') { return }
      this.headerid = this.selectedreturn.toString().split('$')[2]
      this.feedback = this.selectedreturn.toString().split('$')[0]
      NProgress.start()
      axios
        .post('/GetReturnDetails?company=' + this.activecompany + '&headerid=' + this.headerid)
        .then(response => {
          this.returndetails = response.data
        })
      NProgress.done()
    },
    selectAll () {
      this.errorfound = false
      this.feedback = this.$t('general.waiting')
      this.$refs.selectedreturn.select()
    },
    setState (filteredretour) {
      this.selectedreturn = filteredretour.Value
      this.modal = false
      this.loaddetails()
      // this.$refs.container.focus()
    },
    executesql () {
      this.feedback = this.$t('general.busy')
      NProgress.start()
      this.errorfound = false
      axios
        .post(
          '/CheckReturns?lineid=' + this.lineid +
          '&headerid=' + this.headerid +
          '&company=' + this.activecompany +
          '&qreason=' + this.newreason +
          '&qremark=' + this.qremark +
          '&qcheck=' + this.newcheck +
          '&numberrcv=' + this.numberrcv +
          '&lengthrcv=' + this.lengthrcv +
          '&user=' + this.loggedinuser
        )
        .then(response => {
          this.feedback = response.data
          if (!response.status === 200) {
            this.playSound(true)
            this.errorfound = true
          } else {
            this.playSound(false)
            this.errorfound = false
            this.loaddetails()
          }
        })
        .catch(error => {
          this.playSound(true)
          this.errorfound = true
          this.feedback = error.response.data
        })
      NProgress.done()
      return this.errorfound
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
