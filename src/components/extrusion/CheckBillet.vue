<template>
  <div>
  <b-overlay :show="loading" rounded="sm"></b-overlay>
    <form>
      <b-container fluid class="p-0">
        <b-row>
          <b-col class="px-2" cols="12">
            <div v-bind:class="getClass()">
              <h2>
                {{ $t("checkbillet.title") }} {{info}}
                <h6>{{feedback}}</h6>
              </h2>
            </div>
          </b-col>
        </b-row>
        <b-row>
        <b-col cols="12" class="px-2"><b-button squared :variant="variantpress" block @click="selectpress()"><div  class="font-weight-bold">{{selectedpress}}</div></b-button></b-col>
        </b-row>
        <div v-if="currentstep !== '0'">
        <div class="vdivider" />
        <b-row>
          <b-col  class="px-2" cols="8">
            <!-- Container -->
            <b-form-input
              @focus="$event.target.select()"
              id="gietnummer"
              ref="gietnummer"
              type="text"
              readonly
              @input="$v.gietnummer.$touch()"
              v-model="gietnummer"
              :placeholder="instruction"
            />
          </b-col>
          <b-col class="px-2" v-if="currentstep == '1'" cols="4">
            <b-button block
              :variant="variant"
              ref="btnCheck1"
              @click="process()"
              :disabled="$v.$error"
            >{{ $t("checkbillet.start") }}</b-button>
          </b-col>
          <b-col class="px-2" v-if="currentstep == '2'" cols="4">
            <b-button block
              :variant="variant"
              ref="btnCheck2"
              @click="process()"
              :disabled="$v.$error"
            > {{ $t("checkbillet.repeat") }}</b-button>
          </b-col>
          <b-col class="px-2" v-if="currentstep == '3'" cols="4">
            <b-button block
              :variant="variant"
              ref="btnCheck3"
              @click="checkcastnr()"
              :disabled="$v.$error"
            > {{ $t("checkbillet.check") }} <b-spinner v-if="loading" small></b-spinner></b-button>
          </b-col>
          <b-col class="px-2" v-if="currentstep == '4'" cols="4">
            <b-button block
              :variant="variant"
              ref="btnCheck4"
              @click="getpoles()"
              :disabled="$v.$error"
            > {{ $t("checkbillet.register") }} <b-spinner v-if="loading" small></b-spinner></b-button>
          </b-col>
        </b-row>
        <div class="vdivider" />
        <!-- Keyboard -->
        <b-row>
          <b-col cols="3" class="px-2"><b-button squared variant="outline-secondary" block @click="getkey('1')">1</b-button>
          </b-col>
          <b-col cols="3" class="px-2"><b-button squared variant="outline-secondary" block @click="getkey('2')">2</b-button>
          </b-col>
          <b-col cols="3" class="px-2"><b-button squared variant="outline-secondary" block @click="getkey('3')">3</b-button>
          </b-col>
          <b-col cols="3" class="px-2"><b-button squared variant="outline-danger" block @click="getkey('CLEAR')">Clear</b-button></b-col>
        </b-row><div class="vdivider" />
        <b-row>
          <b-col cols="3" class="px-2"><b-button squared variant="outline-secondary" block @click="getkey('4')">4</b-button>
          </b-col>
          <b-col cols="3" class="px-2"><b-button squared variant="outline-secondary" block @click="getkey('5')">5</b-button>
          </b-col>
          <b-col cols="3" class="px-2"><b-button squared variant="outline-secondary" block @click="getkey('6')">6</b-button>
          </b-col>
          <b-col cols="3" class="px-2"></b-col>
        </b-row>
        <div class="vdivider" />
        <b-row>
          <b-col cols="3" class="px-2"><b-button squared variant="outline-secondary" block @click="getkey('7')">7</b-button>
          </b-col>
          <b-col cols="3" class="px-2"><b-button squared variant="outline-secondary" block @click="getkey('8')">8</b-button>
          </b-col>
          <b-col cols="3" class="px-2"><b-button squared variant="outline-secondary" block @click="getkey('9')">9</b-button>
          </b-col>
          <!-- <b-col cols="3"><b-button squared variant="outline-info" block @click="getkey('SPACE')">Space</b-button></b-col> -->
          <b-col cols="3" class="px-2"><b-button squared variant="outline-info" block @click="getkey('BACK')">Back</b-button></b-col>
        </b-row>
        <div class="vdivider" />
        <b-row>
          <b-col cols="3" class="px-2"></b-col>
          <b-col cols="3" class="px-2"><b-button squared variant="outline-secondary" block @click="getkey('0')">0</b-button></b-col>
          <b-col cols="3" class="px-2"></b-col>
          <b-col cols="3" class="px-2"></b-col>
          <!-- <b-col cols="3" class="px-2">Step {{currentstep}}</b-col> -->
        </b-row>
        <div class="vdivider" />
        <b-row>
          <b-col cols="3" class="px-2"><b-button squared variant="outline-primary" block @click="getkey('A')">A</b-button>
          </b-col>
          <b-col cols="3" class="px-2"><b-button squared variant="outline-primary" block @click="getkey('B')">B</b-button>
          </b-col>
          <b-col cols="3" class="px-2"><b-button squared variant="outline-primary" block @click="getkey('C')">C</b-button>
          </b-col>
          <b-col cols="3" class="px-2"><b-button squared variant="outline-primary" block @click="getkey('D')">D</b-button>
          </b-col>
        </b-row>
        <div class="vdivider" />
        <b-row>
          <b-col cols="3" class="px-2"><b-button squared variant="outline-primary" block @click="getkey('E')">E</b-button>
          </b-col>
          <b-col cols="3" class="px-2"><b-button squared variant="outline-primary" block @click="getkey('F')">F</b-button>
          </b-col>
          <b-col cols="3" class="px-2"><b-button squared variant="outline-primary" block @click="getkey('G')">G</b-button>
          </b-col>
          <b-col cols="3" class="px-2"><b-button squared variant="outline-primary" block @click="getkey('H')">H</b-button>
          </b-col>
        </b-row>
        <div class="vdivider" />
        <b-row>
          <b-col cols="3" class="px-2"><b-button squared variant="outline-primary" block @click="getkey('I')">I</b-button>
          </b-col>
          <b-col cols="3" class="px-2"><b-button squared variant="outline-primary" block @click="getkey('J')">J</b-button>
          </b-col>
          <b-col cols="3" class="px-2"><b-button squared variant="outline-primary" block @click="getkey('K')">K</b-button>
          </b-col>
          <b-col cols="3" class="px-2"><b-button squared variant="outline-primary" block @click="getkey('L')">L</b-button>
          </b-col>
        </b-row>
        <div class="vdivider" />
        <b-row>
          <b-col cols="3" class="px-2"><b-button squared variant="outline-primary" block @click="getkey('M')">M</b-button>
          </b-col>
          <b-col cols="3" class="px-2"><b-button squared variant="outline-primary" block @click="getkey('N')">N</b-button>
          </b-col>
          <b-col cols="3" class="px-2"><b-button squared variant="outline-primary" block @click="getkey('O')">O</b-button>
          </b-col>
          <b-col cols="3" class="px-2"><b-button squared variant="outline-primary" block @click="getkey('P')">P</b-button>
          </b-col>
        </b-row>
        </div>
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
      // company: process.env.VUE_APP_COMPANY,
      gietnummer: '',
      feedback: '',
      message: '',
      info: '',
      userinfo: '',
      errorfound: false,
      instruction: '',
      currentstep: '0',
      tovalidate: '',
      checkgietnummer: '',
      loading: false,
      variant: 'primary',
      nbrpoles: '1',
      selectedpress: this.$t('checkbillet.selectedpress'),
      variantpress: 'warning'
    }
  },
  computed: {
    ...mapState(['loginError', 'loginSuccessful', 'loggedinuser', 'test', 'supervisor', 'activecompany'])
  },
  mixins: [beep],
  validations: {
    gietnummer: { required }
  },
  watch: {
    zone: function (v) {
      // this.zone = v.toUpperCase().trim()
      this.info = this.zone
    },
    loading () {
      if (!this.loading) {
        if (this.checkgietnummer.startsWith('OK')) {
          this.errorfound = false
          this.currentstep = '4'
          this.variant = 'success'
          this.feedback = this.$t('checkbillet.registercastnr') + ' ' + this.checkgietnummer
        } else {
          this.errorfound = true
          this.currentstep = '4'
          this.variant = 'danger'
          this.feedback = this.$t('checkbillet.checkcastnr') + ' ' + this.checkgietnummer
        }
      }
    }
  },
  mounted () {
    this.$nextTick(() => {
      if (this.loginSuccessful === false) {
        this.$router.push('/')
      } else {
        this.gietnummer = ''
        this.feedback = this.$t('general.waiting')
        this.instruction = this.$t('checkbillet.castnr')
      }
    })
  },
  methods: {
    selectpress () {
      if (this.selectedpress === '' || this.selectedpress === 'Pers 1') {
        this.selectedpress = 'Pers 2'
        this.variantpress = 'outline-secondary'
        this.currentstep = '1'
      } else {
        this.selectedpress = 'Pers 1'
        this.variantpress = 'outline-dark'
        this.currentstep = '1'
      }
    },
    getkey (value) {
      if (value === 'BACK' && (this.currentstep === '1' || this.currentstep === '2')) {
        this.gietnummer = this.gietnummer.slice(0, -1)
      }
      if (value === 'CLEAR') {
        this.gietnummer = ''
        this.tovalidate = ''
        this.currentstep = '1'
        this.variant = 'primary'
        this.feedback = this.$t('general.waiting')
        this.checkgietnummer = ''
        this.errorfound = false
        // this.$refs.btnCheck.focus()
      }
      if (value !== 'BACK' && value !== 'CLEAR' && (this.currentstep === '1' || this.currentstep === '2')) {
        this.gietnummer = this.gietnummer + value
      }
    },
    getClass () {
      if (this.errorfound) {
        return 'bg-danger text-white'
      } else {
        return 'bg-success text-white'
      }
    },
    process () {
      if (this.currentstep === '1' && this.gietnummer !== '') {
        // vergelijk1
        this.tovalidate = this.gietnummer
        this.gietnummer = ''
        // this.$refs.gietnummer.focus()
        // this.$refs.btnCheck1.focus()
        this.currentstep = '2'
        this.variant = 'secondary'
        this.feedback = this.$t('checkbillet.checkinput')
      } else if (this.currentstep === '2') {
        //
        if (this.gietnummer === this.tovalidate) {
          this.errorfound = false
          this.feedback = this.$t('checkbillet.checkinputok')
          this.variant = 'info'
          this.currentstep = '3'
        } else {
          this.errorfound = true
          this.feedback = this.$t('general.wrong') + ' ' + this.tovalidate + '<>' + this.gietnummer
          this.currentstep = '2'
          this.variant = 'secondary'
          this.gietnummer = ''
        }
      } else {
        this.errorfound = true
        this.currentstep = '1'
        this.feedback = this.$t('general.incorrectdata')
        this.variant = 'primary'
      }
    },
    //
    getpoles () {
      this.$swal.fire({
        title: this.$t('checkbillet.nbrpoles'),
        input: 'number',
        inputValue: 1,
        preConfirm: (value) => {
          if (value > 0 && value !== '') {
            this.insertcastnr(value)
          } else {
            this.$swal.showValidationMessage('<i class="fa fa-info-circle"></i> Foutieve ingave!')
          }
        }
      })
    },
    // Checkcastnr
    checkcastnr () {
      this.loading = true
      axios
        .post('/checkcastnr?company=' + this.activecompany + '&gietnummer=' + this.gietnummer + '&press=' + this.selectedpress + '&user=' + this.loggedinuser)
        .then(response => {
          this.checkgietnummer = response.data
        })
        .catch(error => console.log(error))
        .finally(() => (this.loading = false))
    },
    insertcastnr (nbrpoles) {
      this.message = ''
      if (this.loggedinuser !== '' && this.loginSuccessful === true) {
        NProgress.start()
        axios
          .post('/insertcastnr?company=' + this.activecompany + '&gietnummer=' + this.gietnummer + '&nbrpoles=' + nbrpoles + '&press=' + this.selectedpress + '&user=' + this.loggedinuser)
          .then(response => {
            this.feedback = response.data
            if (!response.status === 200) {
            // if (!this.feedback.startsWith('OK')) {
              this.playSound(true)
              this.errorfound = true
            } else {
              this.playSound(false)
              this.errorfound = false
              this.currentstep = '1'
              this.gietnummer = ''
              this.variant = 'primary'
            }
          })
          .catch(error => console.log(error))
        NProgress.done()
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
