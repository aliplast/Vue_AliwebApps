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
                 {{ $t("infopicking.title") }} {{info}}
                <h6>{{feedback}}</h6>
              </h2>
            </div>
          </b-col>
        </b-row>
          <div class="vdivider" />
          <b-row>
          <b-col cols="12">
            <b-form-radio-group
              v-model="parameter"
              id="parameter"
              ref="parameter"
              :options="options"
              class="mb-2"
              buttons
              button-variant="outline-primary"
              value-field="item"
              text-field="name"
              v-on:keyup.enter="movetonextcontrol"
            ></b-form-radio-group>
          </b-col>
        </b-row>
        <div class="vdivider" />
        <b-row>
          <b-col cols="6" >
            <!-- Location -->
              <b-form-input
                @focus="$event.target.select()"
                id="value"
                ref="value"
                type="text"
                v-model="value"
                :placeholder= "this.$t('infopicking.scanpick')"
              />
          </b-col>
          <b-col cols="3">
            <b-form-checkbox
              id="containerstatus"
              v-model="containerstatus"
              name="containerstatus"
              value="60"
              unchecked-value="90">
               {{ $t("infopicking.open") }}
              </b-form-checkbox>
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
                <span v-if="props.column.field == 'Item' && props.row.Color">
                  <span v-if="props.row.HexColor !== ''" class="dot" :style="{'background-color':props.row.HexColor, 'border-style':'solid'}"></span> <span>{{props.row.Item}}</span>
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
      containerstatus: '90',
      value: '',
      pathpic: '',
      info: '',
      userinfo: '',
      retval: '',
      feedback: '',
      errorfound: false,
      loading: false,
      parameter: 'PA.RCPAKN', // set default
      options: [
        { item: 'PA.RCPAKN', name: 'Container' },
        { item: 'PI.RCPLNO', name: 'Picklist' },
        { item: 'so.AYBMNB', name: 'Order' }
      ],
      columns: [
        {
          label: 'User',
          field: 'User',
          thClass: 'header',
          tdClass: 'cell',
          hidden: false
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
          label: 'Status',
          field: 'Status',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        },
        {
          label: 'SalesOrder',
          field: 'SalesOrder',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        },
        {
          label: 'SalesLine',
          field: 'SalesLine',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        },
        {
          label: 'Picklist',
          field: 'Picklist',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        },
        {
          label: 'PickLine',
          field: 'PickLine',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        },
        {
          label: 'TOP',
          field: 'TOP',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        },
        {
          label: 'Qty',
          field: 'Qty',
          thClass: 'header',
          tdClass: 'cell',
          hidden: false
        },
        {
          label: 'Container',
          field: 'Container',
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
          label: 'Location',
          field: 'Location',
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
          label: 'Real',
          field: 'Real',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        },
        {
          label: 'Color',
          field: 'Color',
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
    value: { required }
  },
  watch: {
    value: function (v) {
      this.value = v.toUpperCase().trim()
    }
  },
  mounted () {
    this.$nextTick(() => {
      if (this.loginSuccessful === false) {
        this.$router.push('/')
      } else {
        this.value = ''
        this.$refs.value.focus()
        this.feedback = this.$t('general.waiting')
      }
    })
  },
  methods: {
    movetonextcontrol: function (event) {
      this.$refs.value.focus()
    },
    getClass () {
      if (this.errorfound) {
        return 'bg-danger text-white'
      } else {
        return 'bg-success text-white'
      }
    },
    onCellClick (params) {
      try {
        this.pathpic = require(process.env.VUE_APP_IMG_URL + 'BFBE/JPG/' + 'al_' + params.row.Salesheader + '_' + params.row.Salesline + '.jpg')
      } catch (e) {
        this.pathpic = process.env.VUE_APP_IMG_URL + params.row.Drawing
      }
      this.$swal({
        title: this.info,
        html: '<p style="text-align:left">' +
            'SO/L: ' + params.row.SalesOrder + '/' + params.row.SalesLine + '<BR>' +
            'PL/L: ' + params.row.Picklist + '/' + params.row.PickLine + '<BR>' +
            'Cont: ' + params.row.Container + '<BR>' +
            'Real: ' + params.row.Real + '<BR>' +
            'Item: ' + params.row.Item + '<BR>' +
            'Color: ' + params.row.Color + '<BR>' +
            'Qty: ' + params.row.Qty + '<BR>' +
            'TOP: ' + params.row.TOP + '<BR>' +
            'Status: ' + params.row.Status + '<BR>' +
            'Loc: ' + params.row.Location + '<BR>' +
            'Zone: ' + params.row.Zone + '<BR>' +
            'User: ' + params.row.User + '<BR>' +
            'Time/Date: ' + params.row.Time + ' ' + params.row.Date +
            '</p>',
        position: 'top',
        width: 350,
        imageUrl: this.pathpic,
        imageWidth: 200,
        imageHeight: 100
      })
    },
    executesql () {
      this.rows = []
      this.retval = ''
      this.feedback = ''
      this.info = ''
      if (this.loggedinuser !== '' && this.loginSuccessful === true) {
        if (this.value !== '') {
          this.errorfound = false
          this.feedback = this.$t('general.busy')
          this.loading = true
          axios
            .get(
              '/GetInfoPicking?company=' +
                this.activecompany +
                '&criterion=' +
                this.parameter +
                '&value=' +
                this.value +
                '&status=' +
                this.containerstatus
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
                this.feedback = this.$t('general.nodata') + ' ' + this.value
                this.$refs.value.focus()
                this.$refs.value.select()
              } else {
                this.playSound(false)
                this.rows = resultArray
                this.errorfound = false
                this.info = this.value
                this.feedback = this.$t('general.click4details') + ' (' + this.rows.length + ')'
                this.value = ''
                this.$refs.btnSearch.focus()
              }
            })
            .catch(error => {
              this.playSound(true)
              this.errorfound = true
              this.feedback = error.message
              this.value = ''
              this.$refs.value.focus()
            })
            .finally(() => { this.loading = false })
        } else {
          this.errorfound = true
          this.feedback = this.$t('general.waiting')
          this.$refs.value.focus()
        }
      } else {
        this.errorfound = true
        this.feedback = this.$t('general.busy')
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
