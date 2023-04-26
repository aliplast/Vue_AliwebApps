<template>
  <div>
    <form>
      <b-container fluid class="p-0">
        <b-row>
          <b-col cols="12">
            <div v-bind:class="getClass()">
              <h2>
                Receive Return {{info}}
                <h6>{{feedback}}</h6>
              </h2>
            </div>
          </b-col>
        </b-row>
        <div class="vdivider" />
        <b-row>
          <b-col cols="12">
            <!-- packto -->
            <label for="bcreturn" class="col-sm-2 col-form-label sr-only">bcreturn</label>
            <b-form-input
              @focus="$event.target.select()"
              id="bcreturn"
              ref="bcreturn"
              type="text"
              v-model="bcreturn"
              placeholder="scan return"
              v-on:keyup.enter="movetonextcontrol"
            />
          </b-col>
        </b-row>
        <div class="vdivider" />
        <b-row>
          <b-col cols="12">
            <!-- packto -->
            <label for="location" class="col-sm-2 col-form-label sr-only">location</label>
            <b-form-input
              @focus="$event.target.select()"
              id="location"
              ref="location"
              type="text"
              v-model="location"
              placeholder="scan location"
              v-on:keyup.enter="confirmationprocess"
            />
          </b-col>
        </b-row>
        <div class="vdivider" />
         <b-row v-if="returnlines.length > 0">
            <b-col cols="12">
              <vue-good-table
                :columns="columns"
                :rows="returnlines"
                :line-numbers="false"
                styleClass="vgt-table condensed"
                :search-options="{ enabled: false }"
                :sort-options="{ enabled: false, }"
                :select-options="{
                  enabled: true,
                  selectOnCheckboxOnly: false, // only select when checkbox is clicked instead of the row
                  selectionInfoClass: 'custom-class',
                  selectionText: 'rows selected',
                  clearSelectionText: 'clear',
                  disableSelectInfo: true, // disable the select info panel on top
                  selectAllByGroup: true, // when used in combination with a grouped table, add a checkbox in the header row to check/uncheck the entire group
                }"
                @on-selected-rows-change="selectionchanged">
              ></vue-good-table>
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
      bcreturn: '',
      location: '',
      docid: '',
      splitvalues: [],
      returnlines: [],
      customerid: '',
      feedback: '',
      message: '',
      info: '',
      userinfo: '',
      errorfound: false
    }
  },
  computed: {
    ...mapState(['loginError', 'loginSuccessful', 'loggedinuser', 'test', 'activecompany'])
  },
  mixins: [beep],
  validations: {
    bcreturn: { required }
  },
  watch: {
    bcreturn: function (v) {
      this.splitvalues = v.toString().split('$')
      this.docid = this.splitvalues[0]
      this.customerid = this.splitvalues[1]
      // console.log(this.splitvalues[0])
    },
    location: function (v) {
      this.location = v.toUpperCase().trim()
    }
  },
  mounted () {
    this.$nextTick(() => {
      if (this.loginSuccessful === false) {
        this.$router.push('/')
      } else {
        this.bcreturn = ''
        this.$refs.bcreturn.focus()
        this.feedback = 'Waiting for input'
      }
    })
  },
  methods: {
    movetonextcontrol: function (event) {
      if (this.bcreturn !== '') {
        this.$refs.location.focus()
      } else {
        this.$refs.bcreturn.focus()
      }
    },
    movetofirstcontrol: function (event) {
      this.$refs.bcreturn.focus()
    },
    getClass () {
      if (this.errorfound) {
        return 'bg-danger text-white'
      } else {
        return 'bg-success text-white'
      }
    },
    confirmationprocess () {
      if (this.bcreturn !== '') {
        this.errorfound = false
        this.$swal({
          title: 'Return Received?',
          showCancelButton: true,
          cancelButtonText: 'NO',
          confirmButtonText: 'YES'
        }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
          if (result.isConfirmed) {
            this.receivereturn(1)
          } else {
            this.receivereturn(0)
          }
          this.$refs.bcreturn.focus()
        })
      } else {
        this.location = ''
        this.$refs.bcreturn.focus()
      }
    },
    receivereturn (status) {
      this.message = ''
      if (this.loggedinuser !== '' && this.loginSuccessful === true) {
        if (this.docid !== '') {
          NProgress.start()
          this.errorfound = false
          axios
            .post(
              '/ReturnsReceive?company=' +
                  this.activecompany +
                  '&status=' + '40' +
                  '&docid=' + this.docid +
                  '&user=' + this.loggedinuser +
                  '&location=' + this.location +
                  '&rcvstatus=' + status
            )
            .then(response => {
              NProgress.done()
              this.playSound(false)
              this.errorfound = false
              this.feedback = response.data
              this.bcreturn = ''
              this.location = ''
              this.$refs.bcreturn.focus()
            })
            .catch(error => {
              NProgress.done()
              this.playSound(true)
              this.errorfound = true
              this.feedback = error.response.data
              this.bcreturn = ''
              this.location = ''
              this.$refs.bcreturn.focus()
            })
        } else {
          this.errorfound = true
          this.feedback = 'Waiting for input ...'
          this.$refs.bcreturn.focus()
        }
      } else {
        this.errorfound = true
        this.feedback = 'Login please ...'
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
