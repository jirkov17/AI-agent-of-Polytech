'use client'

import { useState, useEffect } from 'react'
import { cn } from "../../lib/utils"
import { Button } from "../ui/button"
import { ScrollArea } from "../ui/scroll-area"
import { 
  Plus, 
  MessageSquare,
  MoreVertical,
  Pencil,
  Trash2
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { chatService } from '@/lib/api/services/chatService'
import { Chat } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Sidebar() {
  const [chats, setChats] = useState<Chat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [newChatTitle, setNewChatTitle] = useState("Новый чат")
  const [editChatId, setEditChatId] = useState<number | null>(null)
  const [editChatTitle, setEditChatTitle] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // Fetch chats from API
    const fetchChats = async () => {
      try {
        setIsLoading(true)
        const data = await chatService.getChats()
        setChats(data || [])
      } catch (error) {
        console.error('Error fetching chats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchChats()
  }, [])

  // Reset new chat title when dialog opens
  useEffect(() => {
    if (isDialogOpen) {
      setNewChatTitle("Новый чат")
    }
  }, [isDialogOpen])

  const createNewChat = async () => {
    if (isCreating) return
    
    try {
      setIsCreating(true)
      const newChat = await chatService.createChat({
        title: newChatTitle || "Новый чат"
      })
      
      if (newChat) {
        setChats(prev => [newChat, ...prev])
        // Redirect to the new chat
        window.location.href = `/chat/${newChat.id}`
      }
    } catch (error) {
      console.error('Error creating new chat:', error)
    } finally {
      setIsCreating(false)
      setIsDialogOpen(false)
      setNewChatTitle("Новый чат")
    }
  }

  const startEditChat = (chat: Chat) => {
    setEditChatId(chat.id)
    setEditChatTitle(chat.title)
    setIsEditDialogOpen(true)
  }

  const updateChatTitle = async () => {
    if (isEditing || !editChatId) return
    
    try {
      setIsEditing(true)
      const updatedChat = await chatService.updateChat(editChatId, {
        title: editChatTitle || "Новый чат"
      })
      
      if (updatedChat) {
        setChats(prev => prev.map(chat => 
          chat.id === editChatId ? updatedChat : chat
        ))
      }
    } catch (error) {
      console.error('Error updating chat:', error)
    } finally {
      setIsEditing(false)
      setIsEditDialogOpen(false)
      setEditChatId(null)
      setEditChatTitle("")
    }
  }

  const deleteChat = async (chatId: number) => {
    if (isDeleting) return
    
    try {
      setIsDeleting(true)
      const success = await chatService.deleteChat(chatId)
      
      if (success) {
        setChats(prev => prev.filter(chat => chat.id !== chatId))
        
        // If the current chat is being deleted, redirect to home
        if (pathname === `/chat/${chatId}`) {
          router.push('/')
        }
      }
    } catch (error) {
      console.error('Error deleting chat:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="group flex flex-col h-full bg-background/70 border-r w-full">
      <div className="p-3">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="w-full flex items-center justify-start gap-2"
              variant="outline"
            >
              <Plus className="h-4 w-4" />
              Новый чат
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Создать новый чат</DialogTitle>
            </DialogHeader>
            <div className="mt-4 mb-4">
              <Input
                placeholder="Название чата"
                value={newChatTitle}
                onChange={(e) => setNewChatTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    createNewChat();
                  }
                }}
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="mr-2"
              >
                Отмена
              </Button>
              <Button
                type="submit"
                onClick={createNewChat}
                disabled={isCreating}
              >
                {isCreating ? "Создание..." : "Создать"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Edit Chat Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Редактировать чат</DialogTitle>
            </DialogHeader>
            <div className="mt-4 mb-4">
              <Input
                placeholder="Название чата"
                value={editChatTitle}
                onChange={(e) => setEditChatTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    updateChatTitle();
                  }
                }}
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="mr-2"
              >
                Отмена
              </Button>
              <Button
                type="submit"
                onClick={updateChatTitle}
                disabled={isEditing}
              >
                {isEditing ? "Сохранение..." : "Сохранить"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1 py-2 min-h-[100px]">
          {isLoading ? (
            <div className="text-sm text-muted-foreground p-2 flex items-center justify-center">
              <div className="animate-pulse flex flex-col w-full space-y-2">
                <div className="h-8 bg-gray-200 rounded w-full"></div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          ) : chats.length === 0 ? (
            <div className="text-sm text-muted-foreground p-2">Нет доступных чатов</div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                className={cn(
                  "flex items-center rounded-md px-3 py-2 hover:bg-accent group/item",
                  pathname === `/chat/${chat.id}` ? "bg-accent text-accent-foreground" : "transparent"
                )}
              >
                <Link
                  href={`/chat/${chat.id}`}
                  className="flex items-center flex-grow min-w-0 mr-2"
                  style={{ maxWidth: 'calc(100% - 32px)' }}
                >
                  <MessageSquare className="mr-2 h-4 w-4 shrink-0" />
                  <span className="truncate text-sm font-medium">{chat.title}</span>
                </Link>
                
                <div className="flex-shrink-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 outline-none focus:ring-0 focus:ring-offset-0 hover:bg-transparent"
                      >
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Открыть меню</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => startEditChat(chat)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        <span>Переименовать</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => deleteChat(chat.id)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Удалить</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
} 