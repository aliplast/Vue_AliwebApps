<template>
  <div>
    <form>
      <b-container fluid class="p-0">
        <b-row>
          <b-col cols="12">
            <div v-bind:class="getClass()">
              <h2>
                {{ $t("registerreal.title") }} {{info}}
                <h6>{{feedback}}</h6>
              </h2>
            </div>
          </b-col>
        </b-row>
        <div class="vdivider" />
        <b-row>
          <b-col cols="8">
          <!-- container -->
          <b-form-input
            @focus="$event.target.select()"
            id="searchreal"
            ref="searchreal"
            type="number"
            @input="$v.searchreal.$touch()"
            v-model="searchreal"
            :placeholder= "this.$t('general.scanreal')"
            v-on:keyup.enter="getInfoReal(), getlastcontainermoves()"
          />
          </b-col>
          <b-col cols="2">
          <b-button v-b-tooltip.hover :title= "this.$t('general.searching')" variant="primary"
            type="button"
            @click.prevent="getInfoReal(), getlastcontainermoves()"
          ><b-icon icon="search"></b-icon></b-button>
          </b-col>
          <b-col cols="2">
          <b-button v-b-tooltip.hover :title= "this.$t('general.reset')" variant="secondary"
            type="button"
            @click.prevent="cancel"
          ><b-icon icon="life-preserver"></b-icon></b-button>
        </b-col>
        </b-row>
        <div class="vdivider" />
        <b-row v-show="searchreal">
          <b-col cols="9">
              <b-list-group-item :variant="variantkleur" class="d-flex justify-content-between align-items-center">
                {{ $t("registerreal.customer") }} {{customer}}
                <b-badge variant="primary" pill>{{customernr}}</b-badge>
              </b-list-group-item>
              <b-list-group-item :variant="variantkleur" class="d-flex justify-content-between align-items-center">
                {{ $t("registerreal.date") }} {{ datumbijklant }}
              </b-list-group-item>
              <b-list-group-item :variant="variantkleur" class="d-flex justify-content-between align-items-center">
                {{ $t("registerreal.created") }} {{ datumcreated }}
              </b-list-group-item>
          </b-col>
          <b-col v-if="uitdienst !== 'Y' && todo !== 'create'" cols="3">
            <b-form-checkbox
              id="scrap"
              v-model="scrap"
              name="scrap"
              value="Y"
              unchecked-value="">
              {{ $t("registerreal.scrap") }}
            </b-form-checkbox>
          </b-col>
        </b-row>
        <div class="vdivider" />
      <b-row v-if="todo !== 'duplicate'">
        <b-col cols="8">
          <b-form-select
              id="containertype"
              ref="containertype"
              v-model="selected"
              :options="options"
              :disabled = "uitdienst !== 'Y' ? false : true"
              >
          </b-form-select>
        </b-col>
      </b-row>
      <div class="vdivider" />
      <b-row v-if="uitdienst !== 'Y' && todo !== 'duplicate'">
        <b-col cols="8">
        <!-- real -->
        <b-form-input
              @focus="$event.target.select()"
              id="newreal"
              ref="newreal"
              type="number"
              @input="$v.newreal.$touch()"
              v-model="newreal"
              :placeholder= "this.$t('registerreal.updatereal')"
              v-on:keyup.enter="updateInfoReal()"
              :disabled="errorfound"
            />
        </b-col>
        <b-col v-if="todo !== 'duplicate'" cols="4">
          <b-button block v-b-tooltip.hover :title="this.$t('registerreal.updatenew')" variant="success"
            @click.prevent="updateInfoReal()"
          ><b-icon icon="file-earmark-plus" scale="1"></b-icon></b-button>
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
                styleClass="vgt-table condensed"
                :sort-options="{
                enabled: false
                }"
                >
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
      searchreal: '',
      newreal: '',
      scrap: '',
      customer: '',
      customernr: '',
      containertype: '',
      feedback: '',
      message: '',
      todo: '',
      info: '',
      userinfo: '',
      datumbijklant: '',
      datumcreated: '',
      uitdienst: '',
      vorigect: '',
      creator: '',
      variantkleur: '',
      errorfound: false,
      selected: null,
      options: [
        { value: null, text: 'Select' },
        { value: 'CONT001', text: 'Grijze cont. oud (CONT001)' },
        { value: 'CONT003', text: 'Lage cont. (CONT003)' },
        { value: 'CONT004', text: 'Grijze cont. nieuw (CONT004)' },
        { value: 'CONTCD', text: 'Container condoor (CONTCD)' }
      ],
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
          field: 'Datum',
          thClass: 'header',
          tdClass: 'cell',
          hidden: false
        },
        {
          label: 'St.',
          field: 'Status',
          thClass: 'header',
          tdClass: 'cell',
          hidden: false
        },
        {
          label: 'Comp.',
          field: 'Company',
          thClass: 'header',
          tdClass: 'cell',
          hidden: false
        }
      ],
      rows: []
    }
  },
  computed: {
    ...mapState(['loginError', 'loginSuccessful', 'loggedinuser', 'test', 'activecompany']),
    currentValue () {
      return this.options.find(option => option.value === this.selected)
    }
  },
  mixins: [beep],
  validations: {
    searchreal: { required },
    newreal: { required }
  },
  watch: {
    searchreal: function (v) {
      this.searchreal = v.toUpperCase().trim()
    },
    newreal: function (v) {
      this.newreal = v.toUpperCase().trim()
    }
  },
  mounted () {
    this.$nextTick(() => {
      if (this.loginSuccessful === false) {
        this.$router.push('/')
      } else {
        this.searchreal = ''
        this.$refs.searchreal.focus()
        this.feedback = this.$t('general.waiting')
      }
    })
  },
  methods: {
    movetonextcontrolnew: function (event) {
      // this.newreal = ''
      this.selected = null
      this.$refs.containertype.focus()
    },
    movetonextcontrolupdate: function (event) {
      this.$refs.newreal.select()
      this.$refs.newreal.focus()
    },
    movetofirstcontrol: function (event) {
      this.$refs.searchreal.focus()
      this.$refs.searchreal.select()
    },
    cancel: function (event) {
      this.rows = []
      this.errorfound = false
      this.feedback = this.$t('general.waiting')
      this.searchreal = ''
      this.newreal = ''
      this.customer = ''
      this.customernr = ''
      this.containertype = ''
      this.datumbijklant = ''
      this.datumcreated = ''
      this.uitdienst = ''
      this.creator = ''
      this.vorigect = ''
      this.selected = null
      this.$refs.searchreal.focus()
    },
    getClass () {
      if (this.errorfound) {
        return 'bg-danger text-white'
      } else {
        return 'bg-success text-white'
      }
    },
    getInfoReal () {
      this.retval = ''
      this.feedback = ''
      this.info = ''
      if (this.loggedinuser !== '' && this.loginSuccessful === true) {
        if (this.searchreal !== '') {
          this.errorfound = false
          this.feedback = this.$t('general.searching')
          NProgress.start()
          axios
            .get(
              '/GetRealContainerInfo?company=' +
                this.activecompany +
                '&real=' +
                this.searchreal +
                '&user=' + this.loggedinuser.substring(0, 12)
            )
            .then(res => {
              this.todo = res.data.todo
              if (this.todo === 'update') {
                this.playSound(false)
                this.errorfound = false
                this.newreal = res.data.container
                this.customer = res.data.customer
                this.customernr = res.data.customernr
                this.selected = res.data.containertype
                this.datumbijklant = res.data.bijklant
                this.datumcreated = res.data.aangemaakt
                this.uitdienst = res.data.uitdienst
                this.vorigect = res.data.vorigect
                this.creator = res.data.creator
                this.variantkleur = this.uitdienst === 'Y' ? 'danger' : 'secondary'
                this.feedback = this.$t('registerreal.update') + ' ' + this.searchreal
                this.$nextTick(() => {
                  this.movetonextcontrolupdate()
                })
              }
              if (this.todo === 'create') {
                this.playSound(false)
                this.errorfound = true
                this.customer = res.data.customer
                this.customernr = res.data.customernr
                this.selected = res.data.containertype
                this.datumbijklant = res.data.bijklant
                this.datumcreated = res.data.aangemaakt
                this.uitdienst = res.data.uitdienst
                this.vorigect = res.data.vorigect
                this.creator = res.data.creator
                this.variantkleur = 'success'
                this.feedback = this.$t('registerreal.create') + ' ' + this.searchreal
                this.$nextTick(() => {
                  this.movetonextcontrolnew()
                })
                this.newreal = this.searchreal
              }
              if (this.todo === 'duplicate') {
                this.playSound(false)
                this.errorfound = true
                this.customer = res.data.customer
                this.customernr = res.data.customernr
                this.selected = res.data.containertype
                this.datumbijklant = res.data.bijklant
                this.datumcreated = res.data.aangemaakt
                this.uitdienst = res.data.uitdienst
                this.vorigect = res.data.vorigect
                this.creator = res.data.creator
                this.variantkleur = 'warning'
                this.feedback = this.$t('registerreal.duplicate') + ' ' + this.searchreal
                this.$nextTick(() => {
                  this.movetonextcontrolnew()
                })
                this.newreal = this.searchreal
              }
            })
            .catch(error => {
              this.playSound(true)
              this.errorfound = true
              this.feedback = error.message
              this.cancel()
              this.searchreal = ''
              this.$refs.searchreal.focus()
            })
            .finally(() => (NProgress.done()))
        } else {
          this.errorfound = true
          this.feedback = this.$t('general.waiting')
          this.$refs.searchreal.focus()
        }
      } else {
        this.errorfound = true
        this.feedback = this.$t('general.login')
        this.$router.push('/')
      }
    },
    updateInfoReal () {
      this.retval = ''
      this.feedback = ''
      this.info = ''
      this.errorfound = false
      if (this.loggedinuser !== '' && this.loginSuccessful === true) {
        if (this.selected === null || this.selected === 'Select') {
          this.feedback = this.$t('registerreal.notypeselected')
          return
        }
        if (this.newreal !== '') {
          if ((this.todo === 'update' && this.newreal === '')) {
            this.errorfound = true
            this.feedback = this.$t('registerreal.samenotallowed')
            this.$refs.newreal.focus()
          } else {
            this.$swal.fire({
              title: 'Confirm ' + this.todo,
              html: '<p>' + 'Container: ' + this.newreal + '<BR>' + 'Type: ' + this.currentValue.text + '</p>',
              position: 'top',
              showCancelButton: true,
              confirmButtonText: this.$t('general.ok')
            }).then((result) => {
              if (result.isConfirmed) {
                this.updateInfoRealUpdate(this.todo)
              }
            })
          }
        } else {
          this.errorfound = true
          this.feedback = this.$t('general.mandatory')
          this.$refs.newreal.focus()
        }
      } else {
        this.errorfound = true
        this.feedback = this.$t('general.login')
        this.$router.push('/')
      }
    },
    updateInfoRealUpdate (processtype) {
      this.message = ''
      if (this.loggedinuser !== '' && this.loginSuccessful === true) {
        NProgress.start()
        this.errorfound = false
        axios
          .post(
            '/UpdateRealContainerInfo?company=' + this.activecompany +
                  '&serial=' + this.searchreal +
                  '&newserial=' + this.newreal +
                  '&processtype=' + processtype +
                  '&type=' + this.selected +
                  '&scrap=' + this.scrap +
                  '&user=' + this.loggedinuser.substring(0, 12)
          )
          .then(response => {
            if (response.status === 200) {
              this.errorfound = false
              this.playSound(false)
              this.cancel()
            } else {
              this.errorfound = true
              this.playSound(true)
            }
            this.feedback = response.data
          })
          .catch(error => {
            this.playSound(true)
            this.errorfound = true
            this.feedback = error.response.data
          })
          .finally(() => (NProgress.done()))
      } else {
        this.feedback = this.$t('general.login')
      }
    },
    getlastcontainermoves () {
      this.rows = []
      NProgress.start()
      return axios
        .get(
          '/GetLastContainerMoves?company=' + this.activecompany +
                   '&real=' + this.searchreal
        )
        .then(res => {
          const data = res.data
          const resultArray = []
          for (let key in data) {
            resultArray.push(data[key])
          }
          if (!resultArray.length) {
            this.rows = []
          } else {
            this.rows = resultArray
          }
        })
        .catch(error => {
          this.errorfound = true
          this.feedback = error.message
        })
        .finally(() => (NProgress.done()))
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
