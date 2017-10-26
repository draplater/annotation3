import {handleActions} from "redux-actions";
import * as Actions from "../actions";
import {initialState, StateItem} from "../state";

export default handleActions<StateItem, StateItem>({
  [Actions.SET_VERSION]: (state, action) => {
    return {
      version: action.payload.version
    }
  }
}, initialState);
