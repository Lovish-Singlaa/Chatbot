import React, { useEffect, useRef } from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { useUserData } from '@nhost/react';
import { GET_MESSAGES, MESSAGES_SUBSCRIPTION } from '../graphql/queries';
import { SEND_MESSAGE, INSERT_USER_MESSAGE, INSERT_BOT_MESSAGE } from '../graphql/mutations';
import Message from './Message';
import MessageInput from './MessageInput';

const ChatWindow = ({ chatId }) => {
  const messagesEndRef = useRef(null);
  const user = useUserData();
  
  const { loading, error, data, refetch } = useQuery(GET_MESSAGES, {
    variables: { chatId },
    skip: !chatId,
    fetchPolicy: 'cache-and-network',
  });

  const [sendMessage] = useMutation(SEND_MESSAGE);
  const [insertUserMessage] = useMutation(INSERT_USER_MESSAGE, {
    update: (cache, { data: { insert_messages_one } }) => {
      // Update the cache immediately after inserting user message
      const existingMessages = cache.readQuery({
        query: GET_MESSAGES,
        variables: { chatId },
      });

      if (existingMessages) {
        cache.writeQuery({
          query: GET_MESSAGES,
          variables: { chatId },
          data: {
            messages: [...existingMessages.messages, insert_messages_one],
          },
        });
      }
    },
  });

  const [insertBotMessage] = useMutation(INSERT_BOT_MESSAGE, {
    update: (cache, { data: { insert_messages_one } }) => {
      // Update the cache immediately after inserting bot message
      const existingMessages = cache.readQuery({
        query: GET_MESSAGES,
        variables: { chatId },
      });

      if (existingMessages) {
        cache.writeQuery({
          query: GET_MESSAGES,
          variables: { chatId },
          data: {
            messages: [...existingMessages.messages, insert_messages_one],
          },
        });
      }
    },
  });

  // Real-time subscription for new messages
  useSubscription(MESSAGES_SUBSCRIPTION, {
    variables: { chatId },
    skip: !chatId,
    onData: ({ data }) => {
      if (data?.data?.messages?.[0]) {
        // Refetch to get the latest messages
        refetch();
      }
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [data?.messages]);

  const handleSendMessage = async (messageContent) => {
    try {
      console.log('User object:', user);
      console.log('User ID:', user?.id);
      
      if (!user?.id) {
        throw new Error('User not authenticated or user ID not available');
      }

      console.log('Sending message with:', { 
        chatId, 
        content: messageContent, 
        userId: user.id 
      });
      
      // Insert user message with optimistic update
      const userMessageResult = await insertUserMessage({
        variables: { chatId, content: messageContent },
        optimisticResponse: {
          insert_messages_one: {
            __typename: 'messages',
            id: `temp-${Date.now()}`,
            content: messageContent,
            sender: 'user',
            created_at: new Date().toISOString(),
          },
        },
      });

      // Send to chatbot via Hasura Action
      console.log('Calling sendMessage action...');
      const response = await sendMessage({
        variables: { chatId, content: messageContent, userId: user.id },
      });
      console.log('sendMessage response:', response);

      const botReply = response.data?.sendMessage?.reply;
      console.log('Bot reply:', botReply);
      
      if (botReply) {
        // Insert bot response with optimistic update
        await insertBotMessage({
          variables: { chatId, content: botReply },
          optimisticResponse: {
            insert_messages_one: {
              __typename: 'messages',
              id: `temp-bot-${Date.now()}`,
              content: botReply,
              sender: 'bot',
              created_at: new Date().toISOString(),
            },
          },
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      console.error('Error details:', error.graphQLErrors);
      console.error('Network error:', error.networkError);
      console.error('User object:', user);
      // Refetch to ensure UI is in sync with server state
      refetch();
      throw error;
    }
  };

  if (!chatId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-6">
          <div className="w-20 h-20 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Select a conversation</h3>
          <p className="text-gray-600 leading-relaxed">Choose an existing conversation from the sidebar or create a new one to start chatting with AI</p>
        </div>
      </div>
    );
  }

  if (loading) return (
    <div className="flex-1 flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 border-3 border-gray-300 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading conversation...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="flex-1 flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md px-6">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error loading messages</h3>
        <p className="text-red-600 text-sm mb-4">{error.message}</p>
        <button 
          onClick={() => refetch()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  const messages = data?.messages || [];

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      {/* Chat Header */}
      <div className="px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">AI Assistant</h3>
              <p className="text-sm text-gray-500">Ready to help you with anything</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Online</span>
          </div>
        </div>
      </div>
      
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50 scroll-smooth">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Start the conversation</h3>
            <p className="text-gray-600">Send a message to begin chatting with AI</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <Message
                key={msg.id}
                message={msg}
                isUser={msg.sender === 'user'}
              />
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        disabled={false}
        placeholder="Type your message..."
      />
    </div>
  );
};

export default ChatWindow;
