<template>
  <div>
    <b-overlay :show="loading" rounded="sm" spinner-variant="danger">
    <form>
      <b-container fluid class="p-0">
        <b-row>
          <b-col cols="12">
            <div v-bind:class="getClass()">
              <h2>
                {{ $t("mergecontainer.title") }} {{info}}
                <h6>{{feedback}}</h6>
              </h2>
            </div>
          </b-col>
        </b-row>
        <div class="vdivider" />
        <b-row>
          <b-col cols="9">
            <!-- packfrom -->
            <b-form-input
              @focus="$event.target.select()"
              id="packfrom"
              ref="packfrom"
              type="text"
              @input="$v.packfrom.$touch()"
              v-model="packfrom"
              :placeholder= "this.$t('mergecontainer.scancontainerfrom')"
              v-on:keydown.enter.prevent="searchdata"
            />
          </b-col>
          <b-col cols="3">
            <b-button block v-b-tooltip.hover title="Search" variant="primary"
              type="submit"
              id="btnSearch"
              ref="btnSearch"
              @click.prevent="searchdata"
            ><b-icon icon="search"></b-icon></b-button>
          </b-col>
        </b-row>
        <div class="vdivider" />
        <b-row v-show="article">
          <b-col cols="9">
            <div class="p-1 mb-1">{{article}}</div>
          </b-col>
        </b-row>
        <div class="vdivider" />
        <b-row v-show="article">
          <b-col cols="9">
            <!-- Aantal -->
            <b-form-input
              @focus="$event.target.select()"
              id="qty"
              ref="qty"
              type="number"
              v-model.number="qty"
              :placeholder= "this.$t('mergecontainer.qty')"
              v-on:keydown.enter.prevent="movetonextcontrol"
            />
          </b-col>
          <b-col cols="3">
            <b-button block v-b-tooltip.hover title="Reset" variant="secondary"
              type="button"
              @click.prevent="cancel"
            ><b-icon icon="life-preserver"></b-icon></b-button>
          </b-col>
        </b-row>
        <div class="vdivider" />
        <b-row>
          <b-col cols="9">
            <!-- packto -->
            <b-form-input
              @focus="$event.target.select()"
              id="packto"
              ref="packto"
              type="text"
              @input="$v.packto.$touch()"
              v-model="packto"
              :placeholder= "this.$t('mergecontainer.scancontainerto')"
              v-on:keydown.enter.prevent="executemerge"
            />
          </b-col>
          <b-col cols="3" v-show="article">
            <b-button block v-b-tooltip.hover title="Merge" variant="success"
              @click.prevent="executemerge"
            ><b-icon icon="union"></b-icon></b-button>
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
      packfrom: '',
      packto: '',
      qty: '',
      article: '',
      feedback: '',
      message: '',
      info: '',
      loading: false,
      userinfo: '',
      errorfound: false
    }
  },
  computed: {
    ...mapState(['loginError', 'loginSuccessful', 'loggedinuser', 'test', 'activecompany'])
  },
  mixins: [beep],
  validations: {
    packfrom: { required },
    packto: { required },
    qty: { required }
  },
  watch: {
    packto: function (v) {
      this.packto = v.toUpperCase().trim()
    },
    packfrom: function (v) {
      this.packfrom = v.toUpperCase().trim()
    },
    qty: function (v) {
      this.qty = v
    }
  },
  mounted () {
    this.$nextTick(() => {
      if (this.loginSuccessful === false) {
        this.$router.push('/')
      } else {
        this.packfrom = ''
        this.$refs.packfrom.focus()
        this.feedback = this.$t('general.waiting')
      }
    })
  },
  methods: {
    movetonextcontrol: function (event) {
      this.$refs.packto.focus()
    },
    movetofirstcontrol: function (event) {
      this.$refs.packfrom.focus()
    },
    getClass () {
      if (this.errorfound) {
        return 'bg-danger text-white'
      } else {
        return 'bg-success text-white'
      }
    },
    cancel () {
      this.packfrom = ''
      this.article = ''
      this.qty = ''
      this.packto = ''
      this.$refs.packfrom.focus()
      this.errorfound = false
      this.feedback = ''
    },
    searchdata () {
      this.article = ''
      this.qty = ''
      this.packto = ''
      this.retval = ''
      this.feedback = ''
      this.info = ''
      if (this.loggedinuser !== '' && this.loginSuccessful === true) {
        if (this.packfrom !== '') {
          this.errorfound = false
          this.feedback = this.$t('general.searching') + ' ' + this.packfrom
          this.loading = true
          axios
            .get(
              '/GetInfoByContainerOrReal?company=' +
                this.activecompany +
                '&container=' +
                this.packfrom
            )
            .then(res => {
              const data = res.data
              const resultArray = []
              for (let key in data) {
                resultArray.push(data[key])
              }
              if (resultArray.length !== 1) {
                this.playSound(true)
                this.errorfound = true
                this.feedback = this.$t('general.nodata')
                this.$refs.packfrom.focus()
                this.$refs.packfrom.select()
              } else {
                this.playSound(false)
                this.article = resultArray[0].ItemFull
                this.qty = resultArray[0].RQty
                this.$refs.packto.focus()
                this.errorfound = false
                this.feedback = this.$t('mergecontainer.scancontainerto')
              }
            })
            .catch(error => {
              this.playSound(true)
              this.errorfound = true
              this.feedback = error.message
              this.packfrom = ''
              this.$refs.packfrom.focus()
            })
            .finally(() => { this.loading = false })
        } else {
          this.errorfound = true
          this.feedback = this.$t('general.waiting')
          this.$refs.packfrom.focus()
        }
      } else {
        this.errorfound = true
        this.feedback = this.$t('general.login')
        this.$router.push('/')
      }
    },
    executemerge () {
      this.feedback = 'Processing'
      this.loading = true
      this.errorfound = false
      if (this.packto !== this.packfrom & this.packfrom !== '' & this.packto !== '' & this.article !== '' & this.qty > 0) {
        axios
          .post(
            '/MergeContainerContent?company=' + this.activecompany +
            '&oldcontainer=' + this.packfrom +
            '&item=' + this.article +
            '&number=' + this.qty +
            '&newcontainer=' + this.packto +
            '&user=' + this.loggedinuser.substring(0, 25)
          )
          .then(res => {
            this.playSound(false)
            this.errorfound = false
            this.feedback = this.packto + '=' + res.data
            this.packto = ''
            this.qty = ''
            this.article = ''
            this.$refs.packfrom.focus()
            this.$refs.packfrom.select()
          })
          .catch(error => {
            this.playSound(true)
            this.errorfound = true
            this.feedback = error.message
          })
          .finally(() => { this.loading = false })
      } else {
        this.errorfound = true
        this.feedback = this.$t('general.incorrectdata')
        this.$refs.packto.focus()
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
