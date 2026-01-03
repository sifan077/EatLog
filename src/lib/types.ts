// Meal Log Types
export interface MealLog {
  id: string;
  user_id: string;
  photo_paths: string[];
  content: string | null;
  meal_type: MealType;
  eaten_at: string;
  location: string | null;
  tags: string[] | null;
  price: number;
  created_at: string;
  updated_at: string;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'afternoon_snack' | 'evening_snack' | 'snack';

export interface MealLogInput {
  photo_paths: string[];
  content?: string;
  meal_type: MealType;
  eaten_at?: string;
  location?: string;
  tags?: string[];
  price?: number;
}

export interface MealLogUpdate extends Partial<MealLogInput> {
  id: string;
}