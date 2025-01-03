import {nengo} from './inc/nengo.json'
import timedata from './inc/time.json'
import { NeoCore } from './core'

class NeoDate extends NeoCore {
  #value = 0
  #offset = 8
  #timezone = 0
  #options = { locale: 'en-US', calendar: 'gregory', numberingSystem: 'latn', timeStyle: 'short', dateStyle: 'short', timeZone: 'America/New_York', hourCycle: 'h23', formatMatcher: 'best fit', weekday: 'long', era: 'short', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', timeZoneName: 'short' }
  #location = 'America/Los_Angeles'
  constructor(datelike = null) {
    this.#value = NeoDate.convertToUnixTime(datelike)
    this.#offset = new Date().getTimezoneOffset() / 60
    this.#options = NeoDate.options
    this.#location = NeoDate.options.timeZone
  }
  get value() { return this.#value }
  get now() { return new NeoDate() }
  get localTimeZone() { return this.#location }

  static convertToUnixTime(datelike) {
    if (datelike instanceof Date) return +datelike;
    if (datelike instanceof NeoDate) return datelike.value
    if (typeof datelike === 'number') return (datelike / 1000)
    if (typeof datelike === 'string') {
      return NeoDate.parse(datelike).value
    }
  }

  static get options() {
    return Intl.DateTimeFormat().resolvedOptions()
  }

  static get systemlocale() { return this.options.locale }

  static parse(str_or_num) {
    let matches;
    if (typeof str_or_num === 'number') return new NeoDate(str_or_num)
    if (typeof str_or_num === 'string') {
      // use time data to determine mdy vs dmy matches
      if (matches = str_or_num.match(/(\d{1,2})[\S\D\W]+(\d{1,2})[\S\D\W]+(\d{4})/)) {
        const [s1, s2, year] = matches[1, 2, 3]
        if (Object.keys(timedata.timezoneCommonPoints).includes(this.systemlocale)) {
          const [month, day] = timedata.timezoneCommonPoints[this.systemlocale].mdy ? [s1, s2] : [s2, s1]
          return new NeoDate(new Date(year, month - 1, day))
        } else {
          // ASSUME US DOMINANCE
          const [month, day] = [s1, s2]
          return new NeoDate(new Date(year, month - 1, day))
        }
      } else if (matches = str_or_num.match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})/)) {
        const [year, s1, s2] = matches[1, 2, 3]
        if (Object.keys(timedata.timezoneCommonPoints).includes(this.systemlocale)) {
          const [month, day] = timedata.timezoneCommonPoints[this.systemlocale].mdy ? [s1, s2] : [s2, s1]
          return new NeoDate(new Date(year, month - 1, day))
        } else if (matches = str_or_num.match(/(\d{4})年\s*(\d{1,2})月\s*(\d{1,2})日/)) {
          const [year, month, day] = matches[1, 2, 3]
          return new NeoDate(new Date(year, month - 1, day))
        } else if (matches = str_or_num.match(/(平和|昭和|令和)\s+(\d{1,2})年(\d{1,2})月(\d{1,2})日/)) {
          const [_, era, year, month, day] = matches
          return new NeoDate(new Date(nengo.eras[era] + year, month - 1, day))
        }
      } else if (matches = str_or_num.match(/to(?:day|morrow)|yesterday/i)) {
        return new NeoDate(matches[0].toLowerCase() == 'today' ? new Date() : new Date(+Date.now() + (matches[0].toLowerCase() == 'yesterday' ? -1 : 1) * 86400000))
      } else if (matches = str_or_num.match(/(\d+)\s+((?:second|minute|hour|day|week|month|year|decade)s|centur(?:y|ies)|milleni(?:um|a))\s+(ago|in\sthe\sfuture|from\snow|later)/i)) {
        return new NeoDate(new Date(+Date.now() + (matches[3].toLowerCase() == 'ago' ? -1 : 1) * timedata.intervals[matches[2]] * matches[1]))
      } else {
        return new NeoDate(Date.parse(str_or_num))
      }
    } else {
      return new NeoDate()
    }
  }


  static utimeFrom(arg = undefined) {
    if (arg instanceof Date) return +arg;
    if (arg instanceof NeoDate) return g.utime;
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
export { NeoDate }