/** TodoMVC model definitions **/
import * as store from "store";

export interface StateItem {
  username: string;
}

export const initialState: StateItem = {username: store.get("username") || "guest"};
