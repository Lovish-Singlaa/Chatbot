import React, { useState, useRef, useEffect } from 'react';

const MessageInput = ({ onSendMessage, disabled = false, placeholder = "Type your message..." }) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const textareaRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || sending || disabled) return;

    const trimmedMessage = message.trim();
    setMessage('');
    setSending(true);

    try {
      await onSendMessage(trimmedMessage);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [message]);

  return (
    <div className="p-6 bg-white border-t border-gray-200 shadow-lg">
      <form onSubmit={handleSubmit} className="flex gap-3 items-end">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={sending ? "Sending message..." : placeholder}
          disabled={disabled || sending}
          className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-full focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all duration-300 resize-none min-h-[48px] max-h-[120px] leading-relaxed font-inherit disabled:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70"
          rows={1}
        />
        <button 
          type="submit" 
          disabled={!message.trim() || sending || disabled}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-none py-3 px-5 rounded-full text-sm font-semibold cursor-pointer transition-all duration-300 whitespace-nowrap min-w-[80px] flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
        >
          {sending ? (
            <>
              <span>Sending</span>
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-white rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </>
          ) : (
            <>
              <span>Send</span>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
