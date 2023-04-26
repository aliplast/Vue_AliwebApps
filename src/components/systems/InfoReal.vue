<template>
  <div>
    <form>
      <b-container fluid class="p-0">
        <b-row>
          <b-col cols="12">
            <div v-bind:class="getClass()">
              <h2>
                {{ $t("registerreal.title") }} {{info}}
                <h6>{{feedback}}</h6>
              </h2>
            </div>
          </b-col>
        </b-row>
        <div class="vdivider" />
        <b-row>
          <b-col cols="8">
          <!-- container -->
          <b-form-input
            @focus="$event.target.select()"
            id="searchreal"
            ref="searchreal"
            type="number"
            @input="$v.searchreal.$touch()"
            v-model="searchreal"
            :placeholder= "this.$t('general.scanreal')"
            v-on:keyup.enter="getlastcontainermoves()"
          />
          </b-col>
          <b-col cols="2">
          <b-button v-b-tooltip.hover :title= "this.$t('general.search')" variant="primary"
            type="button"
            @click.prevent="getlastcontainermoves()"
          ><b-icon icon="search"></b-icon></b-button>
          </b-col>
          <b-col cols="2">
          <b-button v-b-tooltip.hover :title= "this.$t('general.reset')" variant="secondary"
            type="button"
            @click.prevent="cancel"
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
                @on-row-click="onRowClick"
                :line-numbers="false"
                styleClass="vgt-table condensed"
                :sort-options="{
                enabled: false
                }"
                >
              </vue-good-table>
            </b-col>
          </b-row>
          <div class="vdivider" />
          <b-row v-if="rows_detail.length > 0">
          <b-col cols="12">
            <!-- Goodtable plugin -->
            <vue-good-table
              :columns="columns_detail"
              :rows="rows_detail"
              compactMode
              :line-numbers="false"
              :search-options="{ enabled: false }"
              :sort-options="{ enabled: false, }"
              styleClass="vgt-table condensed"
              >
            </vue-good-table>
          </b-col>
        </b-row>
      </b-container>
    </form>
  </div>
</template>

<script>
import { beep } from './beep'
import { required } from 'vuelidate/lib/validators'
import { mapState } from 'vuex'
import axios from 'axios'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

export default {
  data () {
    return {
      // company: process.env.VUE_APP_COMPANY,
      searchreal: '',
      newreal: '',
      scrap: '',
      customer: '',
      customernr: '',
      containertype: '',
      feedback: '',
      message: '',
      todo: '',
      info: '',
      userinfo: '',
      datumbijklant: '',
      datumcreated: '',
      uitdienst: '',
      vorigect: '',
      creator: '',
      variantkleur: '',
      errorfound: false,
      selected: null,
      options: [
        { value: null, text: 'Select' },
        { value: 'CONT001', text: 'Grijze cont. oud (CONT001)' },
        { value: 'CONT003', text: 'Lage cont. (CONT003)' },
        { value: 'CONT004', text: 'Grijze cont. nieuw (CONT004)' },
        { value: 'CONTCD', text: 'Container condoor (CONTCD)' }
      ],
      columns: [
        {
          label: 'Container',
          field: 'Container',
          thClass: 'header',
          tdClass: 'cell',
          hidden: false
        },
        {
          label: 'Date',
          field: 'Datum',
          thClass: 'header',
          tdClass: 'cell',
          hidden: false
        },
        {
          label: 'St.',
          field: 'Status',
          thClass: 'header',
          tdClass: 'cell',
          hidden: false
        },
        {
          label: 'Comp.',
          field: 'Company',
          thClass: 'header',
          tdClass: 'cell',
          hidden: false
        }
      ],
      rows: [],
      columns_detail: [
        {
          label: 'Container',
          field: 'Container',
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
          label: 'ItemF',
          field: 'ItemFull',
          thClass: 'header',
          tdClass: 'cell',
          hidden: false
        },
        {
          label: 'Salesorder',
          field: 'Salesorder',
          thClass: 'header',
          tdClass: 'cell',
          hidden: false
        },
        {
          label: 'Productiebon',
          field: 'Productiebon',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        },
        {
          label: 'CN',
          field: 'CN',
          thClass: 'header',
          tdClass: 'cell',
          hidden: false
        },
        {
          label: 'CNID',
          field: 'CNID',
          thClass: 'header',
          tdClass: 'cell',
          hidden: false
        },
        {
          label: 'DP',
          field: 'DP',
          thClass: 'header',
          tdClass: 'cell',
          hidden: false
        },
        {
          label: 'DPID',
          field: 'DPID',
          thClass: 'header',
          tdClass: 'cell',
          hidden: false
        },
        {
          label: 'Shipment',
          field: 'Shipment',
          thClass: 'header',
          tdClass: 'cell',
          hidden: false
        },
        {
          label: 'Route',
          field: 'Route',
          thClass: 'header',
          tdClass: 'cell',
          hidden: false
        },
        {
          label: 'ShipDate',
          field: 'ShipDate',
          thClass: 'header',
          tdClass: 'cell',
          hidden: false
        }
      ],
      rows_detail: []
    }
  },
  computed: {
    ...mapState(['loginError', 'loginSuccessful', 'loggedinuser', 'test', 'activecompany'])
  },
  mixins: [beep],
  validations: {
    searchreal: { required }
  },
  watch: {
    searchreal: function (v) {
      this.searchreal = v.toUpperCase().trim()
    }
  },
  mounted () {
    this.$nextTick(() => {
      if (this.loginSuccessful === false) {
        this.$router.push('/')
      } else {
        this.searchreal = ''
        this.$refs.searchreal.focus()
        this.feedback = this.$t('general.waiting')
      }
    })
  },
  methods: {
    movetonextcontrolnew: function (event) {
      // this.newreal = ''
      this.selected = null
      this.$refs.containertype.focus()
    },
    movetonextcontrolupdate: function (event) {
      this.$refs.newreal.select()
      this.$refs.newreal.focus()
    },
    movetofirstcontrol: function (event) {
      this.$refs.searchreal.focus()
      this.$refs.searchreal.select()
    },
    cancel: function (event) {
      this.rows = []
      this.rows_detail = []
      this.errorfound = false
      this.feedback = this.$t('general.waiting')
      this.searchreal = ''
      this.$refs.searchreal.focus()
    },
    getClass () {
      if (this.errorfound) {
        return 'bg-danger text-white'
      } else {
        return 'bg-success text-white'
      }
    },
    getlastcontainermoves () {
      this.rows = []
      NProgress.start()
      return axios
        .get(
          '/GetLastContainerMoves?company=' + this.activecompany +
                   '&real=' + this.searchreal
        )
        .then(res => {
          const data = res.data
          const resultArray = []
          for (let key in data) {
            resultArray.push(data[key])
          }
          if (!resultArray.length) {
            this.rows = []
          } else {
            this.rows = resultArray
          }
        })
        .catch(error => {
          this.errorfound = true
          this.feedback = error.message
        })
        .finally(() => (NProgress.done()))
    },
    onRowClick (params) {
      console.log(params)
      this.rows_detail = []
      NProgress.start()
      return axios
        .get(
          '/GetInfoByContainer?Company=' +
                    params.row.Company +
                   '&container=' +
                   params.row.Container
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
        .finally(() => (NProgress.done()))
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
