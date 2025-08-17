import { gql } from '@apollo/client';

export const CREATE_CHAT = gql`
  mutation CreateChat($title: String!) {
    insert_chats_one(object: { title: $title }) {
      id
      title
      created_at
    }
  }
`;

export const SEND_MESSAGE = gql`
  mutation SendMessage($chatId: uuid!, $content: String!, $userId: uuid!) {
    sendMessage(chat_id: $chatId, content: $content, user_id: $userId) {
      reply
    }
  }
`;

export const INSERT_USER_MESSAGE = gql`
  mutation InsertUserMessage($chatId: uuid!, $content: String!) {
    insert_messages_one(object: { chat_id: $chatId, sender: "user", content: $content }) {
      id
      content
      sender
      created_at
    }
  }
`;

export const INSERT_BOT_MESSAGE = gql`
  mutation InsertBotMessage($chatId: uuid!, $content: String!) {
    insert_messages_one(object: { chat_id: $chatId, sender: "bot", content: $content }) {
      id
      content
      sender
      created_at
    }
  }
`;
