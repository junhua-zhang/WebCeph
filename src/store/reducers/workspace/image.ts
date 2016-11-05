import { handleActions } from 'redux-actions';
import { Event, StoreKeys } from 'utils/constants';
import { printUnexpectedPayloadWarning } from 'utils/debug';

import { createSelector } from 'reselect';

import assign from 'lodash/assign';

type Height = StoreEntries.workspace.image.height;
type Width = StoreEntries.workspace.image.width;
type Data = StoreEntries.workspace.image.data;
type LoadError = StoreEntries.workspace.image.loadError;

// @TODO: normalize to [-1, 1] instead of 0-100
const defaultBrightness = 50;
const defaultContrast = 1;

const KEY_IMAGE_HEIGHT = StoreKeys.imageHeight;
const KEY_IMAGE_WIDTH = StoreKeys.imageWidth;
const KEY_IMAGE_DATA = StoreKeys.imageData;
const KEY_IMAGE_INVERT = StoreKeys.imageInvert;
const KEY_IMAGE_CONTRAST = StoreKeys.imageContrast;
const KEY_IMAGE_BRIGHTNESS = StoreKeys.imageBrightness;
const KEY_IMAGE_FLIP_X = StoreKeys.imageFlipX;
const KEY_IMAGE_FLIP_Y = StoreKeys.imageFlipY;
const KEY_IMAGE_IS_LOADING = StoreKeys.imageIsLoading;
const KEY_IMAGE_LOAD_ERROR = StoreKeys.imageLoadError;
const defaultWidth: Height = null;
const defaultHeight: Width = null;
const defaultData: Data = null;

const setHeight = handleActions<
  Height,
  Payloads.imageLoadSucceeded | Payloads.imageLoadFailed | Payloads.imageLoadRequested
>(
  {
    [Event.LOAD_IMAGE_SUCCEEDED]: (state, action) => {
      const payload = action.payload as Payloads.imageLoadSucceeded | undefined;
      if (payload === undefined) {
        printUnexpectedPayloadWarning(action.type, state);
        return state;
      }
      return payload.height;
    },
    [Event.LOAD_IMAGE_REQUESTED]: (_, __) => {
      return null;
    },
  },
  defaultHeight,
);

const setWidth = handleActions<
  Height,
  Payloads.imageLoadSucceeded | Payloads.imageLoadFailed | Payloads.imageLoadRequested
>(
  {
    [Event.LOAD_IMAGE_SUCCEEDED]: (state, action) => {
      const payload = action.payload as Payloads.imageLoadSucceeded | undefined;
      if (payload === undefined) {
        printUnexpectedPayloadWarning(action.type, state);
        return state;
      }
      return payload.width;
    },
    [Event.LOAD_IMAGE_REQUESTED]: (_, __) => {
      return null;
    },
  },
  defaultWidth,
);

const setData = handleActions<
  Data,
  Payloads.imageLoadSucceeded | Payloads.imageLoadFailed | Payloads.imageLoadRequested
>(
  {
    [Event.LOAD_IMAGE_SUCCEEDED]: (state, action) => {
      const payload = action.payload as Payloads.imageLoadSucceeded | undefined;
      if (payload === undefined) {
        printUnexpectedPayloadWarning(action.type, state);
        return state;
      }
      return payload.data;
    },
    [Event.LOAD_IMAGE_REQUESTED]: (_, __) => {
      return null;
    },
  },
  defaultData,
);

const setLoadError = handleActions<LoadError, Payloads.imageLoadFailed>({
  [Event.IGNORE_WORKSPACE_ERROR_REQUESTED]: (_, __) => null,
  [Event.LOAD_IMAGE_FAILED]: (state, { type, payload: error }) => {
    if (error === undefined) {
      printUnexpectedPayloadWarning(type, state);
      return state;
    }
    return error;
  },
  [Event.LOAD_IMAGE_REQUESTED]: () => null,
  [Event.RESET_WORKSPACE_REQUESTED]: () => null,
}, null);

const setLoadStatus = handleActions<boolean, boolean>({
  [Event.LOAD_IMAGE_REQUESTED]: () => true,
  [Event.LOAD_IMAGE_FAILED]: () => false,
  [Event.LOAD_IMAGE_SUCCEEDED]: () => false,
  [Event.RESET_WORKSPACE_REQUESTED]: () => false,
}, false);

const flipX = handleActions<boolean, boolean>({
  [Event.FLIP_IMAGE_X_REQUESTED]: (state: boolean) => !state,
  [Event.LOAD_IMAGE_REQUESTED]: () => false,
  [Event.RESET_WORKSPACE_REQUESTED]: () => false,
}, false);

const flipY = handleActions<boolean, boolean>({
  [Event.FLIP_IMAGE_Y_REQUESTED]: (state: boolean) => !state,
  [Event.LOAD_IMAGE_REQUESTED]: () => false,
  [Event.RESET_WORKSPACE_REQUESTED]: () => false,
}, false);

// @TODO: normalize to [-1, 1] instead of 0-100
const setBrightness = handleActions<number, number>({
  [Event.SET_IMAGE_BRIGHTNESS_REQUESTED]: (state, { type, payload: value }) => {
    if (value === undefined) {
      printUnexpectedPayloadWarning(type, state);
      return state;
    }
    return value;
  },
  [Event.LOAD_IMAGE_REQUESTED]: () => defaultBrightness,
  [Event.RESET_WORKSPACE_REQUESTED]: () => defaultBrightness,
}, defaultBrightness);

const setContrast = handleActions<number, number>({
  [Event.SET_IMAGE_CONTRAST_REQUESTED]: (state, { type, payload: value }) => {
    if (value === undefined) {
      printUnexpectedPayloadWarning(type, state);
      return state;
    }
    return value;
  },
  [Event.LOAD_IMAGE_REQUESTED]: () => defaultContrast,
  [Event.RESET_WORKSPACE_REQUESTED]: () => defaultContrast,
}, defaultContrast);

const setInvert = handleActions<boolean, boolean>({
  [Event.INVERT_IMAGE_REQUESTED]: (state) => !state,
  [Event.RESET_WORKSPACE_REQUESTED]: () => false,
}, false);

export default {
  [KEY_IMAGE_HEIGHT]: setHeight,
  [KEY_IMAGE_WIDTH]: setWidth,
  [KEY_IMAGE_DATA]: setData,
  [KEY_IMAGE_INVERT]: setInvert,
  [KEY_IMAGE_CONTRAST]: setContrast,
  [KEY_IMAGE_BRIGHTNESS]: setBrightness,
  [KEY_IMAGE_FLIP_X]: flipX,
  [KEY_IMAGE_FLIP_Y]: flipY,
  [KEY_IMAGE_IS_LOADING]: setLoadStatus,
  [KEY_IMAGE_LOAD_ERROR]: setLoadError,
};

export const isImageLoading = (state: GenericState) => {
  return state[KEY_IMAGE_IS_LOADING] as boolean;
};

export const getImageWidth = (state: GenericState) => {
  return state[KEY_IMAGE_WIDTH] as Width;
};

export const getImageHeight = (state: GenericState) => {
  return state[KEY_IMAGE_HEIGHT] as Height;
};

export const getImageData = (state: GenericState) => {
  return state[KEY_IMAGE_DATA] as Data;
};

export const hasImage = createSelector(
  getImageData,
  (data) => data !== null,
);

export const getImageSize = createSelector(
  getImageWidth,
  getImageHeight,
  (width, height) => ({ width, height }),
);

export const getImageBrightness = (state: GenericState) => state[KEY_IMAGE_BRIGHTNESS] as number;
export const getImageContrast = (state: GenericState) => state[KEY_IMAGE_CONTRAST] as number;
export const isImageFlippedX = (state: GenericState) => state[KEY_IMAGE_FLIP_X] as boolean;
export const isImageFlippedY = (state: GenericState) => state[KEY_IMAGE_FLIP_Y] as boolean;
export const isImageInverted = (state: GenericState) => state[KEY_IMAGE_INVERT] as boolean;
