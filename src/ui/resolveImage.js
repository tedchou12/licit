// @flow

import url from 'url';

type ImageResult = {
  complete: boolean,
  height: number,
  naturalHeight: number,
  naturalWidth: number,
  src: string,
  width: number,
};

const cache = {};

export default function resolveImage(src: ?string): Promise<ImageResult> {
  return new Promise((resolve, reject) => {
    const result: ImageResult = {
      complete: false,
      height: 0,
      naturalHeight: 0,
      naturalWidth: 0,
      src: src || '',
      width: 0,
    };

    const srcStr = src || '';

    if (cache[srcStr]) {
      const cachedResult = Object.assign({}, cache[srcStr]);
      resolve(cachedResult);
      return;
    }

    const parsedURL = url.parse(srcStr);
    const {protocol, port} = parsedURL;
    if (!/(http:|https:)/.test(protocol || '') || port) {
      resolve(result);
      return;
    }

    let img;

    const onLoad = () => {
      if (img) {
        result.width = img.width;
        result.height = img.height;
        result.naturalWidth = img.width;
        result.naturalHeight = img.height;
        result.complete = true;
      }
      resolve(result);
      dispose();
      cache[srcStr] = {...result};
    };

    const onError = () => {
      resolve(result);
      dispose();
    };

    const dispose = () => {
      if (img) {
        if (img instanceof HTMLElement) {
          const pe = img.parentNode;
          pe && pe.removeChild(img);
        }
        img.onload = null;
        img.onerror = null;
        img = null;
      }
    };

    const {body} = document;
    if (body) {
      img = document.createElement('img');
      img.style.cssText =
        'position:fixed;left:-10000000000px;width:auto;height:auto;';
      img.onload = onLoad;
      img.onerror = onError;
      img.src = srcStr;
      body.appendChild(img);
    } else {
      img = new Image();
      img.onload = onLoad;
      img.onerror = onError;
      img.src = srcStr;
    }
  });
}