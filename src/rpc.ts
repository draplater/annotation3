import {JsonRpcClient} from "json-rpc-client-fetch";

export const rpc = new JsonRpcClient({endpoint: "./api"});
