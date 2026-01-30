import MessageContainer from '@/components/MessageContainer';
import MessageInput from '@/components/MessageInput';

export default function Page() {
  return (
    <main className="flex-1 flex flex-col w-full min-h-0 max-w-7xl items-center">
      <MessageContainer />
      <MessageInput />
    </main>
  );
}
