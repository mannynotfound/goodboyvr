export function startApp(aScene) {
  const container = document.getElementById('container');
  container.innerHTML = aScene({});

  const model = document.getElementById('model');
  model.addEventListener('model-loaded', (e) => {
    const modelMesh = e.detail.model;
    modelMesh.geometry.computeVertexNormals();
  });
}
