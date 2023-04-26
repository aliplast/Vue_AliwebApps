<template>
  <div>
  <b-overlay :show="loading" rounded="sm" spinner-variant="danger">
    <form>
      <b-container fluid class="p-0">
        <b-row>
          <b-col cols="12">
            <div v-bind:class="getClass()">
              <h2>
                 {{ $t("maintainscrap.title") }} {{info}}
                <h6>{{feedback}}</h6>
              </h2>
            </div>
          </b-col>
        </b-row>
        <div class="vdivider" />
        <b-row>
          <b-col cols="9">
            <!-- item -->
            <b-form-input
              id="item"
              ref="item"
              type="text"
              v-model="item"
              @click="selectAll"
              @focus="modal = true"
              :placeholder="this.$t('general.scanitem')"
            />
            <div v-if="filteredItems && modal">
              <b-list-group>
                <b-list-group-item
                  v-for="filteredItem in filteredItems" :key="filteredItem.Item"
                  @click="setState(filteredItem)"
                >{{ filteredItem.Item }}
                </b-list-group-item>
              </b-list-group>
            </div>
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
            <vue-good-table
              :columns="columns"
              :rows="rows"
              :line-numbers="false"
              @on-cell-click="onCellClick"
              styleClass="vgt-table condensed"
              :search-options="{ enabled: false }"
              :sort-options="{ enabled: false, }">
              <template slot="table-row" slot-scope="props">
              <span v-if="props.column.field == 'Item'">
                <span style="color: #007bff;cursor: pointer">{{props.formattedRow[props.column.field]}}</span>
              </span>
              <span v-else>
                {{props.formattedRow[props.column.field]}}
              </span>
              <span v-if="props.column.field == 'History'">
              <b-button variant="info" block
                    v-b-tooltip.hover title="History"
                    type="submit" size="sm"
                    id="btnHistory"
                    ref="btnHistory"
                  ><b-icon icon="clock" font-scale="1"></b-icon></b-button>
                </span>
              </template>
            </vue-good-table>
          </b-col>
        </b-row>
        <div class="vdivider" />
        <b-row v-if="rows_history.length > 0">
          <b-col cols="12">
            <vue-good-table
              :columns="columns_history"
              :rows="rows_history"
              :line-numbers="false"
              @on-cell-click="onCellClick"
              styleClass="vgt-table condensed"
              theme="black-rhino"
            ></vue-good-table>
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
      item: '',
      selecteditem: '',
      workcenter: 'LAKV', // Fixed value?
      container: '',
      reason: '',
      reasoncode: '',
      qty: '',
      supplier: '',
      info: '',
      userinfo: '',
      retval: '',
      feedback: '',
      errorfound: false,
      loading: false,
      infoimage: '',
      items: [],
      filteredItems: [],
      modal: false,
      columns: [
        {
          label: 'Item',
          field: 'Item',
          thClass: 'header',
          tdClass: 'cell'
        },
        {
          label: 'Descr',
          field: 'Descr',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        },
        {
          label: 'OH',
          field: 'OH',
          thClass: 'header',
          tdClass: 'cell',
          hidden: false
        },
        {
          label: 'Fam',
          field: 'Family',
          thClass: 'header',
          tdClass: 'cell'
        },
        {
          label: 'SU',
          field: 'StkUnit',
          thClass: 'header',
          tdClass: 'cell'
        },
        {
          label: 'Created',
          field: 'Created',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        },
        {
          label: 'SupplID',
          field: 'SupplID',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        },
        {
          label: 'Supplier',
          field: 'Supplier',
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
          label: 'Stockloc',
          field: 'Stockloc',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        },
        {
          label: 'Stockzone',
          field: 'Stockzone',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        },
        {
          label: '',
          field: 'History'
        }
      ],
      columns_history: [
        {
          label: 'Qty',
          field: 'Qty',
          thClass: 'header',
          tdClass: 'cell'
        },
        {
          label: 'Reason',
          field: 'Reason',
          thClass: 'header',
          tdClass: 'cell'
        },
        {
          label: 'Batch',
          field: 'Batch',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        },
        {
          label: 'Date',
          field: 'Date',
          thClass: 'header',
          tdClass: 'cell',
          hidden: false
        },
        {
          label: 'Time',
          field: 'Time',
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
          label: 'Supplier',
          field: 'Supplier',
          thClass: 'header',
          tdClass: 'cell'
        }
      ],
      rows: [],
      rows_history: []
    }
  },
  async created () {
    // this.loading = true
    // axios
    // .get('GetInfoByItem?company=' + this.activecompany + '&item=%')
    // .then(response => {
    // this.items = response.data
    // })
    // .finally(() => { this.loading = false })
  },
  computed: {
    ...mapState(['loginError', 'loginSuccessful', 'loggedinuser', 'test', 'activecompany'])
  },
  mixins: [beep],
  validations: {
    container: { required }
  },
  watch: {
    item: function (v) {
      this.item = v.toUpperCase().trim()
      if (this.item.length > 3) { this.filterItems(); this.rows = []; this.rows_history = [] }
    }
  },
  mounted () {
    this.$nextTick(() => {
      if (this.loginSuccessful === false) {
        this.$router.push('/')
      } else {
        this.item = ''
        this.$refs.item.focus()
        this.feedback = this.$t('general.waiting')
      }
    })
  },
  methods: {
    async onCellClick (params) {
      if (params.column.field === 'Item') {
        const steps = ['1', '2', '3', '4', '5']
        const Queue = this.$swal.mixin({
          title: params.row.Item,
          html: '<p style="text-align:left">' +
            // 'Desc: ' + params.row.Descr + '<BR>' +
            'Stockloc: ' + params.row.Stockloc + '<BR>' +
            'QtyOH: ' + params.row.OH + '<BR>' +
            'Stockzone: ' + params.row.Stockzone + '<BR>' +
            '</p>',
          position: 'top',
          width: 350,
          imageUrl: process.env.VUE_APP_IMG_URL + params.row.Drawing,
          imageWidth: 200,
          imageHeight: 100,
          confirmButtonText: 'Next &rarr;',
          showCancelButton: true,
          progressSteps: steps
        })
        await Queue.fire({
          html: '<p style="text-align:left">' +
            // 'Desc: ' + params.row.Descr + '<BR>' +
            'Stockloc: ' + params.row.Stockloc + '<BR>' +
            'QtyOH: ' + params.row.OH + '<BR>' +
            // 'Stockzone: ' + params.row.Stockzone + '<BR>' +
            '</p>',
          currentProgressStep: 0,
          input: 'select',
          position: 'top',
          inputPlaceholder: this.$t('maintainscrap.selectcontainer'),
          inputOptions: this.getcontainers(params.row.Item),
          inputValidator: (value) => {
            if (value) {
              this.container = value
            } else {
              return this.$t('maintainscrap.wrongqty')
            }
          }
        }).then((result) => {
          if (result.isDismissed) {
            this.cancelclicked = true
            this.feedback = this.$t('general.aborted')
          }
          this.selecteditem = params.row.Item
        })
        if (!this.cancelclicked) {
          await Queue.fire({
            html: '<p style="text-align:left">' +
            // 'Desc: ' + params.row.Descr + '<BR>' +
            'Stockloc: ' + params.row.Stockloc + '<BR>' +
            'QtyOH: ' + params.row.OH + '<BR>' +
            // 'Stockzone: ' + params.row.Stockzone + '<BR>' +
            '<span style="color:red">Container: ' + this.container + '</span>' +
            '</p>',
            currentProgressStep: 1,
            input: 'select',
            position: 'top',
            inputPlaceholder: this.$t('maintainscrap.selectreason'),
            inputOptions: this.getreasoncodes('3'), // 3=algmeen
            inputValidator: (value) => {
              if (value) {
                this.reasoncode = value
                this.supplier = this.getsupplier(this.container)
              } else { return this.$t('maintainscrap.wrongqty') }
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
            html: '<p style="text-align:left">' +
            // 'Desc: ' + params.row.Descr + '<BR>' +
            'Stockloc: ' + params.row.Stockloc + '<BR>' +
            'QtyOH: ' + params.row.OH + '<BR>' +
            // 'Stockzone: ' + params.row.Stockzone + '<BR>' +
            '<span style="color:red">Container: ' + this.container + '</span><BR>' +
            '<span style="color:red">Reason: ' + this.reasoncode + '</span>' +
            '</p>',
            currentProgressStep: 2,
            input: 'number',
            inputValue: 0,
            position: 'top',
            inputValidator: (value) => {
              if (value < 1 || value > params.row.OH) {
                return this.$t('maintainscrap.wrongqty')
              } else { this.qty = value }
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
            html: '<p style="text-align:left">' +
            // 'Desc: ' + params.row.Descr + '<BR>' +
            'Stockloc: ' + params.row.Stockloc + '<BR>' +
            'QtyOH: ' + params.row.OH + '<BR>' +
            // 'Stockzone: ' + params.row.Stockzone + '<BR>' +
            '<span style="color:red">Container: ' + this.container + '</span><BR>' +
            '<span style="color:red">Reason: ' + this.reasoncode + '</span><BR>' +
            '<span style="color:red">Qty: ' + this.qty + '</span>' +
            '</p>',
            currentProgressStep: 3,
            input: 'text',
            inputValue: this.supplier,
            // inputPlaceholder: 'supplier details',
            position: 'top',
            inputValidator: (value) => {
              if (value) { this.supplier = value }
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
            html: '<p style="text-align:left">' +
            // 'Desc: ' + params.row.Descr + '<BR>' +
            'Stockloc: ' + params.row.Stockloc + '<BR>' +
            'QtyOH: ' + params.row.OH + '<BR>' +
            // 'Stockzone: ' + params.row.Stockzone + '<BR>' +
            '<span style="color:red">Container: ' + this.container + '</span><BR>' +
            '<span style="color:red">Reason: ' + this.reasoncode + '</span><BR>' +
            '<span style="color:red">Qty: ' + this.qty + '</span><BR>' +
            '<span style="color:red">Supplier: ' + this.supplier + '</span>' +
            '</p>',
            currentProgressStep: 4,
            confirmButtonText: 'Scrap',
            showCancelButton: true
          }).then((result) => {
            if (result.value) {
              this.insertscrap()
            }
          })
        }
      }
      if (params.column.field === 'History') {
        this.gethistory(params.row.Item)
      }
    },
    getcontainers (item) {
      return axios
        .get(
          '/GetContainersByItem?company=' + this.activecompany + '&item=' + item
        )
        .then(res => {
          // console.log(res.data)
          return res.data
        })
    },
    getsupplier (container) {
      return axios
        .get(
          '/GetSupplierByContainer?company=' + this.activecompany + '&container=' + container
        )
        .then(res => {
          // console.log(res.data)
          return res.data
        })
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
          // console.log(res.data)
          return res.data
        })
    },
    gethistory (item) {
      this.rows_history = []
      this.loading = true
      axios
        .post('/HistoryScrap?company=' + this.activecompany + '&item=' + item)
        .then(response => {
          // console.log(response.data)
          this.rows_history = response.data
        })
        .finally(() => { this.loading = false })
    },
    selectAll () {
      this.errorfound = false
      this.feedback = this.$t('general.waiting')
      this.$refs.item.select()
    },
    getClass () {
      if (this.errorfound) {
        return 'bg-danger text-white'
      } else {
        return 'bg-success text-white'
      }
    },
    filterItems () {
      axios
        .get('GetInfoByItem?company=' + this.activecompany + '&item=' + this.item + '%')
        .then(response => {
          this.items = response.data
        })
      this.filteredItems = this.items.filter(item => {
        return item.Item.toLowerCase().startsWith(
          this.item.toLowerCase()
        )
      })
    },
    setState (item) {
      this.item = item.Item
      this.modal = false
    },
    insertscrap () {
      this.feedback = ''
      this.info = ''
      if (this.loggedinuser !== '' && this.loginSuccessful === true) {
        this.errorfound = false
        this.feedback = this.$t('general.busy')
        this.loading = true
        axios
          .post(
            '/InsertScrap?company=' + this.activecompany + '&item=' + this.selecteditem + '&pack=' + this.container + '&reason=' +
              this.reasoncode + '&qty=' + this.qty + '&supplier=' + this.supplier + '&workcenter=' + this.workcenter + '&user=' + this.loggedinuser
          )
          .then(res => {
            this.playSound(false)
            this.feedback = res.data
            this.rows_history = []
            this.rows = []
            this.item = ''
            this.$refs.item.focus()
          })
          .catch(error => {
            this.playSound(true)
            this.errorfound = true
            this.feedback = error.message
          })
          .finally(() => { this.loading = false })
      } else {
        this.errorfound = true
        this.feedback = this.$t('general.login')
        this.$router.push('/')
      }
    },
    executesql () {
      this.retval = ''
      this.feedback = ''
      this.info = ''
      this.rows = []
      this.rows_history = []
      if (this.loggedinuser !== '' && this.loginSuccessful === true) {
        if (this.item !== '') {
          this.errorfound = false
          this.feedback = this.$t('general.busy')
          this.loading = true
          axios
            .get(
              '/GetInfoByItem?company=' + this.activecompany + '&item=' + this.item
            )
            .then(res => {
              const data = res.data
              console.log(res.data)
              const resultArray = []
              for (let key in data) {
                resultArray.push(data[key])
              }
              if (!resultArray.length) {
                this.playSound(true)
                this.errorfound = true
                this.feedback = this.$t('general.nodata') + ' ' + this.item
                this.$refs.item.focus()
                this.$refs.item.select()
              } else {
                this.playSound(false)
                this.rows = resultArray
                this.errorfound = false
                this.info = this.item
                this.feedback = this.$t('general.click2process') + ' (' + this.rows.length + ')'
                this.item = ''
                this.$refs.btnSearch.focus()
              }
            })
            .catch(error => {
              this.playSound(true)
              this.errorfound = true
              this.feedback = error.message
              this.item = ''
              this.$refs.item.focus()
            })
            .finally(() => { this.loading = false })
        } else {
          this.errorfound = true
          this.feedback = this.$t('general.waiting')
          this.item = ''
          this.$refs.item.focus()
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
