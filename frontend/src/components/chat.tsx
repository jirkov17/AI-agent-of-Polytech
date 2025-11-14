'use client'

import { ChatInput } from "./custom/chatinput";
import { PreviewMessage, ThinkingMessage } from "./custom/message";
import { useScrollToBottom } from './custom/use-scroll-to-bottom';
import { useState, useEffect, useCallback } from "react";
import { useParams } from 'next/navigation';
import { messageService } from '@/lib/api/services/messageService';
import { LocalMessage, Message } from '@/types';
import {MessageCircle} from "lucide-react";

export function Chat() {
    const [messagesContainerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>();
    const [messages, setMessages] = useState<LocalMessage[]>([]);
    const [question, setQuestion] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const params = useParams<{ id: string }>();
    const chatId = params?.id ? parseInt(params.id) : undefined;
    const [lastMessageId, setLastMessageId] = useState<number>(0);
    const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (chatId) {
            fetchMessages();
        } else {
            setMessages([]);
        }
    }, [chatId]);

    const fetchMessages = useCallback(async () => {
        if (!chatId) return;

        try {
            const data = await messageService.getMessages(chatId);
            setMessages(data.map((msg: Message) => ({
                id: msg.id,
                content: msg.content,
                role: msg.role
            })));
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    }, [chatId]);

    useEffect(() => {
        if (!chatId) {
            setMessages([]);
            return;
        }

        fetchMessages();
        const interval = setInterval(fetchMessages, 1000);
        setPollingInterval(interval);

        return () => {
            if (pollingInterval) clearInterval(pollingInterval);
        };
    }, [chatId, fetchMessages]);

    useEffect(() => {
        return () => {
            if (pollingInterval) {
                clearInterval(pollingInterval);
            }
        };
    }, [pollingInterval]);

    const handleSubmit = async (text?: string) => {
        if (!chatId || isLoading) return;

        const messageText = text || question;
        if (!messageText.trim()) return;

        setIsLoading(true);

        // Optimistically add user message to UI
        const tempId = Date.now().toString();
        const userMessage: LocalMessage = {
            id: tempId,
            content: messageText,
            role: "user"
        };

        setMessages(prev => [...prev, userMessage]);
        setQuestion("");

        try {
            const updatedMessages = await messageService.sendMessage(chatId, {
                content: messageText,
                role: 'user'
            });

            setMessages(updatedMessages.map(msg => ({
                id: msg.id,
                content: msg.content,
                role: msg.role
            })));
        } catch (error) {
            console.error('Error sending message:', error);
            // If request failed, remove the optimistic message
            setMessages(prev => prev.filter(m => m.id !== tempId));
        } finally {
            setIsLoading(false);
        }
    };


    if (!chatId) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full p-5 mb-6 shadow-lg text-white">
                    <MessageCircle size={60} strokeWidth={1.5} />
                </div>
                <h2 className="text-2xl font-semibold mb-2">Добро пожаловать в ИИ-Агента!</h2>
                <p className="text-muted-foreground">Выберите чат в меню слева или создайте новый, чтобы начать.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-w-0 h-full bg-background">
            <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8" ref={messagesContainerRef}>
                <div className="flex flex-col space-y-6 max-w-3xl mx-auto">
                    {messages.map((message, index) => (
                        <PreviewMessage key={message.id || index} message={message} />
                    ))}
                    {isLoading && <ThinkingMessage />}
                    <div ref={messagesEndRef} className="h-6"/>
                </div>
            </div>
            <div className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
                <ChatInput
                    question={question}
                    setQuestion={setQuestion}
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
};