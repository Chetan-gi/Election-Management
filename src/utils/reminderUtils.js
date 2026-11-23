/**
 * 1-Day-Prior Reminder Calculation Engine & Upcoming Occasions
 */

export function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

export function getDaysUntil(dateStr, refDate = new Date(2026, 10, 23)) {
  if (!dateStr) return -1;
  const parts = dateStr.split('-');
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  
  const target = new Date(refDate.getFullYear(), month, day);
  if (target < refDate && (target.getDate() !== refDate.getDate() || target.getMonth() !== refDate.getMonth())) {
    target.setFullYear(target.getFullYear() + 1);
  }
  return Math.round((target - refDate) / (1000 * 60 * 60 * 24));
}

export function getDueTodayReminders(contacts, refDate = new Date(2026, 10, 23), language = 'en') {
  const tomorrow = new Date(refDate);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowMonth = tomorrow.getMonth() + 1;
  const tomorrowDay = tomorrow.getDate();

  const reminders = [];
  contacts.forEach(c => {
    if (c.dob) {
      const parts = c.dob.split('-');
      if (parseInt(parts[1], 10) === tomorrowMonth && parseInt(parts[2], 10) === tomorrowDay) {
        reminders.push({
          contact: c,
          type: 'BIRTHDAY',
          title: language === 'hi' ? 'कल जन्मदिन है' : 'Birthday Tomorrow',
          message: language === 'hi' ? `कल ${c.fullName} का जन्मदिन है।` : `Tomorrow is ${c.fullName}'s birthday.`
        });
      }
    }
    if (c.anniversary) {
      const parts = c.anniversary.split('-');
      if (parseInt(parts[1], 10) === tomorrowMonth && parseInt(parts[2], 10) === tomorrowDay) {
        reminders.push({
          contact: c,
          type: 'ANNIVERSARY',
          title: language === 'hi' ? 'कल शादी की वर्षगांठ है' : 'Anniversary Tomorrow',
          message: language === 'hi' ? `कल ${c.fullName} की शादी की वर्षगांठ है।` : `Tomorrow is ${c.fullName}'s marriage anniversary.`
        });
      }
    }
  });
  return reminders;
}

export function getUpcomingOccasions(contacts, refDate = new Date(2026, 10, 23)) {
  const list = [];
  contacts.forEach(c => {
    if (c.dob) {
      const days = getDaysUntil(c.dob, refDate);
      if (days >= 0 && days <= 30) list.push({ contact: c, type: 'DOB', days, date: c.dob });
    }
    if (c.anniversary) {
      const days = getDaysUntil(c.anniversary, refDate);
      if (days >= 0 && days <= 30) list.push({ contact: c, type: 'ANNIVERSARY', days, date: c.anniversary });
    }
  });
  return list.sort((a, b) => a.days - b.days);
}
