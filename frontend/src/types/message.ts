// Message types
export interface Message {
  id: number;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
}

// Create Message Request
export interface CreateMessageRequest {
  content: string;
  role: 'user' | 'assistant';
}

// Local Message (used in UI components)
export interface LocalMessage {
  id: string | number;
  content: string;
  role: string;
} 