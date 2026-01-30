'use client';
import { useChatStore } from '@/store/chatStore';
import { useEffect, useRef } from 'react';
import { Chat } from '@/types/chat';
import MessageBox from './MessageBox';

const MessageContainer = () => {
  const { chatList } = useChatStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatList]);

  return (
    <div className="flex-1 flex flex-col w-full scrollbar-hide overflow-y-auto p-4 gap-4">
      {chatList.map((chat: Chat, index) => (
        <MessageBox key={index} chat={chat} />
      ))}
      <div ref={scrollRef} className="invisible" />
    </div>
  );
};

export default MessageContainer;
