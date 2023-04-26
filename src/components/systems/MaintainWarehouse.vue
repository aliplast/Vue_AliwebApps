<template>
  <div>
  <b-overlay :show="loading" rounded="sm" spinner-variant="danger">
      <b-container fluid class="p-0">
        <b-row>
          <b-col cols="12">
            <div v-bind:class="getClass()">
              <h2>
                {{ $t("maintainwarehouse.title") }}
                <h6>{{feedback}}</h6>
              </h2>
            </div>
          </b-col>
        </b-row>
        <div class="vdivider" />
        <b-row>
          <b-col cols="6" style="margin-right:0px">
            <!-- drager -->
            <b-form-input
              @focus="$event.target.select(), focused='drager'"
              id="drager"
              ref="drager"
              type="text"
              v-model="drager"
              :placeholder= "this.$t('maintainwarehouse.drager')"
              v-on:keyup.enter="executesql"
            />
          </b-col>
          <b-col cols="6" style="margin-left:0px">
            <!-- real -->
            <b-form-input
              @focus="$event.target.select(), focused=''"
              id="real"
              ref="real"
              type="text"
              v-model="real"
              :placeholder= "this.$t('maintainwarehouse.scanreal')"
              v-on:keyup.enter="movetosecondcontrol"
            />
          </b-col>
        </b-row>
        <div class="vdivider" />
        <b-row>
          <b-col cols="6">
            <!-- Search item -->
            <b-form-input
              :placeholder= "this.$t('maintainwarehouse.searchitem')"
              ref="item"
              id="item"
              type="text"
              autocomplete="off"
              v-model="item"
              @click="selectAll"
              @focus="modal = true, focused=''"
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
          <b-col class="text-left" cols="3" v-if="imagevisible">
            <b-badge variant="info"> {{ $t("maintainwarehouse.top") }} {{ top }}</b-badge>
          </b-col>
           <b-col cols="3">
            <b-button variant="outline-primary"
              type="submit"
              @click.prevent="showImage"
              v-if="imagevisible" block
            ><b-icon icon="image" font-scale="1"></b-icon></b-button>
          </b-col>
        </b-row>
        <div class="vdivider" />
        <b-row>
          <b-col cols="6">
            <!-- Aantal -->
            <b-form-input
              @focus="$event.target.select(), focused=''"
              id="number"
              ref="number"
              type="number"
              v-model.number="number"
              :placeholder= "this.$t('maintainwarehouse.enternumber')"
              v-on:keyup.enter="movetofourthcontrol"
            />
          </b-col>
        </b-row>
        <div class="vdivider" />
        <b-row>
          <b-col cols="6">
            <!-- Location -->
            <b-form-input
              @focus="$event.target.select(), focused='location'"
              id="location"
              ref="location"
              v-model="location"
              type="text"
              :placeholder= "this.$t('maintainwarehouse.scanlocation')"
              v-on:keyup.enter="movetoprocess"
            />
          </b-col>
        </b-row>
        <div class="vdivider" />
        <b-row v-if="showlevel">
          <b-col cols="12">
            <b-form-radio-group
              v-model="level"
              id="loclevel"
              ref="loclevel"
              :options="options"
              buttons
              button-variant="outline-primary"
              size="lg"
              value-field="item"
              text-field="name"
            ></b-form-radio-group>
          </b-col>
        </b-row>
        <div class="vdivider" />
        <b-row>
          <b-col cols="3">
            <b-button  v-b-tooltip.hover :title="this.$t('general.reset')"
              type="button"
              block
              @submit.prevent
              @click="cancel('Scan drager')"
            ><b-icon icon="life-preserver" ></b-icon></b-button>
          </b-col>
          <b-col cols="3">
            <b-button
              variant="primary"
              type="button"
              block
              id="processbtn"
              ref="processbtn"
              @submit.prevent
              @click="process"
            ><b-icon icon="play-fill"></b-icon></b-button>
          </b-col>
        </b-row>
      </b-container>
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
      focused: '', // object that has focus
      directionout: true,
      alreadyprocessed: false,
      item: '',
      itemcode: '',
      imagevisible: true,
      drawing: '',
      items: [],
      filteredItems: [],
      modal: false,
      loading: false,
      drager: '',
      dragercheck: '',
      real: '',
      type: '',
      top: '',
      feedback: '',
      info: '',
      userinfo: '',
      number: '',
      location: '',
      insertnew: true,
      errorfound: false,
      rows: [],
      level: '',
      showlevel: false,
      options: [
        { item: 'A', name: 'A' },
        { item: 'B', name: 'B' },
        { item: 'C', name: 'C' },
        { item: 'D', name: 'D' },
        { item: 'E', name: 'E' },
        { item: 'F', name: 'F' },
        { item: 'G', name: 'G' }
      ]
    }
  },
  // async created () {
  // this.loading = true
  // axios
  // .get('GetInfoByItem?company=' + this.activecompany + '&item=%')
  // .then(response => {
  // this.items = response.data
  // })
  // .finally(() => (this.loading = false))
  // },
  computed: {
    ...mapState(['loginError', 'loginSuccessful', 'loggedinuser', 'test', 'badge', 'activecompany'])
  },
  mixins: [beep],
  validations: {
    item: { required }
  },
  watch: {
    drager: function (v) {
      console.log(v)
      this.drager = v.trim() // v.toUpperCase().trim() // PART1 - check drager
      if (/^[A-Z]{2}[0-9]{6,7}$/.test(this.drager) === false && this.drager !== '' && this.drager.slice(0, 2) !== 'D-') {
        // console.log(/^[A-Z]{2}[0-9]{6,7}$/.test(this.drager) + ' ' + this.drager + ' ' + this.drager.slice(0, 2) !== 'D-')
        this.dragercheck = 'D-' + this.drager
        this.real = '0'
        if (this.drager.slice(-1) === '-') { // PART2 - show levels
          this.level = ''
          this.showlevel = true
        } else {
          this.level = ''
          this.showlevel = false
        }
      } else {
        this.dragercheck = this.drager
      }
      this.feedback = this.dragercheck
    },
    item (v) {
      this.item = v.toUpperCase().trim()
      if (this.item.length > 3) { this.filterItems() }
      this.rows = []
      if (this.item === '') {
        this.imagevisible = false
      } else {
        this.imagevisible = true
      }
    },
    location () {
      // console.log('location')
      this.level = ''
      if ((this.location.charAt(0) !== 'A' & (this.location.slice(-1) === 'L' || this.location.slice(-1) === 'R')) || this.location.slice(-1) === '-') {
        this.showlevel = true
      } else {
        this.showlevel = false
      }
      this.feedback = this.location
      // if (this.location !== '') {
      //   if (this.location.length > 7) {
      //     this.errorfound = true
      //     this.feedback = this.location + ' ' + this.$t('general.istoolong') + ' (' + this.location.length + ')'
      //   } else {
      //     this.errorfound = false
      //   }
      //   if (this.location.slice(-1) === '-') {
      //     this.level = ''
      //     this.showlevel = true
      //     this.feedback = this.location
      //   } else {
      //     this.showlevel = false
      //     this.feedback = this.location
      //   }
      // }
    },
    level: function (v) {
      // console.log('level')
      if (this.level !== '') {
        if (this.focused === 'drager') {
          this.feedback = this.drager.replace(this.drager.slice(-1), this.level)
          this.drager = this.drager.replace(this.drager.slice(-1), this.level)
          this.dragercheck = 'D-' + this.drager
          this.executesql()
        }
        if (this.focused === 'location') {
          // for A-locations Maxibel
          if (this.location.slice(-1) === '-' && this.location.charAt(0) === 'A') {
            this.location = this.location.replace('-', '') + this.level
          }
          // for racks shipping
          if (this.location.slice(-1) === 'L' || this.location.slice(-1) === 'R') {
            this.location = this.location + '-' + this.level
          }
          // this.feedback = this.location
          // this.feedback = this.location.replace(this.location.slice(-1), this.level)
          // this.location = this.location.replace(this.location.slice(-1), this.level)
          this.process()
        }
      }
    }
  },
  mounted () {
    this.$nextTick(() => {
      if (this.loginSuccessful === false) {
        this.$router.push('/')
      } else {
        this.drager = ''
        this.$refs.drager.focus()
        this.feedback = this.$t('general.waiting')
        this.imagevisible = false
      }
    })
  },
  methods: {
    movetofirstcontrol: function (event) {
      this.$refs.drager.focus()
    },
    movetosecondcontrol: function (event) {
      this.$refs.item.focus()
    },
    movetothirdcontrol: function (event) {
      this.$refs.number.focus()
    },
    movetofourthcontrol: function (event) {
      this.$refs.location.focus()
    },
    movetoprocess: function (event) {
      this.$refs.processbtn.focus()
    },
    showImage () {
      this.infoimage = ''
      this.$swal({
        title: this.item,
        html: '<p>' + this.drawing.split('/').pop() + '</p>',
        position: 'top',
        width: 350,
        imageUrl: process.env.VUE_APP_IMG_URL + this.drawing.split('/').pop(),
        imageWidth: 200,
        imageHeight: 100
      })
    },
    getClass () {
      if (this.errorfound) {
        return 'bg-danger text-white'
      } else {
        return 'bg-success text-white'
      }
    },
    selectAll () {
      this.errorfound = false
      this.feedback = this.$t('general.waiting')
      this.$refs.item.select()
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
      this.drawing = item.Drawing
      this.top = item.StkUnit
      this.modal = false
      this.$refs.number.focus()
    },
    process () {
      if (this.dragercheck.slice(0, 2) === 'D-' && this.drager.replace('D-', '').toUpperCase() !== this.location.toUpperCase()) { // location and drager mus be equal when d-)
        this.errorfound = true
        this.feedback = this.$t('maintainwarehouse.loccarriermustbeequal')
      } else {
        if (this.drager === '' || this.item === '' || this.number === '' || this.location === '') {
          this.errorfound = true
          this.feedback = this.$t('maintainwarehouse.allfieldsmandatory')
        } else {
          if (/^(PB|PP|IR|CS)[0-9]+/.test(this.drager) === true && this.real === '') {
            this.feedback = this.$t('general.scanreal')
            this.$refs.real.focus()
          } else {
            if ((this.location.length) <= 7) {
              this.feedback = this.$t('general.busy')
              this.loading = true
              this.errorfound = false
              axios
                .post(
                  '/ProcessWarehouse?company=' +
                  this.activecompany +
                  '&drager=' +
                  this.dragercheck +
                  '&item=' +
                  this.item +
                  '&number=' +
                  this.number +
                  '&location=' +
                  this.location +
                  '&insertnew=' +
                  this.insertnew +
                  '&user=' +
                  this.loggedinuser +
                  '&real=' +
                  this.real
                )
                .then(res => {
                  this.playSound(false)
                  this.errorfound = false
                  // this.feedback = res.data
                  this.cancel(res.data)
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
        }
      }
    },
    cancel (message) {
      this.drager = ''
      this.real = ''
      this.item = ''
      this.itemcode = ''
      this.drawing = ''
      this.number = ''
      this.location = ''
      this.dragercheck = ''
      this.level = ''
      this.showlevel = false
      this.$refs.drager.focus()
      this.$refs.drager.select()
      this.insertnew = true
      this.errorfound = false
      this.feedback = message
    },
    executesql () {
      this.retval = ''
      this.feedback = ''
      this.info = ''
      if (this.loggedinuser !== '' && this.loginSuccessful === true) {
        if (this.dragercheck !== '') {
          this.errorfound = false
          this.feedback = 'Searching'
          this.loading = true
          axios
            .get(
              '/GetInfoByContainerOrReal?company=' +
                this.activecompany +
                '&container=' +
                this.dragercheck
            )
            .then(res => {
              const data = res.data
              const resultArray = []
              for (let key in data) {
                resultArray.push(data[key])
              }
              if (!resultArray.length) {
                this.playSound(true)
                this.errorfound = true
                this.feedback = 'Fill out form'
                this.real = ''
                this.item = ''
                this.number = ''
                this.top = ''
                // console.log('test:' + this.dragercheck)
                if (this.dragercheck.slice(0, 2) === 'D-') {
                  this.location = this.drager
                } else {
                  this.location = ''
                }
                this.insertnew = true
                // this.$refs.item.focus()
              } else {
                this.errorfound = false
                this.playSound(false)
                this.drager = resultArray[0].Container
                this.real = resultArray[0].Real
                this.item = resultArray[0].ItemFull
                this.itemcode = resultArray[0].Item
                this.drawing = resultArray[0].Drawing
                this.number = resultArray[0].RQty
                this.top = resultArray[0].TOP
                this.location = resultArray[0].Location
                this.$refs.location.focus()
                this.$refs.location.select()
                this.info = this.drager
                this.feedback = 'Data found ...'
                this.insertnew = false
              }
              if (/^[PB,PP,IR]{2}/.test(this.drager) === true && this.real === '') {
                this.feedback = 'Enter container!'
                this.$refs.real.focus()
                this.$refs.real.select()
              }
            })
            .catch(error => {
              this.playSound(true)
              this.errorfound = true
              this.feedback = error.response.data
              this.drager = ''
              this.$refs.drager.focus()
            })
            .finally(() => { this.loading = false })
        } else {
          this.errorfound = true
          this.feedback = 'Waiting for input'
          this.$refs.drager.focus()
        }
      } else {
        this.errorfound = true
        this.feedback = 'Login please'
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
