<template>
  <div>
  <b-overlay :show="loading" rounded="sm" spinner-variant="danger">
    <form>
      <b-container fluid class="p-0">
        <b-row>
          <b-col cols="12">
            <div class="vdivider" />
            <div v-bind:class="getClass()">
              <h2>
                {{ $t("infolocation.title") }} {{info}}
                <h6>{{feedback}}</h6>
              </h2>
            </div>
          </b-col>
        </b-row>
          <div class="vdivider" />
        <b-row>
          <b-col cols="9" >
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
            <b-button variant="primary" v-b-tooltip.hover :title="ps_printid" block
              type="submit"
              id="btnSearch"
              ref="btnSearch"
              @click.prevent="executesql"
            ><b-icon icon="search"></b-icon></b-button>
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
        <b-row v-if="rows.length > 0">
          <b-col cols="12">
            <!-- Goodtable plugin -->
            <vue-good-table
              :columns="columns"
              :rows="rows"
              :line-numbers="false"
              @on-row-click="onRowClick"
              styleClass="vgt-table condensed"
              :row-style-class="rowStyleFn"
              :search-options="{ enabled: false }"
              :sort-options="{ enabled: false, }"
              :pagination-options="{
              enabled: true,
              mode: 'pages',
              perPage: 5,
              perPageDropdown: [5, 10, 20],
              dropdownAllowAll: true,
              setCurrentPage: 1,
              nextLabel: '',
              prevLabel: '',
              rowsPerPageLabel: '',
              ofLabel: '/',
              pageLabel: '', // for 'pages' mode
              allLabel: 'All',
            }">
            <template slot="table-row" slot-scope="props">
              <span v-if="props.column.field == 'Info'">
                <div v-if="props.row.HexColor !==''">
                <span  class="dot" :style="{'background-color':props.row.HexColor, 'border-style':'solid'}"></span> <span>{{props.row.Info}}</span>
                </div>
                <div v-else>
                <span>{{props.row.Info}}</span>
                </div>
              </span>
            </template>
            <template slot="table-column" slot-scope="props">
              <span v-if="props.column.label =='Cont'">
                  {{props.column.label}} ({{rows.length}})
              </span>
              <span v-else>
                  {{props.column.label}}
              </span>
          </template>
            </vue-good-table>
          </b-col>
        </b-row>
        <b-row v-if="rows_detail.length > 0">
          <b-col cols="12">
            <!-- Goodtable plugin -->
            <vue-good-table
              :columns="columns_detail"
              :rows="rows_detail"
              @on-cell-click="onCellClick"
              compactMode
              :line-numbers="false"
              :search-options="{ enabled: true }"
              :sort-options="{ enabled: false, }"
              :pagination-options="{
              enabled: true,
              mode: 'pages',
              perPage: 1,
              setCurrentPage: 1,
              nextLabel: '',
              prevLabel: '',
              rowsPerPageLabel: '',
              ofLabel: '/',
              pageLabel: ''}"
              styleClass="vgt-table condensed"
              >
              <template slot="table-row" slot-scope="props">
              <span v-if="props.column.field == 'Item'">
                <div v-if="props.row.HexColor !==''">
                <span  class="dot" :style="{'background-color':props.row.HexColor, 'border-style':'solid'}"></span> <span>{{props.row.Item}}</span>
                </div>
                <div v-else>
                <span>{{props.row.Item}}</span>
                </div>
              </span>
            </template>
            </vue-good-table>
          </b-col>
        </b-row>
        <b-row v-if="rows_pdetail.length > 0">
          <b-col cols="12">
            <!-- Goodtable plugin -->
            <vue-good-table
              :columns="columns_pdetail"
              :rows="rows_pdetail"
              @on-cell-click="onCellClick"
              :line-numbers="false"
              :search-options="{ enabled: false }"
              :sort-options="{ enabled: false, }"
              :pagination-options="{
              enabled: true,
              mode: 'pages',
              perPage: 5,
              setCurrentPage: 1,
              nextLabel: '',
              prevLabel: '',
              rowsPerPageLabel: '',
              ofLabel: '/',
              pageLabel: ''}"
              styleClass="vgt-table condensed"
              >
              <template slot="table-row" slot-scope="props">
              <span v-if="props.column.field == 'Item'">
                <div v-if="props.row.HexColor !==''">
                <span  class="dot" :style="{'background-color':props.row.HexColor, 'border-style':'solid'}"></span> <span>{{props.row.Item}}</span>
                </div>
                <div v-else>
                <span>{{props.row.Item}}</span>
                </div>
              </span>
            </template>
            <template slot="table-column" slot-scope="props">
              <span v-if="props.column.label =='Pack'">
                  {{props.column.label}} ({{rows_pdetail.length}})
              </span>
              <span v-else>
                  {{props.column.label}}
              </span>
          </template>
            </vue-good-table>
          </b-col>
        </b-row>
        <div class="vdivider" />
        <b-row v-show="printvisible">
          <b-col cols="6">
            <!-- printers -->
             <b-form-select
                v-b-tooltip.hover :title="this.selectedprinter"
                v-model="selectedprinter"
                :options="printers"
                value-field="value"
                text-field="text"
                >
            </b-form-select>
          </b-col>
          <b-col cols="3">
            <b-button v-b-tooltip.hover :title="ps_printid" block
              :variant="buttonvariant"
              type="button"
              id="printbtn"
              ref="printbtn"
              @submit.prevent
              @click="print"
            ><b-icon icon="tag-fill"></b-icon></b-button>
          </b-col>
        </b-row>
        <div class="vdivider" />
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
      containerstatus: '80',
      location: '',
      selected: 'C',
      pathpic: '',
      info: '',
      userinfo: '',
      retval: '',
      feedback: '',
      errorfound: false,
      loading: false,
      level: '',
      showlevel: false,
      columns: [
        {
          label: 'Loc',
          field: 'Loc',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        },
        {
          label: 'Cont',
          field: 'Cont',
          thClass: 'header',
          tdClass: 'cell',
          hidden: false
        },
        {
          label: 'Zone',
          field: 'Zone',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        },
        {
          label: 'Status',
          field: 'Status',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        },
        {
          label: 'Created',
          field: 'Created',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        },
        {
          label: 'User',
          field: 'User',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        },
        {
          label: 'Info',
          field: 'Info',
          thClass: 'header',
          tdClass: 'cell',
          hidden: false
        },
        {
          label: 'HexColor',
          field: 'HexColor',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        },
        {
          label: 'PrintID',
          field: 'PrintID',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        }
      ],
      rows: [],
      columns_detail: [
        {
          label: 'Cont',
          field: 'Cont',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        },
        {
          label: 'Loc',
          field: 'Loc',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        },
        {
          label: 'Order',
          field: 'Order',
          thClass: 'header',
          tdClass: 'cell',
          hidden: false
        },
        {
          label: 'Line',
          field: 'Line',
          thClass: 'header',
          tdClass: 'cell',
          hidden: false
        },
        {
          label: 'Item',
          field: 'Item',
          thClass: 'header',
          tdClass: 'cell',
          hidden: false
        },
        {
          label: 'Qty',
          field: 'Qty',
          thClass: 'header',
          tdClass: 'cell',
          hidden: false
        },
        {
          label: 'TOP',
          field: 'TOP',
          thClass: 'header',
          tdClass: 'cell',
          hidden: false
        },
        {
          label: 'Cn',
          field: 'Cn',
          thClass: 'header',
          tdClass: 'cell',
          hidden: false
        },
        {
          label: 'Id',
          field: 'Id',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        },
        {
          label: 'Created',
          field: 'Created',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        },
        {
          label: 'Packs',
          field: 'Packs',
          thClass: 'header',
          tdClass: 'cell',
          hidden: false
        },
        {
          label: 'Drawing',
          field: 'Drawing',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        }
      ],
      rows_detail: [],
      columns_pdetail: [
        {
          label: 'Pack',
          field: 'Pack',
          thClass: 'header',
          tdClass: 'cell',
          hidden: false
        },
        {
          label: 'Loc',
          field: 'Loc',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        },
        {
          label: 'Order',
          field: 'Order',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        },
        {
          label: 'Line',
          field: 'Line',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        },
        {
          label: 'Item',
          field: 'Item',
          thClass: 'header',
          tdClass: 'cell',
          hidden: false
        },
        {
          label: 'Qty',
          field: 'Qty',
          thClass: 'header',
          tdClass: 'cell',
          hidden: false
        },
        {
          label: 'Cn',
          field: 'Cn',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        },
        {
          label: 'Id',
          field: 'Id',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        },
        {
          label: 'Created',
          field: 'Created',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        },
        {
          label: 'Drawing',
          field: 'Drawing',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        }
      ],
      rows_pdetail: [],
      options: [
        { item: 'A', name: 'A' },
        { item: 'B', name: 'B' },
        { item: 'C', name: 'C' },
        { item: 'D', name: 'D' },
        { item: 'E', name: 'E' },
        { item: 'F', name: 'F' }
      ],
      selectedprinter: '',
      printers: [],
      sellabelprinter: '',
      sellabeltype: '',
      printvisible: false,
      ps_printid: '',
      ps_copies: '1', // ???
      buttonvariant: 'primary' // can be used flexible
    }
  },
  computed: {
    ...mapState(['loginError', 'loginSuccessful', 'loggedinuser', 'prtlab', 'prtdoc', 'test', 'activecompany', 'userbadge'])
  },
  mixins: [beep],
  validations: {
    location: { required }
  },
  watch: {
    location: function (v) {
      // this.location = v.toUpperCase().trim()
      this.level = ''
      if ((this.location.charAt(0) !== 'A' & (this.location.slice(-1) === 'L' || this.location.slice(-1) === 'R')) || this.location.slice(-1) === '-') {
        this.showlevel = true
      } else {
        this.showlevel = false
      }
      this.feedback = this.location
      // this.info = this.location + this.level
    },
    level: function (v) {
      this.rows = []
      this.rows_detail = []
      this.rows_pdetail = []
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
    },
    selectedprinter: function (v) {
      var prt = this.printers.find(option => option.value === this.selectedprinter)
      this.sellabelprinter = prt.value
      this.sellabeltype = prt.text
    }
  },
  mounted () {
    this.$nextTick(() => {
      if (this.loginSuccessful === false) {
        this.$router.push('/')
      } else {
        this.location = ''
        this.$refs.location.focus()
        this.feedback = 'Waiting for input'
        this.getprinters()
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
    rowStyleFn (row) {
      return row.originalIndex === this.selectedRow ? 'selectedRow' : ''
    },
    onCellClick (params) {
      if (params.row.Cont.includes('PO') || params.row.Cont.includes('PA')) {
        this.pathpic = process.env.VUE_APP_IMG_URL + 'BFBE/JPG/' + 'al_' + params.row.Order + '_' + params.row.Line + '.jpg'
      } else {
        this.pathpic = process.env.VUE_APP_IMG_URL + params.row.Drawing
      }
      if (params.column.field === 'Item') { // click on item
        this.$swal({
          title: params.row.Item,
          html: '<p style="text-align:left">' +
            'O/L: ' + this.clean(params.row.Order) + ' ' + this.clean(params.row.Line) + '<BR>' +
            'Status: ' + this.clean(params.row.Ostatus) + '<BR>' +
            'CN: ' + this.clean(params.row.Cn) +
            'CNid: ' + this.clean(params.row.Id) + '<BR>' +
            'Container: ' + this.clean(params.row.Cont) + '<BR>' +
            'Cnt Date: ' + this.makedate(params.row.Created) + '<BR>' +
            'Cnt Status: ' + this.clean(params.row.Cstatus) + '<BR>' +
            'Location: ' + this.clean(params.row.Loc) + '<BR>' +
            'Zone: ' + this.clean(params.row.Zone) + '<BR>' +
            'Color: ' + this.clean(params.row.Color) +
            '</p>',
          position: 'top',
          width: 350,
          imageUrl: this.pathpic,
          imageWidth: 200,
          imageHeight: 100
        })
      }
      if (params.column.field === 'Packs') { // click on 'packs'
        this.feedback = params.row.Cont
        this.selectedRow = params.row.originalIndex
        this.getdetailpack(params.row.Cont)
      }
    },
    clean (passedvalue) {
      const result = passedvalue || ''
      return result
    },
    makedate (passedvalue) { // yyyyMMddHHmmss -> dd/MM/yyyy HH:mm
      var hour
      var minute
      if (passedvalue !== '') {
        var year = passedvalue.substr(0, 4)
        var month = passedvalue.substr(4, 2)
        var day = passedvalue.substr(6, 2)
        if (passedvalue.length === 13) {
          hour = passedvalue.substr(8, 1)
          minute = passedvalue.substr(9, 2)
        } else {
          hour = passedvalue.substr(8, 2)
          minute = passedvalue.substr(10, 2)
        }
        return day + '/' + month + '/' + year + ' ' + hour + ':' + minute
      }
    },
    onRowClick (params) {
      this.feedback = params.row.Cont
      this.selectedRow = params.row.originalIndex
      this.ps_printid = params.row.PrintID
      if (this.ps_printid > 0) {
        this.printvisible = true
      } else {
        this.printvisible = false
      }
      this.getdetaildata(params.row.Cont)
    },
    executesql () {
      this.rows = []
      this.rows_detail = []
      this.rows_pdetail = []
      this.retval = ''
      this.feedback = ''
      this.info = ''
      if (this.loggedinuser !== '' && this.loginSuccessful === true) {
        if (this.location !== '') {
          this.errorfound = false
          this.feedback = this.$t('infolocation.searching') + ' ' + this.location + this.level
          this.loading = true
          axios
            .get(
              '/GetContainerByLocation?company=' +
                this.activecompany +
                '&location=' +
                this.location + this.level
            )
            .then(res => {
              this.info = this.location + this.level
              const data = res.data
              const resultArray = []
              for (let key in data) {
                resultArray.push(data[key])
              }
              if (!resultArray.length) {
                this.playSound(true)
                this.errorfound = true
                this.feedback = this.$t('general.nodata') + ' ' + this.location + this.level
                this.$refs.location.focus()
                this.$refs.location.select()
              } else {
                this.playSound(false)
                this.rows = resultArray
                this.errorfound = false
                this.feedback = this.location + this.level + ' (' + this.rows.length + ')'
                this.level = ''
                this.$refs.btnSearch.focus()
              }
            })
            .catch(error => {
              this.playSound(true)
              this.errorfound = true
              this.feedback = error.message
              this.$refs.location.select()
              this.$refs.location.focus()
            })
            .finally(() => { this.loading = false })
        } else {
          this.errorfound = true
          this.feedback = this.$t('general.waiting')
          this.$refs.location.focus()
        }
      } else {
        this.errorfound = true
        this.feedback = this.$t('general.login')
        this.$router.push('/')
      }
    },
    getdetaildata (container) {
      this.rows_pdetail = []
      this.loading = true
      return axios
        .get(
          '/GetDetailsPerContainer?Company=' +
                   this.activecompany +
                   '&container=' +
                   container
        )
        .then(res => {
          const data = res.data
          const resultArray = []
          for (let key in data) {
            resultArray.push(data[key])
          }
          if (!resultArray.length) {
            this.rows_detail = []
          } else {
            this.rows_detail = resultArray
          }
        })
        .finally(() => { this.loading = false })
    },
    getdetailpack (container) {
      this.loading = true
      return axios
        .get(
          '/GetDetailsPackByContainer?Company=' +
                   this.activecompany +
                   '&container=' +
                   container
        )
        .then(res => {
          const data = res.data
          const resultArray = []
          for (let key in data) {
            resultArray.push(data[key])
          }
          if (!resultArray.length) {
            this.rows_pdetail = []
          } else {
            this.rows_pdetail = resultArray
          }
        })
        .catch(error => {
          this.errorfound = true
          this.feedback = error.message
        })
        .finally(() => { this.loading = false })
    },
    async getprinters () {
      await axios
        .get(
          '/GetPrinters?badgeid=' + this.userbadge
        )
        .then(res => {
          console.log(res.data)
          this.printers = res.data
          this.selectedprinter = this.printers[0].value
        })
        .catch(error => {
          console.log(error.message)
        })
    },
    print () {
      this.feedback = 'Processing'
      if (this.sellabelprinter.trim() === '') {
        this.playSound(true)
        this.errorfound = true
        this.feedback = this.$t('infolocation.noprinterdefined')
        return
      }
      if (this.ps_printid === '') {
        this.playSound(true)
        this.errorfound = true
        this.feedback = this.$t('infolocation.nolabeldefined')
        return
      }
      console.log('id:' + this.ps_printid)
      // this.ps_printid = this.rows[0].PrintID
      if (this.ps_printid !== 0) {
        this.loading = true
        this.errorfound = false
        axios
          .post( // returns printid on success
            '/Printservice?Company=' +
                  this.activecompany +
                  '&Printer=' +
                  this.sellabelprinter +
                  '&Labeltype=' +
                  this.sellabeltype +
                  '&Copies=' +
                  this.ps_copies +
                  '&LabelID=' +
                  this.ps_printid +
                  '&User=' +
                  this.loggedinuser
          )
          .then(res => {
            this.playSound(false)
            this.errorfound = false
            this.feedback = res.data
          })
          .catch(error => {
            this.playSound(true)
            this.errorfound = true
            this.feedback = error.message
          })
          .finally(() => { this.loading = false })
        this.ps_printid = ''
      } else {
        this.feedback = this.$t('general.noprintid')
        this.printvisible = false
        this.container = ''
        this.$refs.container.focus()
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
.dot {
  height: 15px;
  width: 15px;
  border-radius: 20%;
  border-color: lightgray;
  border-width: 1px;
  display: inline-block;
}
.selectedRow {
  background-color: rgb(255, 254, 170);
}
</style>
