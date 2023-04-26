<template>
  <div>
    <b-overlay :show="loading" rounded="sm">
    <form>
      <b-container fluid class="p-0">
        <b-row>
          <b-col cols="12">
            <div v-bind:class="getClass()">
              <h2>
                {{ $t("unloadbillet.title") }} {{selecteddn}}
                <h6>{{feedback}}</h6>
              </h2>
            </div>
          </b-col>
        </b-row>
        <div class="vdivider" />
        <b-row>
          <b-col cols="9">
            <!-- Search DN -->
            <b-form-select
                v-model="selecteddn"
                :options="opendn"
                value-field="Serial"
                text-field="Selectie"
                @change="cancel()">
                </b-form-select>
          </b-col>
          <b-col cols="3">
            <b-button v-b-tooltip.hover title="Refresh" block
              variant="primary"
              type="button"
              @submit.prevent
              @click="getopendn()">
            <b-spinner v-if="loading" small></b-spinner>
            <b-icon v-if="!loading" icon="search"></b-icon>
            </b-button>
          </b-col>
        </b-row>
        <div class="vdivider" />
        <b-row>
          <b-col cols="6">
            <!-- Gietnummer -->
            <b-form-input
              @focus="$event.target.select()"
              id="castnr"
              ref="castnr"
              type="text"
              v-model="castnr"
              :placeholder= "$t('unloadbillet.entercastnr')"
              v-on:keyup.enter="getparams()"
            />
          </b-col>
          <b-col cols="3">
            <b-button v-if="rows.length > 0" v-b-tooltip.hover :title= "this.$t('general.process')" block
              variant="success"
              type="button"
              @submit.prevent
              @click="checkprocesscastnr()"
            ><b-icon icon="play-fill"></b-icon></b-button>
          </b-col>
          <b-col cols="3">
            <b-button v-b-tooltip.hover :title= "this.$t('general.reset')" block
              variant="primary"
              type="button"
              @submit.prevent
              @click="cancel()"
            ><b-icon icon="life-preserver"></b-icon></b-button>
          </b-col>
        </b-row>
        <div class="vdivider" />
        <b-row v-if="rows.length > 0">
          <b-col cols="12">
            <!-- Goodtable plugin -->
            <vue-good-table
              :columns="columns"
              :rows="rows"
              :line-numbers="true"
              @on-cell-click="onCellClick"
              styleClass="vgt-table condensed"
            ></vue-good-table>
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
import 'nprogress/nprogress.css'

export default {
  data () {
    return {
      opendn: [],
      selecteddn: '',
      nbrpoles: '0',
      alloy: '',
      remark: '',
      castnr: '',
      feedback: '',
      info: '',
      loading: false,
      userinfo: '',
      errorfound: false,
      columns: [
        {
          label: 'Castnr',
          field: 'Castnr',
          thClass: 'header',
          tdClass: 'cell',
          type: 'string',
          hidden: false
        },
        {
          label: '# Poles',
          field: 'Nbrpoles',
          thClass: 'header',
          tdClass: 'cell',
          type: 'string',
          hidden: false
        },
        {
          label: 'Opmerkingen',
          field: 'OpmerkingVue',
          thClass: 'header',
          tdClass: 'cell',
          type: 'string',
          hidden: false
        },
        {
          label: 'Weging1Datum',
          field: 'Weging1Datum',
          thClass: 'header',
          tdClass: 'cell',
          type: 'string',
          hidden: true
        },
        {
          label: 'Weging1Uur',
          field: 'Weging1Uur',
          thClass: 'header',
          tdClass: 'cell',
          type: 'string',
          hidden: true
        },
        {
          label: 'Weging2Datum',
          field: 'Weging2Datum',
          thClass: 'header',
          tdClass: 'cell',
          type: 'string',
          hidden: true
        },
        {
          label: 'Weging2Uur',
          field: 'Weging2Uur',
          thClass: 'header',
          tdClass: 'cell',
          type: 'string',
          hidden: true
        },
        {
          label: 'NaamLeverancier',
          field: 'NaamLeverancier',
          thClass: 'header',
          tdClass: 'cell',
          type: 'string',
          hidden: true
        },
        {
          label: 'NettoBerekend',
          field: 'NettoBerekend',
          thClass: 'header',
          tdClass: 'cell',
          type: 'string',
          hidden: true
        },
        {
          label: 'Vrachtbrief',
          field: 'Vrachtbrief',
          thClass: 'header',
          tdClass: 'cell',
          type: 'string',
          hidden: true
        },
        {
          label: 'Bonnr',
          field: 'Bonnr',
          thClass: 'header',
          tdClass: 'cell',
          type: 'string',
          hidden: true
        },
        {
          label: 'Kenteken',
          field: 'Kenteken',
          thClass: 'header',
          tdClass: 'cell',
          type: 'string',
          hidden: true
        },
        {
          label: 'User_IN',
          field: 'User_IN',
          thClass: 'header',
          tdClass: 'cell',
          type: 'string',
          hidden: true
        },
        {
          label: 'Serial',
          field: 'Serial',
          thClass: 'header',
          tdClass: 'cell',
          type: 'string',
          hidden: true
        },
        {
          label: 'Description',
          field: 'Description',
          thClass: 'header',
          tdClass: 'cell',
          type: 'string',
          hidden: true
        },
        {
          label: 'Alloy',
          field: 'Alloy',
          thClass: 'header',
          tdClass: 'cell',
          type: 'string',
          hidden: false
        }
      ],
      rows: [],
      dndetails: []
    }
  },
  computed: {
    ...mapState(['loginError', 'loginSuccessful', 'loggedinuser', 'test', 'activecompany'])
  },
  mixins: [beep],
  validations: {
    customer: { required }
  },
  watch: {
    selecteddn: function (v) {
      this.dndetails = this.opendn.find(val => val.Serial === this.selecteddn)
    }
  },
  mounted () {
    this.$nextTick(() => {
      if (this.loginSuccessful === false) {
        this.$router.push('/')
      } else {
        this.getopendn()
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
    cancel () {
      this.rows = []
      this.castnr = ''
      this.getopendn()
    },
    getopendn () {
      this.loading = true
      axios
        .get('/GetOpenDN?company=' + this.activecompany + '&user=' + this.loggedinuser)
        .then(response => {
          // console.log(response.data)
          this.opendn = response.data
        })
        .finally(() => {
          this.loading = false
        })
    },
    add2table () {
      this.errorfound = false
      this.checkIfExists(this.castnr)
      if (!this.exists) {
        if (this.container.match('^[0-9]{1,8}$')) {
          this.type = 'real'
          this.remark = ''
          this.rows.push({
            container: this.container,
            type: this.type,
            remark: this.remark
          })
          this.feedback = this.container
        } else if (this.container.match('^[A-Z]{2}[0-9]{1,8}$')) {
          this.type = 'cont'
          this.remark = ''
          this.rows.push({
            container: this.container,
            type: this.type,
            remark: this.remark
          })
          this.feedback = this.container
        } else {
          // this.type = ''
          this.remark = ''
          this.feedback = this.$t('unloadbillet.invalidcontainer')
          this.errorfound = true
        }
      } else {
        this.feedback = this.$t('unloadbillet.duplicatecontainer')
        this.errorfound = true
        // this.$swal('Duplicate!', this.container + ' already in list', 'error')
      }
      this.container = ''
      this.$refs.container.focus()
    },
    checkIfExists (castnr) {
      this.exists = this.rows.some(item => {
        return item.castnr === castnr
      })
    },
    onCellClick (params) {
      this.$swal({
        title: this.$t('general.rusure'),
        text: params.row.Castnr + ' ' + this.$t('unloadbillet.willbedeleted'),
        position: 'top',
        showCancelButton: true,
        confirmButtonText: this.$t('general.yes'),
        cancelButtonText: this.$t('general.no'),
        showCloseButton: true
      }).then(result => {
        if (result.value) {
          // delete clicked row
          this.rows.splice(params.rowIndex, 1)
          // this.$swal('Deleted', 'You successfully deleted this file', 'success')
        } else {
          // this.$swal('Cancelled', 'Your file is still intact', 'info')
        }
      })
    },
    getparams () {
      this.errorfound = false
      this.$swal.mixin({
        title: this.$t('unloadbillet.entervalues'),
        position: 'top',
        width: 350,
        input: 'text',
        confirmButtonText: 'Next &rarr;',
        showCancelButton: true,
        progressSteps: ['1', '2', '3']
      }).queue([
        {
          title: this.$t('unloadbillet.nbrpoles'),
          input: 'number',
          inputPlaceholder: this.$t('unloadbillet.nbrpolestext'),
          // inputValue: 0,
          inputValidator: (value) => {
            if (!value) {
              return 'Mandatory'
            }
          }
        },
        {
          title: this.$t('unloadbillet.alloynbrs'),
          input: 'select',
          inputOptions: this.getalloys(this.castnr),
          inputValidator: (value) => {
            if (!value) {
              return this.$t('general.mandatory')
            } else { this.alloy = this.GetAlloys[value] }
          }
        },
        {
          title: this.$t('unloadbillet.remark'),
          input: 'text',
          inputPlaceholder: this.$t('unloadbillet.remark'),
          inputValidator: (value) => {
            this.remark = value
          }
        }
      ]).then((result) => {
        if (result.value) {
          this.nbrpoles = result.value[0]
          this.$swal.fire({
            title: this.$t('unloadbillet.addtooverview'),
            position: 'top',
            confirmButtonText: this.$t('general.add'),
            showCancelButton: true
          }).then((result) => {
            if (result.value) {
              this.checkIfExists(this.castnr)
              if (!this.exists) {
                this.rows.push({
                  Castnr: this.castnr,
                  Nbrpoles: this.nbrpoles,
                  OpmerkingVue: this.remark,
                  Opmerkingen: this.dndetails.Opmerkingen,
                  Weging1Datum: this.dndetails.Weging1Datum,
                  Weging1Uur: this.dndetails.Weging1Uur,
                  Weging2Datum: this.dndetails.Weging2Datum,
                  Weging2Uur: this.dndetails.Weging2Uur,
                  NaamLeverancier: this.dndetails.NaamLeverancier,
                  NettoBerekend: this.dndetails.NettoBerekend,
                  Vrachtbrief: this.dndetails.Vrachtbrief,
                  Bonnr: this.dndetails.Bonnr,
                  Kenteken: this.dndetails.Kenteken,
                  User_IN: this.dndetails.User_IN,
                  Serial: this.dndetails.Serial,
                  Description: this.dndetails.Description,
                  Alloy: this.alloy
                })
              }
            }
          })
        }
      })
    },
    getalloys () {
      return axios
        .get(
          '/GetAlloys?Company=' + this.activecompany + '&castnr=' + this.castnr
        )
        .then(res => {
          // console.log(res.data)
          this.GetAlloys = res.data.map(data => (data.Alloy))
          return this.GetAlloys
        })
    },
    checkprocesscastnr () {
      this.$swal({
        title: this.$t('unloadbillet.processselection'),
        position: 'top',
        text: this.$t('unloadbillet.changeisdefinitif'),
        showCancelButton: true,
        confirmButtonText: this.$t('general.yes'),
        cancelButtonText: this.$t('general.no'),
        showCloseButton: true
      }).then(result => {
        if (result.value) {
          this.processcastnr()
        } else {
          this.feedback = this.$t('general.aborted')
        }
      })
    },
    processcastnr () {
      if (this.rows.length > 0) {
        this.errorfound = false
        this.loading = true
        axios
          .post('/ProcessBillets',
            JSON.stringify(this.rows), {
              headers: { 'Content-Type': 'application/json' },
              params: {
                company: this.activecompany,
                user: this.loggedinuser
              }
            })
          .then(response => {
            if (!response.status === 200) {
              this.playSound(true)
              this.errorfound = true
              this.feedback = response.data
            } else {
              this.playSound(false)
              this.errorfound = false
              this.feedback = response.data
              this.rows = []
            }
          })
          .catch(error => {
            this.playSound(true)
            this.errorfound = true
            this.feedback = error.response.data
          })
          .finally(() => {
            this.loading = false
            this.cancel()
          })
      } else {
        this.errorfound = true
        this.feedback = this.$t('unloadbillet.nothingtoprocess')
        this.cancel()
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
