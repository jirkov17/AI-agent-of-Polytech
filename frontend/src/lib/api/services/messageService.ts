import apiClient from '../client';
import { Message, CreateMessageRequest } from '../../../types';

// API endpoints
const CHATS_ENDPOINT = '/chats';

export const messageService = {
  /**
   * Get all messages for a specific chat
   */
  getMessages: async (chatId: number): Promise<Message[]> => {
    try {
      const response = await apiClient.get<Message[]>(`${CHATS_ENDPOINT}/${chatId}/messages/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching messages for chat ${chatId}:`, error);
      return [];
    }
  },

  /**
   * Send a message in a chat
   */
  sendMessage: async (chatId: number, data: CreateMessageRequest): Promise<Message[]> => {
    try {
      const response = await apiClient.post<Message[]>(
        `${CHATS_ENDPOINT}/${chatId}/add_message/`,
        data
      );
      return response.data;
    } catch (error) {
      console.error(`Error sending message to chat ${chatId}:`, error);
      throw error;
    }
  }
};