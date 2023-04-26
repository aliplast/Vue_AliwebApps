<template>
  <div>
      <b-overlay :show="loading" rounded="sm">
      <b-container fluid class="p-0">
        <b-row>
          <b-col cols="12">
            <div class="vdivider" />
            <div v-bind:class="getClass()">
              <h2>
                {{ $t("receivetolocation.title") }} {{info}}
                <h6>{{feedback}}</h6>
              </h2>
            </div>
          </b-col>
        </b-row>
          <div class="vdivider" />
        <b-row>
          <b-col cols="6">
            <!-- PORef -->
              <b-form-input
                @focus="$event.target.select()"
                id="poref"
                ref="poref"
                type="text"
                v-model="poref"
                :placeholder= "$t('receivetolocation.scanporef')"
                 v-on:keyup.enter="executesql"
              />
          </b-col>
          <b-col cols="3">
            <b-button variant="primary" block
              type="submit"
              @click.prevent="executesql"
            ><b-icon icon="search"></b-icon></b-button>
          </b-col>
          <b-col cols="3">
            <b-button v-b-tooltip.hover  :title="this.$t('general.cancel')" block
              variant="secondary"
              type="button"
              @submit.prevent
              @click="cancel"
            ><b-icon icon="life-preserver"></b-icon></b-button>
          </b-col>
        </b-row>
        <div class="vdivider" />
        <b-row v-if="rows.length > 0">
          <b-col cols="12">
            <!-- Goodtable plugin -->
            <vue-good-table
              :name="test"
              :columns="columns"
              :rows="rows"
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
              allLabel: 'All',
            }"
            >
            </vue-good-table>
          </b-col>
        </b-row>
           <div class="vdivider" />
        <b-card v-if="showscanarea" :sub-title="cardtitle" bg-variant="light" border-variant="dark">
          <b-form-row>
          <b-col cols="4">
                <b-form-input
                  @focus="$event.target.select()"
                  id="scandrager"
                  ref="scandrager"
                  type="text"
                  v-model="scandrager"
                  :placeholder= "$t('receivetolocation.scandrager')"
                  v-on:keyup.enter="movetonextcontrol"
                />
            </b-col>
            <b-col cols="3">
              <!-- PORef -->
                <b-form-input
                  @focus="$event.target.select()"
                  id="scanqty"
                  ref="scanqty"
                  type="number"
                  v-model="scanqty"
                  :placeholder= "$t('receivetolocation.scanqty')"
                  v-on:keyup.enter="movetolastcontrol"
                />
            </b-col>
            <b-col cols="3">
              <!-- PORef -->
                <b-form-input
                  @focus="$event.target.select()"
                  id="scanloc"
                  ref="scanloc"
                  type="text"
                  v-model="scanloc"
                  :placeholder= "$t('receivetolocation.scanloc')"
                  v-on:keyup.enter="add2table"
                />
            </b-col>
            <b-col cols="2">
              <b-button :variant="signaltodo" block
              type="submit"
              @click.prevent="add2table"
            >{{scanqtytodo}}</b-button>
            </b-col>
          </b-form-row>
          <div class="vdivider" />
          <b-form-row v-if="rowsprocess.length > 0">
            <b-col cols="12">
              <!-- Goodtable plugin -->
              <vue-good-table
                :columns="columnsprocess"
                :rows="rowsprocess"
                @on-cell-click="onCellClickremove"
                styleClass="vgt-table condensed"
              >
              </vue-good-table>
            </b-col>
          </b-form-row>
          <div class="vdivider" />
          <b-form-row v-if="rowsprocess.length > 0">
          <b-col cols="9">
          </b-col>
          <b-col cols="3">
          <b-button v-b-tooltip.hover  :title="this.$t('general.process')" block
              variant="outline-dark"
              type="button"
              @submit.prevent
              @click="executeputaway"
            ><b-icon icon="gear-fill"></b-icon></b-button>
          </b-col>
          </b-form-row>
        </b-card>
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
      poref: '',
      pathpic1: '',
      pathpic2: '',
      info: '',
      userinfo: '',
      retval: '',
      feedback: '',
      errorfound: false,
      bin: '',
      proposals: '',
      po_nr: '',
      po_line: '',
      po_item: '',
      po_need: '',
      po_open: '',
      po_todo: '',
      po_need_check: '',
      po_carrier: '',
      po_loc: '',
      valid: false,
      duplicate: false,
      loading: false,
      columns: [
        {
          label: 'POnr',
          field: 'POnr',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        },
        {
          label: 'Type',
          field: 'Type',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        },
        {
          label: 'Line',
          field: 'Line',
          thClass: 'header',
          tdClass: this.tdClassActive
        },
        {
          label: 'ORef',
          field: 'ORef',
          thClass: 'header',
          tdClass: 'cell'
        },
        {
          label: 'YRef',
          field: 'YRef',
          thClass: 'header',
          tdClass: 'cell'
        },
        {
          label: 'Need',
          field: 'Need',
          thClass: 'header',
          tdClass: 'cell'
        },
        {
          label: 'Open',
          field: 'Open',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        },
        {
          label: 'Todo',
          field: 'Todo',
          thClass: 'header',
          tdClass: this.tdClassTodo // use boostrap classes
          // hidden: true
        },
        {
          label: 'Unit',
          field: 'Unit',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        },
        {
          label: 'Descr',
          field: 'Descr',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        },
        {
          label: 'Suppl',
          field: 'Suppl',
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
        },
        {
          label: 'Bin',
          field: 'Bin',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        },
        {
          label: 'Proposals',
          field: 'Proposals',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        }
      ],
      rows: [],
      scandrager: '',
      drager: '',
      scanqty: '',
      scanloc: '',
      scanqtycalc: 0,
      scanqtytodo: 0,
      showscanarea: false,
      signaltodo: 'success',
      cardtitle: '',
      activerow: null,
      rowsprocess: [],
      columnsprocess: [
        {
          label: 'PL',
          field: 'palletnr',
          thClass: 'header',
          tdClass: 'cell',
          hidden: false
        },
        {
          label: 'Qty',
          field: 'qty',
          thClass: 'header',
          tdClass: 'cell',
          hidden: false
        },
        {
          label: 'PO',
          field: 'po',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        },
        {
          label: 'Ln',
          field: 'poline',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        },
        {
          label: 'Item',
          field: 'item',
          thClass: 'header',
          tdClass: 'cell',
          hidden: false
        },
        {
          label: 'Loc',
          field: 'loc',
          thClass: 'header',
          tdClass: 'cell',
          hidden: false
        }
      ]
    }
  },
  computed: {
    ...mapState(['loginError', 'loginSuccessful', 'loggedinuser', 'test', 'badge', 'activecompany'])
  },
  mixins: [beep],
  validations: {
    poref: { required }
  },
  watch: {
    scandrager: function (v) {
      // console.log(v)
      this.scandrager = v.trim() // v.toUpperCase().trim() // PART1 - check drager
      if (/^[A-Z]{2}[0-9]{6,7}$/.test(this.scandrager) === false && this.scandrager !== '' && this.scandrager.slice(0, 2) !== 'D-') {
        this.drager = 'D-' + this.scandrager
      } else {
        this.drager = this.scandrager
      }
      this.feedback = this.drager
    },
    poref: function (v) {
      this.poref = v.toUpperCase().trim()
    }
  },
  mounted () {
    this.$nextTick(() => {
      if (this.loginSuccessful === false) {
        this.$router.push('/')
      } else {
        this.showscanarea = false
        this.poref = ''
        this.$refs.poref.focus()
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
    tdClassTodo (row) {
      if (row.Todo > 0 && row.Open > 0) {
        return 'text-warning'
      } else {
        if (row.Todo < 0) {
          return 'text-success'
        } else { return 'text-danger' }
      }
    },
    tdClassActive (row) {
      if (this.activerow === row.originalIndex) {
        return 'text-primary'
      } else {
        return null
      }
    },
    cancel () {
      this.errorfound = false
      this.feedback = this.$t('general.waiting')
      this.rows = []
      this.rowsprocess = []
      this.showscanarea = false
      this.poref = ''
      this.$refs.poref.focus()
    },
    movetofirstcontrol: function (event) {
      this.$refs.scandrager.focus()
      this.scandrager = ''
    },
    movetonextcontrol: function (event) {
      this.$refs.scanqty.focus()
    },
    movetolastcontrol: function (event) {
      this.$refs.scanloc.focus()
    },
    async add2table () {
      this.errorfound = false
      this.duplicate = this.checkIfExists(this.drager)
      // console.log('1.' + this.duplicate)
      this.valid = await this.checkIfExistsInDB(this.drager, this.po_item)
      // console.log('2.' + this.valid)
      if (!this.duplicate && this.valid) {
        if (this.scanqty > 0 && this.drager.trim() !== '' && this.scanloc.trim() !== '') {
          this.rowsprocess.push({
            palletnr: this.drager,
            qty: this.scanqty,
            loc: this.scanloc,
            po: this.po_nr,
            poline: this.po_line,
            item: this.po_item
          })
          // calculated todo
          const calctodo = this.rowsprocess.reduce((total, item) => total + parseInt(item.qty), 0)
          this.scanqtytodo = Number(this.scanqtycalc) - calctodo
          this.signaltodo = this.scanqtytodo < 0 ? 'danger' : 'success'
          this.feedback = this.$t('receivetolocation.palletadded')
        } else {
          this.errorfound = true
          this.feedback = this.$t('general.missingdata')
        }
        this.movetofirstcontrol()
      } else {
        this.errorfound = true
        this.feedback = this.$t('general.duplicatedata')
      }
    },
    checkIfExists (pallet) {
      this.duplicate = this.rowsprocess.some(item => {
        return item.palletnr === pallet
      })
      return this.duplicate
    },
    async checkIfExistsInDB (pallet, item) {
      const res = await axios
        .post('/CheckIfPACExists?Company=' + this.activecompany + '&container=' + pallet + '&item=' + item)
      if (res.data === '1') { this.valid = true } else { this.valid = false }
      // console.log(res.data)
      return this.valid
    },
    onCellClickremove (params) {
      this.$swal({
        title: this.$t('general.rusure'),
        text: this.$t('general.definitif'),
        showCancelButton: true,
        confirmButtonText: this.$t('general.yes'),
        cancelButtonText: this.$t('general.no'),
        showCloseButton: true
      }).then(result => {
        if (result.value) {
          // delete clicked row
          this.rowsprocess.splice(params.rowIndex, 1)
          const calctodo = this.rowsprocess.reduce((total, item) => total + parseInt(item.qty), 0)
          this.scanqtytodo = Number(this.scanqtycalc) - calctodo
          this.signaltodo = this.scanqtytodo < 0 ? 'danger' : 'success'
        }
      })
    },
    executeputaway () {
      this.feedback = this.$t('general.busy')
      this.loading = true
      this.errorfound = false
      axios
        .post('/Putaway2',
          JSON.stringify(this.rowsprocess), {
            headers: { 'Content-Type': 'application/json' },
            params: {
              company: this.activecompany,
              user: this.loggedinuser
            }
          })
        .then(res => {
          this.playSound(false)
          this.errorfound = false
          this.feedback = res.data + ' ' + this.$t('receivetolocation.receiptscreated')
          this.cancel()
        })
        .catch(error => {
          this.playSound(true)
          this.errorfound = true
          this.feedback = error.message
        })
        .finally(() => { this.loading = false })
    },
    onCellClick (params) {
      this.activerow = params.row.originalIndex
      this.po_nr = params.row.POnr
      this.po_line = params.row.Line
      this.po_item = params.row.ORef
      if (params.column.field === 'ORef') {
        // this.showscanarea = false
        this.po_need_check = params.row.Todo // controle
        this.pathpic2 = process.env.VUE_APP_IMG_URL + params.row.Drawing
        if (params.row.Bin !== '') { this.bin = '<BR>Bin: ' + params.row.Bin } else { this.bin = '' }
        if (params.row.Unit !== '') { this.bin = '<BR>Unit: ' + params.row.Unit }
        if (params.row.Proposals !== '') { this.proposals = '<BR>' + params.row.Proposals } else { this.proposals = '' }
        this.$swal.fire({
          title: params.row.ORef,
          html: '<p>' + params.row.Descr + this.bin + this.proposals + '</p>',
          position: 'top',
          width: 350,
          imageUrl: this.pathpic2,
          imageWidth: 200,
          imageHeight: 100
        })
      }
      if (params.column.field === 'Line' && params.row.Todo > 0) {
        if (params.row.Type === 'BT') {
          this.$swal.fire(this.$t('receivetolocation.wrongtype') + ' (' + params.row.Type + ')')
        } else {
          this.showscanarea = true
          this.scanqtycalc = params.row.Todo
          this.scanqtytodo = params.row.Todo
          this.cardtitle = this.po_nr + '/' + this.po_line + ' - ' + this.po_item
        }
      } else {
        this.feedback = this.$t('receivetolocation.todo') + ' ' + params.row.Todo
      }
    },
    executesql () {
      this.showscanarea = false
      this.rows = []
      this.rowsprocess = []
      this.scandrager = ''
      this.scanloc = ''
      this.scanqty = ''
      this.retval = ''
      this.feedback = ''
      this.info = ''
      if (this.loggedinuser !== '' && this.loginSuccessful === true) {
        if (this.poref.match('^[0-9]{1,8}$')) {
          this.errorfound = false
          this.feedback = this.$t('general.busy')
          this.loading = true
          axios
            .get(
              '/GetPODetails?company=' +
                this.activecompany +
                '&poref=' +
                this.poref
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
                this.poref = ''
                this.$refs.poref.focus()
              } else {
                this.playSound(false)
                this.rows = resultArray
                this.errorfound = false
                this.info = this.poref
                this.feedback = this.$t('general.click2process')
                this.poref = ''
                this.$refs.poref.focus()
              }
            })
            .catch(error => {
              this.playSound(true)
              this.errorfound = true
              this.feedback = error.message
              this.poref = ''
              this.$refs.poref.focus()
            })
            .finally(() => { this.loading = false })
        } else {
          this.errorfound = true
          this.feedback = this.$t('general.waiting')
          this.$refs.poref.focus()
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

<style>PA123456
.vdivider {
  margin-top: 10px;
  margin-bottom: 10px;
}
</style>
