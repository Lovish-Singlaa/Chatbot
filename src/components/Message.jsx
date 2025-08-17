import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const Message = ({ message, isUser }) => {
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`flex mb-4 animate-fade-in ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] px-4 py-3 rounded-2xl relative break-words leading-relaxed ${
        isUser 
          ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-br-md shadow-lg shadow-indigo-500/30' 
          : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md shadow-lg shadow-black/10'
      }`}>
        <div className="text-sm leading-relaxed">
          {isUser ? (
            // User messages: plain text
            <div className="whitespace-pre-wrap">{message.content}</div>
          ) : (
            // Bot messages: render markdown
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  // Custom styling for markdown elements
                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                  h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-sm font-bold mb-2">{children}</h3>,
                  ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                  li: ({ children }) => <li className="text-sm">{children}</li>,
                  code: ({ children, className }) => {
                    const isInline = !className;
                    return isInline ? (
                      <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-xs font-mono">
                        {children}
                      </code>
                    ) : (
                      <code className="block bg-gray-100 text-gray-800 p-2 rounded text-xs font-mono overflow-x-auto">
                        {children}
                      </code>
                    );
                  },
                  pre: ({ children }) => (
                    <pre className="bg-gray-100 text-gray-800 p-3 rounded text-xs font-mono overflow-x-auto mb-2">
                      {children}
                    </pre>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-gray-300 pl-3 italic text-gray-600 mb-2">
                      {children}
                    </blockquote>
                  ),
                  a: ({ children, href }) => (
                    <a 
                      href={href} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      {children}
                    </a>
                  ),
                  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                  em: ({ children }) => <em className="italic">{children}</em>,
                  table: ({ children }) => (
                    <div className="overflow-x-auto mb-2">
                      <table className="min-w-full border border-gray-300 text-xs">
                        {children}
                      </table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="border border-gray-300 px-2 py-1 bg-gray-50 font-semibold">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="border border-gray-300 px-2 py-1">
                      {children}
                    </td>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
        {message.created_at && (
          <div className={`text-xs opacity-70 mt-2 ${isUser ? 'text-right' : 'text-left'}`}>
            {formatTime(message.created_at)}
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
