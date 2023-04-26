<template>
  <div>
    <form>
      <b-container fluid class="p-0">
        <b-row>
          <b-col cols="12">
            <div v-bind:class="getClass()">
              <h2>
                Take Picture {{ info }}
                <h6>{{ feedback }}</h6>
              </h2>
            </div>
          </b-col>
        </b-row>
        <div class="vdivider" />
        <b-row>
         <input type="file" accept="image/*" @change="onChange" />
  <div id="preview">
    <img v-if="item.imageUrl" :src="item.imageUrl" />
  </div>
        </b-row>
        <b-row>
          <b-col cols="12">
            <!-- reasons -->
             <b-form-select v-model="selected" :options="reasons" ref="reasons"></b-form-select>
          </b-col>
        </b-row>
        <div class="vdivider" />
        <b-row>
          <b-col cols="12">
            <!-- remark -->
            <label for="remark" class="col-sm-2 col-form-label sr-only">Opmerking</label>
            <b-form-input
              @focus="$event.target.select()"
              id="remark"
              ref="remark"
              type="text"
              placeholder="remark"
              v-model="remark"
            />
          </b-col>
        </b-row>
        <div class="vdivider" />
        <b-row>
          <b-col cols="12">
            <b-button-toolbar>
            <b-button-group class="mx-1">
            <!-- Toggle button -->
            <b-button :variant="alertcolor" @click="toggleCamera">
              <span v-if="!isCameraOpen">Open camera</span>
              <span v-else>Close camera</span>
            </b-button>
            </b-button-group>
              <b-form-checkbox
                v-if="!isCameraOpen"
                id="frontcam"
                v-model="camface"
                name="camface"
                value="environment"
                unchecked-value="user"
                >{{camface}}
              </b-form-checkbox>
           <b-button-group class="mx-1">
            <div v-if="isPhotoTaken && isCameraOpen">
            <b-button variant="outline-primary" @click="saveImage" >
                <b-icon icon="cloud-upload"></b-icon> Imagestore
              </b-button>
          </div>
          </b-button-group>
          </b-button-toolbar>
          </b-col>
        </b-row>
        <div class="vdivider" />
         <b-row>
          <b-col cols="12">
            <!-- spinner -->
            <div class="camera-button">
              <div v-show="isCameraOpen && isLoading">
                <div class="text-center">
                  <b-spinner
                    variant="primary"
                    type="grow"
                    label="Spinning"
                  ></b-spinner>
                </div>
              </div>
            </div>
            <div
              v-if="isCameraOpen" v-show="!isLoading">
              <!-- Canvas -->
              <div id="MainPlane" class="text-center" @click="takePhoto">
                <video
                  v-show="!isPhotoTaken" :width="widthcanvas" :height="heightcanvas"
                  ref="camera" id="cameraPlane" autoplay>
                </video>
                <canvas
                  v-show="isPhotoTaken" :width="widthcanvas" :height="heightcanvas"
                  ref="canvas" id="photoPlane">
                </canvas>
              </div>
               <input v-show="!isPhotoTaken" type="range" min="100" max="400" step="10">
            </div>
          </b-col>
        </b-row>
          <div class="vdivider" />
         <b-row>
          <b-col cols="12">
              <b-card v-show="errorfound" title="Errors">
                <b-card-text>{{logdata}}</b-card-text>
              </b-card>
            </b-col>
         </b-row>
        <div class="vdivider" />
      </b-container>
    </form>
  </div>
</template>

<script>
import { beep } from './beep'
import { mapState } from 'vuex'
import axios from 'axios'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

export default {
  data () {
    return {
      item: {
        // ...
        image: null,
        imageUrl: null
      },
      info: '',
      userinfo: '',
      retval: '',
      feedback: '',
      errorfound: false,
      isCameraOpen: false,
      isPhotoTaken: false,
      isLoading: false,
      alertcolor: 'outline-success',
      selected: null,
      reasons: [
        { value: null, text: 'selecteer' },
        { value: 'Beschadiging', text: 'Beschadiging' },
        { value: 'Informatief', text: 'Informatief' },
        { value: 'Kras', text: 'Kras' },
        { value: 'Lakfout', text: 'Lakfout' },
        { value: 'Transport', text: 'Transport' },
        { value: 'Andere', text: 'Andere' }
      ],
      remark: '',
      camface: 'environment', // default
      window: {
        width: 0,
        height: 0
      },
      widthcanvas: 0,
      heightcanvas: 0,
      maxpicwidth: 0,
      maxpicheight: 0,
      photosettings: null,
      logdata: ''
    }
  },
  computed: {
    ...mapState(['loginError', 'loginSuccessful', 'loggedinuser', 'afdeling', 'test', 'supervisor']),
    company: function () {
      if (this.test === true) {
        return process.env.VUE_APP_COMPANYUAC
      } else {
        return process.env.VUE_APP_COMPANY
      }
    },
    canvas: function () {
      return this.$refs.canvas
    }
  },
  mixins: [beep],
  validations: {},
  mounted () {
    this.$nextTick(() => {
      if (this.loginSuccessful === false) {
        this.$router.push('/')
      } else {
        this.feedback = 'Select reason'
      }
    })
  },
  watch: {
    remark (v) {
      this.remark = v.trim()
    }
  },
  created () {
    window.addEventListener('resize', this.handleResize)
    this.handleResize()
  },
  destroyed () {
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    onChange (e) {
      const file = e.target.files[0]
      this.image = file
      this.item.imageUrl = URL.createObjectURL(file)
    },
    handleResize () {
      this.window.width = window.innerWidth
      this.window.height = window.innerHeight
      this.widthcanvas = this.window.width - 55
      this.heightcanvas = window.innerHeight * (9 / 16)
    },
    toggleCamera () {
      this.logdata = ''
      this.errorfound = false
      if (this.isCameraOpen) {
        this.isCameraOpen = false
        this.isPhotoTaken = false
        // this.alertcolor = 'outline-success'
        this.feedback = ''
        this.stopCameraStream()
        this.reset()
      } else {
        this.isCameraOpen = true
        this.feedback = 'Tap Pic 4 Photo'
        // this.alertcolor = 'outline-danger'
        this.createCameraElement()
      }
    },
    createCameraElement () {
      this.isLoading = true
      this.errorfound = false
      if (this.camface === 'user') {
        navigator.mediaDevices
          // .getUserMedia({ video: { facingMode: { exact: this.camface, zoom: true } } })
          .getUserMedia({ video: { facingMode: { exact: this.camface, zoom: true, width: { max: 4096 }, height: { ideal: 2160 } } } })
          .then((mediaStream) => {
            this.isLoading = false
            this.$refs.camera.srcObject = mediaStream
            const track = mediaStream.getVideoTracks()[0]
            const capabilities = track.getCapabilities()
            const settings = track.getSettings()
            const input = document.querySelector('input[type="range"]')
            console.log('usr-capabilities')
            console.log(capabilities)
            console.log('usr-settings')
            console.log(settings)
            // Check whether zoom is supported or not.
            if ('zoom' in settings) {
            // Map zoom to a slider element.
              input.min = capabilities.zoom.min
              input.max = capabilities.zoom.max
              input.step = capabilities.zoom.step
              input.value = settings.zoom
              input.oninput = function (event) {
                track.applyConstraints({ advanced: [ { zoom: event.target.value } ] })
              }
              input.hidden = false
            } else {
              this.feedback = 'No Zoom'
              input.hidden = true
            }
            this.imageCapture = new ImageCapture(track)
            // this.isCameraOpen = true
            this.maxpicwidth = capabilities.width.max
            this.maxpicheight = capabilities.height.max
            console.log(this.maxpicwidth + 'X' + this.maxpicheight)
          })
          .catch((error) => {
            this.isLoading = false
            this.feedback = 'Camera Error'
            this.logdata = error
            // console.log(error)
            this.errorfound = true
          })
      }
      if (this.camface === 'environment') {
        navigator.mediaDevices
          // .getUserMedia({ video: { facingMode: { exact: this.camface, zoom: true } } })
          .getUserMedia({ video: { facingMode: { exact: this.camface, zoom: true, width: { max: 4096 }, height: { max: 2016 } } } })
          .then((mediaStream) => {
            this.isLoading = false
            this.$refs.camera.srcObject = mediaStream
            const track = mediaStream.getVideoTracks()[0]
            const capabilities = track.getCapabilities()
            const settings = track.getSettings()
            const input = document.querySelector('input[type="range"]')
            console.log('env-capabilities')
            console.log(capabilities)
            console.log('env-settings')
            console.log(settings)
            // Check whether zoom is supported or not.
            if ('zoom' in settings) {
            // Map zoom to a slider element.
              input.min = capabilities.zoom.min
              input.max = capabilities.zoom.max
              input.step = capabilities.zoom.step
              input.value = settings.zoom
              input.oninput = function (event) {
                track.applyConstraints({ advanced: [ { zoom: event.target.value } ] })
              }
              input.hidden = false
            } else {
              this.feedback = 'No Zoom'
              input.hidden = true
            }
            this.maxpicwidth = capabilities.width.max
            this.maxpicheight = capabilities.height.max
            console.log(this.maxpicwidth + 'X' + this.maxpicheight)
          })
          .catch((error) => {
            this.isLoading = false
            this.feedback = 'Camera Error'
            this.logdata = error
            // console.log(error)
            this.errorfound = true
          })
      }
    },
    stopCameraStream () {
      if (this.$refs.camera.srcObject != null) {
        let tracks = this.$refs.camera.srcObject.getTracks()
        tracks.forEach((track) => {
          track.stop()
        })
      }
    },
    takePhoto () {
      if (!this.isPhotoTaken) {
        this.isPhotoTaken = true
        // const pic = this.imageCapture.takePhoto({ imageWidth: 1080, imageHeight: 720 })
        // console.log('pic')
        // console.log(pic)
        // .then(blob => createImageBitmap(blob, { resizeWidth: this.maxpicwidth, resizeHeight: this.maxpicheight }))
        this.imageCapture.takePhoto({ imageWidth: this.maxpicwidth, imageHeight: this.maxpicheight })
          // .then(blob => createImageBitmap(blob, { resizeWidth: this.maxpicwidth, resizeHeight: this.maxpicheight }))
          .then(blob => createImageBitmap(blob))
          .then(imageBitmap => {
            const canvas = this.$refs.canvas
            this.drawCanvas(canvas, imageBitmap)
          })
          .catch(error => (this.logdata = error))
        this.imageCapture.takePhoto({ imageWidth: this.maxpicwidth, imageHeight: this.maxpicheight })
          .then(blob => {
            var reader = new FileReader()
            reader.readAsDataURL(blob)
            reader.onloadend = function () {
              var base64data = reader.result
              localStorage.blobtoimage = base64data
                .replace('image/png', 'image/octet-stream')
                .replace('image/jpeg', 'image/octet-stream')
              console.log(localStorage.blobtoimage)
            }
            this.feedback = blob.type + ' ' + blob.size
          })
          .catch(error => console.log(error))
      } else {
        this.isPhotoTaken = false
      }
    },
    drawCanvas (canvas, img) {
      canvas.width = getComputedStyle(canvas).width.split('px')[0]
      canvas.height = getComputedStyle(canvas).height.split('px')[0]
      let ratio = Math.min(canvas.width / img.width, canvas.height / img.height)
      let x = (canvas.width - img.width * ratio) / 2
      let y = (canvas.height - img.height * ratio) / 2
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
      canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height,
        x, y, img.width * ratio, img.height * ratio)
    },
    reset () {
      this.errorfound = false
      this.isCameraOpen = false
      this.isPhotoTaken = false
      this.isLoading = false
      this.selected = null
      this.remark = ''
      this.logdata = ''
      this.feedback = 'Select reason'
      this.$refs.remark.focus()
    },
    getClass () {
      if (this.errorfound) {
        return 'bg-danger text-white'
      } else {
        return 'bg-success text-white'
      }
    },
    saveImage () {
      console.log('save image')
      console.log(localStorage.blobtoimage)
      const canvas = document
        .getElementById('photoPlane')
        .toDataURL('image/jpeg')
        .replace('image/jpeg', 'image/octet-stream')
      if (canvas.length > 0 && this.selected !== null) {
        NProgress.start()
        this.errorfound = false
        axios
          .post('/SaveToImageStore',
            JSON.stringify(localStorage.blobtoimage), {
            // JSON.stringify(canvas), {
              headers: { 'Content-Type': 'application/json' },
              params: {
                company: this.company,
                name: this.afdeling,
                application: this.$router.history.current.path,
                reason: this.selected,
                remark: this.remark,
                user: this.loggedinuser,
                supervisor: this.supervisor
              }
            })
          .then((res) => {
            this.playSound(false)
            this.errorfound = false
            this.feedback = res.data
          })
          .catch((error) => {
            this.playSound(true)
            this.errorfound = true
            this.feedback = error.message
            this.logdata = error.message
          })
        NProgress.done()
      } else {
        this.playSound(true)
        this.errorfound = true
        this.feedback = 'No reason/No image'
        this.$refs.reasons.focus()
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
  border-color: #0069d9;
  border-width: 1px;
  display: inline-block;
}
/* #cameraPlane {
  padding: 3px;
  box-sizing: border-box;
  border: 3px solid #DC3545;
}
#photoPlane {
  padding: 3px;
  box-sizing: border-box;
  border: 3px solid #28A745;
} */
.text-center {
  text-align: center;
  margin-left: auto;
  margin-right: auto;
}
</style>
