import { NArray, enlist } from "./array";
import { Integer, N, Float } from "./integer";
import { NObject } from "./object";
import { NString } from "./string";
import { NDate } from "./date";
export { Case } from './case'


export { NArray, Integer, N, Float, NObject, NString, NDate };

export const evolve = (obj) => {
  if (!obj) return obj
  if (obj.nhanced) return obj;
  if (typeof obj.nhanced) return obj;
  if (Array.isArray(obj)) return enlist(obj)
  if (typeof obj === "number") return N(obj)
  if (typeof obj === "string") return new NString(obj)
  if (obj instanceof Date) return new NDate(obj)
  if (Object.isObject(obj)) return new NObject(obj)
}



