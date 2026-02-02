/**
 * Format a number as Korean Won currency
 */
export function formatCurrency(value: number, showSign = false): string {
  const absValue = Math.abs(value);
  const formatted = new Intl.NumberFormat('ko-KR').format(absValue);
  
  if (showSign && value !== 0) {
    return value > 0 ? `+${formatted}원` : `-${formatted}원`;
  }
  
  return `${value < 0 ? '-' : ''}${formatted}원`;
}

/**
 * Format a number with thousands separator
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('ko-KR').format(value);
}

/**
 * Format a percentage
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format a date in Korean format
 */
export function formatDate(date: Date | string, format: 'short' | 'medium' | 'long' = 'medium'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  switch (format) {
    case 'short':
      return new Intl.DateTimeFormat('ko-KR', {
        month: 'numeric',
        day: 'numeric',
      }).format(d);
    case 'long':
      return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      }).format(d);
    default:
      return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      }).format(d);
  }
}

/**
 * Format relative time (e.g., "3일 전", "1시간 전")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays}일 전`;
  } else if (diffHours > 0) {
    return `${diffHours}시간 전`;
  } else if (diffMins > 0) {
    return `${diffMins}분 전`;
  } else {
    return '방금 전';
  }
}

/**
 * Abbreviate large numbers (e.g., 1000000 -> "100만")
 */
export function abbreviateNumber(value: number): string {
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (absValue >= 100000000) {
    return `${sign}${(absValue / 100000000).toFixed(1)}억`;
  } else if (absValue >= 10000) {
    return `${sign}${(absValue / 10000).toFixed(1)}만`;
  } else if (absValue >= 1000) {
    return `${sign}${(absValue / 1000).toFixed(1)}천`;
  }
  
  return formatNumber(value);
}
