<template>
  <div>
      <b-container fluid class="p-0">
        <b-row>
          <b-col cols="12">
            <div class="vdivider" />
            <div v-bind:class="getClass()">
              <h2>
                 {{ $t("backtostock.title") }} {{info}}
                <h6>{{feedback}}</h6>
              </h2>
            </div>
          </b-col>
        </b-row>
          <div class="vdivider" />
        <b-row>
          <b-col cols="12">
            <!-- Goodtable plugin -->
            <vue-good-table
              :columns="columns"
              :rows="rows"
              @on-row-click="onRowClick"
              styleClass="vgt-table condensed"
              :search-options="{ enabled: true }"
              :sort-options="{ enabled: true, }"
              :pagination-options="{
              enabled: true,
              mode: 'pages',
              perPage: 15,
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
            <div slot="table-actions">
              <b-button size="sm" variant="primary"
               @click.prevent="executesql"
              >{{ $t("backtostock.load") }}</b-button>
            </div>
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
      pathpic1: '',
      pathpic2: '',
      info: '',
      userinfo: '',
      retval: '',
      feedback: '',
      errorfound: false,
      b2s_item: '',
      b2s_qty: '',
      b2s_container: '',
      b2s_removedcontainer: '',
      b2s_loc: '',
      containerlocation: '',
      columns: [
        {
          label: 'Item',
          field: 'Item',
          thClass: 'header',
          tdClass: 'cell',
          hidden: false
        },
        {
          label: 'Container',
          field: 'Container',
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
          label: 'B2S',
          field: 'QtyS',
          thClass: 'header',
          tdClass: 'cell',
          hidden: false
        },
        {
          label: 'Sortlist',
          field: 'Sortlist',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        },
        {
          label: 'Workcenter',
          field: 'Workcenter',
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
          label: 'Status',
          field: 'Status',
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
          label: 'Drawing',
          field: 'Drawing',
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
        }
      ],
      rows: []
    }
  },
  computed: {
    ...mapState(['loginError', 'loginSuccessful', 'loggedinuser', 'activecompany'])
  },
  mixins: [beep],
  watch: {
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
    executeputaway (item, qty, containerto, containerfrom, location) {
      this.feedback = this.$t('general.busy')
      NProgress.start()
      this.errorfound = false
      axios
        .put(
          '/Put2Stock?company=' + this.activecompany +
            '&item=' + item +
            '&quantity=' + qty +
            '&containerto=' + containerto +
            '&containerfrom=' + containerfrom +
            '&location=' + location
        )
        .then(res => {
          this.playSound(false)
          this.errorfound = false
          this.feedback = res.data
          // this.executesql() // reload changes
        })
        .catch(error => {
          this.playSound(true)
          this.errorfound = true
          this.feedback = error.message
        })
      NProgress.done()
    },
    onRowClick (params) {
      this.pathpic2 = process.env.VUE_APP_IMG_URL + params.row.Drawing
      this.$swal.mixin({
        title: params.row.Item,
        html: '<p style="text-align:left">' +
            'PrO/L: ' + params.row.ProductionOrder + '/' + params.row.MaterialLine + '<BR>' +
            'Location: ' + params.row.Location + '<BR>' +
            'Time/Date: ' + params.row.Time + '/' + params.row.Date +
            '</p>',
        position: 'top',
        width: 350,
        imageUrl: this.pathpic2,
        imageWidth: 200,
        imageHeight: 100,
        imageAlt: process.env.VUE_APP_IMG_URL + 'empty.jpg',
        input: 'text',
        confirmButtonText: 'Next &rarr;',
        showCancelButton: true,
        progressSteps: ['1', '2']
      }).queue([
        {
          input: 'number',
          inputPlaceholder: 'Quantity',
          inputValue: params.row.Qty,
          inputValidator: (value) => {
            if (!value) {
              return this.$t('general.mandatory')
            }
          }
        },
        {
          input: 'select',
          inputOptions: this.getlocations(params.row.Item, params.row.Container),
          inputValidator: (value) => {
            if (!value) {
              return this.$t('general.mandatory')
            } else { this.containerlocation = this.locations[value] }
          }
        }
      ]).then((result) => {
        if (result.value) {
        // const answers = JSON.stringify(result.value)
          this.b2s_item = params.row.Item
          this.b2s_qty = result.value[0] // ingegeven waarde
          this.b2s_container = this.containerlocation.toString().split(':')[0]
          this.b2s_location = this.containerlocation.toString().split(':')[1]
          console.log(this.b2s_container)
          this.b2s_removedcontainer = params.row.Container
          // this.b2s_loc = result.value[2] // ingegeven waarde
          this.$swal.fire({
            title: params.row.Item,
            html: `<p style="text-align:left">
                  Number:<strong> ${result.value[0]}</strong><BR>
                  Ct From:<strong> ${params.row.Container}</strong><BR>
                  Loc From:<strong> ${params.row.Location}</strong><BR>
                  Ct To:<strong> ${this.b2s_container}</strong><BR>            
                  Loc To:<strong> ${this.b2s_location}</strong><BR>  
                  </p>`,
            confirmButtonText: 'Putaway',
            showCancelButton: true
          }).then((result) => {
            if (result.value) {
              this.executeputaway(this.b2s_item, this.b2s_qty, this.b2s_container, this.b2s_removedcontainer, this.b2s_location)
            }
          })
        }
      })
    },
    getlocations (item, container) {
      return axios
        .post(
          '/GetB2SContainers?Company=' + this.activecompany + '&article=' + item + '&container=' + container
        )
        .then(res => {
          // console.log(res.data)
          this.locations = res.data.map(data => (data.CT + ':' + data.LOC))
          return this.locations
        })
    },
    executesql () {
      this.rows = []
      this.retval = ''
      this.feedback = ''
      this.info = ''
      if (this.loggedinuser !== '' && this.loginSuccessful === true) {
        this.errorfound = false
        this.feedback = 'Searching'
        NProgress.start()
        axios
          .get(
            '/GetRemovedContainers?company=' + this.activecompany
          )
          .then(res => {
            NProgress.done()
            const data = res.data
            const resultArray = []
            for (let key in data) {
              resultArray.push(data[key])
            }
            if (!resultArray.length) {
              this.playSound(true)
              this.errorfound = true
              this.feedback = this.$t('general.nodata')
            } else {
              this.playSound(false)
              this.rows = resultArray
              this.errorfound = false
              this.info = ''
              this.feedback = this.$t('backtostock.click2putaway')
            }
          })
          .catch(error => {
            NProgress.done()
            this.playSound(true)
            this.errorfound = true
            this.feedback = error.message
          })
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
