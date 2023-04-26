<template>
  <div>
  <b-overlay :show="loading" rounded="sm" spinner-variant="danger">
    <form>
      <b-container fluid class="p-0">
        <b-row>
          <b-col cols="12">
            <div v-bind:class="getClass()">
              <h2>
                 {{ $t("infoitem.title") }} {{info}}
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
              :search-options="{ enabled: true }"
              :sort-options="{ enabled: false, }"
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
        }
      ],
      rows: []
    }
  },
  async created () {
    this.loading = true
    axios
      .get('GetInfoByItem?company=' + this.activecompany + '&item=%')
      .then(response => {
        this.items = response.data
      })
      .finally(() => { this.loading = false })
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
      if (this.item.length > 3) { this.filterItems(); this.rows = [] }
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
            '</p>',
        position: 'top',
        width: 350,
        imageUrl: process.env.VUE_APP_IMG_URL + params.row.Drawing,
        imageWidth: 200,
        imageHeight: 100,
        confirmButtonText: this.$t('infoitem.showdetails'),
        showLoaderOnConfirm: true,
        showCancelButton: true,
        preConfirm: (login) => {
          return axios
            .get(
              '/GetInfoItemPerLocationByItem?company=' + this.activecompany + '&item=' + params.row.Item
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
          console.log(this.items)
          this.$swal.fire({
            title: params.row.Item + ' (' + params.row.OH + ')',
            // html: '<div><b-table small striped caption-top :items=items'><template v-slot:table-caption>" + "Records: " + dt.Rows.Count.ToString() + "</template></div>',
            html: result.value,
            position: 'top'
          })
        }
      })
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
    executesql () {
      console.log(this.item)
      this.retval = ''
      this.feedback = ''
      this.info = ''
      this.rows = []
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
                this.feedback = this.$t('general.click4details') + ' (' + this.rows.length + ')'
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
