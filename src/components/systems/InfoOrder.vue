<template>
  <div>
  <b-overlay :show="loading" rounded="sm" spinner-variant="danger">
    <form>
      <b-container fluid class="p-0">
        <b-row>
          <b-col cols="12">
            <div v-bind:class="getClass()">
              <h2>
                {{ $t("infoorder.title") }} {{info}}
                <h6>{{feedback}}</h6>
              </h2>
            </div>
          </b-col>
        </b-row>
        <div class="vdivider" />
        <b-row>
          <b-col cols="9">
            <!-- order -->
            <b-form-input
              @focus="$event.target.select()"
              id="order"
              ref="order"
              type="text"
              v-model="order"
              :placeholder= "this.$t('general.scanorder')"
            />
          </b-col>
          <b-col cols="3">
            <b-button  variant="primary" block
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
      pathpic: '',
      order: '',
      info: '',
      userinfo: '',
      retval: '',
      feedback: '',
      errorfound: false,
      loading: false,
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
          field: 'Real',
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
          label: 'Qty',
          field: 'Qty',
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
          label: 'Drawing',
          field: 'Drawing',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        },
        {
          label: 'Drawing',
          field: 'DrawingSO',
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
          field: 'Loc',
          thClass: 'header',
          tdClass: 'cell',
          hidden: false
        },
        {
          label: 'SO',
          field: 'Order',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        },
        {
          label: 'SL',
          field: 'Line',
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
          label: 'Shipment',
          field: 'Shipment',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        },
        {
          label: 'Route',
          field: 'Route',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        },
        {
          label: 'TranspDate',
          field: 'TranspDate',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        },
        {
          label: 'TransStat',
          field: 'TransStat',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
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
    order: { required }
  },
  watch: {
    order: function (v) {
      this.order = v.toUpperCase().trim()
    }
  },
  mounted () {
    this.$nextTick(() => {
      if (this.loginSuccessful === false) {
        this.$router.push('/')
      } else {
        this.order = ''
        this.$refs.order.focus()
        this.feedback = this.$t('general.waiting')
      }
    })
  },
  methods: {
    onCellClick (params) {
      try {
        this.pathpic = require(process.env.VUE_APP_IMG_URL + 'BFBE/JPG/' + params.row.DrawingSO)
      } catch (e) {
        this.pathpic = process.env.VUE_APP_IMG_URL + params.row.Drawing
      }
      this.$swal({
        title: params.row.Item,
        html: '<p style="text-align:left">' +
            'Item: ' + params.row.ItemFull + '<BR>' +
            'TOP: ' + params.row.TOP + '<BR>' +
            'O/L: ' + params.row.Order + '/' + params.row.Line + '<BR>' +
            'CN: ' + params.row.CN + '/' + params.row.CNID + '<BR>' +
            'Creator: ' + params.row.User + '<BR>' +
            'Date: ' + params.row.Created + '<BR>' +
            'Container: ' + params.row.Container + '<BR>' +
            'Real: ' + params.row.Real + '<BR>' +
            'Cnt Status: ' + params.row.Status + '<BR>' +
            'Location: ' + params.row.Loc + '<BR>' +
            'DateH: ' + params.row.DateH + '<BR>' +
            'Shipment: ' + params.row.Shipment + '<BR>' +
            'Route: ' + params.row.Route + '<BR>' +
            'DateS: ' + params.row.TranspDate + '<BR>' +
            'Shp Status: ' + params.row.TransStat + '<BR>' +
            '</p>',
        position: 'top',
        width: 350,
        imageUrl: this.pathpic,
        imageWidth: 200,
        imageHeight: 100
      })
    },
    getClass () {
      if (this.errorfound) {
        return 'bg-danger text-white'
      } else {
        return 'bg-success text-white'
      }
    },
    executesql () {
      this.retval = ''
      this.feedback = ''
      this.info = this.pack
      if (this.loggedinuser !== '' && this.loginSuccessful === true) {
        if (this.order !== '') {
          this.errorfound = false
          this.feedback = this.$t('general.busy')
          this.loading = true
          axios
            .get(
              '/GetInfoBySalesOrder?company=' +
                this.activecompany +
                '&salesorder=' +
                this.order
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
                this.feedback = this.$t('general.nodata') + ' ' + this.order
                this.$refs.order.focus()
                this.$refs.order.select()
              } else {
                this.playSound(false)
                this.rows = resultArray
                this.errorfound = false
                this.info = this.order
                this.feedback = this.$t('general.click4details')
                this.order = ''
                this.$refs.order.focus()
                this.$refs.btnSearch.focus()
              }
            })
            .catch(error => {
              this.playSound(true)
              this.errorfound = true
              this.feedback = error.message
              this.order = ''
              this.$refs.order.focus()
            })
            .finally(() => { this.loading = false })
        } else {
          this.errorfound = true
          this.feedback = this.$t('general.waiting')
          this.$refs.order.focus()
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
.dot {
  height: 15px;
  width: 15px;
  border-radius: 50%;
  border-color: lightgray;
  border-width: 1px;
  display: inline-block;
}
</style>
