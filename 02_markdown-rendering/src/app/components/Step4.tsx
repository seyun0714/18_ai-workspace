import { SAMPLE_MARKDOWN } from '@/data/sample';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';

export default function Step4() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <h3 className="text-base font-semibold text-gray-900 mb-1">
        Step 4. HTML (
        <code className="px-1 py-0.5 rounded bg-gray-100 text-xs">
          rehype-raw
        </code>
        ) + 보안 (
        <code className="px-1 py-0.5 rounded bg-gray-100 text-xs">
          rehype-sanitize
        </code>
        ) + 커스터마이징
      </h3>
      <p className="text-xs text-gray-500 mb-3">
        HTML 태그를 파싱하고, XSS를 방어합니다.
      </p>
      <div className="w-full rounded-lg border border-gray-200 bg-gray-50/80 p-3">
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown
            // 1. remarkPlugins: 마크다운 문법 해석 (표, 체크리스트 등)
            remarkPlugins={[remarkGfm]}
            // 2. rehypePlugins: HTML 변환 및 보안 설정
            rehypePlugins={[rehypeRaw, rehypeSanitize]}
            components={{
              // 코드 블록 커스터마이징
              code({ node, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');

                return match ? (
                  <div className="my-4 rounded-md overflow-hidden shadow-sm">
                    <SyntaxHighlighter
                      style={vs}
                      language={match[1]}
                      PreTag="div"
                      customStyle={{
                        margin: 0,
                        padding: '1rem',
                        fontSize: '13px',
                        backgroundColor: '#f9fafb',
                      }}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  </div>
                ) : (
                  // 인라인 코드 커스텀
                  <code
                    className="px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-800 font-medium"
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              img: ({ src, alt, ...props }: any) => {
                return (
                  <img
                    src={src}
                    alt={alt}
                    width={600}
                    height={320}
                    className="rounded-2xl border border-gray-200"
                    {...props}
                  />
                );
              },
              a: ({ href, children, ...props }: any) => (
                <a
                  href={href || '#'}
                  target="_blank"
                  rel="noopener noreferer"
                  className="text-indigo-800 font-medium"
                  {...props}
                >
                  {children}
                </a>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-blue-500 pl-4 italic my-2 text-gray-600">
                  {children}
                </blockquote>
              ),
            }}
          >
            {SAMPLE_MARKDOWN}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
