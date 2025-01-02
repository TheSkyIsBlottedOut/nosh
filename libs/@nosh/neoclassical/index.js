import { NeoCore } from "./src/core";
import { NeoArray } from "./src/array";
import { NeoString } from "./src/string"
import { NeoNumber, InfinitePrecisionNumber } from "./src/number"
import { NeoObject } from "./src/object"
import { NeoDate } from "./src/date"
import { NeoRange } from "./src/range"
import { Case } from "./src/case"
import { extendBaseClasses } from "./src/extender";


const evolve = (obj) => {
  if (!obj) return obj
  if (obj.neo) return obj;
  if (obj instanceof NeoCore) return obj
  if (Array.isArray(obj)) return new NeoArray(obj)
  if (typeof obj === "number") return new NeoNumber(obj)
  if (typeof obj === "string") return new NeoString(obj)
  if (obj instanceof Date) return new NeoDate(obj)
  if (Object.isObject(obj)) return new NeoObject(obj)
}
export {
  NeoCore, NeoArray, NeoString, NeoNumber, InfinitePrecisionNumber, NeoObject, NeoDate, NeoRange, Case, extendBaseClasses, evolve
}
