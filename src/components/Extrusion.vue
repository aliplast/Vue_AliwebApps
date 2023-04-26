<template>
  <div>
    <div class="vdivider" />
    <b-row>
      <b-col cols="6">
        <b-icon icon="globe" variant="secondary" font-scale="1"></b-icon>  <label for="lang">{{ $t("general.chooselanguage") }}</label>
      </b-col>
      <b-col cols="3">
        <b-form-select id="lang" v-model="$i18n.locale" size="sm" class="mb-0">
         <b-form-select-option value="nl">NL</b-form-select-option>
         <b-form-select-option value="en">EN</b-form-select-option>
        </b-form-select>
      </b-col>
      <b-col cols="3">
      </b-col>
    </b-row>
    <div class="vdivider" />
    <b-card-group deck v-if="mnumboperations">
      <b-card :header=" $t('extrusionheader.operations')">
        <b-list-group>
          <b-list-group-item class="text-left" to="/TranspRegEx">{{ $t("extrusion.RegisterContainer") }}</b-list-group-item>
          <b-list-group-item class="text-left" to="/PBConfirmation">{{ $t("extrusion.PBConfirmation") }}</b-list-group-item>
          <b-list-group-item class="text-left" to="/MoveContainerExtr">{{ $t("extrusion.MoveContainer") }}</b-list-group-item>
          <b-list-group-item class="text-left" to="/UnloadBillet">{{ $t("extrusion.UnloadBillets") }}</b-list-group-item>
          <b-list-group-item class="text-left" to="/CheckBillet">{{ $t("extrusion.CheckCastnr") }}</b-list-group-item>
        </b-list-group>
      </b-card>
    </b-card-group>
    <div class="vdivider" />
    <b-card-group deck v-if="mnumbinfo">
      <b-card :header=" $t('extrusionheader.info')">
        <b-list-group>
          <b-list-group-item class="text-left" to="/InfoLocationExtr">{{ $t("extrusion.InfoLocation") }}</b-list-group-item>
          <b-list-group-item class="text-left" to="/InfoContainerExtr">{{ $t("extrusion.InfoContainer") }}</b-list-group-item>
        </b-list-group>
      </b-card>
    </b-card-group>
    <div class="vdivider" />
    <b-card-group deck  v-if="mnumbwarehouse">
      <b-card :header=" $t('extrusionheader.warehouse')">
        <b-list-group>
          <b-list-group-item class="text-left" to="/PBTransferExtr">{{ $t("extrusion.PBTransfer") }}</b-list-group-item>
          <b-list-group-item class="text-left" to="/PBTransferExtrV2">{{ $t("extrusion.PBTransferV2") }}</b-list-group-item>
          <b-list-group-item class="text-left" to="/HardnessMeasure">{{ $t("extrusion.HardnessMeasure") }}</b-list-group-item>
        </b-list-group>
      </b-card>
    </b-card-group>
    <div class="vdivider" />
    <b-card no-body class="text-center">
    <div class="bg-secondary text-light">
       {{ lastlogin | moment("D/MM/YYYY HH:mm") }} - {{$appVersion}}
       <!--- {{ prtdoc }} -->
    </div>
    </b-card>
  </div>
</template>
<script>
import { mapState } from 'vuex'
export default {
  data () {
    return {
      // version: process.env.VUE_APP_VERSION
    }
  },
  computed: {
    ...mapState(['loggingIn', 'loginError', 'loginSuccessful', 'loggedinuser', 'test', 'prtlab', 'prtdoc', 'viewonly', 'lastlogin', 'appversion', 'mnumbinfo', 'mnumboperations', 'mnumbreception', 'mnumbwarehouse'])
  },
  methods: {}
}
</script>

<style>
.vdivider {
  margin-top: 10px;
  margin-bottom: 10px;
}
</style>
