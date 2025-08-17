import { gql } from '@apollo/client';

export const GET_CHATS = gql`
  query GetChats {
    chats {
      id
      title
      messages {
        content
        sender
      }
    }
  }
`;

export const GET_MESSAGES = gql`
  query GetMessages($chatId: uuid!) {
    messages(where: { chat_id: { _eq: $chatId } }) {
      id
      content
      sender
    }
  }
`;

export const MESSAGES_SUBSCRIPTION = gql`
  subscription OnMessageAdded($chatId: uuid!) {
    messages(where: { chat_id: { _eq: $chatId } }) {
      id
      content
      sender
    }
  }
`;
