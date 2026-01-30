import { Chat } from '@/types/chat';
import { create } from 'zustand';

interface ChatStore {
  chatList: Chat[];
  isWriting: boolean;
  addChat: (chat: Chat) => void;
  updateLastChatContent: (content: string) => void;
  removeLastChat: () => void;
  setIsWriting: (isWriting: boolean) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  chatList: [],
  isWriting: false,
  addChat: (chat) => {
    set((state) => ({ chatList: [...state.chatList, chat] }));
  },
  updateLastChatContent: (content) => {
    set((state) => {
      const newList = [...state.chatList];
      if (newList.length === 0) return state;

      const lastIndex = newList.length - 1;
      newList[lastIndex] = {
        ...newList[lastIndex],
        content: newList[lastIndex].content + content,
      };

      return { chatList: newList };
    });
  },
  removeLastChat: () => {
    set((state) => ({
      chatList: state.chatList.slice(0, -1),
    }));
  },
  setIsWriting: (isWriting) => set({ isWriting }),
}));
