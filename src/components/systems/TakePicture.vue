<template>
  <div>
    <b-overlay :show="loading" rounded="sm">
    <form>
      <b-container fluid class="p-0">
        <b-row>
          <b-col cols="12">
            <div v-bind:class="getClass()">
              <h2>
                {{ $t("takepicture.title") }} {{ info }}
                <h6>{{ feedback }}</h6>
              </h2>
            </div>
          </b-col>
        </b-row>
        <div class="vdivider" />
        <b-row>
          <b-col cols="9">
            <!-- reasons -->
             <b-form-select v-model="selected" :options="reasons" ref="reasons">
              <template #first>
                <b-form-select-option :value="null" disabled>{{ $t("takepicture.selectreason") }}</b-form-select-option>
              </template>
             </b-form-select>
          </b-col>
          <b-col cols="3">
              <b-button variant="primary" @click="reset" block>
                  <b-icon icon="life-preserver"></b-icon>
                </b-button>
          </b-col>
        </b-row>
        <div class="vdivider" />
        <b-row>
          <b-col cols="9">
            <!-- dept -->
             <b-form-select v-model="selecteddept"
              :options="dept"
              ref="dept"
              value-field="Afdeling"
              text-field="Afdeling">
            </b-form-select>
          </b-col>
          <b-col cols="3">
            <div v-if="valid">
              <b-button variant="success" @click="saveImage" :title="this.$t('takepicture.upload')" block>
                  <b-icon icon="cloud-upload"></b-icon>
                </b-button>
            </div>
          </b-col>
        </b-row>
        <div class="vdivider" />
        <b-row>
          <b-col cols="9">
            <!-- dept -->
             <b-form-select v-model="selectedrcv"
              :options="rcv"
              ref="rcv"
              value-field="Naam"
              text-field="Naam">
               <template #first>
                  <b-form-select-option :value="null" disabled>{{ $t("takepicture.selectrcv") }}</b-form-select-option>
                </template>
            </b-form-select>
          </b-col>
        </b-row>
        <div class="vdivider" />
        <b-row>
          <b-col cols="12">
            <!-- remark -->
            <b-form-input
              @focus="$event.target.select()"
              id="remark"
              ref="remark"
              type="text"
              placeholder="remark"
              v-model="remark"
            /></b-col>
          </b-row>
        <div class="vdividerxl" />
        <b-row>
          <b-col cols="12">
          {{ $t("takepicture.takeapicture") }}
          <label for="fileinput" class="btn"><b-icon scale="2" icon="camera"></b-icon></label>
            <input type="file" style="display:none" ref="fileinput" id="fileinput" accept="image/*" @change="onFileChange" />
          </b-col>
        </b-row>
        <div class="vdividerxl" />
         <b-row>
          <b-col cols="12">
          <div id="preview">
              <b-img v-if="imageUrl" :src="imageUrl" fluid />
            </div>
          </b-col>
        </b-row>
          <div class="vdivider" />
         <b-row>
          <b-col cols="12">
              <b-card v-show="errorfound">
                <b-card-text>{{logdata}}</b-card-text>
              </b-card>
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
import { mapState } from 'vuex'
import axios from 'axios'

export default {
  data () {
    return {
      loading: false,
      valid: false,
      image: null,
      base64: null,
      imageUrl: null,
      info: '',
      userinfo: '',
      retval: '',
      feedback: '',
      errorfound: false,
      isLoading: false,
      alertcolor: 'outline-success',
      selected: null,
      reasons: [
        { value: 'Beschadiging', text: 'Beschadiging' },
        { value: 'Informatief', text: 'Informatief' },
        { value: 'Kras', text: 'Kras' },
        { value: 'Lakfout', text: 'Lakfout' },
        { value: 'Transport', text: 'Transport' },
        { value: 'Andere', text: 'Andere' }
      ],
      selecteddept: null,
      dept: [],
      selectedrcv: null,
      rcv: [],
      remark: '',
      logdata: ''
    }
  },
  computed: {
    ...mapState(['loginError', 'loginSuccessful', 'loggedinuser', 'afdeling', 'test', 'supervisor', 'activecompany'])
  },
  mixins: [beep],
  validations: {},
  mounted () {
    this.$nextTick(() => {
      if (this.loginSuccessful === false) {
        this.$router.push('/')
      } else {
        this.feedback = this.$t('general.waiting')
        this.getdept()
        this.getrcv()
        this.selecteddept = this.afdeling
      }
    })
  },
  watch: {
    remark (v) {
      this.remark = v.trim()
    }
  },
  methods: {
    onFileChange (event) {
      this.errorfound = false
      const selectedfile = event.target.files[0]
      if ((selectedfile.size / (1024 * 1024)) <= 2) {
        this.valid = true
        localStorage.removeItem('currentphoto')
        this.image = this.createBase64Image(selectedfile)
      } else {
        this.errorfound = true
        this.feedback = (selectedfile.size / (1024 * 1024)).toFixed(2) + ' > 2MB'
        this.valid = false
      }
      // Deze als thumbnail tonen
      this.imageUrl = URL.createObjectURL(selectedfile)
    },
    createBase64Image: function (FileObject) {
      const reader = new FileReader()
      reader.onload = (event) => {
        this.base64 = event.target.result
        localStorage.setItem('currentphoto', this.base64)
      }
      reader.readAsDataURL(FileObject)
    },
    reset () {
      this.valid = false
      this.errorfound = false
      this.isLoading = false
      this.selected = null
      this.image = null
      this.base64 = null
      this.imageUrl = null
      this.remark = ''
      this.logdata = ''
      this.feedback = 'Select reason'
      this.$refs.fileinput.value = ''
      this.$refs.remark.focus()
    },
    getdept () {
      this.loading = true
      axios
        .get('/getdept')
        .then(response => {
          // console.log(response.data)
          this.dept = response.data
        })
        .finally(() => {
          this.loading = false
        })
    },
    getrcv () {
      this.loading = true
      axios
        .get('/GetReceivers')
        .then(response => {
          // console.log(response.data)
          this.rcv = response.data
        })
        .finally(() => {
          this.loading = false
        })
    },
    getClass () {
      if (this.errorfound) {
        return 'bg-danger text-white'
      } else {
        return 'bg-success text-white'
      }
    },
    saveImage () {
      if (this.selected !== null) {
        this.errorfound = false
        this.feedback = ''
        this.logdata = ''
        this.loading = true
        axios
          .post('/SaveToImageStore',
            JSON.stringify(localStorage.getItem('currentphoto')), {
              headers: { 'Content-Type': 'application/json' },
              params: {
                company: this.activecompany,
                name: this.afdeling,
                application: this.$router.history.current.path,
                reason: this.selected,
                remark: this.remark,
                user: this.loggedinuser,
                receivers: this.selectedrcv,
                afdeling: this.selecteddept
              }
            })
          .then((res) => {
            this.playSound(false)
            this.errorfound = false
            this.feedback = res.data
            this.valid = false
          })
          .catch((error) => {
            console.log(error)
            this.playSound(true)
            this.errorfound = true
            this.feedback = error.response.data
            this.logdata = error.response.data
          })
          .finally(() => (this.loading = false))
      } else {
        this.errorfound = true
        this.feedback = this.$t('takepicture.selectreason')
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
  margin-top: 25;
  margin-bottom: 25px;
}
</style>
