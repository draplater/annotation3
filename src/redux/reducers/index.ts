import { combineReducers, Reducer } from "redux";
import GlobalInfo from "./GlobalInfo";
import {StateItem} from "../state";

export interface RootState {
  GlobalInfo: StateItem;
}

export default combineReducers<RootState>({
  GlobalInfo: GlobalInfo
});
