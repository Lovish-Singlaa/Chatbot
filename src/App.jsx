import React, { useState } from 'react';
import { ApolloProvider } from '@apollo/client';
import { NhostProvider } from '@nhost/react';
import { useAuthenticationStatus, useSignOut } from '@nhost/react';
import nhost from './nhost';
import client from './apollo';
import Auth from './components/Auth';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import { useMutation } from '@apollo/client';
import { CREATE_CHAT } from './graphql/mutations';
import { GET_CHATS as GET_CHATS_QUERY } from './graphql/queries';
import './App.css';

const ChatApp = () => {
  const [selectedChatId, setSelectedChatId] = useState(null);
  const { signOut } = useSignOut();
  
  const [createChat] = useMutation(CREATE_CHAT, {
    update: (cache, { data: { insert_chats_one } }) => {
      // Update the cache immediately after creating a new chat
      const existingChats = cache.readQuery({
        query: GET_CHATS_QUERY,
      });

      if (existingChats) {
        cache.writeQuery({
          query: GET_CHATS_QUERY,
          data: {
            chats: [...existingChats.chats, insert_chats_one],
          },
        });
      }
    },
  });

  const handleCreateChat = async () => {
    try {
      const title = `New Chat ${new Date().toLocaleString()}`;
      const { data } = await createChat({ 
        variables: { title },
        optimisticResponse: {
          insert_chats_one: {
            __typename: 'chats',
            id: `temp-chat-${Date.now()}`,
            title: title,
            created_at: new Date().toISOString(),
            messages: [],
          },
        },
      });
      if (data?.insert_chats_one?.id) {
        setSelectedChatId(data.insert_chats_one.id);
      }
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">AI Chatbot</h1>
              <p className="text-sm text-gray-500">Powered by OpenRouter</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Connected</span>
            </div>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden p-4">
        <div className="flex-1 flex bg-white rounded-2xl shadow-xl overflow-hidden">
          <ChatList
            selectedChatId={selectedChatId}
            onChatSelect={setSelectedChatId}
            onCreateChat={handleCreateChat}
          />
          <ChatWindow chatId={selectedChatId} />
        </div>
      </div>
    </div>
  );
};

const AppContent = () => {
  const { isAuthenticated, isLoading } = useAuthenticationStatus();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-500">Preparing your chat experience</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <ChatApp /> : <Auth />;
};

const App = () => {
  return (
    <NhostProvider nhost={nhost}>
      <ApolloProvider client={client}>
        <AppContent />
      </ApolloProvider>
    </NhostProvider>
  );
};

export default App;
