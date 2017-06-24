import {setAttributes} from './utils';

export const CORS_PROXY = 'http://ec2-52-27-113-232.us-west-2.compute.amazonaws.com:8080';

function createAssetId(url) {
  const id = `asset-${url.replace(/\W/g, '_')}`;
  const existing = document.querySelector(`#${id}`);
  return {id, existing};
}

function computeDimensions(ratio) {
  return {
    width: Math.min(1, (ratio < 1 ? 1.5 * 1 / ratio : 1.5)),
    height: Math.min(1, (ratio < 1 ? 1.5 : 1.5 * ratio)),
  };
}

export function loadImage(url) {
  return new Promise(resolve => {
    const {id, existing} = createAssetId(url);

    if (existing) {
      resolve({
        img: existing,
        dimensions: computeDimensions(existing.height / existing.width),
      });
    } else {
      const img = setAttributes(document.createElement('img'), {
        id,
        src: `${CORS_PROXY}/${url}`,
        crossorigin: 'anonymous',
      });

      const assetList = document.querySelector('#assets');
      assetList.appendChild(img);

      const poll = setInterval(() => {
        if (img.naturalWidth) {
          clearInterval(poll);
          const ratio = img.naturalHeight / img.naturalWidth;
          resolve({img, dimensions: computeDimensions(ratio)});
        }
      }, 10);
    }
  });
}

export function loadVideo(url) {
  return new Promise(resolve => {
    const {id, existing} = createAssetId(url);

    if (existing) {
      resolve({
        video: existing,
        dimensions: computeDimensions(existing.height / existing.width),
      });
    } else {
      const video = setAttributes(document.createElement('video'), {
        id,
        muted: true,
        autoplay: true,
        loop: true,
        src: `${url}`,
        crossorigin: 'anonymous',
      });

      video.addEventListener('loadedmetadata', () => {
        const ratio = video.videoHeight / video.videoWidth;
        const dimensions = computeDimensions(ratio);
        video.height = dimensions.height;
        video.width = dimensions.width;
        const assetList = document.querySelector('#assets');
        assetList.appendChild(video);
        resolve({video, dimensions});
      }, false);
    }
  });
}
