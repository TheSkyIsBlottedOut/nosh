import nengo from 'inc/nengo.json'
class NDate {

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
      if (self.systemlocale.include('US')) {
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