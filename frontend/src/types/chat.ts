import { Message } from './message';

// Chat types
export interface Chat {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
  message_count?: number;
  last_message?: Message;
}

// Create Chat Request
export interface CreateChatRequest {
  title: string;
} 