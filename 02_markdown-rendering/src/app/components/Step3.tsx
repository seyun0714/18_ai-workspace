import { SAMPLE_MARKDOWN } from '@/data/sample';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function Step3() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <h3 className="text-base font-semibold text-gray-900 mb-1">
        Step 3. 코드 블록 하이라이팅{' '}
        <code className="px-1 py-0.5 rounded bg-gray-100 text-xs">
          react-syntax-highlighter
        </code>{' '}
        적용
      </h3>
      <p className="text-xs text-gray-500 mb-3">
        코드 블록(\`\`\`)에만 색상을 입힙니다.
      </p>
      <div className="w-full rounded-lg border border-gray-200 bg-gray-50/80 p-3">
        <div className="markdown-native">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                if (match) {
                  return (
                    <SyntaxHighlighter
                      style={vs}
                      language={match[1]}
                      PreTag="div"
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  );
                }
                return <code {...props}>{children}</code>;
              },
            }}
          >
            {SAMPLE_MARKDOWN}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
