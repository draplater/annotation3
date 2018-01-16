import {rpc} from "./rpc";

export function getElementsByXPath(doc, xpath, parent?, ns?)
{
  let results = [];
  let query = doc.evaluate(xpath,
      parent || doc,
      ns, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
  for (let i=0, length=query.snapshotLength; i<length; ++i) {
    results.push(query.snapshotItem(i));
  }
  return results;
}

export async function rpcRequest(method: string, ...args) {
  try {
    return await rpc.request(method, ...args);
  } catch (e) {
    if (e.name == "RpcError") {
      alert(e.response.error.message);
      console.log(e.response);
    } else {
      throw(e);
    }
  }
}
