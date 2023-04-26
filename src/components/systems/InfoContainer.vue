<template>
  <div>
    <b-overlay :show="loading" rounded="sm" spinner-variant="danger">
    <form>
      <b-container fluid class="p-0">
        <b-row>
          <b-col cols="12">
            <div v-bind:class="getClass()">
              <h2>
                {{ $t("infocontainer.title") }} {{info}}
                <h6>{{feedback}}</h6>
              </h2>
            </div>
          </b-col>
        </b-row>
        <div class="vdivider" />
        <b-row>
          <b-col cols="9">
            <!-- container -->
            <b-form-input
              @focus="$event.target.select()"
              id="container"
              ref="container"
              type="text"
              v-model="container"
              :placeholder= "this.$t('infocontainer.scancontainer')"
            />
          </b-col>
          <b-col cols="3">
            <b-button  :variant="buttonvariant" v-b-tooltip.hover :title="ps_printid" block
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
              :columns="columns"
              :rows="rows"
              :line-numbers="false"
              @on-cell-click="onCellClick"
              styleClass="vgt-table condensed"
              :search-options="{ enabled: true }"
              :sort-options="{ enabled: false, }"
              :pagination-options="{
             enabled: true,
              mode: 'pages',
              perPage: 5,
              perPageDropdown: [5, 15, 25],
              dropdownAllowAll: true,
              setCurrentPage: 1,
              nextLabel: '',
              prevLabel: '',
              rowsPerPageLabel: '',
              ofLabel: '/',
              pageLabel: '', // for 'pages' mode
              allLabel: 'All',}">
              <template slot="table-row" slot-scope="props">
              <span v-if="props.column.field == 'Color'">
                <span v-if="props.row.HexColor !== ''" class="dot" :style="{'background-color':props.row.HexColor, 'border-style':'solid'}"></span> <span>{{props.row.Color}}</span>
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
      // company: process.env.VUE_APP_COMPANY,
      pathpic: '',
      container: '',
      info: '',
      userinfo: '',
      retval: '',
      feedback: '',
      loading: false,
      errorfound: false,
      // test: '',
      columns: [
        {
          label: 'Cont',
          field: 'Container',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        },
        {
          label: 'Real',
          field: 'real',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        },
        {
          label: 'Item',
          field: 'Item',
          thClass: 'header',
          tdClass: 'cell'
        },
        {
          label: 'IQty',
          field: 'Qty',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        },
        {
          label: 'RQty',
          field: 'RQty',
          thClass: 'header',
          tdClass: 'cell'
        },
        {
          label: 'TOP',
          field: 'TOP',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        },
        {
          label: 'Color',
          field: 'Color',
          thClass: 'header',
          tdClass: 'cell',
          hidden: false
        },
        {
          label: 'Tekening',
          field: 'Tekening',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        },
        {
          label: 'CN',
          field: 'CN',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        },
        {
          label: 'DP',
          field: 'DP',
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
          label: 'Loc',
          field: 'Location',
          thClass: 'header',
          tdClass: 'cell',
          hidden: false
        },
        {
          label: 'SO',
          field: 'Salesheader',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        },
        {
          label: 'SL',
          field: 'Salesline',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        },
        {
          label: 'Item',
          field: 'Item',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        },
        {
          label: 'HexColor',
          field: 'HexColor',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
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
          label: 'HStatus',
          field: 'HStatus',
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
      selected: null,
      printers: [],
      selectedprinter: '',
      sellabelprinter: '',
      sellabeltype: '',
      printvisible: false,
      ps_printid: '',
      ps_copies: '1', // ???
      buttonvariant: 'primary' // can be used flexible
    }
  },
  computed: {
    ...mapState(['loginError', 'loginSuccessful', 'loggedinuser', 'prtlab', 'prtdoc', 'test', 'userbadge', 'activecompany'])
  },
  mixins: [beep],
  validations: {
    container: { required }
  },
  watch: {
    container: function (v) {
      this.container = v.toUpperCase().trim()
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
        this.container = ''
        this.$refs.container.focus()
        this.feedback = this.$t('general.waiting')
        this.getprinters()
      }
    })
  },
  methods: {
    onCellClick (params) {
      this.$swal({
        title: params.row.Item,
        html: '<p style="text-align:left">' +
            'Item: ' + this.clean(params.row.ItemFull) + '<BR>' +
            'O/L: ' + this.clean(params.row.Salesheader) + ' ' + this.clean(params.row.Salesline) + '<BR>' +
            'RQty/IQty: ' + this.clean(params.row.RQty) + '/' + this.clean(params.row.Qty) + '<BR>' +
            'TOP: ' + this.clean(params.row.TOP) + '<BR>' +
            'CN: ' + this.clean(params.row.CN) + ' (' + this.clean(params.row.CNID) + ')' + '<BR>' +
            'Creator: ' + this.clean(params.row.User) + '<BR>' +
            'Date: ' + this.clean(params.row.Created) + '<BR>' +
            'Real: ' + this.clean(params.row.Real) + '<BR>' +
            'CT: ' + this.clean(params.row.Container) + '<BR>' +
            'Sts L: ' + this.clean(params.row.Status) + ' H:' + this.clean(params.row.HStatus) + '<BR>' +
            'Zone: ' + this.clean(params.row.Zone) + '<BR>' +
            'Packs: ' + this.clean(params.row.Packs) +
            '</p>',
        position: 'top',
        width: 350,
        imageUrl: params.row.Drawing,
        imageWidth: 200,
        imageHeight: 100
      })
    },
    clean (passedvalue) {
      const result = passedvalue || ''
      return result
    },
    getClass () {
      if (this.errorfound) {
        return 'bg-danger text-white'
      } else {
        return 'bg-success text-white'
      }
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
    executesql () {
      this.rows = []
      this.retval = ''
      this.feedback = ''
      this.printvisible = false
      this.info = this.pack
      if (this.loggedinuser !== '' && this.loginSuccessful === true) {
        if (this.container !== '') {
          this.errorfound = false
          this.feedback = this.$t('general.busy')
          this.loading = true
          axios
            .get(
              '/GetInfoByContainerOrReal?company=' +
                this.activecompany +
                '&container=' +
                this.container
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
                this.feedback = this.$t('general.nodata') + ' ' + this.container
                this.$refs.container.focus()
                this.$refs.container.select()
              } else {
                this.playSound(false)
                this.rows = resultArray
                this.ps_printid = this.rows[0].PrintID
                this.errorfound = false
                this.info = this.container
                this.feedback = this.$t('general.click4details') + ' (' + this.rows.length + ')'
                this.printvisible = true
                this.container = ''
                this.$refs.container.focus()
                this.$refs.btnSearch.focus()
              }
            })
            .catch(error => {
              this.playSound(true)
              this.errorfound = true
              this.feedback = error.message
              this.container = ''
              this.$refs.container.focus()
            })
            .finally(() => { this.loading = false })
        } else {
          this.errorfound = true
          this.feedback = this.$t('general.waiting')
          this.$refs.container.focus()
        }
      } else {
        this.errorfound = true
        this.feedback = this.$t('general.login')
        this.$router.push('/')
      }
    },
    print () {
      this.feedback = this.$t('general.busy')
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
  border-radius: 50%;
  border-color: lightgray;
  border-width: 1px;
  display: inline-block;
}
</style>
