import { combineReducers, Reducer } from "redux";
import VersionInfo from "./VersionInfo";
import {StateItem} from "../state";

export interface RootState {
  VersionInfo: StateItem;
}

export default combineReducers<RootState>({
  VersionInfo
});
