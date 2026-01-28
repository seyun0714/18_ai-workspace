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

    // OPENAI 응답
    const stream = new ReadableStream({
      // start: 스트림이 시작될 때 (클라이언트가 연결 시) 자동으로 호출되는 함수
      // controller: 스트림 청크 데이터를 전송(push)/종료(close)할 수 있는 컨트롤러 객체
      start: async (controller) => {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        try {
          // reader 객체를 통해 청크 단위의 모든 데이터들을 읽어들이는 과정
          while (true) {
            const { done, value } = await reader.read(); // { done, value }
            if (done) {
              controller.close();
              break;
            }
            // console.log('value:', value);
            // 바이너리 데이터 => 문자열 변환 (디코딩 작업)
            const chunk = decoder.decode(value, { stream: true });
            console.log(chunk);

            console.log('---------------------------------');
          }
        } catch (error) {
          console.log('스트림 처리 오류:', error);
          controller.error(error);
        } finally {
          reader.releaseLock();
        }
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
