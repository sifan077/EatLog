import { NextRequest } from 'next/server';
import { getAiRecommendationData } from '../../actions';
import { buildMealRecommendationPrompt } from '@/utils/ai-prompt';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mealType } = body;

    // 获取用户档案和最近7天的饮食记录
    const { profile, recentMeals } = await getAiRecommendationData();

    // 构建AI推荐提示词
    const prompt = buildMealRecommendationPrompt(profile, recentMeals, mealType || 'dinner');

    // 从环境变量读取配置
    const aiBaseUrl = process.env.AI_BASE_URL;
    const modelName = process.env.MODEL_NAME;
    const apiKey = process.env.API_KEY;

    if (!aiBaseUrl || !modelName || !apiKey) {
      throw new Error('AI配置缺失，请检查环境变量');
    }

    // 调用LLM API（使用流式响应）
    const response = await fetch(aiBaseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
        stream: true, // 启用流式响应
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('LLM API error:', {
        status: response.status,
        statusText: response.statusText,
        url: aiBaseUrl,
        error: errorText,
      });
      throw new Error(`LLM API调用失败: ${response.status} - ${errorText}`);
    }

    // 创建流式响应
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error('无法读取响应流');
          }

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            // 解析SSE格式的数据
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') {
                  controller.close();
                  return;
                }

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    controller.enqueue(encoder.encode(content));
                  }
                } catch (e) {
                  console.error('解析SSE数据失败:', e);
                }
              }
            }
          }
        } catch (error) {
          console.error('流式响应错误:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in AI recommendation API:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
