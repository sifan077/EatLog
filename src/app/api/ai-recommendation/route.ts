import { NextRequest } from 'next/server';
import { getAiRecommendationData } from '../../actions';
import { buildMealRecommendationPrompt } from '@/utils/ai-prompt';

// 强制使用动态路由，避免Vercel的静态优化
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60; // Vercel Pro支持60秒，免费版10秒

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

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
      // 添加超时配置
      signal: AbortSignal.timeout(55000), // 55秒超时，留一些余量
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
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error('无法读取响应流');
          }

          let buffer = ''; // 缓冲区用于处理分片数据

          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              controller.close();
              break;
            }

            // 解析SSE格式的数据
            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;

            // 按行分割
            const lines = buffer.split('\n');

            // 保留最后一行（可能不完整）
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmedLine = line.trim();

              // 跳过空行
              if (!trimmedLine) continue;

              // 检查是否是SSE数据行
              if (trimmedLine.startsWith('data: ')) {
                const data = trimmedLine.slice(6).trim();

                // 检查是否是结束标记
                if (data === '[DONE]') {
                  controller.close();
                  return;
                }

                // 跳过空数据
                if (!data) continue;

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    controller.enqueue(encoder.encode(content));
                  }
                } catch (e) {
                  // JSON解析失败，记录错误但继续处理
                  console.error('解析SSE数据失败:', {
                    error: e instanceof Error ? e.message : e,
                    data: data.substring(0, 100), // 只记录前100字符
                  });
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
        'Cache-Control': 'no-cache, no-transform',
        'X-Accel-Buffering': 'no', // 禁用nginx缓冲
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in AI recommendation API:', error);

    // 如果是超时错误，返回特殊消息
    const isTimeout =
      error instanceof Error && (error.name === 'AbortError' || error.message.includes('timeout'));

    return new Response(
      JSON.stringify({
        success: false,
        error: isTimeout
          ? '请求超时，请重试'
          : error instanceof Error
            ? error.message
            : 'Unknown error',
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
