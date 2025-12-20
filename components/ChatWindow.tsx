"use client";

import { useState, useEffect, useRef } from "react";

interface ChatProps {
  shipmentId: string;
  currentUserId: string;
  onClose: () => void;
  title: string;
}

export default function ChatWindow({ shipmentId, currentUserId, onClose, title }: ChatProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Messages (Polled every 3 seconds)
  useEffect(() => {
    const fetchMessages = async () => {
      const res = await fetch(`/api/messages?shipmentId=${shipmentId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    };

    fetchMessages(); // Initial call
    const interval = setInterval(fetchMessages, 3000); // Poll every 3s
    return () => clearInterval(interval);
  }, [shipmentId]);

  // 2. Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 3. Send Message
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    await fetch("/api/messages", {
      method: "POST",
      body: JSON.stringify({
        content: newMessage,
        shipmentId,
        senderId: currentUserId
      }),
    });

    setNewMessage("");
    // We don't manually add it to 'messages' because the next poll (in <3s) will fetch it
    // This ensures we only see confirmed saved messages
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white shadow-2xl rounded-xl border border-gray-200 overflow-hidden z-50 flex flex-col h-96">
      
      {/* Header */}
      <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
        <h3 className="font-bold text-sm truncate pr-2">Chat: {title}</h3>
        <button onClick={onClose} className="text-white hover:text-gray-200 font-bold">✕</button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.length === 0 && (
          <p className="text-gray-400 text-xs text-center mt-10">No messages yet. Say hi! 👋</p>
        )}
        
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-lg p-2 text-sm ${
                isMe ? "bg-blue-500 text-white rounded-br-none" : "bg-gray-200 text-gray-800 rounded-bl-none"
              }`}>
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-2 border-t bg-white flex gap-2">
        <input 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border rounded-md px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
        />
        <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-bold">
          ➤
        </button>
      </form>
    </div>
  );
}