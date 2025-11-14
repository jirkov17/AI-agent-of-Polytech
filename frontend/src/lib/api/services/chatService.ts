import apiClient from '../client';
import { Chat, PaginatedResponse, CreateChatRequest } from '../../../types';

// API endpoints
const CHATS_ENDPOINT = '/chats';

export const chatService = {
  /**
   * Get all chats
   */
  getChats: async (): Promise<Chat[]> => {
    try {
      const response = await apiClient.get<PaginatedResponse<Chat>>(CHATS_ENDPOINT);
      return response.data.results;
    } catch (error) {
      console.error('Error fetching chats:', error);
      return [];
    }
  },

  /**
   * Get a specific chat by ID
   */
  getChat: async (chatId: number): Promise<Chat | null> => {
    try {
      const response = await apiClient.get<Chat>(`${CHATS_ENDPOINT}/${chatId}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching chat ${chatId}:`, error);
      return null;
    }
  },

  /**
   * Create a new chat
   */
  createChat: async (data: CreateChatRequest): Promise<Chat | null> => {
    try {
      const response = await apiClient.post<Chat>(CHATS_ENDPOINT + '/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating chat:', error);
      return null;
    }
  },

  /**
   * Update a chat
   */
  updateChat: async (chatId: number, data: Partial<CreateChatRequest>): Promise<Chat | null> => {
    try {
      const response = await apiClient.patch<Chat>(`${CHATS_ENDPOINT}/${chatId}/`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating chat ${chatId}:`, error);
      return null;
    }
  },

  /**
   * Delete a chat
   */
  deleteChat: async (chatId: number): Promise<boolean> => {
    try {
      await apiClient.delete(`${CHATS_ENDPOINT}/${chatId}/`);
      return true;
    } catch (error) {
      console.error(`Error deleting chat ${chatId}:`, error);
      return false;
    }
  }
}; 