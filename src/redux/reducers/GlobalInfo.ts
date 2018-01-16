import {handleActions} from "redux-actions";
import * as Actions from "../actions";
import {initialState, StateItem} from "../state";

export default handleActions<StateItem, StateItem>({
  [Actions.SET_USERNAME]: (state, action) => {
    return {
      username: action.payload.username
    }
  }
}, initialState);
