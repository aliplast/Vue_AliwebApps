<template>
  <div>
    <form>
      <b-container fluid class="p-0">
        <b-row>
          <b-col cols="12">
            <div v-bind:class="getClass()">
              <h2>
                {{ $t("infopacklabel.title") }} {{info}}
                <h6>{{feedback}}</h6>
              </h2>
            </div>
          </b-col>
        </b-row>
        <div class="vdivider" />
        <b-row>
          <b-col cols="9">
            <!-- container -->
            <b-form-input
              @focus="$event.target.select()"
              id="pack"
              ref="pack"
              type="text"
              v-model="pack"
              :placeholder= "this.$t('infopacklabel.scanpack')"
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
      pathpic: '',
      pack: '',
      info: '',
      userinfo: '',
      retval: '',
      feedback: '',
      errorfound: false,
      // test: '',
      columns: [
        {
          label: 'Pack',
          field: 'Pack',
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
          label: 'Color',
          field: 'Color',
          thClass: 'header',
          tdClass: 'cell',
          hidden: false
        },
        {
          label: 'PrO',
          field: 'Prodcutiebon',
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
          label: 'Item',
          field: 'ItemFull',
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
          label: 'Salesheader',
          field: 'Salesheader',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        },
        {
          label: 'Salesline',
          field: 'Salesline',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        },
        {
          label: 'Loc',
          field: 'Location',
          thClass: 'header',
          tdClass: 'cell',
          hidden: false
        },
        {
          label: 'Zone',
          field: 'Zone',
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
          label: 'Status',
          field: 'Status',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        },
        {
          label: 'Container',
          field: 'Container',
          thClass: 'header',
          tdClass: 'cell',
          hidden: true
        },
        {
          label: 'LijnStatus',
          field: 'LijnStatus',
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
    pack: { required }
  },
  watch: {
    container: function (v) {
      this.pack = v.toUpperCase().trim()
    }
  },
  mounted () {
    this.$nextTick(() => {
      if (this.loginSuccessful === false) {
        this.$router.push('/')
      } else {
        this.container = ''
        this.$refs.pack.focus()
        this.feedback = this.$t('general.waiting')
      }
    })
  },
  methods: {
    validimage (imageSrc) {
      var img = new Image()
      img.src = imageSrc
      if (img.width === 0) {
        return false
      } else {
        return true
      }
    },
    onCellClick (params) {
      try {
        this.pathpic = require(process.env.VUE_APP_IMG_URL + 'BFBE/JPG/' + 'al_' + params.row.Salesheader + '_' + params.row.Salesline + '.jpg')
      } catch (e) {
        this.pathpic = process.env.VUE_APP_IMG_URL + params.row.Drawing
      }
      this.pathpic2 = process.env.VUE_APP_IMG_URL + params.row.Drawing
      this.$swal({
        title: params.row.ItemFull,
        html: '<p style="text-align:left">' +
            'Item: ' + this.clean(params.row.Item) + '<BR>' +
            'O/L: ' + this.clean(params.row.Salesheader) + ' ' + this.clean(params.row.Salesline) + '<BR>' +
            'LnSts: ' + this.clean(params.row.LijnStatus) + '<BR>' +
            'CN: ' + this.clean(params.row.CN) + '<BR>' +
            'CNid: ' + this.clean(params.row.CNID) + '<BR>' +
            'Qty: ' + this.clean(params.row.Qty) + '<BR>' +
            'Created: ' + this.clean(params.row.User) + '<BR>' +
            'On: ' + this.clean(params.row.Created) + '<BR>' +
            'ProdOrd: ' + this.clean(params.row.Productiebon) + '<BR>' +
            'Container: ' + this.clean(params.row.Container) + '<BR>' +
            'PckSts: ' + this.clean(params.row.Status) +
            '</p>',
        position: 'top',
        width: 350,
        imageUrl: this.pathpic,
        imageWidth: 200,
        imageHeight: 100
      })
    },
    clean (passedvalue) {
      const result = passedvalue || ''
      return result
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
      this.info = ''
      if (this.loggedinuser !== '' && this.loginSuccessful === true) {
        if (this.pack !== '') {
          this.errorfound = false
          this.feedback = this.$t('general.busy')
          NProgress.start()
          axios
            .get(
              '/GetInfoByPack?company=' +
                this.activecompany +
                '&pack=' +
                this.pack
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
                this.feedback = this.$t('general.nodata') + ' ' + this.pack
                this.$refs.pack.focus()
                this.$refs.pack.select()
              } else {
                this.playSound(false)
                this.rows = resultArray
                this.errorfound = false
                this.info = this.pack
                this.feedback = this.$t('general.click4details') + ' (' + this.rows.length + ')'
                this.pack = ''
                // this.$refs.pack.focus()
                this.$refs.btnSearch.focus()
              }
            })
            .catch(error => {
              NProgress.done()
              this.playSound(true)
              this.errorfound = true
              this.feedback = error.message
              this.pack = ''
              this.$refs.pack.focus()
            })
        } else {
          this.errorfound = true
          this.feedback = this.$t('general.waiting')
          this.$refs.pack.focus()
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
