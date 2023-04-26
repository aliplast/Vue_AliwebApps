import Vue from 'vue'
import Router from 'vue-router'

import Home from './components/Home.vue'

import Extrusion from './components/Extrusion.vue'
import Systems from './components/Systems.vue'

import MoveContainer from './components/systems/MoveContainer.vue'
import MovePack from './components/systems/MovePack.vue'
import LinkContainer from './components/systems/LinkContainer.vue'
import InfoLocation from './components/systems/InfoLocation.vue'
import InfoContainer from './components/systems/InfoContainer.vue'
import InfoItem from './components/systems/InfoItem.vue'
import InfoPicking from './components/systems/InfoPicking.vue'
import TranspReg from './components/systems/TranspReg.vue'
import InfoPack from './components/systems/InfoPack.vue'
import MaintainWarehouse from './components/systems/MaintainWarehouse.vue'
import ReceiveToLocation from './components/systems/ReceiveToLocation.vue'
import MaintainShipment from './components/systems/MaintainShipment.vue'
import ReprintLabel from './components/systems/ReprintLabel.vue'
import ResetItem from './components/systems/ResetItem.vue'
import Back2Stock from './components/systems/Back2Stock.vue'
import InfoOrder from './components/systems/InfoOrder.vue'
import MergeContainer from './components/systems/MergeContainer.vue'
import MaintainRollin from './components/systems/MaintainRollin.vue'
import SignShipment from './components/systems/SignShipment.vue'
import TakePicture from './components/systems/TakePicture.vue'
import InfoOperation from './components/systems/InfoOperation.vue'
import InfoNonTrf from './components/systems/InfoNonTrf.vue'
// import PBTransfer from './components/systems/PBTransfer.vue'
import RegisterReturn from './components/systems/RegisterReturn.vue'
import ReceiveReturn from './components/systems/ReceiveReturn.vue'
import CheckReturn from './components/systems/CheckReturn.vue'
import RegisterReal from './components/systems/RegisterReal.vue'
import MaintainScrap from './components/systems/MaintainScrap.vue'
import InfoReal from './components/systems/InfoReal.vue'
import TranspRegEx from './components/extrusion/TranspRegEx.vue'
import PBConfirmation from './components/extrusion/PBConfirmation.vue'
import MoveContainerExtr from './components/extrusion/MoveContainerExtr.vue'
import InfoLocationExtr from './components/extrusion/InfoLocationExtr.vue'
import InfoContainerExtr from './components/extrusion/InfoContainerExtr.vue'
import PBTransferExtr from './components/extrusion/PBTransferExtr.vue'
import PBTransferExtrV2 from './components/extrusion/PBTransferExtrV2.vue'
import HardnessMeasure from './components/extrusion/HardnessMeasure.vue'
import CheckBillet from './components/extrusion/CheckBillet.vue'
import UnloadBillet from './components/extrusion/UnloadBillet.vue'

Vue.use(Router)

export default new Router({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes: [
    { path: '/', component: Home },
    { path: '/extrusion', component: Extrusion },
    { path: '/systems', component: Systems },
    { path: '/movecontainer', component: MoveContainer },
    { path: '/movepack', component: MovePack },
    { path: '/linkcontainer', component: LinkContainer },
    { path: '/infoLocation', component: InfoLocation },
    { path: '/infoContainer', component: InfoContainer },
    { path: '/InfoItem', component: InfoItem },
    { path: '/InfoPicking', component: InfoPicking },
    { path: '/TranspReg', component: TranspReg },
    { path: '/InfoPack', component: InfoPack },
    { path: '/MaintainWarehouse', component: MaintainWarehouse },
    { path: '/ReceiveToLocation', component: ReceiveToLocation },
    { path: '/MaintainShipment', component: MaintainShipment },
    { path: '/ReprintLabel', component: ReprintLabel },
    { path: '/ResetItem', component: ResetItem },
    { path: '/Back2Stock', component: Back2Stock },
    { path: '/InfoOrder', component: InfoOrder },
    { path: '/MergeContainer', component: MergeContainer },
    { path: '/MaintainRollin', component: MaintainRollin },
    { path: '/SignShipment', component: SignShipment },
    { path: '/TakePicture', component: TakePicture },
    { path: '/InfoOperation', component: InfoOperation },
    { path: '/TranspRegEx', component: TranspRegEx },
    { path: '/PBConfirmation', component: PBConfirmation },
    { path: '/InfoNonTrf', component: InfoNonTrf },
    { path: '/MaintainScrap', component: MaintainScrap },
    // { path: '/PBTransfer', component: PBTransfer },
    { path: '/RegisterReturn', component: RegisterReturn },
    { path: '/ReceiveReturn', component: ReceiveReturn },
    { path: '/CheckReturn', component: CheckReturn },
    { path: '/MoveContainerExtr', component: MoveContainerExtr },
    { path: '/infoLocationExtr', component: InfoLocationExtr },
    { path: '/infoContainerExtr', component: InfoContainerExtr },
    { path: '/PBTransferExtr', component: PBTransferExtr },
    { path: '/PBTransferExtrV2', component: PBTransferExtrV2 },
    { path: '/HardnessMeasure', component: HardnessMeasure },
    { path: '/CheckBillet', component: CheckBillet },
    { path: '/UnloadBillet', component: UnloadBillet },
    { path: '/RegisterReal', component: RegisterReal },
    { path: '/InfoReal', component: InfoReal }
  ]
})
