/**
 * ============================================
 * TIME UTILS — Utility xử lý giờ AM/PM
 * ============================================
 */

/**
 * Convert 24h (HH:mm) → 12h (h:mm AM/PM) theo tiếng Việt
 * VD: "14:30" → "2:30 CH"
 */
export function convertTo12hFormat(time24: string): string {
  if (!time24) return '';
  
  const [hours, minutes] = time24.split(':');
  let h = parseInt(hours);
  const m = minutes;
  
  const period = h >= 12 ? 'CH' : 'SA'; // CH = Chiều, SA = Sáng
  if (h > 12) h -= 12;
  if (h === 0) h = 12;
  
  return `${h}:${m} ${period}`;
}

/**
 * Convert 12h (h:mm AM/PM) → 24h (HH:mm) theo tiếng Việt
 * VD: "2:30 CH" → "14:30"
 */
export function convertTo24hFormat(time12: string): string {
  if (!time12) return '';
  
  // Parse "h:mm SA/CH"
  const match = time12.match(/^(\d{1,2}):(\d{2})\s*(SA|CH)$/i);
  if (!match) return '';
  
  let h = parseInt(match[1]);
  const m = match[2];
  const period = match[3].toUpperCase();
  
  if (period === 'CH' && h !== 12) {
    h += 12;
  } else if (period === 'SA' && h === 12) {
    h = 0;
  }
  
  return `${String(h).padStart(2, '0')}:${m}`;
}

/**
 * Format giờ để hiển thị
 * VD: "07:00" → "7:00 Sáng" hoặc "14:00" → "2:00 Chiều"
 */
export function formatTimeDisplay(time24: string): string {
  if (!time24) return 'N/A';
  
  const [hours, minutes] = time24.split(':');
  let h = parseInt(hours);
  
  const period = h >= 12 ? 'Chiều' : 'Sáng';
  if (h > 12) h -= 12;
  if (h === 0) h = 12;
  
  return `${h}:${minutes} ${period}`;
}
