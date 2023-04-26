<template>
  <div>
    <form>
      <b-container fluid  class="p-0">
        <b-row>
          <b-col cols="12">
            <div v-bind:class="getClass()">
              <h2>
                {{ $t("transpregex.title") }} {{customercode}}
                <h6>{{feedback}}</h6>
              </h2>
            </div>
          </b-col>
        </b-row>
        <div class="vdivider" />
        <b-row>
          <b-col cols="9">
            <!-- Search Customer -->
            <b-form-input
              :placeholder= "$t('transpregex.searchcustomer')"
              ref="customer"
              id="customer"
              type="text"
              autocomplete="off"
              v-model="customer"
              @click="selectAll"
              @focus="modal = true"
            />
            <div v-if="filteredCustomers && modal">
              <ul class="list-group">
                <li
                  class="list-group-item"
                  v-for="filteredCustomer in filteredCustomers" :key="filteredCustomer.Name"
                  @click="setState(filteredCustomer)"
                >{{ filteredCustomer.Name }}</li>
              </ul>
            </div>
          </b-col>
          <b-col cols="3">
            <b-button v-b-tooltip.hover title="In" block
              :pressed.sync="directionout"
              v-if="!directionout"
              variant="outline-secondary"
            ><b-icon icon="box-arrow-in-down"></b-icon></b-button>
            <b-button  v-b-tooltip.hover title="Out"
              :pressed.sync="directionout" block
              v-if="directionout" variant="secondary"
            ><b-icon icon="box-arrow-up"></b-icon></b-button>
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
              :placeholder= "$t('transpregex.scancontainer')"
              v-on:keyup.enter="add2table"
            />
          </b-col>
          <b-col cols="3">
            <b-button block
              variant="success"
              type="button"
              @submit.prevent
              @click="ConfirmationProcess"
            ><b-icon icon="play-fill"></b-icon></b-button>
          </b-col>
          <b-col cols="3">
            <b-button block
              variant="primary"
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
              :columns="columns"
              :rows="rows"
              :line-numbers="true"
              @on-cell-click="onCellClick"
              styleClass="vgt-table condensed"
            ></vue-good-table>
          </b-col>
        </b-row>
      </b-container>
    </form>
  </div>
</template>

<script>
import { beep } from '../systems/beep'
import { required } from 'vuelidate/lib/validators'
import { mapState } from 'vuex'
import axios from 'axios'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

export default {
  data () {
    return {
      directionout: true,
      alreadyprocessed: false,
      customer: '',
      customercode: '',
      customers: [],
      filteredCustomers: [],
      modal: false,
      // company: process.env.VUE_APP_COMPANY,
      container: '',
      type: '',
      feedback: '',
      info: '',
      userinfo: '',
      errorfound: false,
      columns: [
        {
          label: 'Container',
          field: 'container',
          thClass: 'header',
          tdClass: 'cell',
          type: 'string'
        },
        {
          label: 'Type',
          field: 'type',
          thClass: 'header',
          tdClass: 'cell',
          type: 'string'
        },
        {
          label: 'Remark',
          field: 'remark',
          thClass: 'header',
          tdClass: 'cell',
          type: 'string'
        }
      ],
      rows: []
    }
  },
  computed: {
    ...mapState(['loginError', 'loginSuccessful', 'loggedinuser', 'test']),
    company: function () {
      if (this.test === true) {
        return process.env.VUE_APP_COMPANYUAC
      } else {
        return process.env.VUE_APP_COMPANY
      }
    }
  },
  mixins: [beep],
  validations: {
    customer: { required }
  },
  watch: {
    container: function (v) {
      this.container = v.toUpperCase().trim()
    },
    customer () {
      if (this.customer.length > 3) { this.filterCustomers() }
      this.rows = []
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
      }
    })
  },
  methods: {
    movetonextcontrol: function (event) {
      this.$refs.container.focus()
    },
    movetofirstcontrol: function (event) {
      this.$refs.customer.focus()
    },
    getClass () {
      if (this.errorfound) {
        return 'bg-danger text-white'
      } else {
        return 'bg-success text-white'
      }
    },
    cancel () {
      this.directionout = true
      this.alreadyprocessed = false
      this.customer = ''
      this.customercode = ''
      this.rows = []
    },
    selectAll () {
      this.errorfound = false
      this.feedback = this.$t('general.waiting')
      this.$refs.customer.select()
    },
    filterCustomers () {
      NProgress.start()
      axios
        .get('GetCustomersBySearch?company=' + this.company + '&searchvalue=' + this.customer + '%')
        .then(response => {
          this.customers = response.data
        })
      this.filteredCustomers = this.customers.filter(customer => {
        return customer.Name.toLowerCase().startsWith(
          this.customer.toLowerCase()
        )
      })
      NProgress.done()
    },
    setState (customer) {
      this.customer = customer.Name
      this.customercode = customer.No
      this.modal = false
      this.$refs.container.focus()
    },
    checkdata () {
      for (var i = 0; i < this.rows.length; i++) {
        if (this.rows[i].remark !== '') {
          this.alreadyprocessed = true
        }
      }
    },
    add2table () {
      this.errorfound = false
      this.checkIfExists(this.container)
      if (!this.exists) {
        if (this.container.match('^[0-9]{1,8}$')) {
          this.type = 'real'
          this.remark = ''
          this.rows.push({
            container: this.container,
            type: this.type,
            remark: this.remark
          })
          this.feedback = this.container
        } else if (this.container.match('^[A-Z]{2}[0-9]{1,8}$')) {
          this.type = 'cont'
          this.remark = ''
          this.rows.push({
            container: this.container,
            type: this.type,
            remark: this.remark
          })
          this.feedback = this.container
        } else {
          // this.type = ''
          this.remark = ''
          this.feedback = this.$t('transpregex.invalidcontainer')
          this.errorfound = true
        }
      } else {
        this.feedback = this.$t('transpregex.duplicatecontainer')
        this.errorfound = true
        // this.$swal('Duplicate!', this.container + ' already in list', 'error')
      }
      this.container = ''
      this.$refs.container.focus()
    },
    checkIfExists (container) {
      this.exists = this.rows.some(item => {
        return item.container === container
      })
    },
    onCellClick (params) {
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
          this.rows.splice(params.rowIndex, 1)
          // this.$swal('Deleted', 'You successfully deleted this file', 'success')
        } else {
          // this.$swal('Cancelled', 'Your file is still intact', 'info')
        }
      })
    },
    ConfirmationProcess () {
      this.errorfound = false
      this.$swal({
        title: this.$t('general.rusure'),
        showCancelButton: true,
        confirmButtonText: this.$t('general.yes'),
        cancelButtonText: this.$t('general.no'),
        showCloseButton: true
      }).then(result => {
        if (result.value) {
          this.Write2ASW()
        } else {
          this.feedback = this.$t('general.aborted')
          this.errorfound = true
          this.$refs.customer.focus()
        }
      })
    },
    Write2ASW () {
      // this.checkdata()
      // if (this.alreadyprocessed === false) {
      if (this.loggedinuser !== '' && this.loginSuccessful === true) {
        if (this.customer !== '' && this.rows.length > 0) {
          NProgress.start()
          // console.log(JSON.stringify(this.rows))
          this.errorfound = false
          axios
            .post('/ProcessContainers',
              JSON.stringify(this.rows), {
                headers: { 'Content-Type': 'application/json' },
                params: {
                  company: this.company,
                  customer: this.customercode,
                  directionout: this.directionout
                }
              })
            .then(res => {
              this.playSound(false)
              this.rows = []
              this.rows = JSON.parse(res.data)
              this.feedback = this.$t('general.processed')
              this.showprocessbutton = false
            })
            .catch(e => {
              // console.log('Error:' + e)
              this.playSound(true)
              this.feedback = e
            })
          NProgress.done()
        } else {
          this.errorfound = true
          this.feedback = this.$t('general.nodata')
          if (this.customer === '') {
            this.$refs.customer.focus()
          } else {
            this.$refs.container.focus()
          }
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
