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
                {{ $t("infoopenpb.title") }} {{info}}
                <h6>{{feedback}}</h6>
              </h2>
            </div>
          </b-col>
        </b-row>
          <div class="vdivider" />
        <b-row>
        <b-col cols="9">
        </b-col>
          <b-col cols="3">
            <b-button variant="primary" v-b-tooltip.hover :title="this.$t('infoopenpb.load')" block
              type="submit"
              id="btnSearch"
              ref="btnSearch"
              @click.prevent="executesql"
            ><b-icon icon="arrow-repeat"></b-icon></b-button>
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
              @on-row-click="onRowClick"
              styleClass="vgt-table condensed"
              :search-options="{ enabled: true }"
              :sort-options="{ enabled: false, }"
              :pagination-options="{
              enabled: true,
              mode: 'pages',
              perPage: 20,
              perPageDropdown: [5, 10, 20, 50],
              dropdownAllowAll: true,
              setCurrentPage: 1,
              nextLabel: '',
              prevLabel: '',
              rowsPerPageLabel: '',
              ofLabel: '/',
              pageLabel: '', // for 'pages' mode
              allLabel: 'All',
            }">
            <div slot="emptystate">
              {{ $t("general.nodata") }}
            </div>
            </vue-good-table>
          </b-col>
        </b-row>
        <div class="vdivider" />
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
      info: '',
      userinfo: '',
      retval: '',
      feedback: '',
      location: '',
      loading: false,
      errorfound: false,
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
          field: 'Date',
          thClass: 'header',
          tdClass: 'cell',
          hidden: false
        },
        {
          label: 'StockLoc',
          field: 'StockLoc',
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
          label: 'RQty',
          field: 'RQty',
          thClass: 'header',
          tdClass: 'cell',
          hidden: false
        }
      ],
      rows: [],
      buttonvariant: 'primary' // can be used flexible
    }
  },
  computed: {
    ...mapState(['loginError', 'loginSuccessful', 'loggedinuser', 'prtlab', 'prtdoc', 'test', 'activecompany'])
  },
  mixins: [beep],
  validations: {
    location: { required }
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
    onRowClick (params) {
      this.feedback = params.row.Container
      this.$swal.mixin({
        title: params.row.Container,
        html: '<p>' + params.row.Item + ' qty:' + params.row.RQty + '</p>',
        position: 'top',
        width: 350,
        input: 'text',
        confirmButtonText: 'Next &rarr;',
        showCancelButton: true
      }).queue([
        {
          input: 'text',
          inputPlaceholder: 'Location',
          inputValidator: (value) => {
            if (!value) {
              return 'Mandatory'
            }
          }
        }
      ]).then((result) => {
        if (result.value) {
          this.location = result.value[0].trim()
          this.$swal.fire({
            title: 'Confirm ' + params.row.Container,
            html: `<p>Location:<strong> ${result.value[0]}</strong></p>`,
            confirmButtonText: 'To Location',
            showCancelButton: true
          }).then((result) => {
            if (result.value) {
              if (!this.executeputaway(params.row.Container, this.location)) {
                this.rows.splice(params.pageIndex, 1)
              }
            }
          })
        }
      })
    },
    executeputaway (container, location) {
      this.feedback = 'Processing'
      this.loading = true
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
                  this.loggedinuser
        )
        .then(response => {
          // console.log(response.data)
          this.feedback = response.data
          // if (!this.feedback.startsWith('OK')) {
          if (!response.status === 200) {
            this.playSound(true)
            this.errorfound = true
          } else {
            this.playSound(false)
            this.errorfound = false
            this.info = container
          }
        })
        .catch(error => {
          this.playSound(true)
          this.errorfound = true
          this.feedback = error.response.data
        })
        .finally(() => { this.loading = false })
      return this.errorfound
    },
    executesql () {
      this.rows = []
      this.retval = ''
      this.feedback = ''
      this.info = ''
      if (this.loggedinuser !== '' && this.loginSuccessful === true) {
        this.errorfound = false
        this.feedback = this.$t('general.busy')
        this.loading = true
        axios
          .get(
            '/GetNonTransferredPB?company=' + this.activecompany
          )
          .then(res => {
            const data = res.data
            const resultArray = []
            for (let key in data) {
              resultArray.push(data[key])
            }
            if (!resultArray.length) {
              this.rows = []
              this.feedback = this.$t('general.nodata')
              this.errorfound = true
            } else {
              this.rows = resultArray
              this.feedback = this.$t('infoopenpb.found') + ' ' + this.rows.length
              this.errorfound = false
            }
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
  border-radius: 20%;
  border-color: lightgray;
  border-width: 1px;
  display: inline-block;
}
.selectedRow {
  background-color: rgb(255, 254, 170);
}
</style>
