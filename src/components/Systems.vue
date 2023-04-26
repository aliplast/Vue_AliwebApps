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
    <b-card-group deck v-if="mnualshipping">
      <b-card :header=" $t('systemsheader.shipping')">
        <b-list-group>
          <b-list-group-item class="text-left" to="/TranspReg">{{ $t("systems.TranspReg") }}</b-list-group-item>
          <b-list-group-item class="text-left" to="/MaintainShipment">{{ $t("systems.MaintainShipment") }}</b-list-group-item>
          <b-list-group-item class="text-left" to="/SignShipment">{{ $t("systems.SignShipment") }}</b-list-group-item>
          <b-list-group-item class="text-left" to="/RegisterReal">{{ $t("systems.RegisterReal") }}</b-list-group-item>
        </b-list-group>
      </b-card>
    </b-card-group>
  <div class="vdivider" />
  <b-card-group deck v-if="mnualwarehouse">
      <b-card :header=" $t('systemsheader.warehouse')">
        <b-list-group>
          <b-list-group-item class="text-left" to="/MoveContainer">{{ $t("systems.MovetoLocation") }}</b-list-group-item>
          <b-list-group-item class="text-left" to="/MergeContainer">{{ $t("systems.MergeContainer") }} </b-list-group-item>
          <b-list-group-item class="text-left" to="/MovePack">{{ $t("systems.MovePacktoRack") }}</b-list-group-item>
          <b-list-group-item class="text-left" to="/ReprintLabel">{{ $t("systems.ReprintLabelStock") }}</b-list-group-item>
          <b-list-group-item class="text-left" to="/LinkContainer">{{ $t("systems.LinkContainer") }} </b-list-group-item>
          <b-list-group-item class="text-left" to="/MaintainScrap">{{ $t("systems.MaintainScrap") }}</b-list-group-item>
        </b-list-group>
      </b-card>
    </b-card-group>
  <div class="vdivider" />
  <b-card-group deck v-if="mnualreturn">
      <b-card :header=" $t('systemsheader.returns')">
        <b-list-group>
          <b-list-group-item class="text-left" to="/RegisterReturn">{{ $t("systems.RegisterReturn") }}</b-list-group-item>
          <b-list-group-item class="text-left" to="/ReceiveReturn">{{ $t("systems.ReceiveReturn") }}</b-list-group-item>
          <b-list-group-item class="text-left" to="/CheckReturn">{{ $t("systems.CheckReturn") }}</b-list-group-item>
        </b-list-group>
      </b-card>
    </b-card-group>
    <div class="vdivider" />
    <b-card-group deck  v-if="mnualinfo">
      <b-card :header=" $t('systemsheader.info')">
        <b-list-group>
          <b-list-group-item class="text-left" to="/InfoLocation">{{ $t("systems.InfoLocation") }}</b-list-group-item>
          <b-list-group-item class="text-left" to="/InfoContainer">{{ $t("systems.InfoContainer") }}</b-list-group-item>
          <b-list-group-item class="text-left" to="/InfoPack">{{ $t("systems.InfoPacklabel") }}</b-list-group-item>
          <b-list-group-item class="text-left" to="/InfoItem">{{ $t("systems.InfoItem") }}</b-list-group-item>
          <b-list-group-item class="text-left" to="/InfoPicking">{{ $t("systems.InfoPicking") }}</b-list-group-item>
          <b-list-group-item class="text-left" to="/InfoOrder">{{ $t("systems.InfoOrder") }}</b-list-group-item>
          <b-list-group-item class="text-left" to="/InfoOperation">{{ $t("systems.InfoOperation") }}</b-list-group-item>
          <b-list-group-item class="text-left" to="/InfoNonTrf">{{ $t("systems.InfoOpenPB") }}</b-list-group-item>
          <b-list-group-item class="text-left" to="/InfoReal">{{ $t("systems.InfoReal") }}</b-list-group-item>
        </b-list-group>
      </b-card>
    </b-card-group>
    <div class="vdivider" />
    <b-card-group deck v-if="mnualreception">
      <b-card :header=" $t('systemsheader.reception')">
        <b-list-group>
          <b-list-group-item class="text-left" to="/MaintainWarehouse">{{ $t("systems.MaintainWarehouse") }}</b-list-group-item>
          <b-list-group-item class="text-left" to="/ReceiveToLocation">{{ $t("systems.ReceiveToLocation") }}</b-list-group-item>
          <b-list-group-item class="text-left" to="/Back2Stock">{{ $t("systems.BacktoStock") }}</b-list-group-item>
          <b-list-group-item class="text-left" to="/TakePicture">{{ $t("systems.TakePicture") }}</b-list-group-item>
          <!-- <b-list-group-item class="text-left" to="/PBTransfer">{{ $t("systems.PBTransfer") }}</b-list-group-item> -->
          <!-- <b-list-group-item class="text-left" to="/ResetItem">Reset Item <b-badge variant="danger">NIET GEBRUIKEN!!!</b-badge></b-list-group-item> -->
        </b-list-group>
      </b-card>
    </b-card-group>
    <div>
    <div class="vdivider" />
    <b-card-group deck v-if="mnualoperations">
      <b-card :header=" $t('systemsheader.operations')">
        <b-list-group>
          <b-list-group-item class="text-left" to="/MaintainRollin">{{ $t("systems.MaintainKartelen") }}</b-list-group-item>
        </b-list-group>
      </b-card>
    </b-card-group>
    <div class="vdivider" />
    <b-card no-body class="text-center">
    <div class="bg-secondary text-light">
       {{ lastlogin | moment("D/MM/YYYY HH:mm") }} - {{ $appVersion }}
       <!--- {{ prtdoc }} -->
    </div>
  </b-card>
</div>
  </div>
</template>
<script>
import { mapState } from 'vuex'
export default {
  data () {
    return {
    }
  },
  computed: {
    ...mapState(['loggingIn', 'loginError', 'loginSuccessful', 'loggedinuser', 'test', 'prtlab', 'prtdoc', 'viewonly', 'lastlogin', 'mnualinfo', 'mnualoperations', 'mnualreception', 'mnualreturn', 'mnualshipping', 'mnualwarehouse'])
  },
  methods: {
  }
}
</script>

<style>
.vdivider {
  margin-top: 10px;
  margin-bottom: 10px;
}
</style>
