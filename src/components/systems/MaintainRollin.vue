<template>
  <div>
  <b-overlay :show="loading" rounded="sm" spinner-variant="danger">
      <b-container fluid class="p-0">
        <b-row>
          <b-col cols="12">
            <div class="vdivider" />
            <div v-bind:class="getClass()">
              <h2>
                {{ $t("maintainrollin.title") }} {{info}}
                <h6>{{feedback}}</h6>
              </h2>
            </div>
          </b-col>
        </b-row>
          <div class="vdivider" />
        <b-row v-if="showrollin == false">
          <!-- Shiftdata -->
          <b-col cols="9">
          <label for="shiftcode" class="col-sm-2 col-form-label sr-only">Shift</label>
              <b-form-input
                @focus="$event.target.select()"
                id="shiftcode"
                ref="shiftcode"
                type="text"
                v-model="shiftcode"
                :placeholder= "$t('maintainrollin.scanshiftcode')"
                v-on:keyup.enter="getshiftdata"
              />
        </b-col>
        <b-col cols="3">
            <b-button variant="primary" block
              type="submit"
              @click.prevent="getshiftdata"
            ><b-icon icon="calendar2-plus"></b-icon ></b-button>
          </b-col>
        </b-row>
        <b-row v-if="showrollin == true">
            <b-col cols="12">
            <b-alert show variant="dark">Shift: {{shiftdata}}</b-alert>
            </b-col>
      </b-row>
        <div class="vdivider" />
        <b-row v-if="showrollin == true">
          <b-col cols="9">
            <!-- PORef -->
            <label for="prodorder" class="col-sm-2 col-form-label sr-only">Order</label>
              <b-form-input
                @focus="$event.target.select()"
                id="prodorder"
                ref="prodorder"
                type="text"
                v-model="prodorder"
                :placeholder= "$t('maintainrollin.scanorder')"
                v-on:keyup.enter="executesql"
              />
          </b-col>
          <b-col cols="3">
            <b-button variant="primary" block
              type="submit"
              id="btnSearch"
              ref="btnSearch"
              @click.prevent="executesql"
            ><b-icon icon="search"></b-icon></b-button>
          </b-col>
        </b-row>
        <div class="vdivider" />
        <b-row v-if="rows.length > 0">
          <b-col cols="12">
            <!-- Goodtable plugin -->
            <vue-good-table
              :name="overview"
              :columns="columns"
              :rows="rows"
              @on-row-click="onRowClick"
              styleClass="vgt-table condensed"
              :search-options="{ enabled: false }"
              :sort-options="{ enabled: false, }">
              <template slot="table-row" slot-scope="props">
                <span v-if="props.column.field == 'Diff'">
                <span  v-if="props.row.Diff <= 0"  style="font-weight: bold; color: red;">{{props.row.Diff}}</span>
                <span  v-if="props.row.Diff > 0"  style="font-weight: bold; color: green;">{{props.row.Diff}}</span>
                </span>
                <span v-else>
                {{props.formattedRow[props.column.field]}}
                </span>
              </template>
            </vue-good-table>
          </b-col>
        </b-row>
      </b-container>
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
      loading: false,
      showrollin: false,
      shiftdata: '',
      ploeg: '',
      ploegdatum: '',
      maxnumber: 0,
      shiftcode: '',
      prodorder: '',
      input_number: 0,
      input_numberscrap: 0,
      input_container: '',
      input_reasoncode: '',
      input_action: '',
      input_appl: '',
      defValues: [],
      stepinfo: '',
      btntext: '',
      btncolor: '',
      workcenter: '',
      info: '',
      userinfo: '',
      retval: false,
      feedback: '',
      errorfound: false,
      overview: '',
      columns: [
        {
          label: 'ProdOrder',
          field: 'ProdOrder',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        },
        {
          label: 'Item',
          field: 'Component',
          thClass: 'header',
          tdClass: 'cell',
          hidden: false
        },
        {
          label: 'QtyN',
          field: 'QtyNeeded',
          thClass: 'header',
          hidden: false,
          tdClass: this.tdClassSuccess
        },
        {
          label: 'QtyR',
          field: 'QtyReported',
          thClass: 'header',
          hidden: true,
          tdClass: this.tdClassSuccess
        },
        {
          label: 'Seq',
          field: 'SeqNr',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        },
        {
          label: 'WC',
          field: 'Workcenter',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        },
        {
          label: 'Todo',
          field: 'Diff',
          thClass: 'header',
          tdClass: 'cell',
          hidden: false
        }
      ],
      rows: []
    }
  },
  computed: {
    ...mapState(['loginError', 'loginSuccessful', 'loggedinuser', 'test', 'activecompany'])
  },
  mixins: [beep],
  validations: {
    prodorder: { required }
  },
  watch: {
    prodorder: function (v) {
      this.prodorder = v.toUpperCase().trim()
    },
    shiftcode: function (v) {
      this.shiftcode = v.toUpperCase().trim()
    },
    defaultQty: function (v) {
      this.defaultQty = this.defaultQty
    }
  },
  mounted () {
    this.$nextTick(() => {
      if (this.loginSuccessful === false) {
        this.$router.push('/')
      } else {
        this.shiftcode = ''
        this.$refs.shiftcode.focus()
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
    tdClassSuccess (row) {
      if (row.QtyNeeded === row.QtyReported) {
        return 'successColumn'
      }
    },
    cancel () {
      this.input_number = ''
      this.input_container = ''
      // this.rows = []
      this.$refs.prodorder.focus()
    },
    async onRowClick (params) {
      this.feedback = this.$t('general.processing')
      this.cancelclicked = false
      const steps = ['1', '2', '3']
      const Queue = this.$swal.mixin({
        title: params.row.Component,
        html: '<p>Reported: ' + params.row.QtyReported +
              '<BR>Needed: ' + params.row.QtyNeeded + '</p>',
        position: 'top',
        input: 'text',
        confirmButtonText: 'Next &rarr;',
        showCancelButton: true,
        progressSteps: steps
      })
      await Queue.fire({
        currentProgressStep: 0,
        input: 'text',
        inputPlaceholder: 'Container',
        showLoaderOnConfirm: true,
        preConfirm: (value) => {
          return axios.post(
            '/CheckContainerInrol?Company=' +
                  this.activecompany +
                  '&container=' +
                  value +
                  '&item=' +
                  params.row.Component
          )
            .then(res => {
              if (!res.data.length) {
                this.maxnumber = 0
              } else {
                this.maxnumber = res.data[0].PCRQTY
              }
            })
        },
        inputValidator: (value) => { // Check if container exists (via sql)
          if (value !== '') {
            this.defValues[0] = value // Container
          }
        }
      }).then((result) => {
        if (result.isDismissed) {
          this.cancelclicked = true
          this.feedback = this.$t('general.aborted')
        }
      })
      if (!this.cancelclicked) {
        await Queue.fire({
          html: Number(this.maxnumber) > 0
            ? '<p>Reported: ' + params.row.QtyReported +
            '<BR>Needed: ' + params.row.QtyNeeded +
            '<BR>Qty in CT: ' + this.maxnumber +
            '</p>'
            : '<p>Reported: ' + params.row.QtyReported +
            '<BR>Needed: ' + params.row.QtyNeeded +
            '<BR>Qty in CT: ' + this.maxnumber +
            '<BR><strong>' + this.$t('maintainrollin.wrongoremptycontainer') + '</strong>' +
            '</p>',
          currentProgressStep: 1,
          position: 'top',
          input: 'number',
          inputPlaceholder: 'Number',
          inputValue: params.row.QtyNeeded,
          showConfirmButton: this.maxnumber > 0,
          inputValidator: (value) => {
          // console.log(this.getqty(params.row.QtyNeeded, params.row.QtyReported))
            if (!value || value > this.maxnumber) {
              return 'Invalid (max.' + this.maxnumber + ')'
            } else {
              this.defValues[1] = value // Number
            }
          }
        }).then((result) => {
          if (result.isDismissed) {
            this.cancelclicked = true
            this.feedback = this.$t('general.aborted')
          }
        })
      }
      if (!this.cancelclicked) {
        await Queue.fire({
          html: '<p>Reported: ' + params.row.QtyReported +
              '<BR>Needed: ' + params.row.QtyNeeded +
              '<BR>Qty in CT: ' + this.maxnumber + '</p>',
          currentProgressStep: 2,
          input: 'select',
          position: 'top',
          inputPlaceholder: 'NO SCRAP',
          inputOptions: this.getreasoncodes('4') // 4= kartelrange
        })
          .then((result) => {
          // console.log(result)
            if (result.isDismissed) {
              this.cancelclicked = true
              this.feedback = this.$t('general.aborted')
            } else {
              if (result) {
                this.defValues[2] = result.value // Reason
                this.input_container = this.defValues[0] // ingegeven waarde container
                this.input_number = this.defValues[1] // ingegeven waarde aantal
                this.input_reasoncode = this.defValues[2] // ingegeven waarde reasoncode
                if (this.input_reasoncode === '') {
                  this.btntext = this.$t('maintainrollin.register')
                  this.btncolor = '#28a745'
                  this.input_reasoncode = '0'
                  this.input_numberscrap = 0
                  this.input_number = this.defValues[1]
                  this.input_action = 'OUT'
                  this.input_appl = 'INROL'
                  this.stepinfo = '<p>Container: <strong>' + this.defValues[0] + '</strong><BR>' +
                  'Number: <strong>' + this.defValues[1] + '</strong><BR></p>'
                } else {
                  this.btntext = this.$t('maintainrollin.scrap')
                  this.btncolor = '#dc3545'
                  this.input_numberscrap = this.defValues[1]
                  this.input_number = 0
                  this.input_action = 'OUT'
                  this.input_appl = 'SCRAP'
                  this.stepinfo = '<p>Container: <strong>' + this.defValues[0] + '</strong><BR>' +
                  'Number: <strong>' + this.defValues[1] + '</strong><BR>' +
                  'Reasoncode: <strong><span style=color:red;">' + this.defValues[2] + '</span></strong></p>'
                }
                this.$swal.fire({
                  title: params.row.Component,
                  html: this.stepinfo,
                  position: 'top',
                  confirmButtonText: this.btntext,
                  confirmButtonColor: this.btncolor,
                  showCancelButton: true
                }).then((result) => {
                  if (result.value) {
                    this.registerinrol(params.row.ProdOrder, params.row.Component,
                      params.row.SeqNr, this.input_number, this.input_reasoncode, this.input_container,
                      params.row.Workcenter, this.input_action, this.ploeg, this.ploegdatum,
                      this.input_numberscrap, '', this.maxnumber, this.input_appl)
                  }
                })
              }
            }
          })
      }
    },
    GetQtyRemaining (container, item) {
      this.loading = true
      this.maxnumber = 0
      axios
        .post(
          '/CheckContainerInrol?Company=' +
                  this.activecompany +
                  '&container=' +
                  container +
                  '&item=' +
                  item
        )
        .then(res => {
          console.log(res.data)
          if (!res.data.length) {
            this.maxnumber = 0
          } else {
            this.maxnumber = res.data[0].PCRQTY
          }
        })
        .catch(error => console.log(error))
    },
    getreasoncodes (accountgroup) {
      return axios
        .get(
          '/GetReasonCodes?Company=' +
                   this.activecompany +
                   '&accountgroup=' +
                   accountgroup
        )
        .then(res => {
          console.log(res.data)
          return res.data
        })
    },
    registerinrol (prodorder, component, seq, number, reasoncode, container, workcenter, action, ploeg, ploegdatum, numberscrap, remark, maxnumber, appl) {
      this.feedback = this.$t('general.busy')
      this.loading = true
      this.errorfound = false
      axios
        .post(
          '/RegisterTransaction?company=' + this.activecompany +
            '&prodorder=' + prodorder +
            '&component=' + component +
            '&seq=' + seq +
            '&number=' + number +
            '&reasoncode=' + reasoncode +
            '&container=' + container +
            '&workcenter=' + workcenter +
            '&action=' + action +
            '&user=' + this.loggedinuser.substring(0, 25) +
            '&ploeg=' + ploeg +
            '&ploegdatum=' + ploegdatum +
            '&numberscrap=' + numberscrap +
            '&remark=' + remark +
            '&maxnumber=' + maxnumber +
            '&appl=' + appl
        )
        .then(res => {
          // check returndata
          this.playSound(false)
          this.feedback = res.data
          if (res.data.includes('Err')) {
            this.errorfound = true
          } else {
            this.errorfound = false
          }
          // Refresh grid
          this.executesql()
        })
        .catch(error => {
          this.playSound(true)
          this.errorfound = true
          this.feedback = error.message
        })
        .finally(() => {
          this.loading = false
        })
    },
    getqty (QtyNeeded, QtyRemaining) {
      if (QtyNeeded - QtyRemaining > 0) {
        return QtyRemaining
      } else {
        return QtyNeeded
      }
    },
    getshiftdata () {
      // console.log(this.company)
      this.errorfound = false
      if (this.shiftcode) {
        this.feedback = this.$t('maintainrollin.getshift')
        this.loading = true
        axios
          .get(
            '/GetShiftData?Company=' +
                  this.activecompany +
                  '&shiftcode=' +
                  this.shiftcode
          )
          .then(res => {
            if (!res.data.length) {
              this.errorfound = true
              this.feedback = this.$t('maintainrollin.noshiftdata')
              this.shiftdata = ''
              this.ploegdatum = ''
              this.workcenter = ''
              this.ploeg = ''
              this.showrollin = false
            } else {
              this.feedback = this.$t('maintainrollin.scanorder')
              this.shiftdata = res.data[0].Datum + ' ' + res.data[0].Ploeg + ' ' + res.data[0].Workcenter
              this.ploegdatum = res.data[0].Datum
              this.ploeg = res.data[0].Ploeg
              this.workcenter = res.data[0].Workcenter
              this.showrollin = true
              this.prodorder = ''
              this.$nextTick(function () {
                this.$refs.prodorder.focus()
              })
              this.errorfound = false
            }
          })
          .catch(error => {
            this.playSound(true)
            this.errorfound = true
            this.feedback = error.message
            this.$refs.shiftcode.select()
            this.$refs.shiftcode.focus()
          })
          .finally(() => { this.loading = false })
      } else {
        this.errorfound = true
        this.$refs.shiftcode.select()
        this.$refs.shiftcode.focus()
        this.feedback = this.$t('general.mandatory')
      }
    },
    executesql () {
      this.rows = []
      this.retval = ''
      this.feedback = ''
      this.info = ''
      if (this.loggedinuser !== '' && this.loginSuccessful === true) {
        if (this.prodorder.match('^[0-9]{1,8}$')) {
          this.errorfound = false
          this.feedback = this.$t('general.busy')
          this.loading = true
          axios
            .get(
              '/GetProductionOrderDetails?company=' +
                this.activecompany +
                '&prodorder=' +
                this.prodorder +
                '&workcenter=' +
                this.workcenter
            )
            .then(res => {
              const data = res.data
              const resultArray = []
              for (let key in data) {
                resultArray.push(data[key])
              }
              if (!resultArray.length) {
                this.playSound(true)
                this.errorfound = true
                this.feedback = this.$t('general.nodata')
                this.prodorder = ''
                this.$refs.prodorder.focus()
              } else {
                this.playSound(false)
                this.rows = resultArray
                this.errorfound = false
                this.feedback = this.$t('general.click2process')
                // this.$refs.btnSearch.focus()
                this.$refs.prodorder.focus()
              }
            })
            .catch(error => {
              this.playSound(true)
              this.errorfound = true
              this.feedback = error.message
              this.prodorder = ''
              this.$refs.prodorder.focus()
            })
            .finally(() => { this.loading = false })
        } else {
          this.errorfound = true
          this.feedback = this.$t('general.waiting')
          this.$refs.prodorder.focus()
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
.successColumn {
  color: #4CAF50;
  font-weight: bold ;
}
</style>
