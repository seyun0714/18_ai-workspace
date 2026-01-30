import { Chat } from '@/types/chat';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';

interface MessageBoxProps {
  chat: Chat;
}

const MessageBox = ({ chat }: MessageBoxProps) => {
  const { role, content } = chat;

  return (
    <div className="w-full">
      {role === 'assistant' && (
        <div className="flex justify-start gap-2">
          <div className="flex items-center justify-center w-8 h-8 bg-gray-300 text-black text-md font-semibold rounded-full">
            AI
          </div>
          <div className="max-w-4xl bg-gray-200 rounded-xl  px-4 py-2 prose prose-sm">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeSanitize]}
              components={{
                code({ node, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '');

                  // inline 프롭을 통해 인라인 코드인지 블록 코드인지 구분합니다.
                  // react-markdown v8+ 에서는 props.inline으로 전달됩니다.
                  const isInline = props.inline;

                  return !isInline ? (
                    // 1. 블록 코드
                    <div className="my-4 rounded-md overflow-hidden shadow-sm border border-gray-200">
                      <SyntaxHighlighter
                        style={vs}
                        language={match ? match[1] : 'text'}
                        PreTag="div"
                        customStyle={{
                          margin: 0,
                          padding: '1rem',
                          fontSize: '13px',
                          backgroundColor: '#f8f9fa',
                        }}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    // 2. 인라인 코드 (한 줄짜리 짧은 코드)
                    <code
                      className="px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-800 font-medium"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>
      )}
      {role === 'user' && (
        <div className="flex justify-end gap-2">
          <div className="max-w-4xl bg-blue-50 rounded-xl px-4 py-2 prose">
            {content}
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageBox;
