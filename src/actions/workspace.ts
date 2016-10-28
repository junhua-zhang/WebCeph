import { Event } from 'utils/constants';
import { createAction } from 'redux-actions';

/* Tracing actions */
export const setActiveTool: (symbol: string) => Action<Payloads.setActiveTool> = createAction(
  Event.TOGGLE_TOOL_REQUESTED,
);

export const disableActiveTool: () => Action<Payloads.disableActiveTool> = createAction(
  Event.DISABLE_TOOL_REQUESTED,
);

export const addManualLandmark: (symbol: string, value: GeometricalObject | number) => Action<Payloads.addManualLandmark> = createAction(
  Event.ADD_MANUAL_LANDMARK_REQUESTED,
  (symbol: string, value: GeometricalObject): Payloads.addManualLandmark => ({ symbol, value }),
);

export const addUnnamedManualLandmark: (value: GeometricalObject | number) => any = createAction(
  Event.ADD_UNKOWN_MANUAL_LANDMARK_REQUESTED,
);

export const removeManualLandmark: (symbol: string) => Action<Payloads.removeManualLandmark> = createAction(
  Event.REMOVE_MANUAL_LANDMARK_REQUESTED,
  (symbol: string): Payloads.removeManualLandmark => symbol,
);

export const temporarilyHideLandmark: (symbol: string) => any = createAction(
  Event.HIDE_LANDMARK_TEMPORARILY_REQUESTED,
);

export const showTemporarilyHiddenLandmark: (symbol: string) => any = createAction(
  Event.SHOW_TEMORARILY_HIDDEN_LANDMARK_REQUESTED,
);

export const setScale: (zoom: number, x?: number, y?: number) => Action<Payloads.setScale> = createAction(
  Event.SET_SCALE_REQUESTED,
  (scale: number, x: number, y: number): Payloads.setScale => ({ scale, x, y }),
);

/** Performs steps in the cephalometric analysis that can be automatically evaluated in the current state.
 * This may include calculating an angle (i.e SNA) provided that all three points (S, N and A) have been set
*/
export const tryAutomaticSteps: () => any = createAction(Event.TRY_AUTOMATIC_STEPS_REQUESTED);

/* Image editing actions */
export const loadImageFile: (file: File) => Action<Payloads.imageLoadRequested> = createAction(Event.LOAD_IMAGE_REQUESTED);
export const flipX: () => Action<Payloads.flipImageX> = createAction(Event.FLIP_IMAGE_X_REQUESTED);
export const setBrightness: (value: number) => Action<Payloads.setBrightness> = createAction(Event.SET_IMAGE_BRIGHTNESS_REQUESTED);
export const setContrast: (value: number) => Action<Payloads.setContrast> = createAction(Event.SET_IMAGE_CONTRAST_REQUESTED);
export const invertColors: () => Action<Payloads.invertColors> = createAction(Event.INVERT_IMAGE_REQUESTED);
export const resetWorkspace: () => Action<Payloads.resetWorkspace> = createAction(Event.RESET_WORKSPACE_REQUESTED);
export const updateCanvasSize: (width: number, height: number) => Action<Payloads.updateCanvasSize> = createAction(
  Event.CANVAS_RESIZED,
  (width: number, height: number) => ({ width, height }),
);

export const showAnalysisResults: () => Action<Payloads.showAnalysisResults> = createAction(Event.SHOW_ANALYSIS_RESULTS_REQUESTED); 
export const hideAnalysisResults: () => Action<Payloads.hideAnalysisResults> = createAction(Event.CLOSE_ANALYSIS_RESULTS_REQUESTED);

export const highlightStep: (symbol: string) => Action<Payloads.highlightStep> = createAction(Event.HIGHLIGHT_STEP_ON_CANVAS_REQUESTED);
export const unhighlightStep: (symbol: string) => Action<Payloads.unhighlightStep> = createAction(Event.UNHIGHLIGHT_STEP_ON_CANVAS_REQUESTED);

export const redo: () => Action<Payloads.undo> = createAction(Event.REDO_REQUESTED);
export const undo: () => Action<Payloads.redo> = createAction(Event.UNDO_REQUESTED);
