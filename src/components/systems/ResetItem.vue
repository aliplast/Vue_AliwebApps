<template>
  <div>
    <form>
      <b-container fluid class="p-0">
        <b-row>
          <b-col cols="12">
            <div v-bind:class="getClass()">
              <h2>
                Reset Item {{info}}
                <h6>{{feedback}}</h6>
              </h2>
            </div>
          </b-col>
        </b-row>
        <div class="vdivider" />
        <b-row>
          <b-col cols="9">
            <!-- item -->
            <label  for="item" class="col-sm-2 col-form-label sr-only">Item</label >
            <b-form-input
              @focus="$event.target.select()"
              id="item"
              ref="item"
              type="text"
              v-model="item"
              placeholder="scan/enter item"
            />
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
              :line-numbers="true"
              @on-cell-click="onCellClick"
              styleClass="vgt-table condensed"
              :search-options="{ enabled: true }"
              :sort-options="{ enabled: false, }"
            ></vue-good-table>
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
      item: '',
      info: '',
      userinfo: '',
      retval: '',
      feedback: '',
      errorfound: false,
      test: '',
      infoimage: '',
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
    container: { required }
  },
  watch: {
    item: function (v) {
      this.item = v.toUpperCase().trim()
    }
  },
  mounted () {
    this.$nextTick(() => {
      if (this.loginSuccessful === false) {
        this.$router.push('/')
      } else {
        this.item = ''
        this.$refs.item.focus()
        this.feedback = 'Waiting for values'
      }
    })
  },
  methods: {
    onCellClick (params) {
      this.$swal({
        title: params.row.Item,
        html: '<p style="text-align:left">' +
            'Desc: ' + params.row.Descr + '<BR>' +
            'Suppl: ' + params.row.Supplier + '<BR>' +
            'SupplID: ' + params.row.SupplID + '<BR>' +
            'Stockloc: ' + params.row.Stockloc + '<BR>' +
            'QtyOH: ' + params.row.OH + '<BR>' +
            'Stockzone: ' + params.row.Stockzone +
            '</p>' +
            '<p><span style="color: #ff0000; background-color: #ffff00;"><strong>RESET REMOVES ALL CONTAINERS!</strong></span></p>',
        position: 'top',
        width: 350,
        imageUrl: process.env.VUE_APP_IMG_URL + params.row.Drawing,
        imageWidth: 200,
        imageHeight: 100,
        showCancelButton: true,
        confirmButtonText: 'Reset',
        showLoaderOnConfirm: false,
        preConfirm: (login) => {
          return axios
            .post(
              '/UpdateResetItem?company=' + this.company + '&item=' + params.row.Item
            )
            .then(response => {
              return response.data
            })
            .catch(error => {
              this.$swal.showValidationMessage(
                `Request failed: ${error}`
              )
            })
        },
        allowOutsideClick: () => !this.$swal.isLoading()
      }).then((result) => {
        if (result.value) {
          this.$swal.fire({
            title: params.row.Item + ' (' + params.row.OH + ')',
            // html: '<div><b-table small striped caption-top :items=items'><template v-slot:table-caption>" + "Records: " + dt.Rows.Count.ToString() + "</template></div>',
            html: 'Records updated: ' + result.value,
            position: 'top'
          })
        }
      })
    },
    getClass () {
      if (this.errorfound) {
        return 'bg-danger text-white'
      } else {
        return 'bg-success text-white'
      }
    },
    // getdetails (article) {
    //   axios
    //     .get('/GetInfoItemPerLocationByItem?company=' + this.company + '&item=' + article)
    //     .then(res => {
    //       const data = res.data
    //       const resultArray = []
    //       for (let key in data) {
    //         resultArray.push(data[key])
    //       }
    //       this.itemdetails = resultArray
    //       console.log(this.itemdetails)
    //     })
    // },
    executesql () {
      this.retval = ''
      this.feedback = ''
      this.info = ''
      this.rows = []
      if (this.loggedinuser !== '' && this.loginSuccessful === true) {
        if (this.item !== '') {
          this.errorfound = false
          this.feedback = 'Searching ...'
          NProgress.start()
          axios
            .get(
              '/GetInfoByItem?company=' + this.activecompany + '&item=' + this.item
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
                this.feedback = 'No data ' + this.item
                this.$refs.item.focus()
                this.$refs.item.select()
              } else {
                this.playSound(false)
                this.rows = resultArray
                this.errorfound = false
                this.info = this.item
                this.feedback = 'Click for drawing'
                this.item = ''
                this.$refs.btnSearch.focus()
              }
            })
            .catch(error => {
              NProgress.done()
              this.playSound(true)
              this.errorfound = true
              this.feedback = error.message
              this.item = ''
              this.$refs.item.focus()
            })
        } else {
          this.errorfound = true
          this.feedback = 'Waiting for input ...'
          this.item = ''
          this.$refs.item.focus()
        }
      } else {
        this.errorfound = true
        this.feedback = 'Login please ...'
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
