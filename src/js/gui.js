import {debounce} from 'lodash';

export function startGUI(cpt) {
  // clean up existing gui
  const existing = document.querySelector('.dg.main');
  if (existing) {
    existing.parentNode.removeChild(existing);
  }
  // init new gui
  const SceneOpts = function() {
    this.thing = 500;
  };
  const sceneOptions = new SceneOpts();
  const gui = new dat.GUI();
  gui.closed = true;
  // add config items
  const thingCfg = gui.add(sceneOptions, 'thing', 50, 1000);
  controllerSpawn.onChange(value => {
    cpt.emit('update-thing', {value});
  });
}

export function attachGUI(cpt) {
  // set up dat.GUI listeners
  cpt.updateThing = e => {
    cpt.thing = e.detail.value;
  };
  cpt.debouncedUpdateThing = debounce(cpt.updateThing.bind(cpt), 100);
  cpt.el.addEventListener('update-thing', cpt.debouncedUpdateThing);
}
