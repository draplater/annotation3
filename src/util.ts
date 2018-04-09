import {rpc} from "./rpc";

export function getElementsByXPath(doc, xpath, parent?, ns?) {
  let results = [];
  let query = doc.evaluate(xpath,
    parent || doc,
    ns, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
  for (let i = 0, length = query.snapshotLength; i < length; ++i) {
    results.push(query.snapshotItem(i));
  }
  return results;
}


function transformedIterator<OriginType, NewType>(originIterator: Iterator<OriginType>,
                                                  transformer: (OriginType) => NewType): Iterator<NewType> {
  return {
    next: function (paramValue?: any) {
      const {value, done} = originIterator.next();
      if (done) {
        return {done, value: undefined};
      } else {
        return {value: transformer(value), done}
      }
    }
  };
}

function iterableIteratorWrapper<T>(iterator: Iterator<T>): IterableIterator<T> {
  const iter: any = {};
  iter.next = iter;
  iter[Symbol.iterator] = () => iter;
  return iter;
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

type AllPrimitiveTypes = boolean | null | number | string | symbol;

export class SMap<KeyType, ValueType> implements Map<KeyType, ValueType> {
  [Symbol.toStringTag];

  private map = new Map<AllPrimitiveTypes, [KeyType, ValueType]>();
  private serializeFunc: (key: KeyType) => string;

  constructor(serializeFunc?: (key: KeyType) => string) {
    this.serializeFunc = serializeFunc || JSON.stringify;
  }

  set(key: KeyType, value: ValueType): this {
    this.map.set(this.serializeFunc(key), [key, value]);
    return this;
  }

  get(key: KeyType): ValueType | undefined {
    const r = this.map.get(this.serializeFunc(key));
    if(r === undefined) {
      return undefined;
    } else {
      return r[1];
    }
  }

  clear() {
    this.map.clear();
  }

  delete(key: KeyType): boolean {
    return this.map.delete(this.serializeFunc(key));
  }

  has(key: KeyType): boolean {
    return this.map.has(this.serializeFunc(key));
  }

  get size() {
    return this.map.size;
  }

  keys(): IterableIterator<KeyType> {
    return iterableIteratorWrapper(transformedIterator(
      this.map.values(), value => value[0]));
  }

  values(): IterableIterator<ValueType> {
    return iterableIteratorWrapper(transformedIterator(
      this.map.values(), value => value[1]));
  }

  entries(): IterableIterator<[KeyType, ValueType]> {
    return this.map.values();
  }

  [Symbol.iterator](): IterableIterator<[KeyType, ValueType]> {
    return this.map.values();
  }

  forEach(callbackfn: (value: ValueType, key: KeyType,
                       map: Map<KeyType, ValueType>) => void, thisArg?: any): void {
    this.map.forEach((value, key) => {
      callbackfn.call(thisArg, [value[1], value[0], this]);
    });
  }
}

