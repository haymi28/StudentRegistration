// @ts-nocheck
// Copied from https://github.com/hymnbook/abushakir/blob/master/src/ETC.js
// to bypass npm installation issues.

const constants = {
  🇪🇹: {
    weekdays: [
      "እሑድ",
      "ሰኞ",
      "ማክሰኞ",
      "ረቡዕ",
      "ሐሙስ",
      "ዓርብ",
      "ቅዳሜ"
    ],
    months: [
      "መስከረም",
      "ጥቅምት",
      "ኅዳር",
      "ታኅሣሥ",
      "ጥር",
      "የካቲት",
      "መጋቢት",
      "ሚያዝያ",
      "ግንቦት",
      "ሰኔ",
      "ሐምሌ",
      "ነሐሴ",
      "ጳጉሜ"
    ],
    day_in_month: [
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      5
    ]
  },
  moment: {
    AM: "ጠዋት",
    PM: "ከሰዓት"
  }
}


class BahireHasab {
  constructor(year) {
    if (year) {
      if ("string" === typeof year) {
        throw new Error("Year must be a number.");
      }
      this._year = year;
    } else {
      this._year = new Date().getFullYear() - 8;
    }

    this.meskerem1 = this.getMeskerem1();
    this.ameteAlem = this.getAmeteAlem();
    this.wengelawi = this.getWengelawi();
    this.rabit = this.getRabit();

    this.wenber = this.getWenber();
    this.abekte = this.getAbekte();
    this.metk = this.getMetk();

    this.bealeMetk = this.getBealeMetk();

    this.nenewe = this.getNenewe();

    this.abiyTsom = this.getAbiyTsom();
    this.debreZeyit = this.getDebreZeyit();
    this.hosana = this.getHosana();
    this.seklet = this.getSeklet();
    this.tnsae = this.getTnsae();
    this.erget = this.getErget();
    this.bealeHamsa = this.getBealeHamsa();
    this.tsomeHawaryat = this.getTsomeHawaryat();
    this.tsomeDihnet = this.getTsomeDihnet();
  }

  getMeskerem1() {
    let year = this._year;
    let ameteAlem = 5500 + year;
    let rabit = Math.floor(ameteAlem / 4);
    let result = (ameteAlem + rabit) % 7;
    return result;
  }

  getAmeteAlem() {
    return 5500 + this._year;
  }

  getWengelawi() {
    return this.ameteAlem % 4;
  }

  getRabit() {
    return Math.floor(this.ameteAlem / 4);
  }

  getWenber() {
    let wenber = (this.ameteAlem % 19) - 1;
    if (wenber < 0) {
      return 18;
    }
    return wenber;
  }

  getAbekte() {
    return (this.wenber * 11) % 30;
  }

  getMetk() {
    if (30 - this.abekte > 0) return 30 - this.abekte;
    else return 0;
  }

  getBealeMetk() {
    let metk = this.getMetk();
    let result = {};
    if (metk > 14) {
      result.month = "ጥቅምት";
      result.date = metk - 14;
    } else {
      result.month = "መስከረም";
      result.date = metk + 15;
    }
    return result;
  }

  getNenewe() {
    let result = {};
    let meskerem1 = this.meskerem1;
    let metk = this.metk;
    let day = meskerem1 + metk;

    if (day > 30) {
      day = day % 30;
      result.month = constants.🇪🇹.months[4]; // Tir
      result.date = day;
    } else {
      result.month = constants.🇪🇹.months[3]; // Tahsas
      result.date = day;
    }
    return result;
  }

  getAbiyTsom() {
    let result = {};
    let nenewe = this.nenewe;

    if (nenewe.date + 14 > 30) {
      result.month = constants.🇪🇹.months[5];
      result.date = (nenewe.date + 14) % 30;
    } else {
      result.month = nenewe.month;
      result.date = nenewe.date + 14;
    }
    return result;
  }

  getDebreZeyit() {
    let result = {};
    let abiyTsom = this.getAbiyTsom();
    if (abiyTsom.date + 28 > 30) {
      if (abiyTsom.month === "ጥር") {
        result.month = "የካቲት";
        result.date = abiyTsom.date + 28 - 30;
      } else {
        result.month = "መጋቢት";
        result.date = abiyTsom.date + 28 - 30;
      }
    } else {
      result.month = abiyTsom.month;
      result.date = abiyTsom.date + 28;
    }
    return result;
  }

  getHosana() {
    let result = {};
    let debreZeyit = this.debreZeyit;
    if (debreZeyit.date + 21 > 30) {
      if (debreZeyit.month === "የካቲት") {
        result.month = "መጋቢት";
        result.date = debreZeyit.date + 21 - 30;
      } else {
        result.month = "ሚያዝያ";
        result.date = debreZeyit.date + 21 - 30;
      }
    } else {
      result.month = debreZeyit.month;
      result.date = debreZeyit.date + 21;
    }
    return result;
  }
  getSeklet() {
    let result = {};
    let hosana = this.hosana;

    if (hosana.date + 5 > 30) {
      if (hosana.month === "መጋቢት") {
        result.month = "ሚያዝያ";
        result.date = hosana.date + 5 - 30;
      } else {
        result.month = "ግንቦት";
        result.date = hosana.date + 5 - 30;
      }
    } else {
      result.month = hosana.month;
      result.date = hosana.date + 5;
    }
    return result;
  }
  getTnsae() {
    let result = {};
    let seklet = this.seklet;
    if (seklet.date + 2 > 30) {
      if (seklet.month === "መጋቢት") {
        result.month = "ሚያዝያ";
        result.date = seklet.date + 2 - 30;
      } else {
        result.month = "ግንቦት";
        result.date = seklet.date + 2 - 30;
      }
    } else {
      result.month = seklet.month;
      result.date = seklet.date + 2;
    }
    return result;
  }
  getErget() {
    let result = {};
    let tnsae = this.tnsae;

    if (tnsae.date + 9 > 30) {
      if (tnsae.month === "ሚያዝያ") {
        result.month = "ግንቦት";
        result.date = tnsae.date + 9 - 30;
      } else {
        result.month = "ሰኔ";
        result.date = tnsae.date + 9 - 30;
      }
    } else {
      result.month = tnsae.month;
      result.date = tnsae.date + 9;
    }
    return result;
  }
  getBealeHamsa() {
    let result = {};
    let erget = this.erget;
    if (erget.date + 10 > 30) {
      if (erget.month === "ግንቦት") {
        result.month = "ሰኔ";
        result.date = erget.date + 10 - 30;
      } else {
        result.month = "ሐምሌ";
        result.date = erget.date + 10 - 30;
      }
    } else {
      result.month = erget.month;
      result.date = erget.date + 10;
    }
    return result;
  }
  getTsomeHawaryat() {
    let result = {};
    let bealeHamsa = this.bealeHamsa;
    if (bealeHamsa.date + 1 > 30) {
      if (bealeHamsa.month === "ሰኔ") {
        result.month = "ሐምሌ";
        result.date = bealeHamsa.date + 1 - 30;
      } else {
        result.month = "ነሐሴ";
        result.date = bealeHamsa.date + 1 - 30;
      }
    } else {
      result.month = bealeHamsa.month;
      result.date = bealeHamsa.date + 1;
    }
    return result;
  }
  getTsomeDihnet() {
    let result = {};
    let tsomeHawaryat = this.tsomeHawaryat;
    if (tsomeHawaryat.date + 1 > 30) {
      result.month = constants.🇪🇹.months[11];
      result.date = tsomeHawaryat.date + 1 - 30;
    } else {
      result.month = tsomeHawaryat.month;
      result.date = tsomeHawaryat.date + 1;
    }
    return result;
  }

  get allAtswamat() {
    return {
      "ነነዌ": this.nenewe,
      "ዓቢይ ጾም": this.abiyTsom,
      "ደብረ ዘይት": this.debreZeyit,
      "ሆሳዕና": this.hosana,
      "ስቅለት": this.seklet,
      "ትንሳኤ": this.tnsae,
      "ዕርገት": this.erget,
      "በዓለ ሃምሳ": this.bealeHamsa,
      "ጾመ ሐዋርያት": this.tsomeHawaryat,
      "ጾመ ድህነት": this.tsomeDihnet
    };
  }
}

export class ETC {
    constructor(year, month, day) {
      if (year instanceof Date) {
        let date = year;
        this._gregorian_date = date;
        this._year = date.getFullYear();
        this._month = date.getMonth() + 1;
        this._day = date.getDate();
        this._hour = date.getHours();
        this._minute = date.getMinutes();
        this._second = date.getSeconds();
        this._millisecond = date.getMilliseconds();
        this._is_gregorian = true;
        this._internal_time = new Date(
          this._year,
          this._month - 1,
          this._day,
          this._hour,
          this._minute,
          this._second,
          this._millisecond
        );
        this.toEthiopic(this._year, this._month, this._day);
      } else {
        if (!year || !month || !day) {
          let today = new ETC(new Date());
          this._year = today.year;
          this._month = today.month;
          this._day = today.day;
          this._hour = today.hour;
          this._minute = today.minute;
          this._second = today.second;
          this._millisecond = today.millisecond;
          this._is_gregorian = false;
        } else {
          this._year = year;
          this._month = month;
          this._day = day;
          this._hour = 0;
          this._minute = 0;
          this._second = 0;
          this._millisecond = 0;
          this._is_gregorian = false;
        }
        this._internal_time = new Date(
          this._year,
          this._month,
          this._day,
          this._hour,
          this._minute,
          this._second,
          this._millisecond
        );
        this.toGregorian(this._year, this._month, this._day);
      }
    }
    get year() {
      return this._year;
    }
    get month() {
      return this._month;
    }
    get day() {
      return this._day;
    }
    get hour() {
      return this._hour;
    }
    get minute() {
      return this._minute;
    }
    get second() {
      return this._second;
    }
  
    get monthName() {
      return constants.🇪🇹.months[this._month - 1];
    }
  
    get dayName() {
      let day_of_week = this._gregorian_date.getDay();
      return constants.🇪🇹.weekdays[day_of_week];
    }
  
    get allMonths() {
      return constants.🇪🇹.months;
    }
  
    get allDays() {
      return constants.🇪🇹.weekdays;
    }
  
    toEthiopic(year, month, day) {
      let jdn = this._gregorianToJDN(year, month, day);
      let ethiopic = this._jdnToEthiopic(jdn);
      this._year = ethiopic[0];
      this._month = ethiopic[1];
      this._day = ethiopic[2];
      return this;
    }
  
    toGregorian(year, month, day) {
      let jdn = this._ethiopicToJDN(year, month, day);
      let gregorian = this._jdnToGregorian(jdn);
      this._gregorian_year = gregorian[0];
      this._gregorian_month = gregorian[1];
      this._gregorian_day = gregorian[2];
      this._gregorian_date = new Date(
        gregorian[0],
        gregorian[1] - 1,
        gregorian[2],
        this._hour,
        this._minute,
        this._second,
        this._millisecond
      );
      return this;
    }
  
    get BahireHasab() {
      if (this._is_gregorian)
        return new BahireHasab(this._gregorian_date.getFullYear() - 8);
      else return new BahireHasab(this._year);
    }
  
    _ethiopicToJDN(year, month, day) {
      const ERA = 1723856; // ERA of Ethiopian Calendar
      return (
        ERA +
        365 * (year - 1) +
        Math.floor(year / 4) +
        30 * (month - 1) +
        day
      );
    }
  
    _jdnToEthiopic(jdn) {
      const ERA = 1723856; // ERA of Ethiopian Calendar
      let r = (jdn - ERA) % 1461;
      let n = (r % 365) + 365 * Math.floor(r / 1460);
  
      let year =
        4 * Math.floor((jdn - ERA) / 1461) +
        Math.floor(r / 365) -
        Math.floor(r / 1460);
      let month = Math.floor(n / 30) + 1;
      let day = (n % 30) + 1;
  
      return [year, month, day];
    }
  
    _gregorianToJDN(year, month, day) {
      let s = Math.floor(year / 4) -
        Math.floor(year / 100) +
        Math.floor(year / 400);
      let e = Math.floor((14 - month) / 12);
      let a = year + 4800 - e;
      let m = month + 12 * e - 3;
      return (
        day +
        Math.floor((153 * m + 2) / 5) +
        365 * a +
        Math.floor(a / 4) -
        Math.floor(a / 100) +
        Math.floor(a / 400) -
        32045
      );
    }
  
    _jdnToGregorian(jdn) {
      let a = jdn + 32044;
      let b = Math.floor((4 * a + 3) / 146097);
      let c = a - Math.floor((146097 * b) / 4);
      let d = Math.floor((4 * c + 3) / 1461);
      let e = c - Math.floor((1461 * d) / 4);
      let m = Math.floor((5 * e + 2) / 153);
  
      let day = e - Math.floor((153 * m + 2) / 5) + 1;
      let month = m + 3 - 12 * Math.floor(m / 10);
      let year = 100 * b + d - 4800 + Math.floor(m / 10);
  
      return [year, month, day];
    }
  
    _four_digit(num) {
      return ("0000" + num).slice(-4);
    }
  
    _two_digit(num) {
      return ("00" + num).slice(-2);
    }
  
    _date_format(
      date,
      year_separator,
      month_separator,
      day_separator,
      date_as_string
    ) {
      let result =
        this._four_digit(date[0]) +
        year_separator +
        this._two_digit(date[1]) +
        month_separator +
        this._two_digit(date[2]) +
        day_separator;
      return date_as_string
        ? result.substring(0, result.length - 1)
        : date.concat(this._internal_time);
    }
  
    get anToday() {
      let today = new ETC(new Date());
      return [today.year, today.month, today.day];
    }
  
    get geezDay() {
      return this._day;
    }
  
    get geezMonth() {
      return this._month;
    }
  
    get geezYear() {
      return this._year;
    }
  
    get geezDate() {
      return this.dayName + ", " + this.monthName + " " + this.day + ", " + this.year;
    }
  }
