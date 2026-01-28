import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // 1. 프론트에서 전달되는 메시지 받기
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

    // 2. API KEY 추출
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'OpenAI API KEY가 설정되어있지 않습니다.',
        },
        { status: 500 },
      );
    }

    // 3. OpenAI API 요청
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
        stream: false,
      }),
    });

    // 4. API 실패 체크
    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: 'OpenAI API 오류',
        },
        { status: response.status },
      );
    }

    // 5. 성공 시 OpenAI 응답 프론트에 전달
    const data = await response.json();
    return NextResponse.json({
      success: true,
      message: data.choices[0].message.content,
    });
  } catch (error) {
    console.error('서버 측 오류', error);
    return NextResponse.json(
      {
        success: false,
        error: '서버 측에서 오류가 발생했습니다.',
      },
      { status: 500 },
    );
  }
}
