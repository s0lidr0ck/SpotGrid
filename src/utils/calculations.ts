import { DayPart } from '../pages/EstimateDetails';

interface EstimateItem {
  id: string;
  dayPartId: string;
  specificDate: string;
  userDefinedCpm: number;
  spotsPerOccurrence: number;
}

/**
 * Calculate weekly spend for estimate items
 */
export const calculateWeeklySpend = (items: EstimateItem[], dayParts: DayPart[]): number => {
  return items.reduce((sum, item) => {
    const dayPart = dayParts.find(dp => dp.id === item.dayPartId);
    if (!dayPart) return sum;

    const impressions = dayPart.expectedViews * item.spotsPerOccurrence * dayPart.days;
    return sum + (impressions / 1000) * item.userDefinedCpm;
  }, 0);
};

/**
 * Calculate weekly impressions for estimate items
 */
export const calculateWeeklyImpressions = (items: EstimateItem[], dayParts: DayPart[]): number => {
  return items.reduce((sum, item) => {
    const dayPart = dayParts.find(dp => dp.id === item.dayPartId);
    if (!dayPart) return sum;

    return sum + (dayPart.expectedViews * item.spotsPerOccurrence * dayPart.days);
  }, 0);
};

/**
 * Calculate budget duration in weeks
 */
export const calculateBudgetDuration = (totalBudget: number, weeklySpend: number): string => {
  if (!weeklySpend || weeklySpend <= 0) return 'N/A';
  
  const totalWeeks = totalBudget / weeklySpend;
  const weeks = Math.floor(totalWeeks);
  const days = Math.round((totalWeeks - weeks) * 7);
  
  if (weeks === 0) {
    return `${days} day${days !== 1 ? 's' : ''}`;
  } else if (days === 0) {
    return `${weeks} week${weeks !== 1 ? 's' : ''}`;
  } else {
    return `${weeks} week${weeks !== 1 ? 's' : ''}, ${days} day${days !== 1 ? 's' : ''}`;
  }
};

/**
 * Format currency
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Format number with commas
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(Math.round(num));
};