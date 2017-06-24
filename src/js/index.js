import 'aframe';
import 'aframe-gradient-sky';
import 'aframe-event-set-component';
import 'aframe-animation-component';
import 'aframe-template-component';
import 'aframe-look-at-component';
import 'aframe-layout-component';
import './components';

import aScene from '../scene/index.hbs';
import {startApp} from './main';

const extras = require('aframe-extras');
extras.registerAll();

window.useDatGUI = true;
window.isGearVR = AFRAME.utils.device.isGearVR();

document.addEventListener('DOMContentLoaded', () => {
  startApp(aScene);

  if (module.hot) {
    module.hot.accept();
  }
});
