import { MealLog, UserProfile } from '@/lib/types';
import { MEAL_TYPES } from '@/lib/constants';

/**
 * 构建AI饮食指导的提示词
 * @param userProfile 用户档案
 * @param recentMeals 最近7天的饮食记录
 * @param currentMeal 当前要记录的饮食（可选，用于实时指导）
 * @returns 结构化的AI提示词
 */
export function buildDietGuidancePrompt(
  userProfile: UserProfile,
  recentMeals: MealLog[],
  currentMeal?: MealLog
): string {
  // 1. 用户基本信息部分
  const userSection = buildUserProfileSection(userProfile);

  // 2. 前7天饮食记录部分
  const recentMealsSection = buildRecentMealsSection(recentMeals);

  // 3. 当前饮食部分（如果有）
  const currentMealSection = currentMeal ? buildCurrentMealSection(currentMeal) : '';

  // 4. 分析请求部分
  const requestSection = buildRequestSection(!!currentMeal);

  return `${userSection}

${recentMealsSection}

${currentMealSection}

${requestSection}`;
}

/**
 * 构建用户档案部分
 */
function buildUserProfileSection(profile: UserProfile): string {
  const lines = [
    '## 用户档案信息',
    '',
    `姓名: ${profile.display_name || '未设置'}`,
    `身高: ${profile.height ? `${profile.height} cm` : '未设置'}`,
    `体重: ${profile.weight ? `${profile.weight} kg` : '未设置'}`,
    `活动水平: ${getActivityLevelLabel(profile.activity_level)}`,
    `每日卡路里目标: ${profile.daily_calorie_target ? `${profile.daily_calorie_target} kcal` : '未设置'}`,
    '',
    '### 饮食目标',
    profile.diet_goals && profile.diet_goals.length > 0
      ? profile.diet_goals.map((goal) => `- ${goal}`).join('\n')
      : '- 未设置',
    '',
    '### 饮食限制（重要：推荐时必须严格遵守）',
    profile.dietary_restrictions && profile.dietary_restrictions.length > 0
      ? profile.dietary_restrictions
          .map((restriction) => `- ${restriction}（绝对不能包含相关食材）`)
          .join('\n')
      : '- 无',
    '',
    '### 过敏原（重要：推荐时必须完全避免）',
    profile.allergies && profile.allergies.length > 0
      ? profile.allergies.map((allergy) => `- ${allergy}（绝对不能包含此类食物）`).join('\n')
      : '- 无',
  ];

  return lines.join('\n');
}

/**
 * 构建最近7天饮食记录部分
 */
function buildRecentMealsSection(meals: MealLog[]): string {
  // 计算实际有多少天的数据
  const uniqueDates = new Set(
    meals.map((meal) => new Date(meal.eaten_at).toLocaleDateString('zh-CN'))
  );
  const daysCount = uniqueDates.size;

  if (meals.length === 0) {
    return '## 饮食记录\n\n暂无记录，请先记录一些饮食数据以便AI提供更准确的建议。';
  }

  // 按日期分组
  const mealsByDate = groupMealsByDate(meals);

  const lines = [
    `## 饮食记录`,
    '',
    `*注：目前有 ${daysCount} 天的饮食记录，共 ${meals.length} 餐。建议记录更多天数的饮食数据以获得更准确的个性化建议。*`,
    '',
  ];

  Object.entries(mealsByDate).forEach(([date, dayMeals]) => {
    lines.push(`### ${date}`);
    lines.push('');

    dayMeals.forEach((meal) => {
      const mealType = MEAL_TYPES.find((mt) => mt.value === meal.meal_type);
      const time = new Date(meal.eaten_at).toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
      });

      lines.push(`**${mealType?.label || meal.meal_type}** ${time}`);
      lines.push(`- 描述: ${meal.content || '无'}`);
      lines.push('');
    });
  });

  return lines.join('\n');
}

/**
 * 构建当前饮食部分
 */
function buildCurrentMealSection(meal: MealLog): string {
  const mealType = MEAL_TYPES.find((mt) => mt.value === meal.meal_type);
  const time = new Date(meal.eaten_at).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const lines = [
    '## 当前饮食记录',
    '',
    `**${mealType?.label || meal.meal_type}** ${time}`,
    `- 描述: ${meal.content || '无'}`,
  ];

  return lines.join('\n');
}

/**
 * 构建分析请求部分
 */
function buildRequestSection(hasCurrentMeal: boolean): string {
  const lines = [
    '## 分析请求',
    '',
    '你是一位专业的营养师，擅长制定科学、健康的减脂饮食计划。',
    '',
    '请根据我的饮食历史、热量摄入趋势、营养均衡情况以及减脂目标，',
    '为我推荐下一顿（即**今天下一餐**）的具体菜品。',
    '',
    '## 输出要求',
    '',
    '请用清晰、简洁的中文回复，先简要分析我的近期饮食情况，再给出具体的一餐推荐。',
    '',
    '### 第一部分：近期饮食分析',
    '- 分析我的饮食记录，注意如果数据不足7天，请基于现有信息给出分析',
    '- 如果有足够数据，估算每日热量摄入趋势',
    '- 评估营养均衡情况（蛋白质、碳水、脂肪比例）',
    '- 指出饮食的优缺点',
    '- 如果发现明显的营养失衡（如蛋白质不足、碳水过低等），请明确指出',
    '- 如果数据不足，请说明并基于用户档案信息给出一般性建议',
    '',
    '### 第二部分：下一餐推荐',
    '',
    '推荐要求：',
    '- **热量控制**：根据我的减脂目标，估算合理的热量范围并据此分配',
    '- **营养比例**：明确主食、蛋白质、蔬菜的比例建议（如碳水:蛋白质:蔬菜 = 4:3:3）',
    '- **食材选择**：使用常见的、容易购买的食材',
    '- **适合场景**：适合外卖或简单搭配，不需要复杂烹饪',
    '- **避免食物**：避免高糖、高油、深加工食品',
    '- **严格遵守限制**：绝对不要推荐包含用户饮食限制中的食材（如素食、无麸质等）',
    '- **完全避免过敏原**：绝对不要推荐包含用户过敏原的任何食物',
    '- **符合目标**：考虑我的饮食目标和饮食限制',
    '',
    '推荐格式：',
    '```\n**推荐菜品**：xxx\n\n**主要食材**：\n- 主食：xxx\n- 蛋白质：xxx\n- 蔬菜：xxx\n\n**营养价值**：约 xxx kcal\n\n**营养亮点**：xxx\n```',
    '',
    '### 第三部分：额外建议',
    '- 提供2-3条实用的饮食改进建议',
    '- 提醒需要注意的事项或风险',
    '- 如果数据不足，建议用户继续记录更多饮食数据',
    '',
    '## 注意事项',
    '- 如果信息不足（如缺少身高体重数据或饮食记录太少），请明确指出',
    '- 建议要具体、实用，避免空泛',
    '- 充分考虑我的个人情况和偏好',
    '- 输出格式使用Markdown，便于阅读',
  ];

  return lines.join('\n');
}

/**
 * 将饮食记录按日期分组
 */
function groupMealsByDate(meals: MealLog[]): Record<string, MealLog[]> {
  const grouped: Record<string, MealLog[]> = {};

  meals.forEach((meal) => {
    const date = new Date(meal.eaten_at).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    if (!grouped[date]) {
      grouped[date] = [];
    }

    grouped[date].push(meal);
  });

  return grouped;
}

/**
 * 获取活动水平的中文标签
 */
function getActivityLevelLabel(level: string | null): string {
  const labels: Record<string, string> = {
    sedentary: '久坐不动（几乎不运动）',
    light: '轻度活动（每周运动 1-3 天）',
    moderate: '中度活动（每周运动 3-5 天）',
    active: '高度活动（每周运动 6-7 天）',
    very_active: '非常活跃（每天运动或体力劳动）',
  };

  return labels[level || ''] || '未设置';
}

/**
 * 构建简化的提示词（用于快速食谱推荐）
 */
export function buildQuickDietPrompt(
  userProfile: UserProfile,
  recentMeals: MealLog[],
  nextMealType?: 'breakfast' | 'lunch' | 'dinner' | 'afternoon_snack' | 'evening_snack' | 'snack'
): string {
  const summary = buildDietSummary(userProfile, recentMeals);
  const mealLabel = nextMealType
    ? MEAL_TYPES.find((mt) => mt.value === nextMealType)?.label
    : '下一餐';

  return `作为一位专业的营养师，请基于以下信息为用户推荐${mealLabel}：

${summary}

请提供：
1. 简要分析近期饮食情况（1-2句话）
2. 推荐一道具体的菜品（包括菜名、主要食材）
3. 营养价值和热量估算

要求：
- 食材常见、适合外卖或简单搭配
- 符合减脂目标
- 避免高糖、高油、深加工食品
- 每部分不超过100字`;
}

/**
 * 构建饮食摘要
 */
function buildDietSummary(profile: UserProfile, meals: MealLog[]): string {
  const mealCount = meals.length;
  const uniqueDates = new Set(
    meals.map((meal) => new Date(meal.eaten_at).toLocaleDateString('zh-CN'))
  );
  const daysCount = uniqueDates.size;

  const lines = [
    `用户: ${profile.display_name || '未设置'}`,
    `目标: ${profile.diet_goals?.join(', ') || '未设置'}`,
    `活动水平: ${getActivityLevelLabel(profile.activity_level)}`,
    `记录天数: ${daysCount} 天`,
    `总记录数: ${mealCount} 餐`,
  ];

  return lines.join('\n');
}

/**
 * 获取出现频率最高的标签
 */
function getTopTags(tags: string[], limit: number): string[] {
  const counts: Record<string, number> = {};

  tags.forEach((tag) => {
    counts[tag] = (counts[tag] || 0) + 1;
  });

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag]) => tag);
}

/**
 * 构建食谱推荐提示词（专注于具体食谱推荐）
 * @param userProfile 用户档案
 * @param recentMeals 最近7天的饮食记录
 * @param nextMealType 下一餐的餐次类型（如 'lunch', 'dinner'）
 * @returns 结构化的食谱推荐提示词
 */
/**
 * 构建今日饮食数据部分
 */
function buildTodayMealsSection(
  meals: MealLog[],
  nextMealType: 'breakfast' | 'lunch' | 'dinner' | 'afternoon_snack' | 'evening_snack' | 'snack'
): string {
  if (meals.length === 0) {
    return '## 今日饮食\n\n今天还没有记录任何饮食。';
  }

  const lines = ['## 今日饮食', '', `*注：今天已记录 ${meals.length} 餐。*`, ''];

  // 按餐次分组
  const mealsByType: Record<string, MealLog[]> = {};
  meals.forEach((meal) => {
    if (!mealsByType[meal.meal_type]) {
      mealsByType[meal.meal_type] = [];
    }
    mealsByType[meal.meal_type].push(meal);
  });

  // 按餐次顺序显示
  const mealTypeOrder = [
    'breakfast',
    'lunch',
    'afternoon_snack',
    'dinner',
    'evening_snack',
    'snack',
  ];

  mealTypeOrder.forEach((type) => {
    const typeMeals = mealsByType[type];
    if (typeMeals && typeMeals.length > 0) {
      const mealType = MEAL_TYPES.find((mt) => mt.value === type);
      lines.push(`### ${mealType?.label || type}`);
      lines.push('');

      typeMeals.forEach((meal) => {
        const time = new Date(meal.eaten_at).toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit',
        });

        lines.push(`- ${time}: ${meal.content || '无描述'}`);
        if (meal.price > 0) {
          lines.push(`  价格: ¥${meal.price.toFixed(2)}`);
        }
        if (meal.location) {
          lines.push(`  地点: ${meal.location}`);
        }
        if (meal.tags && meal.tags.length > 0) {
          lines.push(`  标签: ${meal.tags.join(', ')}`);
        }
        lines.push('');
      });
    }
  });

  return lines.join('\n');
}

/**
 * 构建今日总结的提示词
 */
export function buildTodaySummaryPrompt(
  userProfile: UserProfile,
  todayMeals: MealLog[],
  recentMeals: MealLog[]
): string {
  const userSection = buildUserProfileSection(userProfile);
  const todayMealsSection = buildTodayMealsSection(todayMeals, 'dinner'); // 使用任意值，不影响显示

  const requestSection = `
## 今日饮食总结请求

你是一位专业的营养师，擅长分析饮食记录并提供健康建议。

请根据我今天的饮食记录，为我提供一份详细的今日饮食总结。

## 输出要求

请按以下格式输出：

### 第一部分：今日饮食概览
- 今日共记录了几餐
- 按餐次列出所有食物（包括时间、描述、价格、地点）
- 如果有标签，也一并列出

### 第二部分：热量分析
- 估算今日总热量摄入
- 与每日目标热量对比（如果有设置）
- 分析热量分布是否合理

### 第三部分：营养分析
- 分析蛋白质、碳水、脂肪的摄入情况
- 评估营养均衡程度
- 指出营养亮点和不足

### 第四部分：饮食评价
- 今日饮食的优点
- 需要改进的地方
- 是否符合减脂目标

### 第五部分：改进建议
- 2-3条具体的饮食改进建议
- 明天可以尝试的食物搭配
- 需要注意的事项

## 注意事项
- 如果今天没有记录，请明确指出并建议开始记录
- 建议要具体、实用，避免空泛
- 充分考虑我的个人情况和偏好
- 使用Markdown格式输出
- 如果数据不足，请说明并基于用户档案给出一般性建议
`;

  return `${userSection}

${todayMealsSection}

${requestSection}`;
}

export function buildMealRecommendationPrompt(
  userProfile: UserProfile,
  recentMeals: MealLog[],
  nextMealType: 'breakfast' | 'lunch' | 'dinner' | 'afternoon_snack' | 'evening_snack' | 'snack',
  todayMeals?: MealLog[]
): string {
  const userSection = buildUserProfileSection(userProfile);
  const recentMealsSection = buildRecentMealsSection(recentMeals);
  const todayMealsSection = todayMeals ? buildTodayMealsSection(todayMeals, nextMealType) : '';
  const nextMealLabel = MEAL_TYPES.find((mt) => mt.value === nextMealType)?.label || nextMealType;

  const requestSection = `
## 食谱推荐请求

你是一位专业的营养师，擅长制定科学、健康的减脂饮食计划。

请根据我的饮食历史、热量摄入趋势、营养均衡情况以及减脂目标，
为我推荐**今天${nextMealLabel}**的具体食谱。

**重要：请重点参考"今日饮食"部分，根据今天已经摄入的食物来调整推荐！**

## 推荐要求

### 热量控制
- 根据我的减脂目标，估算合理的热量范围
- **重点考虑我今日已摄入的热量**，确保全天热量不超标
- 如果今天已经摄入较多，推荐低热量或清淡的菜品
- 明确标注这餐的推荐热量范围

### 营养比例
- 明确主食、蛋白质、蔬菜的比例建议
- 确保营养均衡，符合减脂需求
- **根据今日已摄入的营养状况调整**，避免营养重复或缺失
- 如果今天蛋白质不足，适当增加蛋白质推荐

### 食材选择
- 使用常见的、容易购买的食材
- 考虑我的饮食限制和过敏原
- 避免高糖、高油、深加工食品
- 推荐适合外卖或简单搭配的菜品
- 推荐学校食堂能吃到的

## 输出格式

请按以下格式输出：

### 第一部分：今日饮食总结
- 总结今天已经摄入的食物
- 估算今日已摄入的热量（如果有价格信息，可以参考）
- 分析今日营养摄入情况（蛋白质、碳水、脂肪等）
- 指出今日饮食的优缺点

### 第二部分：近期饮食分析（7天）
简要分析我过去7天的饮食情况，如果不足7天就是我还没有记录够，包括：
- 热量摄入趋势
- 营养均衡状况
- 存在的问题和改进方向

### 第三部分：${nextMealLabel}推荐


**推荐菜品**：xxx

**主要食材**：
- 主食：xxx
- 蛋白质：xxx
- 蔬菜：xxx
- 其他：xxx（可选）

**营养组成**：
- 热量：约 xxx kcal
- 蛋白质：约 xx 克
- 碳水化合物：约 xx 克
- 脂肪：约 xx 克

**营养亮点**：xxx

### 第四部分：额外建议
- 2-3条实用的饮食建议
- 注意事项或风险提示

## 注意事项
- 如果信息不足，请明确指出需要补充的信息
- 建议要具体、实用，避免空泛
- 充分考虑我的个人情况和偏好，不要出现我不吃的
- **重点考虑今日已摄入的数据，确保推荐合理**
- 使用Markdown格式输出
`;

  return `${userSection}

${recentMealsSection}

${todayMealsSection}

${requestSection}`;
}
