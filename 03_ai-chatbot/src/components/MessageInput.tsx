'use client';
import { useChatStore } from '@/store/chatStore';
import { SendHorizonalIcon } from 'lucide-react';
import { KeyboardEvent, useState } from 'react';

const MessageInput = () => {
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const {
    chatList,
    isWriting,
    setIsWriting,
    addChat,
    updateLastChatContent,
    removeLastChat,
  } = useChatStore();

  // 채팅 전송
  const handleSend = async () => {
    if (!message.trim() || isLoading) return;
    // 오류 시 되돌리기 용
    const userMessage = message;

    const newChat = { role: 'user' as const, content: userMessage };
    setMessage('');
    setIsLoading(true);
    setIsWriting(true);

    const chatHistory = structuredClone(chatList);
    chatHistory.push(newChat);
    addChat(newChat);

    // API 호출 로직 여기서!
    try {
      const response = await fetch(`/api/chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: chatHistory.slice(-5),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '알 수 없는 오류');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('스트림을 읽을 수 없습니다.');
      }

      const decoder = new TextDecoder();

      // zustand에 Chat 하나 추가(AI 답변)
      addChat({ role: 'assistant', content: '' });

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          const data = line.slice(6);
          try {
            const json = JSON.parse(data);
            const content = json.content;

            // zustand 값 업데이트
            updateLastChatContent(content);
          } catch (error) {}
        }
      }
    } catch (error) {
      // 스트리밍 중이던 chat 삭제.
      // zustand에 에러 chat 추가.
      removeLastChat();
      const errorMessage =
        error instanceof Error
          ? error.message
          : '오류가 발생했습니다. 다시 시도해주세요.';
      addChat({
        role: 'assistant',
        content: errorMessage,
      });
      setMessage(userMessage);
    } finally {
      setIsLoading(false);
      setIsWriting(false);
    }
  };

  // 엔터로도 처리
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="flex w-full border-t border-t-gray-200 px-3 py-4 gap-2 ">
      <input
        className="flex-1 border border-gray-300 px-4 py-3 rounded-lg outline-none focus:border-gray-400"
        placeholder='메시지를 입력하세요... (예: "코드 예시 보여줘", "표 만들어줘")'
        onKeyDown={handleKeyDown}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
      />
      <button
        className="flex justify-center items-center bg-blue-500 font-medium text-lg text-white w-12 h-12 rounded-full hover:bg-blue-600 cursor-pointer"
        onClick={handleSend}
        disabled={!message || isLoading || isWriting}
      >
        <SendHorizonalIcon className="-rotate-90" />
      </button>
    </div>
  );
};

export default MessageInput;
