<template>
  <div>
  <b-overlay :show="loading" rounded="sm" spinner-variant="danger">
    <form>
      <b-container fluid class="p-0">
        <b-row>
          <b-col cols="12">
            <div v-bind:class="getClass()">
              <h2>
                {{ $t("infooperation.title") }} {{info}}
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
              id="container"
              ref="container"
              type="text"
              v-model="container"
              :placeholder= "this.$t('infooperation.scanvalue')"
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
        <div class="vdividerxl" />
          <b-col cols="12">
            <div v-for="(result, index) in results" :key="index">
<div class="bggrid">
<b-container fluid >
<b-row class="text-left">
    <b-col><p class="font-weight-bold"><i>Product:</i> {{result.Product}}</p></b-col>
    <b-col><p class="font-weight-bold"><i>Kleur:</i>  {{result.Kleur}}</p></b-col>
    <b-col><p class="font-weight-bold"><i>Aantal:</i>  {{result.Aantal}}</p></b-col>
  </b-row>
  <b-row class="text-left">
    <b-col><p class="font-weight-bold"><i>Sales:</i> {{result.OrderNr}}/{{result.Orderlijn}}</p></b-col>
    <b-col><p class="font-weight-bold"><i>Klant:</i> {{result.KlantNaam}}</p></b-col>
    <b-col><p class="font-weight-bold">{{result.Packnr}}/{{result.ProductieOrder}}</p></b-col>
  </b-row>
</b-container>
</div>
<div class="vdivider" />
<b-container fluid>
  <b-row class="text-left">
    <b-col>Ref Tekening: {{result.RefTekening}}</b-col>
    <b-col v-if="result.L1 != '0'">L1: {{result.L1}}</b-col>
    <b-col v-else></b-col>
    <b-col v-if="result.A1 != '0'">A1: {{result.A1}}</b-col>
    <b-col v-else></b-col>
  </b-row>
  <b-row class="text-left">
    <b-col>Plaatdikte: {{result.Plaatdikte}}</b-col>
    <b-col v-if="result.L2 != '0'">L2: {{result.L2}}</b-col>
    <b-col v-else></b-col>
    <b-col v-if="result.A2 != '0'">A2: {{result.A2}}</b-col>
    <b-col v-else></b-col>
  </b-row>
  <b-row class="text-left">
<b-col>PlaatLengte: {{result.Plaatlengte}}</b-col>
    <b-col v-if="result.L3 != '0'">L3: {{result.L3}}</b-col>
    <b-col v-else></b-col>
    <b-col v-if="result.A3 != '0'">A3: {{result.A3}}</b-col>
    <b-col v-else></b-col>
  </b-row>
  <b-row class="text-left">
    <b-col>Plaatbreedte: {{result.Plaatbreedte}}</b-col>
    <b-col v-if="result.L4 != '0'">L4: {{result.L4}}</b-col>
    <b-col v-else></b-col>
    <b-col v-if="result.A4 != '0'">A4: {{result.A4}}</b-col>
    <b-col v-else></b-col>
  </b-row>
  <b-row class="text-left">
    <b-col>Lasbouten: {{result.LasBouten}}  {{result.PosLasbouten}}</b-col>
    <b-col v-if="result.L5 != '0'">L5: {{result.L5}}</b-col>
    <b-col v-else></b-col>
    <b-col v-if="result.A5 != '0'">A5: {{result.A5}}</b-col>
    <b-col v-else></b-col>
  </b-row>
  <b-row class="text-left">
    <b-col>Ophanggaatjes: {{result.OphangGaatjes}} {{result.PosOphanggaatjes}}</b-col>
    <b-col v-if="result.L6 != '0'">L6: {{result.L6}}</b-col>
    <b-col v-else></b-col>
    <b-col v-if="result.A6 != '0'">A6: {{result.A6}}</b-col>
    <b-col v-else></b-col>
  </b-row>
  <b-row class="text-left">
    <b-col>Overlengte: {{result.Overlengte}}</b-col>
    <b-col v-if="result.L7 != '0'">L7: {{result.L7}}</b-col>
    <b-col v-else></b-col>
    <b-col v-if="result.A7 != '0'">A7: {{result.A7}}</b-col>
    <b-col v-else></b-col>
  </b-row>
  <b-row class="text-left">
    <b-col>Lakzijdes: {{result.Lakzijde}}</b-col>
    <b-col></b-col>
    <b-col></b-col>
  </b-row>
</b-container>
<hr>
    <b-img v-if="result.Path2Image" :src="result.Path2Image" fluid-grow></b-img>
            </div>
          </b-col>
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
      container: '',
      info: '',
      userinfo: '',
      loading: false,
      retval: '',
      feedback: '',
      errorfound: false,
      results: []
    }
  },
  computed: {
    ...mapState(['loginError', 'loginSuccessful', 'loggedinuser', 'test', 'activecompany'])
  },
  mixins: [beep],
  validations: {
    container: { required }
  },
  watch: {
    container: function (v) {
      this.container = v.toUpperCase().trim()
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
      this.rows = []
      this.retval = ''
      this.feedback = ''
      this.info = this.container
      this.results = []
      if (this.loggedinuser !== '' && this.loginSuccessful === true) {
        if (this.container !== '') {
          this.errorfound = false
          this.feedback = this.$t('general.busy')
          this.loading = true
          axios
            .get(
              '/GetOperationCard?company=' +
                this.activecompany +
                '&searchvalue=' +
                this.container
            )
            .then(res => {
              this.results = res.data
              // console.log(this.results.length)
              if (this.results.length != null && this.results.length === 1) {
                this.feedback = ''
                this.results = res.data
              } else {
                this.playSound(true)
                this.errorfound = true
                this.feedback = this.$t('general.nodata') + ' (' + this.results.length + ')'
                this.results = []
              }
              this.container = ''
              this.$refs.container.focus()
            })
            .catch(error => {
              this.playSound(true)
              this.errorfound = true
              this.feedback = error.message
              this.container = ''
              this.$refs.container.focus()
            })
            .finally(() => { this.loading = false })
        } else {
          this.errorfound = true
          this.feedback = this.$t('general.waiting')
          this.$refs.container.focus()
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
.vdividerxl {
  margin-top: 25px;
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
.bggrid {
  background-color: LightGrey
}
</style>
