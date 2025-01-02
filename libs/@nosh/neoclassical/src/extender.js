
export const extendBaseClasses = () => {
  const Mappings = {
    Object: NeoObject,
    String: NeoString,
    Array: NeoArray,
    Number: NeoNumber,
    Date: NeoDate
  }

  const up = function () {
    const type = typeof this
    if (Mappings[type]) return Mappings[type].create(this)
    return this
  }

  Object.keys(Mappings).forEach((key) => {
    Object.getPrototypeOf(globalThis[key]).up = up
  })

}