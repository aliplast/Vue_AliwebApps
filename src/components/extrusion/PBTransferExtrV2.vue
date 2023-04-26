<template>
  <div>
    <b-overlay :show="loading" rounded="sm" spinner-variant="danger">
    <form>
      <b-container fluid class="p-0">
        <b-row>
          <b-col cols="12">
            <div v-bind:class="getClass()">
              <h2>
                {{ $t("pbtransferextrV2.title") }}
                <h6>{{feedback}}</h6>
              </h2>
            </div>
          </b-col>
        </b-row>
        <div class="vdivider" />
        <div v-if="showpickup">
          <b-row>
            <b-col cols="6">
              <b-form-select
                v-model="zoneselected"
                :options="zoneoptions"
                value-field="Zone"
                text-field="Zone"
                @change="getdetailszone(zoneselected)"
                >
                </b-form-select>
            </b-col>
            <b-col cols="3">
              <b-button variant="primary" v-b-tooltip.hover :title="activeaddress"
                type="submit" block
                id="btnRefresh"
                ref="btnRefresh"
                @click.prevent="loadpickup()"
              ><b-icon icon="arrow-clockwise"></b-icon></b-button>
            </b-col>
            <b-col cols="3" v-if="locationdetails.length > 0">
              <b-button variant="secondary" v-b-tooltip.hover title="In Transit"
                type="submit" block
                id="btnInTransit"
                ref="btnInTransit"
                @click.prevent="putintransit(); getintransit()"
              > {{ $t("pbtransferextrV2.intransit") }}</b-button>
            </b-col>
          </b-row>
          <div class="vdivider" />
          <b-row>
          <b-col cols="6">
            <!-- Container -->
            <b-form-input
              @focus="$event.target.select()"
              id="container"
              ref="container"
              type="text"
              v-model="container"
              placeholder="scan container"
              v-on:keyup.enter="checkcontainer(container)"
            />
          </b-col>
          </b-row>
          <div class="vdivider" />
          <b-row v-if="locationdetails.length > 0">
            <b-col cols="12">
              <div class="alert alert-primary" role="alert">
              <strong>{{ $t("pbtransferextrV2.pickup") }}</strong>
              ({{ selecteddata.length }}/{{locationdetails.length}})
            </div>
            </b-col>
          </b-row>
          <b-row v-if="locationdetails.length > 0">
            <b-col cols="12">
              <vue-good-table
                :columns="columns"
                :rows="locationdetails"
                :row-style-class="rowInError"
                :line-numbers="false"
                styleClass="vgt-table condensed"
                :search-options="{ enabled: false }"
                :sort-options="{ enabled: false, }"
                :select-options="{
                  enabled: true,
                  selectOnCheckboxOnly: false, // only select when checkbox is clicked instead of the row
                  selectionInfoClass: 'custom-class',
                  selectionText: 'rows selected',
                  clearSelectionText: 'clear',
                  disableSelectInfo: true, // disable the select info panel on top
                  selectAllByGroup: true, // when used in combination with a grouped table, add a checkbox in the header row to check/uncheck the entire group
                }"
                @on-selected-rows-change="selectionchanged">
                <div slot="emptystate">
                  {{ $t("pbtransferextrV2.nocontainerstopickup") }}
                </div>
              </vue-good-table>
            </b-col>
          </b-row>
        </div>
        <div class="vdivider" />
        <div v-if="!showpickup">
          <!-- Overview In Transit -->
          <b-row>
            <b-col cols="12">
              <div class="alert alert-danger" role="alert">
              <strong>{{ $t("pbtransferextrV2.intransit") }}</strong> ({{containersintransit.length}})
            </div>
            </b-col>
          </b-row>
            <b-row>
            <b-col cols="12">
              <vue-good-table
                ref="intransit"
                :columns="columnsintransit"
                :rows="containersintransit"
                :line-numbers="false"
                @on-row-click="onrowclick"
                styleClass="vgt-table condensed"
                :search-options="{ enabled: false }"
                :sort-options="{ enabled: false, }"
                >
                <div slot="emptystate">
                  {{ $t("pbtransferextr.nocontainersintransit") }}
                </div>
              </vue-good-table>
            </b-col>
          </b-row>
          <div class="vdivider" />
        </div>
      </b-container>
    </form>
    </b-overlay>
  </div>
</template>

<script>
import { beep } from '../systems/beep'
// import { required } from 'vuelidate/lib/validators'
import { mapState } from 'vuex'
import axios from 'axios'
// import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

export default {
  data () {
    return {
      info: '',
      userinfo: '',
      retval: '',
      feedback: '',
      zoneoptions: [],
      zoneselected: '',
      zonepersistent: '',
      activelocation: '',
      zone: '',
      location: '',
      loading: false,
      container: '',
      errorfound: false,
      zones: [],
      zonedetails: [],
      locationdetails: [],
      selecteddata: [],
      containersintransit: [],
      activeaddress: '',
      curlng: '',
      curlat: '',
      droplocations: { Z01: 'Z01', Z02: 'Z02', Z03: 'Z03', Z04: 'Z04', Z05: 'Z05', Z06: 'Z06', Z07: 'Z07', Z08: 'Z08' },
      columns: [
        {
          label: 'Location',
          field: 'Location',
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
          label: 'Item',
          field: 'Item',
          thClass: 'header',
          tdClass: 'cell',
          hidden: false
        },
        {
          label: 'St.',
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
          hidden: false
        }
      ],
      columnsintransit: [
        {
          label: 'Location',
          field: 'Location',
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
          label: 'Item',
          field: 'Item',
          thClass: 'header',
          tdClass: 'cell',
          hidden: false
        },
        {
          label: 'St.',
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
          hidden: false
        }
      ]
    }
  },
  computed: {
    ...mapState(['loginError', 'loginSuccessful', 'loggedinuser', 'test', 'activecompany']),
    showpickup: function () {
      if (this.containersintransit.length > 0) {
        return false
      } else {
        return true
      }
    }
  },
  mixins: [beep],
  mounted () {
    this.$nextTick(() => {
      if (this.loginSuccessful === false) {
        this.$router.push('/')
      } else {
        this.feedback = this.$t('general.waiting')
        this.getzones()
        this.getintransit()
      }
    })
  },
  methods: {
    companyto: function (companyfrom) {
      if (companyfrom === 'MB') { return 'AL' }
      if (companyfrom === 'M1') { return 'D2' }
      if (companyfrom === 'AL') { return 'MB' }
      if (companyfrom === 'D2') { return 'M1' }
    },
    colorvariant: function (nbr) {
      if (nbr === 0) return 'success'
      if (nbr >= 6) return 'danger'
      if (nbr > 0) return 'warning'
      return 'primary'
    },
    rowInError (row) {
      return row.Location === '' ? 'warning' : ''
    },
    getClass () {
      if (this.errorfound) {
        return 'bg-danger text-white'
      } else {
        return 'bg-success text-white'
      }
    },
    checkcontainer (container) {
      container = container.trim() // anders werkt findindex niet ... spaties!
      // search in list, return index
      let index = this.locationdetails.findIndex(item => item.Container === container)
      // enable check given index
      this.$set(this.locationdetails[index], 'vgtSelected', true)
      // empty scanned value
      this.feedback = this.container
      this.container = ''
      this.$refs.container.focus()
      this.$refs.container.select()
    },
    selectionchanged (params) {
      this.selecteddata = params.selectedRows
    },
    getzones () {
      this.loading = true
      axios
        .get('/GetZones?company=' + this.activecompany)
        .then(response => {
          this.zoneoptions = response.data
        })
        .finally(() => {
          this.loading = false
        })
    },
    loadpickup () {
      this.loading = true
      if (this.zoneselected !== '') {
        axios
          .get('/GetZoneDetails?company=' + this.activecompany + '&zone=' + this.zoneselected)
          .then(response => {
            this.zonedetails = response.data
          })
          .finally(() => { this.loading = false })
      }
    },
    // getdetails (location) {
    //   NProgress.start()
    //   this.feedback = this.zoneselected + ' ' + location
    //   if (location !== '') {
    //     this.activelocation = location
    //     axios
    //       .get('/GetLocationDetails?company=' + this.activecompany + '&location=' + location)
    //       .then(response => {
    //         this.locationdetails = response.data
    //       })
    //   } else {
    //     this.locationdetails = []
    //     this.activelocation = ''
    //   }
    //   NProgress.done()
    // },
    getdetailszone (zone) {
      this.loading = true
      this.feedback = this.zoneselected
      if (zone !== '') {
        this.activelocation = zone
        axios
          .get('/GetLocationDetailsZone?company=' + this.activecompany + '&zone=' + zone)
          .then(response => {
            this.locationdetails = response.data
          })
          .finally(() => {
            this.loading = false
          })
      } else {
        this.locationdetails = []
        this.activelocation = ''
      }
    },
    getintransit () {
      this.feedback = ''
      this.loading = true
      axios
        .get('/GetInTransit?company=' + this.activecompany + '&user=' + this.loggedinuser)
        .then(response => {
          this.containersintransit = response.data
        })
        .finally(() => {
          this.loading = false
        })
    },
    getlocations () {
      return axios
        .get(
          '/GetTransitLocations?Company=' + this.companyto(this.activecompany)
        )
        .then(res => {
          return res.data
        })
    },
    putintransit () {
      this.loading = true
      // console.log(JSON.stringify(this.selecteddata))
      axios
        .post('/PutInTransit',
          JSON.stringify(this.selecteddata), {
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
            this.containersintransit = response.data
            // this.getdetails(this.activelocation)
            this.getintransit()
            this.loadpickup()
          }
        })
        .catch(error => {
          this.playSound(true)
          this.errorfound = true
          this.feedback = error.response.data
        })
        .finally(() => {
          this.loading = false
        })
    },
    onrowclick (params) {
      // console.log(this.$refs['intransit'].selectedRows)
      // Gebruik dit om de geselecteerde door te geven - movelocation moet ontdubbeld worden om array te loppen!
      // this.locatemydevice()
      this.feedback = params.row.Container
      this.$swal.mixin({
        title: params.row.Container,
        html: '<p style="text-align:center">' +
            'Loc: ' + params.row.Location + '<BR>' +
            'Whse: ' + this.activecompany + '->' + this.companyto(this.activecompany) + '<BR>' +
            '</p>',
        position: 'center',
        width: 350,
        input: 'text',
        confirmButtonText: 'Next &rarr;',
        showCancelButton: true
        // progressSteps: ['1', '2']
      }).queue([
        {
          input: 'select',
          inputOptions: this.getlocations(),
          // input: 'text',
          inputPlaceholder: this.location !== '' ? this.location : this.$t('pbtransferextrV2.location'),
          inputValue: this.location !== '' ? this.location : '', // Always scan location!
          inputValidator: (value) => {
            if (!value) {
              return 'Mandatory'
            }
          }
        }
      ]).then((result) => {
        if (result.value) {
          this.location = result.value[0].trim()
          this.zone = '' // result.value[1].trim()
          this.$swal.fire({
            title: 'Confirm ' + params.row.Container,
            html: '<p style="text-align:center">' +
            'Loc: ' + params.row.Location + '->' + result.value[0] + '<BR>' +
            'Whse: ' + this.activecompany + '->' + this.companyto(this.activecompany) + '<BR>' +
            '</p>',
            confirmButtonText: this.$t('pbtransferextrV2.tolocation'),
            showCancelButton: true
          }).then((result) => {
            if (result.value) {
              console.log(params.row.Container + '/' + this.location + '/' + this.zone)
              if (!this.executeputaway(params.row.Container, this.location, this.zone)) {
                this.containersintransit.splice(params.pageIndex, 1)
                this.selectOptions = this.getzones()
                this.loadpickup()
                this.getdetailszone(this.activelocation)
              }
            }
          })
        }
      })
    },
    executeputaway (container, location, zone) {
      this.feedback = this.$t('general.busy')
      this.loading = true
      this.errorfound = false
      axios
        .post(
          '/MoveToLocation?company=' +
                  this.activecompany +
                  '&container=' + container +
                  '&location=' + location +
                  '&user=' + this.loggedinuser +
                  '&zone=' + zone +
                  '&companyto=' + this.companyto(this.activecompany)
        )
        .then(response => {
          this.feedback = response.data
          if (!response.status === 200) {
            this.playSound(true)
            this.errorfound = true
          } else {
            this.playSound(false)
            this.errorfound = false
          }
        })
        .catch(error => {
          this.playSound(true)
          this.errorfound = true
          this.feedback = error.response.data
        })
        .finally(() => { this.loading = false })
      return this.errorfound
    }
  }
}
</script>

<style>
.vdivider {
  margin-top: 10px;
  margin-bottom: 10px;
}
.warning {
    background-color: #f0ad4e;
    color: #f7f7f7;
}
</style>
