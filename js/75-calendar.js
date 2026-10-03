/* ============================================================
   CALENDAR — the whole plan as an .ics file: one 2-hour block per
   day at the time the student chooses (SAST), rest days as all-day
   events, a reminder 15 minutes before, and a link back to that day
   in the app. Import it once into Google Calendar.
   ============================================================ */
(function () {
  "use strict";
  const esc = U.esc;
  const DEFAULT_TIME = "18:00";
  const SAST = "+02:00"; // South Africa has no daylight saving

  const text = function (s) { return String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n"); };
  const utc = function (d) { return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""); };
  const ymd = function (iso) { return iso.replace(/-/g, ""); };
  /* RFC 5545: lines of at most 75 octets, continued with a leading space. */
  function fold(line) {
    const enc = new TextEncoder();
    if (enc.encode(line).length <= 75) return line;
    const out = []; let cur = "", n = 0;
    for (const ch of line) {
      const b = enc.encode(ch).length;
      if (n + b > (out.length ? 74 : 75)) { out.push(cur); cur = ""; n = 0; }
      cur += ch; n += b;
    }
    out.push(cur);
    return out.join("\r\n ");
  }

  /* Pure: build the file. time "HH:MM" (SAST), base = the app's URL without the hash. */
  function build(time, base, now) {
    const t = /^\d{2}:\d{2}$/.test(time || "") ? time : DEFAULT_TIME;
    const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//The Four-Month Rebuild//Plan//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", "X-WR-CALNAME:The Four-Month Rebuild", "X-WR-TIMEZONE:Africa/Johannesburg"];
    const stamp = utc(now || new Date());
    COURSE.PLAN.days.forEach(function (day) {
      const url = base + "#/day/" + day.i;
      const ev = ["BEGIN:VEVENT", "UID:rebuild-" + day.date + "@four-month-rebuild", "DTSTAMP:" + stamp];
      if (day.kind === "rest") {
        const next = U.addDays(day.date, 1);
        ev.push("DTSTART;VALUE=DATE:" + ymd(day.date), "DTEND;VALUE=DATE:" + ymd(next), "TRANSP:TRANSPARENT",
          "SUMMARY:" + text("Rebuild · " + P.dayShort(day)), "DESCRIPTION:" + text(P.dayEyebrow(day) + ". No study today.\n\n" + url));
      } else {
        const start = new Date(day.date + "T" + t + ":00" + SAST), end = new Date(start.getTime() + 2 * 3600e3);
        const items = P.dayItems(day.i).map(function (it) { return "Hour " + it.hour + ": " + P.itemLabel(it); });
        const desc = P.dayEyebrow(day) + "\n\n" + (items.length ? items.join("\n") : day.kind === "spare" ? "Buffer day: catch up on anything unfinished, or rest." : P.dayTitle(day)) + "\n\nOpen today's plan: " + url;
        ev.push("DTSTART:" + utc(start), "DTEND:" + utc(end), "SUMMARY:" + text("Rebuild · " + P.dayShort(day)), "DESCRIPTION:" + text(desc), "URL:" + url,
          "BEGIN:VALARM", "ACTION:DISPLAY", "TRIGGER:-PT15M", "DESCRIPTION:" + text("Rebuild in 15 minutes"), "END:VALARM");
      }
      ev.push("END:VEVENT");
      Array.prototype.push.apply(lines, ev);
    });
    lines.push("END:VCALENDAR");
    return lines.map(fold).join("\r\n") + "\r\n";
  }

  const studyTime = function () { const s = APP.state.settings.studyTime; return /^\d{2}:\d{2}$/.test(s || "") ? s : DEFAULT_TIME; };
  window.CALENDAR = {
    build: build,
    panelHTML: function () {
      return "<section class='panel'><div class='sec-head'><span class='code'>CALENDAR</span><h2>Put the plan in your calendar</h2></div>" +
        "<p>One two-hour block for every day of the plan, at the time you choose, with a reminder 15 minutes before. A fixed time is the single biggest help with turning up every day.</p>" +
        "<div class='row wrap'><label class='fld'><span>Start time (SAST)</span><input id='cal-time' type='time' value='" + esc(studyTime()) + "' data-chg='calTime'></label>" +
        "<button class='btn primary' data-act='calExport'>Download the calendar (.ics)</button></div>" +
        "<p class='small muted'>Google Calendar, on a computer: first create a new calendar called “Rebuild” (Settings → Add calendar), then Settings → Import &amp; export → Import, choose the file and the Rebuild calendar. To change the time later, delete the Rebuild calendar and import a new file.</p></section>";
    }
  };
  ACT.calTime = function (el) { if (/^\d{2}:\d{2}$/.test(el.value)) { APP.state.settings.studyTime = el.value; STORE.commit(false); } };
  ACT.calExport = function () {
    const base = location.href.split("#")[0];
    PLATFORM.download("four-month-rebuild-plan.ics", build(studyTime(), base), "text/calendar");
    U.toast("Calendar downloaded — import it into Google Calendar.");
  };
})();
