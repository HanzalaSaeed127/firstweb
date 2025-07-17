import { PricingRule } from '../types';
import { format, getDay } from 'date-fns';

export const calculatePrice = (
  basePrice: number,
  date: Date,
  time: string,
  duration: number,
  pricingRules: PricingRule[]
): { finalPrice: number; discountApplied: number; discountDetails: string[] } => {
  let totalDiscount = 0;
  const discountDetails: string[] = [];
  
  const dayOfWeek = getDay(date);
  const timeHour = parseInt(time.split(':')[0]);
  
  // Check weekday discount
  const weekdayRule = pricingRules.find(rule => 
    rule.type === 'weekday' && 
    rule.isActive && 
    rule.condition.daysOfWeek?.includes(dayOfWeek)
  );
  
  if (weekdayRule) {
    totalDiscount += weekdayRule.discount;
    discountDetails.push(`Weekday discount: ${weekdayRule.discount}%`);
  }
  
  // Check bulk booking discount
  const bulkRules = pricingRules
    .filter(rule => rule.type === 'bulk' && rule.isActive)
    .sort((a, b) => (b.condition.minHours || 0) - (a.condition.minHours || 0));
  
  for (const rule of bulkRules) {
    if (rule.condition.minHours && duration >= rule.condition.minHours) {
      totalDiscount += rule.discount;
      discountDetails.push(`${rule.condition.minHours}+ hours discount: ${rule.discount}%`);
      break;
    }
  }
  
  // Check off-peak discount
  const offPeakRule = pricingRules.find(rule => 
    rule.type === 'off-peak' && 
    rule.isActive && 
    rule.condition.timeRange
  );
  
  if (offPeakRule && offPeakRule.condition.timeRange) {
    const startHour = parseInt(offPeakRule.condition.timeRange.start.split(':')[0]);
    const endHour = parseInt(offPeakRule.condition.timeRange.end.split(':')[0]);
    
    if (timeHour >= startHour && timeHour < endHour) {
      totalDiscount += offPeakRule.discount;
      discountDetails.push(`Off-peak discount: ${offPeakRule.discount}%`);
    }
  }
  
  // Cap total discount at 50%
  totalDiscount = Math.min(totalDiscount, 50);
  
  const totalPrice = basePrice * duration;
  const discountAmount = (totalPrice * totalDiscount) / 100;
  const finalPrice = totalPrice - discountAmount;
  
  return {
    finalPrice: Math.round(finalPrice),
    discountApplied: totalDiscount,
    discountDetails
  };
};

export const formatCurrency = (amount: number) => {
  return `PKR ${amount.toLocaleString()}`;
};