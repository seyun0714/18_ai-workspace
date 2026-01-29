import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    if (!message) {
      return NextResponse.json(
        {
          success: false,
          error: '메시지가 누락되었습니다.',
        },
        { status: 400 },
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'OpenAI API 키가 존재하지 않습니다.',
        },
        { status: 500 },
      );
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant. Respond in Korean.',
          },
          {
            role: 'user',
            content: message,
          },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: 'OpenAI API 오류',
        },
        { status: response.status },
      );
    }
    const decoder = new TextDecoder();

    // 1. 스트림 정의 (여기서 return하지 마세요)
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
              const sseLine = line.trim();
              if (!sseLine || !sseLine.startsWith('data: ')) continue;

              const data = sseLine.slice(6);
              if (data === '[DONE]') {
                controller.close();
                return; // 루프 및 start 함수 종료
              }

              try {
                const json = JSON.parse(data);
                const content = json.choices[0]?.delta?.content || '';
                if (content) {
                  const sseData = `data: ${JSON.stringify({ content })}\n\n`;
                  controller.enqueue(new TextEncoder().encode(sseData));
                }
              } catch (e) {
                // JSON 파싱 에러 무시
              }
            }
          }
        } catch (error) {
          controller.error(error);
        } finally {
          reader.releaseLock();
          controller.close(); // 안전하게 닫기
        }
      },
    });

    // 2. 반드시 ReadableStream 정의 "밖"에서 NextResponse를 반환하세요!
    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: '서버 측에 오류가 발생했습니다.',
      },
      { status: 500 },
    );
  }
}
