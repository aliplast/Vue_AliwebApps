<template>
  <div>
  <form>
    <b-overlay :show="loading" rounded="sm" spinner-variant="danger">
      <b-container fluid class="p-0">
        <b-row>
          <b-col cols="12">
            <div v-bind:class="getClass()">
              <h2>
                {{ $t("reprintlabel.title") }}
                <h6>{{feedback}}</h6>
              </h2>
            </div>
          </b-col>
        </b-row>
        <div class="vdivider" />
        <b-form-row>
          <b-col cols="5">
            <!-- real -->
            <b-form-input
              v-b-tooltip.hover :title="ps_printid"
              @focus="$event.target.select()"
              id="real"
              ref="real"
              type="text"
              v-model="real"
              :placeholder= "this.$t('reprintlabel.scanreal')"
              @keyup.enter.prevent="executesql()"
            />
          </b-col>
          <b-col cols="5">
            <!-- drager -->
            <b-form-input
              @focus="$event.target.select()"
              id="drager"
              ref="drager"
              type="text"
              v-model="drager"
              v-bind:disabled="true"
              :placeholder= "this.$t('reprintlabel.carrier')"
            />
          </b-col>
          <b-col cols="2">
            <b-button variant="primary"
              type="submit"
              id="btnSearch"
              ref="btnSearch"
              @click.prevent="executesql()"
            ><b-icon icon="search"></b-icon></b-button>
          </b-col>
        </b-form-row>
        <div class="vdivider" />
        <b-row>
          <b-col cols="9">
            <!-- Search item -->
            <b-form-input
              :placeholder= "this.$t('reprintlabel.searchitem')"
              ref="item"
              id="item"
              type="text"
              autocomplete="off"
              v-model="item"
              v-bind:disabled="lockfields"
              @click="selectItem"
              @focus="modalitem = true"
            />
            <div v-if="filteredItems && modalitem">
              <b-list-group>
                <b-list-group-item
                  v-for="filteredItem in filteredItems" :key="filteredItem.Item"
                  @click="setStateItem(filteredItem)"
                >{{ filteredItem.Item }}
                </b-list-group-item>
              </b-list-group>
            </div>
          </b-col>
           <b-col cols="3">
            <b-button variant="outline-primary"
              type="submit" block
              @click.prevent="showImage()"
              v-if="imagevisible"
            ><b-icon icon="image" font-scale="1"></b-icon></b-button>
          </b-col>
        </b-row>
        <div class="vdivider" />
        <b-row>
          <b-col cols="6">
            <!-- Aantal -->
            <b-form-input
              @focus="$event.target.select()"
              id="number"
              ref="number"
              type="number"
              v-model.number="number"
              :placeholder= "this.$t('reprintlabel.number')"
            />
          </b-col>
          <b-col class="text-left" cols="3" v-if="imagevisible">
            <b-badge variant="info"> {{ $t("reprintlabel.top") }} {{ top }}</b-badge>
          </b-col>
        </b-row>
        <div class="vdivider" />
        <b-row>
          <b-col cols="6">
            <!-- Location -->
            <b-form-input
              @focus="$event.target.select()"
              id="location"
              ref="location"
              v-model="location"
              v-bind:disabled="lockfields"
              type="text"
              :placeholder= "this.$t('reprintlabel.scanlocation')"
              @keyup.enter="createlabel()"
            />
          </b-col>
        </b-row>
        <div class="vdivider" />
        <b-form-row>
          <b-col cols="4">
            <!-- printers -->
            <b-form-select
                v-b-tooltip.hover :title="this.selectedprinter"
                v-model="selectedprinter"
                :options="printers"
                value-field="value"
                text-field="text"
                >
            </b-form-select>
          </b-col>
          <b-col cols="2">
            <b-button v-b-tooltip.hover :title= "this.$t('reprintlabel.reset')"
              type="button"
              id="resetbtn"
              ref="resetbtn"
              @click="cancel"
            ><b-icon icon="life-preserver"></b-icon></b-button>
          </b-col>
          <b-col cols="2" v-show="printvisible">
            <b-button v-b-tooltip.hover :title= "this.$t('reprintlabel.update')"
              variant="warning"
              type="submit"
            ><b-icon icon="pencil-square" font-scale="1"></b-icon></b-button>
          </b-col>
          <b-col cols="2" v-show="printvisible">
            <b-button v-b-tooltip.hover :title="sellabelprinter"
              :variant="buttonvariant"
              id="printbtn"
              ref="printbtn"
              @click="printlabel()"
            ><b-icon icon="tag-fill"></b-icon></b-button>
          </b-col>
          <b-col cols="2" v-show="createvisible">
            <b-button v-b-tooltip.hover :title= "this.$t('reprintlabel.create')"
              :variant="buttonvariant"
              type="button"
              id="processbtn"
              ref="processbtn"
              @click="createlabel()"
            ><b-icon icon="plus-circle"></b-icon></b-button>
          </b-col>
        </b-form-row>
      </b-container>
    </b-overlay>
    </form>
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
      buttonvariant: 'primary', // can be used flexible
      ps_printid: '',
      ps_copies: '1', // ???
      item: '',
      newitem: '',
      order: '0',
      top: '',
      loading: false,
      customer: '',
      itemcode: '',
      imagevisible: true,
      drawing: '',
      items: [],
      filteredItems: [],
      modalitem: false,
      modalnewitem: false,
      lockfields: true,
      printvisible: false,
      createvisible: false,
      drager: '',
      dragercheck: '',
      real: '',
      type: '',
      feedback: '',
      info: '',
      userinfo: '',
      number: '',
      newnumber: '',
      location: '',
      newlocation: '',
      containertype: 'PM',
      insertnew: true,
      errorfound: false,
      rows: [],
      selectedprinter: '',
      printers: [],
      sellabelprinter: '',
      sellabeltype: ''
    }
  },
  async created () {
    axios
      .get('GetInfoByItem?company=' + this.activecompany + '&item=%')
      .then(response => {
        this.items = response.data
      })
  },
  computed: {
    ...mapState(['loginError', 'loginSuccessful', 'loggedinuser', 'prtlab', 'prtdoc', 'test', 'userbadge', 'activecompany'])
  },
  mixins: [beep],
  validations: {
    item: { required }
  },
  watch: {
    drager: function (v) {
      this.drager = v.toUpperCase().trim()
    },
    item (v) {
      this.item = v.toUpperCase().trim()
      if (this.item.length >= 3) { this.filterItems(this.item) }
      this.rows = []
      if (this.item === '') {
        this.imagevisible = false
      } else {
        this.imagevisible = true
      }
    },
    newitem (v) {
      this.newitem = v.toUpperCase().trim()
      if (this.newitem.length >= 3) { this.filterItems(this.newitem) }
      this.rows = []
    },
    location () {
      if (this.location.length > 7) {
        this.errorfound = true
        this.feedback = this.location + ' ' + this.$t('general.istoolong') + ' (' + this.location.length + ')'
      } else {
        this.errorfound = false
      }
    },
    selectedprinter: function (v) {
      var prt = this.printers.find(option => option.value === this.selectedprinter)
      this.sellabelprinter = prt.value
      this.sellabeltype = prt.text
    }
  },
  mounted () {
    this.$nextTick(() => {
      if (this.loginSuccessful === false) {
        this.$router.push('/')
      } else {
        this.real = ''
        this.$refs.real.focus()
        this.feedback = this.$t('general.waiting')
        this.imagevisible = false
        this.getprinters()
      }
    })
  },
  methods: {
    movetofirstcontrol: function (event) {
      this.$refs.real.focus()
    },
    movetofourthcontrol: function (event) {
      console.log('next control')
    },
    movetosecondcontrol: function (event) {
      this.$refs.item.focus()
    },
    movetothirdcontrol: function (event) {
      this.$refs.number.focus()
    },
    movetoprocess: function (event) {
      this.$refs.processbtn.focus()
    },
    showImage () {
      this.infoimage = ''
      this.$swal({
        title: this.item,
        html: '<p>' + this.drawing + '</p>',
        position: 'top',
        width: 350,
        imageUrl: process.env.VUE_APP_IMG_URL + this.drawing,
        imageWidth: 200,
        imageHeight: 100
      })
    },
    async getprinters () {
      await axios
        .get(
          '/GetPrinters?badgeid=' + this.userbadge
        )
        .then(res => {
          this.printers = res.data
          this.selectedprinter = this.printers[0].value
        })
        .catch(error => {
          console.log(error.message)
        })
    },
    getClass () {
      if (this.errorfound) {
        return 'bg-danger text-white'
      } else {
        return 'bg-success text-white'
      }
    },
    selectItem () {
      this.errorfound = false
      this.feedback = this.$t('general.waiting')
      this.$refs.item.select()
    },
    selectNewItem () {
      this.errorfound = false
      this.feedback = this.$t('general.waiting')
      this.$refs.newitem.select()
    },
    filterItems (pItem) {
      axios
        .get('GetInfoByItem?company=' + this.activecompany + '&item=' + pItem)
        .then(response => {
          this.items = response.data
        })
      this.filteredItems = this.items.filter(item => {
        return item.Item.toUpperCase().startsWith(
          pItem.toUpperCase()
        )
      })
    },
    setStateItem (item) {
      this.item = item.Item
      this.drawing = item.Drawing
      this.top = item.StkUnit
      this.modalitem = false
      this.$refs.number.focus()
    },
    setStateNewItem (item) {
      this.newitem = item.Item
      // this.drawing = item.Drawing
      this.modalnewitem = false
      this.$refs.number.focus()
    },
    printlabel () {
      console.log('Print label')
      this.feedback = this.$t('general.busy')
      if (String(this.ps_printid) !== '') {
        this.loading = true
        this.errorfound = false
        axios
          .post( // returns printid on success
            '/Printservice?Company=' +
                  this.activecompany +
                  '&Printer=' +
                  this.sellabelprinter +
                  '&Labeltype=' +
                  this.sellabeltype +
                  '&Copies=' +
                  this.ps_copies +
                  '&LabelID=' +
                  this.ps_printid +
                  '&User=' +
                  this.loggedinuser
          )
          .then(res => {
            this.playSound(false)
            this.errorfound = false
            this.cancel()
            this.feedback = res.data
          })
          .catch(error => {
            this.playSound(true)
            this.errorfound = true
            this.feedback = error.message
            this.$refs.drager.focus()
          })
          .finally(() => { this.loading = false })
        this.ps_printid = ''
      }
    },
    createlabel () {
      this.feedback = this.$t('general.busy')
      console.log('Create label')
      if (this.real === '' || this.item === '' || this.number === '' || this.location === '') {
        this.errorfound = true
        this.feedback = this.$t('general.mandatory')
      } else {
        if (this.location.length <= 7) {
          this.feedback = this.$t('general.busy')
          this.loading = true
          this.errorfound = false
          axios
            .post(
              '/CreateLabel?company=' +
                  this.activecompany +
                  '&drager=' +
                  '' + // not needed, generated by api
                  '&item=' +
                  this.item +
                  '&number=' +
                  this.number +
                  '&location=' +
                  this.location +
                  '&user=' +
                  this.loggedinuser +
                  '&real=' +
                  this.real +
                  '&containertype=' +
                  this.containertype +
                  '&customer=' +
                  this.customer +
                  '&bonnr=' +
                  this.order
            )
            .then(res => {
              this.playSound(false)
              // console.log(res.data.indexOf('Error') + ' ' + res.data)
              if (res.data.indexOf('Error') > 0) {
                this.errorfound = true
                this.feedback = res.data
              } else {
                this.errorfound = false
                this.ps_printid = res.data
                this.printlabel()
              }
              // this.cancel()
            })
            .catch(error => {
              this.playSound(true)
              this.errorfound = true
              this.feedback = error.message
              this.$refs.drager.focus()
            })
            .finally(() => { this.loading = false })
        } else {
          this.errorfound = true
          this.feedback = this.$t('general.login')
          this.$router.push('/')
        }
      }
    },
    cancel () {
      this.drager = ''
      this.real = ''
      this.item = ''
      this.top = ''
      this.itemcode = ''
      this.drawing = ''
      this.number = ''
      this.location = ''
      this.ps_printid = ''
      this.$refs.real.focus()
      this.printvisible = false
      this.createvisible = false
      this.feedback = 'Waiting for input'
    },
    renameitemcheck () {
      // checks
      this.$swal.mixin({
        title: '',
        position: 'top',
        width: 350,
        input: 'text',
        confirmButtonText: 'Next &rarr;',
        showCancelButton: true,
        progressSteps: ['1', '2', '3']
      }).queue([
        {
          title: 'New Item',
          input: 'text',
          inputPlaceholder: 'New Item',
          inputValue: this.item,
          inputValidator: (value) => {
            if (!value) {
              return 'Mandatory'
            }
          }
        },
        {
          title: 'New Qty',
          input: 'number',
          inputPlaceholder: 'New Qty',
          inputValue: this.number,
          inputValidator: (value) => {
            if (!value || value < 1) {
              return 'Mandatory/Invalid'
            }
          }
        },
        {
          title: 'New Loc',
          input: 'text',
          inputPlaceholder: 'Location',
          inputValue: this.location,
          inputValidator: (value) => {
            if (!value || value.length > 7) {
              return 'Mandatory/Wrong'
            }
          }
        }
      ]).then((result) => {
        if (result.value) {
          // const answers = JSON.stringify(result.value)
          this.newitem = result.value[0] // ingegeven waarde
          this.newnumber = result.value[1] // ingegeven waarde
          this.newlocation = result.value[2] // ingegeven waarde
          this.$swal.fire({
            title: 'Confirm ' + this.drager,
            html: `<p>New item:<strong> ${result.value[0]}</strong><BR>
                  New Qty:<strong> ${result.value[1]}</strong><BR>                  
                  New Loc:<strong> ${result.value[2]}</strong></p>`,
            confirmButtonText: 'Register',
            showCancelButton: true
          }).then((result) => {
            if (result.value) {
              this.renameitem()
            }
          })
        }
      })
    },
    renameitem () {
      this.feedback = this.$t('general.processing')
      this.errorfound = false
      this.loading = true
      axios
        .post(
          '/RenameItemInPack?company=' + this.activecompany +
                '&newitem=' + this.newitem +
                '&olditem=' + this.item +
                '&qty=' + this.newnumber +
                '&location=' + this.newlocation +
                '&container=' + this.drager +
                '&printid=' + this.ps_printid
        )
        .then(res => {
          this.playSound(false)
          this.errorfound = false
          this.executesql()
          this.feedback = this.$t('general.ok')
          // this.$refs.resetbtn.focus()
        })
        .catch(error => {
          this.playSound(true)
          this.errorfound = true
          this.feedback = error.message
        })
        .finally(() => { this.loading = false })
    },
    executesql () {
      this.retval = ''
      this.feedback = ''
      this.info = ''
      if (this.loggedinuser !== '' && this.loginSuccessful === true) {
        if (this.real !== '') {
          this.errorfound = false
          this.feedback = this.$t('general.searching')
          this.loading = true
          axios
            .get(
              '/GetInfoByReal?company=' +
                this.activecompany +
                '&container=' +
                this.real
            )
            .then(res => {
              const data = res.data
              const resultArray = []
              for (let key in data) {
                resultArray.push(data[key])
              }
              if (!resultArray.length || resultArray.length > 1) {
                this.playSound(true)
                this.errorfound = true
                if (!resultArray.length) { this.feedback = 'No data - Create label' }
                if (resultArray.length > 1) { this.feedback = 'No brut (' + resultArray.length + ')' }
                this.top = ''
                this.item = ''
                this.number = ''
                this.location = ''
                this.lockfields = false
                this.printvisible = false
                this.createvisible = true
                this.$refs.resetbtn.focus()
              } else {
                this.playSound(false)
                this.drager = resultArray[0].Container
                this.real = resultArray[0].Real
                this.item = resultArray[0].ItemFull
                this.itemcode = resultArray[0].Item
                this.top = resultArray[0].TOP
                this.drawing = resultArray[0].Drawing
                this.number = resultArray[0].Qty
                this.location = resultArray[0].Location
                this.ps_printid = resultArray[0].PrintID
                this.errorfound = false
                this.info = this.drager
                this.feedback = ''
                // this.$refs.location.focus()
                if (this.ps_printid !== null) {
                  this.printvisible = true
                  this.createvisible = false
                  this.lockfields = true
                  // this.$refs.printbtn.focus()
                  this.$refs.resetbtn.focus()
                } else {
                  this.printvisible = false
                  this.createvisible = true
                  this.lockfields = false
                  this.$refs.resetbtn.focus()
                }
                // if (this.ps_printid === null) { this.buttonvariant = 'danger' } else { this.buttonvariant = 'success' }
              }
            })
            .catch(error => {
              this.playSound(true)
              this.errorfound = true
              this.feedback = error.message
              this.real = ''
              this.$refs.real.focus()
              this.lockfields = false
              this.printvisible = false
              this.createvisible = false
            })
            .finally(() => { this.loading = false })
        } else {
          this.errorfound = true
          this.feedback = this.$t('general.waiting')
          this.$refs.real.focus()
          this.lockfields = false
          this.printvisible = false
          this.createvisible = false
        }
      } else {
        this.errorfound = true
        this.feedback = this.$t('general.login')
        this.$router.push('/')
        this.lockfields = false
        this.printvisible = false
        this.createvisible = false
      }
      this.newitem = ''
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
