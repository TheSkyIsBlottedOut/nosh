import nengo from 'inc/nengo.json'
import { NeoCore } from './core'
import { O_O } from "@nosh/unhelpfully"
import { $ } from 'bun'


class NeoDate extends NeoCore {
  #value = 0
  #timezone = 0
  async constructor(datelike = null) {
    this.#value = NeoDate.convertToUnixTime(datelike)
    this.#offset = new Date().getTimezoneOffset() / 60
    this.#options = Intl.DateTimeFormat().resolvedOptions() // { locale: 'en-US', calendar: 'gregory', numberingSystem: 'latn', timeStyle: 'short', dateStyle: 'short', timeZone: 'America/New_York', hourCycle: 'h23', formatMatcher: 'best fit', weekday: 'long', era: 'short', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', timeZoneName: 'short' }
    this.#location = Intl.DateTimeFormat().resolvedOptions().timeZone
  }

  get value() { return this.#value }
  get now() { return new NeoDate() }
  get localTimeZone() { }

static convertToUnixTime(datelike) {
  if (datelike instanceof Date) return +datelike;
  if (datelike instanceof NeoDate) return datelike.value
  if (typeof datelike === 'number') return (datelike / 1000)
  if (typeof datelike === 'string') {
    return NeoDate.parse(datelike).value
  }

}






  // Accepts: nothing; utime; date string; intervals
  constructor(arg = undefined) {
    this.utime = NDate.utimeFrom(arg);
  }


  static get systemlocale() {
    return Intl.DateTimeFormat().resolvedOptions().locale;
  }
  static parse(str) {
    // parse non-standard options
    if (str.match(/(\d{2}[\/-]){2}\d{4}/)) {
      if (/US/i.test(this.systemlocale ?? '')) {
        const [month, day, year] = str.split(/[\/-]/);
        return new NDate(new Date(year, month - 1, day))
      } else {
        const [day, month, year] = str.split(/[\/-]/);
        return new NDate(new Date(year, month - 1, day))
      }
    } else if (str.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/)) {
      const [_, year, month, day] = str.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
      return new NDate(new Date(year, month - 1, day))
    } else if (str.match(/(平和|昭和｜令和)\s+\d{1,2})年(\d{1,2})月(\d{1,2})日/)) {
      const [_, era, year, month, day] = str.match(/(平和|昭和｜令和)(\d{1,2})年(\d{1,2})月(\d{1,2})日/);
      return new NDate(new Date(nengo.eras[era] + year, month - 1, day))
    }

  }

  static utimeFrom(arg = undefined) {
    if (arg instanceof Date) return +arg;
    if (arg instanceof NDate) return g.utime;
    if (typeof arg === 'number') return +Date.at(arg);
    if (typeof arg === 'string') {
      // is it an interval
      if (arg.match(/\d+[smhdw]/)) return +Date.at(arg);
      return +Date.parse(arg);
    }
    if (arg instanceof Array) return Date.UTC(...arg);
    return +Date.now();
  }

}

O_O.add('up').to(Date.prototype).get(() => new NDate(+this));