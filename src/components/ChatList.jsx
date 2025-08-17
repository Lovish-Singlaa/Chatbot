import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_CHATS } from '../graphql/queries';

const ChatList = ({ selectedChatId, onChatSelect, onCreateChat }) => {
  const { loading, error, data } = useQuery(GET_CHATS);

  if (loading) return (
    <div className="w-full h-full bg-white flex flex-col">
      <div className="p-4 lg:p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Conversations</h2>
          <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-500">Loading conversations...</p>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="w-full h-full bg-white flex flex-col">
      <div className="p-4 lg:p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Conversations</h2>
      </div>
      <div className="flex-1 flex items-center justify-center p-4 lg:p-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm text-red-600 mb-2">Error loading chats</p>
          <p className="text-xs text-gray-500">{error.message}</p>
        </div>
      </div>
    </div>
  );

  const chats = data?.chats || [];

  const getLastMessage = (messages) => {
    if (!messages || messages.length === 0) return 'No messages yet';
    const lastMessage = messages[messages.length - 1];
    return lastMessage.content.length > 50 
      ? lastMessage.content.substring(0, 50) + '...' 
      : lastMessage.content;
  };

  return (
    <div className="w-full h-full bg-white flex flex-col">
      <div className="p-4 lg:p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Conversations</h2>
          <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {chats.length} chats
          </div>
        </div>
        
        <button 
          onClick={onCreateChat} 
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-none py-3 px-4 rounded-xl text-sm font-medium cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 active:translate-y-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Conversation
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="p-6 lg:p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">No conversations yet</h3>
            <p className="text-xs text-gray-500 mb-4">Start your first conversation with AI</p>
            <button 
              onClick={onCreateChat}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create First Chat
            </button>
          </div>
        ) : (
          <div className="p-2">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={`p-3 rounded-xl cursor-pointer transition-all duration-200 mb-1 ${
                  selectedChatId === chat.id 
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => onChatSelect(chat.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    selectedChatId === chat.id 
                      ? 'bg-white/20' 
                      : 'bg-gradient-to-r from-indigo-100 to-purple-100'
                  }`}>
                    <svg className={`w-4 h-4 ${
                      selectedChatId === chat.id ? 'text-white' : 'text-indigo-600'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`text-sm font-medium truncate ${
                        selectedChatId === chat.id ? 'text-white' : 'text-gray-900'
                      }`}>
                        {chat.title}
                      </h3>
                      {/* <span className={`text-xs ${
                        selectedChatId === chat.id ? 'text-white/70' : 'text-gray-500'
                      }`}>
                        {new Date(chat.created_at).toLocaleDateString()}
                      </span> */}
                    </div>
                    <p className={`text-xs truncate ${
                      selectedChatId === chat.id ? 'text-white/80' : 'text-gray-500'
                    }`}>
                      {getLastMessage(chat.messages)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;