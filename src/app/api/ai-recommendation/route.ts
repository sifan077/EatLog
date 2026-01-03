import { NextRequest, NextResponse } from 'next/server';
import { getAiRecommendationData } from '../../actions';
import { buildMealRecommendationPrompt } from '@/utils/ai-prompt';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mealType } = body;

    // 获取用户档案和最近7天的饮食记录
    const { profile, recentMeals } = await getAiRecommendationData();

    // 构建AI推荐提示词
    const prompt = buildMealRecommendationPrompt(
      profile,
      recentMeals,
      mealType || 'dinner'
    );

    return NextResponse.json({
      success: true,
      prompt,
    });
  } catch (error) {
    console.error('Error in AI recommendation API:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}