import { UserProfile, MealLog, NutritionAnalysis, DietRecommendation } from '@/lib/types';
import { getStartOfDay, getEndOfDay } from '@/utils/date';

// Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
export function calculateBMR(profile: UserProfile): number {
  const weight = profile.weight || 0;
  const height = profile.height || 0;
  const birthDate = profile.birth_date ? new Date(profile.birth_date) : new Date();
  const age = new Date().getFullYear() - birthDate.getFullYear();
  
  // Assume male for now (can be enhanced with gender field)
  const bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  
  return Math.round(bmr);
}

// Calculate TDEE (Total Daily Energy Expenditure)
export function calculateTDEE(profile: UserProfile): number {
  const bmr = calculateBMR(profile);
  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  
  const multiplier = activityMultipliers[profile.activity_level || 'moderate'] || 1.55;
  return Math.round(bmr * multiplier);
}

// Analyze nutrition from meal logs
export function analyzeNutrition(mealLogs: MealLog[], profile: UserProfile): NutritionAnalysis {
  const totalCalories = mealLogs.reduce((sum, meal) => sum + (meal.price || 0), 0);
  
  // Simple estimation: assume average meal has 500 calories
  // In production, you would have detailed nutrition data
  const estimatedCaloriesPerMeal = 500;
  const totalEstimatedCalories = mealLogs.length * estimatedCaloriesPerMeal;
  
  const averageCaloriesPerMeal = mealLogs.length > 0 
    ? Math.round(totalEstimatedCalories / mealLogs.length) 
    : 0;
  
  const tdee = calculateTDEE(profile);
  const targetCalories = profile.daily_calorie_target || tdee;
  
  // Generate recommendations
  const recommendations: DietRecommendation[] = [];
  
  // Calorie intake analysis
  if (mealLogs.length === 0) {
    recommendations.push({
      id: 'no-meals',
      title: '今日还没有记录',
      description: '开始记录你的第一餐吧！',
      category: 'tip',
      priority: 'high',
      icon: '🍽️',
    });
  } else if (totalEstimatedCalories > targetCalories * 1.2) {
    recommendations.push({
      id: 'high-calories',
      title: '卡路里摄入偏高',
      description: `今日已摄入约 ${totalEstimatedCalories} 卡路里，建议控制在 ${targetCalories} 卡路里以内`,
      category: 'warning',
      priority: 'high',
      icon: '⚠️',
    });
  } else if (totalEstimatedCalories < targetCalories * 0.6) {
    recommendations.push({
      id: 'low-calories',
      title: '卡路里摄入偏低',
      description: `今日仅摄入约 ${totalEstimatedCalories} 卡路里，建议适当增加营养摄入`,
      category: 'warning',
      priority: 'medium',
      icon: '📉',
    });
  } else {
    recommendations.push({
      id: 'good-calories',
      title: '卡路里摄入合理',
      description: `今日摄入约 ${totalEstimatedCalories} 卡路里，控制在目标范围内`,
      category: 'tip',
      priority: 'low',
      icon: '✅',
    });
  }
  
  // Meal frequency analysis
  if (mealLogs.length < 3) {
    recommendations.push({
      id: 'few-meals',
      title: '建议增加用餐次数',
      description: '建议每天至少 3 餐，保持规律的饮食习惯',
      category: 'tip',
      priority: 'medium',
      icon: '🍴',
    });
  }
  
  // Diet goals based recommendations
  if (profile.diet_goals) {
    if (profile.diet_goals.includes('减脂')) {
      recommendations.push({
        id: 'weight-loss',
        title: '减脂建议',
        description: '增加蛋白质摄入，减少精制碳水化合物，多吃蔬菜和瘦肉',
        category: 'meal',
        priority: 'medium',
        icon: '🥗',
      });
    }
    
    if (profile.diet_goals.includes('增肌')) {
      recommendations.push({
        id: 'muscle-gain',
        title: '增肌建议',
        description: '确保每餐都有优质蛋白质，训练后及时补充营养',
        category: 'meal',
        priority: 'medium',
        icon: '💪',
      });
    }
    
    if (profile.diet_goals.includes('健康饮食')) {
      recommendations.push({
        id: 'healthy-eating',
        title: '健康饮食建议',
        description: '多吃全谷物、蔬菜和水果，控制油盐糖的摄入',
        category: 'meal',
        priority: 'low',
        icon: '🥬',
      });
    }
  }
  
  // Dietary restrictions recommendations
  if (profile.dietary_restrictions) {
    if (profile.dietary_restrictions.includes('素食')) {
      recommendations.push({
        id: 'vegetarian',
        title: '素食建议',
        description: '注意补充蛋白质、维生素B12和铁，多吃豆类和坚果',
        category: 'tip',
        priority: 'medium',
        icon: '🥬',
      });
    }
    
    if (profile.dietary_restrictions.includes('低糖')) {
      recommendations.push({
        id: 'low-sugar',
        title: '低糖饮食建议',
        description: '避免含糖饮料和甜点，选择低GI食物',
        category: 'tip',
        priority: 'medium',
        icon: '🍵',
      });
    }
  }
  
  // Allergies warning
  if (profile.allergies && profile.allergies.length > 0) {
    recommendations.push({
      id: 'allergies',
      title: '过敏提醒',
      description: `注意避免以下过敏原：${profile.allergies.join('、')}`,
      category: 'warning',
      priority: 'high',
      icon: '🚫',
    });
  }
  
  return {
    totalCalories: totalEstimatedCalories,
    totalProtein: 0, // Would be calculated from detailed nutrition data
    totalCarbs: 0,
    totalFat: 0,
    averageCaloriesPerMeal,
    mealCount: mealLogs.length,
    recommendations,
  };
}

// Get meal suggestions based on profile
export function getMealSuggestions(profile: UserProfile): string[] {
  const suggestions: string[] = [];
  
  // Based on diet goals
  if (profile.diet_goals) {
    if (profile.diet_goals.includes('减脂')) {
      suggestions.push(
        '鸡胸肉沙拉',
        '清蒸鱼配蔬菜',
        '燕麦粥配水果',
        '烤鸡胸肉',
        '蔬菜汤'
      );
    }
    
    if (profile.diet_goals.includes('增肌')) {
      suggestions.push(
        '牛排配糙米饭',
        '鸡蛋配全麦面包',
        '三文鱼配蔬菜',
        '蛋白质奶昔',
        '鸡胸肉配土豆'
      );
    }
    
    if (profile.diet_goals.includes('健康饮食')) {
      suggestions.push(
        '蔬菜沙拉',
        '全麦三明治',
        '水果酸奶',
        '蒸蔬菜',
        '坚果拼盘'
      );
    }
  }
  
  // Based on dietary restrictions
  if (profile.dietary_restrictions) {
    if (profile.dietary_restrictions.includes('素食')) {
      suggestions.push(
        '豆腐蔬菜汤',
        '素食炒饭',
        '坚果沙拉',
        '全麦面包配牛油果',
        '豆浆配全麦馒头'
      );
    }
    
    if (profile.dietary_restrictions.includes('无麸质')) {
      suggestions.push(
        '米饭配蔬菜',
        '土豆泥',
        '玉米沙拉',
        '藜麦碗',
        '水果拼盘'
      );
    }
  }
  
  // Default suggestions
  if (suggestions.length === 0) {
    suggestions.push(
      '均衡营养餐',
      '蔬菜沙拉',
      '全麦三明治',
      '水果酸奶',
      '坚果拼盘'
    );
  }
  
  return suggestions.slice(0, 5);
}