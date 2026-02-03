
"use client"

import { useState } from "react"
import { Send, User } from "lucide-react"
import { Button } from "@/components/ui/button"

const MOCK_CHATS = [
    {
        id: "1",
        member: "Tanaka Taro",
        lastMessage: "Thank you for the session!",
        time: "10:30",
        messages: [
            { id: 1, text: "Next session confirmed for Tuesday.", sender: "TRAINER", time: "10:00" },
            { id: 2, text: "Thank you for the session! I'll bring my shoes.", sender: "MEMBER", time: "10:30" }
        ]
    },
    {
        id: "2",
        member: "Yamada Hanako",
        lastMessage: "Can I reschedule?",
        time: "Yesterday",
        messages: [
            { id: 1, text: "Can I reschedule my appointment?", sender: "MEMBER", time: "Yesterday" }
        ]
    }
]

export function ChatInterface() {
    const [activeChat, setActiveChat] = useState(MOCK_CHATS[0])
    const [newMessage, setNewMessage] = useState("")
    const [messages, setMessages] = useState(activeChat.messages)

    const handleSend = () => {
        if (!newMessage.trim()) return
        setMessages([...messages, {
            id: Date.now(),
            text: newMessage,
            sender: "TRAINER",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }])
        setNewMessage("")
    }

    return (
        <div className="flex h-[600px] border rounded-xl overflow-hidden bg-white shadow-sm">
            {/* Sidebar List */}
            <div className="w-1/3 border-r bg-gray-50 flex flex-col">
                <div className="p-4 border-b font-bold text-lg bg-white">Messages (LINE)</div>
                <div className="flex-1 overflow-y-auto">
                    {MOCK_CHATS.map(chat => (
                        <div
                            key={chat.id}
                            onClick={() => { setActiveChat(chat); setMessages(chat.messages) }}
                            className={`p-4 border-b cursor-pointer hover:bg-gray-100 ${activeChat.id === chat.id ? 'bg-blue-50' : ''}`}
                        >
                            <div className="font-bold flex justify-between">
                                {chat.member}
                                <span className="text-xs text-gray-400 font-normal">{chat.time}</span>
                            </div>
                            <div className="text-sm text-gray-500 truncate">{chat.lastMessage}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-[#7494c0]"> {/* LINE-ish Background Color */}
                <div className="p-4 bg-white/90 backdrop-blur border-b flex items-center justify-between shadow-sm z-10">
                    <div className="font-bold text-lg">{activeChat.member}</div>
                </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.sender === 'TRAINER' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] p-3 rounded-2xl text-sm relative shadow-sm ${msg.sender === 'TRAINER'
                                    ? 'bg-[#8de055] text-black rounded-tr-none' // LINE Greenish
                                    : 'bg-white text-black rounded-tl-none'
                                }`}>
                                {msg.text}
                                <span className="text-[10px] text-gray-400 absolute bottom-0 -right-8 w-8">{msg.time}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-3 bg-white border-t">
                    <div className="flex gap-2">
                        <input
                            className="flex-1 p-2 border rounded-full px-4 focus:outline-none focus:border-blue-500"
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <Button onClick={handleSend} size="icon" className="rounded-full bg-blue-600 hover:bg-blue-700">
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
