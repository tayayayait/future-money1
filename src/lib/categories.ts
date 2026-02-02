import {
  Utensils,
  Car,
  ShoppingBag,
  Film,
  Heart,
  GraduationCap,
  Home,
  Zap,
  PiggyBank,
  TrendingUp,
  Briefcase,
  MoreHorizontal,
  type LucideIcon,
} from 'lucide-react';

export interface Category {
  id: string;
  name: string;
  icon: LucideIcon;
  colorClass: string;
  bgColorClass: string;
}

export const EXPENSE_CATEGORIES: Category[] = [
  {
    id: 'food',
    name: '식비',
    icon: Utensils,
    colorClass: 'text-category-food',
    bgColorClass: 'bg-category-food/10',
  },
  {
    id: 'transport',
    name: '교통',
    icon: Car,
    colorClass: 'text-category-transport',
    bgColorClass: 'bg-category-transport/10',
  },
  {
    id: 'shopping',
    name: '쇼핑',
    icon: ShoppingBag,
    colorClass: 'text-category-shopping',
    bgColorClass: 'bg-category-shopping/10',
  },
  {
    id: 'entertainment',
    name: '여가',
    icon: Film,
    colorClass: 'text-category-entertainment',
    bgColorClass: 'bg-category-entertainment/10',
  },
  {
    id: 'health',
    name: '건강',
    icon: Heart,
    colorClass: 'text-category-health',
    bgColorClass: 'bg-category-health/10',
  },
  {
    id: 'education',
    name: '교육',
    icon: GraduationCap,
    colorClass: 'text-category-education',
    bgColorClass: 'bg-category-education/10',
  },
  {
    id: 'housing',
    name: '주거',
    icon: Home,
    colorClass: 'text-category-housing',
    bgColorClass: 'bg-category-housing/10',
  },
  {
    id: 'utilities',
    name: '공과금',
    icon: Zap,
    colorClass: 'text-category-utilities',
    bgColorClass: 'bg-category-utilities/10',
  },
  {
    id: 'savings',
    name: '저축',
    icon: PiggyBank,
    colorClass: 'text-category-savings',
    bgColorClass: 'bg-category-savings/10',
  },
  {
    id: 'investment',
    name: '투자',
    icon: TrendingUp,
    colorClass: 'text-category-investment',
    bgColorClass: 'bg-category-investment/10',
  },
  {
    id: 'other',
    name: '기타',
    icon: MoreHorizontal,
    colorClass: 'text-category-other',
    bgColorClass: 'bg-category-other/10',
  },
];

export const INCOME_CATEGORIES: Category[] = [
  {
    id: 'salary',
    name: '급여',
    icon: Briefcase,
    colorClass: 'text-category-income',
    bgColorClass: 'bg-category-income/10',
  },
  {
    id: 'investment_income',
    name: '투자수익',
    icon: TrendingUp,
    colorClass: 'text-category-investment',
    bgColorClass: 'bg-category-investment/10',
  },
  {
    id: 'other_income',
    name: '기타수입',
    icon: MoreHorizontal,
    colorClass: 'text-category-other',
    bgColorClass: 'bg-category-other/10',
  },
];

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export function getCategoryById(id: string): Category | undefined {
  return ALL_CATEGORIES.find(cat => cat.id === id);
}
