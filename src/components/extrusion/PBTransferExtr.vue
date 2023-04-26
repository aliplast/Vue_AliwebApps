<template>
  <div>
    <form>
      <b-container fluid class="p-0">
        <b-row>
          <b-col cols="12">
            <div v-bind:class="getClass()">
              <h2>
                {{ $t("pbtransferextr.title") }}
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
                @change="loadpickup()"
                >
                </b-form-select>
            </b-col>
            <b-col cols="3">
              <b-button block variant="primary" v-b-tooltip.hover :title="activeaddress"
                type="submit"
                id="btnRefresh"
                ref="btnRefresh"
                @click.prevent="loadpickup(), locatemydevice()"
              ><b-icon icon="arrow-clockwise"></b-icon></b-button>
            </b-col>
            <b-col cols="3" v-if="locationdetails.length > 0">
              <b-button block  variant="secondary" v-b-tooltip.hover title="In Transit"
                type="submit"
                id="btnInTransit"
                ref="btnInTransit"
                @click.prevent="putintransit(); getintransit(), locatemydevice()">
                Transit</b-button>
            </b-col>
          </b-row>
          <div class="vdivider" />
          <!-- Overview locations pickup -->
          <b-row class="p-2">
            <b-col cols="3" class="p-1" v-for="location in zonedetails" :key="location.Location">
                <b-button block :variant="colorvariant(location.NbrContainers)"
                type="submit"
                @click.prevent="getdetails(location.Location); getintransit(); locatemydevice()"
                :id="location.Location"
                :ref="location.Location"
              >{{ location.Location }} <b-badge variant="light">{{location.NbrContainers }}</b-badge></b-button>
            </b-col>
          </b-row>
          <div class="vdivider" />
          <b-row v-if="locationdetails.length > 0">
            <b-col cols="12">
              <div class="alert alert-primary" role="alert">
              <strong>Pickup</strong> ({{locationdetails.length}}) <small>{{ showactiveaddress() }}</small>
            </div>
            </b-col>
          </b-row>
          <b-row v-if="locationdetails.length > 0">
            <b-col cols="12">
              <vue-good-table
                :columns="columns"
                :rows="locationdetails"
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
                  {{ $t("pbtransferextr.nocontainerstopickup") }}
                </div>
              ></vue-good-table>
            </b-col>
          </b-row>
        </div>
        <div class="vdivider" />
        <div v-if="!showpickup">
          <!-- Overview In Transit -->
          <b-row>
            <b-col cols="12">
              <div class="alert alert-danger" role="alert">
              <strong>{{ $t("pbtransferextr.transit") }}</strong> ({{containersintransit.length}}) {{ showactiveaddress() }}
            </div>
            </b-col>
          </b-row>
            <b-row>
            <b-col cols="12">
              <vue-good-table
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
  </div>
</template>

<script>
import { beep } from '../systems/beep'
// import { required } from 'vuelidate/lib/validators'
import { mapState } from 'vuex'
import axios from 'axios'
import NProgress from 'nprogress'
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
      activelocation: '',
      zone: '',
      location: '',
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
        this.locatemydevice()
      }
    })
  },
  watch: {
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
      if (nbr >= 4) return 'danger'
      if (nbr > 0) return 'warning'
      return 'primary'
    },
    getClass () {
      if (this.errorfound) {
        return 'bg-danger text-white'
      } else {
        return 'bg-success text-white'
      }
    },
    showactiveaddress () {
      if (this.activeaddress.indexOf(',') > -1) {
        return this.activeaddress.split(',')[0]
      } else {
        return this.activeaddress
      }
    },
    layoutCount: function (rows, columns) {
      return (rows - 1) * this.numberOfColumns + columns
    },
    selectionchanged (params) {
      this.selecteddata = params.selectedRows
    },
    getzones () {
      NProgress.start()
      console.log('/GetZones?company=' + this.activecompany)
      axios
        .get('/GetZones?company=' + this.activecompany)
        .then(response => {
          this.zoneoptions = response.data
        })
      NProgress.done()
    },
    loadpickup () {
      NProgress.start()
      this.locationdetails = []
      if (this.zoneselected !== '') {
        axios
          .get('/GetZoneDetails?company=' + this.activecompany + '&zone=' + this.zoneselected)
          .then(response => {
            this.zonedetails = response.data
          })
      }
      NProgress.done()
    },
    getdetails (location) {
      NProgress.start()
      this.feedback = this.zoneselected + ' ' + location
      if (location !== '') {
        this.activelocation = location
        axios
          .get('/GetLocationDetails?company=' + this.activecompany + '&location=' + location)
          .then(response => {
            this.locationdetails = response.data
          })
      } else {
        this.locationdetails = []
        this.activelocation = ''
      }
      NProgress.done()
    },
    getintransit () {
      NProgress.start()
      axios
        .get('/GetInTransit?company=' + this.activecompany + '&user=' + this.loggedinuser)
        .then(response => {
          this.containersintransit = response.data
        })
      NProgress.done()
    },
    getlocations () {
      console.log('/GetTransitLocations?Company=' + this.companyto(this.activecompany))
      return axios
        .get(
          '/GetTransitLocations?Company=' + this.companyto(this.activecompany)
        )
        .then(res => {
          console.log(res.data)
          return res.data
        })
    },
    putintransit () {
      NProgress.start()
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
            this.getdetails(this.activelocation)
            this.getintransit()
            this.loadpickup()
          }
        })
        .catch(error => {
          this.playSound(true)
          this.errorfound = true
          this.feedback = error.response.data
        })
      // this.getzones()
      // this.loadpickup()
      // this.getdetails(this.activelocation)
      NProgress.done()
    },
    onrowclick (params) {
      this.locatemydevice()
      this.feedback = params.row.Container
      this.$swal.mixin({
        title: params.row.Container,
        html: '<p style="text-align:center">' +
            'Loc: ' + params.row.Location + '<BR>' +
            'Whse: ' + this.activecompany + '->' + this.companyto(this.activecompany) + '<BR>' +
            '<small>' + this.showactiveaddress() + '</small>' +
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
          inputPlaceholder: 'Location',
          // inputValue: params.row.Location, // Always scan location!
          inputValidator: (value) => {
            if (!value) {
              return 'Mandatory'
            }
          }
        }
        // {
        // input: 'text',
        // inputPlaceholder: 'Zone',
        // inputValue: 'ZBRUT',
        // inputValidator: (value) => {
        // if (!value) {
        // return 'Mandatory'
        // }
        // }
        // }
      ]).then((result) => {
        if (result.value) {
          this.location = result.value[0].trim()
          this.zone = '' // result.value[1].trim()
          this.$swal.fire({
            title: 'Confirm ' + params.row.Container,
            html: '<p style="text-align:center">' +
            'Loc: ' + params.row.Location + '->' + result.value[0] + '<BR>' +
            'Whse: ' + this.activecompany + '->' + this.companyto(this.activecompany) + '<BR>' +
            '<small>' + this.showactiveaddress() + '</small>' +
            '</p>',
            confirmButtonText: 'To Location',
            showCancelButton: true
          }).then((result) => {
            if (result.value) {
              if (!this.executeputaway(params.row.Container, this.location, this.zone)) {
                this.containersintransit.splice(params.pageIndex, 1)
                this.selectOptions = this.getzones()
                this.loadpickup()
                this.getdetails(this.activelocation)
              }
            }
          })
        }
      })
    },
    locatemydevice () {
      // navigator.geolocation.getCurrentPosition(function () {}, function () {}, {}) // the hackiest of all hacks ...
      navigator.geolocation.getCurrentPosition(
        position => {
          this.lng = position.coords.longitude
          this.lat = position.coords.latitude
          this.activeaddress = '' // disable when billing enabled on google api
          // this.getStreetAddressFrom(position.coords.latitude, position.coords.longitude)
        },
        error => {
          console.log(error.message)
        },
        { maximumAge: 1000, timeout: 5000, enableHighAccuracy: true }
      )
    },
    async getStreetAddressFrom (lat, long) {
      try { // billing account nodig - gebruik corialis dev account
        var {
          data
        } = await axios.get(
          'https://maps.googleapis.com/maps/api/geocode/json?latlng=' +
         lat +
         ',' +
         long +
         '&key=AIzaSyALlSip9W8FQB6pv4KLISWmXXl2qFLfK-Q'
        )
        if (data.error_message) {
          console.log(data.error_message)
        } else {
          this.activeaddress = data.results[0].formatted_address
        }
      } catch (error) {
        console.log(error.message)
      }
    },
    executeputaway (container, location, zone) {
      this.feedback = this.$t('general.busy')
      NProgress.start()
      this.errorfound = false
      axios
        .post(
          '/MoveToLocation?company=' +
                  this.activecompany +
                  '&container=' +
                  container +
                  '&location=' +
                  location +
                  '&user=' +
                  this.loggedinuser +
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
      NProgress.done()
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
</style>
