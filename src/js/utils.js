export function setAttributes(el, attributes = {}) {
  Object.keys(attributes).forEach(a => {
    el.setAttribute(a, attributes[a]);
  });

  return el;
}
