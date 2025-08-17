/**
 * Custody Schedule Calculator
 * 
 * 14-day repeating cycle starting Monday, August 18, 2025
 * Week 1: Mom has Mon/Tue & Fri-Sun, You have Wed/Thu
 * Week 2: You have Mon/Tue & Fri-Sun, Mom has Wed/Thu
 */

// Sunday, Week 1, Day 0 - You have Child this weekend
// Using UTC to avoid timezone issues
const CYCLE_START = new Date(Date.UTC(2025, 7, 17, 0, 0, 0)); // Note: month is 0-indexed, so 7 = August

/**
 * Calculate who has custody on a given date
 * @param {Date|string} date - The date to check
 * @returns {Object} Custody information for that date
 */
function getCustodyStatus(date) {
  let checkDate;
  
  // Handle both Date objects and strings
  if (typeof date === 'string') {
    // Parse date string as UTC to avoid timezone issues
    const [year, month, day] = date.split('-').map(num => parseInt(num));
    checkDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
  } else {
    // Convert to UTC date
    checkDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0));
  }
  
  // Calculate days since cycle start (both in UTC)
  const daysDiff = Math.floor((checkDate - CYCLE_START) / (1000 * 60 * 60 * 24));
  
  // Handle dates before cycle start
  if (daysDiff < 0) {
    // Calculate backwards - the pattern extends infinitely in both directions
    const daysBeforeCycle = Math.abs(daysDiff);
    const cyclePosition = (14 - (daysBeforeCycle % 14)) % 14;
    return calculateCustodyForPosition(cyclePosition, checkDate);
  }
  
  // Calculate position in 14-day cycle (0-13)
  const cyclePosition = daysDiff % 14;
  
  return calculateCustodyForPosition(cyclePosition, checkDate);
}

/**
 * Determine custody based on position in cycle
 * @param {number} position - Day position in 14-day cycle (0-13)
 * @param {Date} date - The actual date for additional info
 */
function calculateCustodyForPosition(position, date) {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const weekInCycle = position < 7 ? 1 : 2;
  
  // Map cycle position to day pattern
  // Position 0 = Sunday of Week 1, Position 1 = Monday of Week 1, etc.
  const dayPosition = position % 7;
  
  // Week 1 pattern (days 0-6) - Starting Sunday Aug 17 (YOU have weekend)
  const week1Pattern = {
    0: { custody: 'you', overnight: true },                   // Sunday (Day 0)
    1: { custody: 'mom', dropoff: 'you', pickup: 'mom' },    // Monday (Day 1)
    2: { custody: 'mom', dropoff: 'mom', pickup: 'mom' },    // Tuesday (Day 2)
    3: { custody: 'you', dropoff: 'mom', pickup: 'you' },    // Wednesday (Day 3)
    4: { custody: 'you', dropoff: 'you', pickup: 'you' },    // Thursday (Day 4)
    5: { custody: 'mom', dropoff: 'you', pickup: 'mom' },    // Friday (Day 5)
    6: { custody: 'mom', overnight: true }                    // Saturday (Day 6)
  };
  
  // Week 2 pattern (days 7-13) - Starting Sunday Aug 24 (MOM has weekend)
  const week2Pattern = {
    0: { custody: 'mom', overnight: true },                   // Sunday (Day 7)
    1: { custody: 'you', dropoff: 'mom', pickup: 'you' },    // Monday (Day 8)
    2: { custody: 'you', dropoff: 'you', pickup: 'you' },    // Tuesday (Day 9)
    3: { custody: 'mom', dropoff: 'you', pickup: 'mom' },    // Wednesday (Day 10)
    4: { custody: 'mom', dropoff: 'mom', pickup: 'mom' },    // Thursday (Day 11)
    5: { custody: 'you', dropoff: 'mom', pickup: 'you' },    // Friday (Day 12)
    6: { custody: 'you', overnight: true }                    // Saturday (Day 13)
  };
  
  const pattern = weekInCycle === 1 ? week1Pattern : week2Pattern;
  const dayInfo = pattern[dayPosition];  // Use position in cycle, not day of week
  
  // Debug info
  if (!dayInfo) {
    console.error(`Missing dayInfo for position ${dayPosition} in week ${weekInCycle}`);
  }
  
  return {
    date: date.toISOString().split('T')[0],
    custody: dayInfo?.custody || 'unknown',
    isYourDay: dayInfo?.custody === 'you',
    weekInCycle,
    dayOfWeek,
    dayPosition,  // Add for debugging
    dropoff: dayInfo?.dropoff || null,
    pickup: dayInfo?.pickup || null,
    isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
    isTransitionDay: dayInfo?.dropoff && dayInfo?.pickup && dayInfo.dropoff !== dayInfo.pickup
  };
}

/**
 * Get custody schedule for a date range
 * @param {Date|string} startDate 
 * @param {Date|string} endDate 
 */
function getCustodyRange(startDate, endDate) {
  const schedule = [];
  const current = new Date(startDate);
  const end = new Date(endDate);
  
  while (current <= end) {
    schedule.push(getCustodyStatus(current));
    current.setDate(current.getDate() + 1);
  }
  
  return schedule;
}

/**
 * Find next available date night (when you don't have Child)
 * @param {Date|string} fromDate - Start searching from this date
 * @param {number} count - How many date nights to find
 */
function getNextDateNights(fromDate = new Date(), count = 5) {
  const dateNights = [];
  const current = new Date(fromDate);
  current.setHours(12, 0, 0, 0);  // Set to noon to avoid DST issues
  
  // Look up to 60 days ahead
  for (let i = 0; i < 60 && dateNights.length < count; i++) {
    const status = getCustodyStatus(current);
    
    // Good for date night if you don't have custody
    if (!status.isYourDay) {
      dateNights.push({
        date: status.date,
        dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][status.dayOfWeek],
        isWeekend: status.isWeekend,
        daysAway: i
      });
    }
    
    current.setDate(current.getDate() + 1);
  }
  
  return dateNights;
}

/**
 * Get a month's custody calendar
 * @param {number} year 
 * @param {number} month (0-11)
 */
function getMonthCustody(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  return getCustodyRange(firstDay, lastDay);
}

export {
  getCustodyStatus,
  getCustodyRange,
  getNextDateNights,
  getMonthCustody
};