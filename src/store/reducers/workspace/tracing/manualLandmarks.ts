import assign from 'lodash/assign';
import omit from 'lodash/omit';

import { createSelector } from 'reselect';
import { handleActions } from 'redux-actions';
import { Event, StoreKeys } from 'utils/constants';
import { printUnexpectedPayloadWarning } from 'utils/debug';

import { getActiveTreatmentStageId } from 'store/reducers/workspace/treatmentStage';

import undoable, { includeAction } from 'redux-undo';
import { undoableConfig } from 'utils/config';

type ManualLandmarks = StoreEntries.workspace.tracing;
const KEY_MANUAL_LANDMARKS = StoreKeys.manualLandmarks;

const defaultState: ManualLandmarks = { };

const manualLandmarksReducer = handleActions<
  ManualLandmarks,
  Payloads.addManualLandmark | Payloads.removeManualLandmark
>(
  {
    [Event.ADD_MANUAL_LANDMARK_REQUESTED]: (
      state: ManualLandmarks, { type, payload }: Action<Payloads.addManualLandmark>
    ) => {
      if (payload === undefined) {
        printUnexpectedPayloadWarning(type, state);
        return state;
      }

      if (state[payload.imageId] === undefined) {
        console.warn(
          'Attempted to add a landmark without specifing the treatment stage, this is a bug!'
        );
        return state;
      }

      if (state[payload.symbol] !== undefined) {
        console.warn(
          'Attempted to add a landmark that already exists, this is a bug!'
        );
        return state;
      }
      return assign(
        { },
        state,
        {
          [payload.imageId]: assign(
            { },
            state[payload.imageId],
            {
              [payload.symbol]: payload.value,
            },
          ),
        }
      );
    },
    [Event.REMOVE_MANUAL_LANDMARK_REQUESTED]: (
      state: ManualLandmarks,
      { type, payload: { imageId, symbol } }: Action<Payloads.removeManualLandmark>
    ) => {
      if (symbol === undefined) {
        printUnexpectedPayloadWarning(type, state);
        return state;
      }
      if (imageId === undefined) {
        console.warn(
          'Attempted to remove a landmark without specifing the treatment stage, this is a bug!'
        );
        return state;
      }
      if (state[imageId][symbol] === undefined) {
        console.warn(
          'Attempted to remove a landmark that does not exist, this is a bug!'
        );
        return state;
      }
      return assign(
        { },
        state,
        {
          [imageId]: omit(state[imageId], symbol),
        },
      );
    },
    [Event.RESET_WORKSPACE_REQUESTED]: () => defaultState,
  },
  defaultState,
);


export default {
  [KEY_MANUAL_LANDMARKS]: undoable(
    manualLandmarksReducer,
    assign(
      { },
      undoableConfig,
      {
        filter: includeAction([
          Event.ADD_MANUAL_LANDMARK_REQUESTED,
          Event.REMOVE_MANUAL_LANDMARK_REQUESTED,
        ]),
      },
    ),
  ),
};

export const getManualLandmarksHistory = (state: GenericState): UndoableState<ManualLandmarks> => {
  return state[KEY_MANUAL_LANDMARKS];
};

export const getManualLandmarksOfAllStages = (state: GenericState): ManualLandmarks => {
  return state[KEY_MANUAL_LANDMARKS].present;
};

export const getActiveStageManualLandmarks = createSelector(
  getManualLandmarksOfAllStages,
  getActiveTreatmentStageId,
  (manual, stageId): { [symbol: string]: GeometricalObject } => {
    if (manual[stageId] !== undefined) {
      return manual[stageId];
    }
    return { };
  },
);