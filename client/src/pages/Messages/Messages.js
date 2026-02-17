import React, { useState } from 'react';
import { ArrowLeft, Search, Phone, Video, MoreVertical, Send, Paperclip, Smile, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Messages = () => {
  const navigate = useNavigate();
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock chat data
  const chats = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      role: 'teacher',
      department: 'Computer Science',
      lastMessage: 'The assignment deadline has been extended to next Friday.',
      timestamp: '2 min ago',
      unreadCount: 2,
      avatar: null,
      online: true
    },
    {
      id: 2,
      name: 'Alex Kumar',
      role: 'alumni',
      company: 'Google',
      lastMessage: 'Sure, I can help you with the interview preparation.',
      timestamp: '1 hour ago',
      unreadCount: 0,
      avatar: null,
      online: false
    },
    {
      id: 3,
      name: 'Study Group - CS 2021',
      role: 'group',
      members: 8,
      lastMessage: 'Priya: Can we meet tomorrow at 3 PM?',
      timestamp: '3 hours ago',
      unreadCount: 5,
      avatar: null,
      online: false
    },
    {
      id: 4,
      name: 'Priya Sharma',
      role: 'student',
      department: 'Computer Science',
      lastMessage: 'Thanks for sharing the notes!',
      timestamp: '1 day ago',
      unreadCount: 0,
      avatar: null,
      online: true
    }
  ];

  // Mock messages for selected chat
  const messages = [
    {
      id: 1,
      senderId: 1,
      senderName: 'Dr. Sarah Johnson',
      text: 'Hello! I wanted to inform you about the upcoming assignment.',
      timestamp: '10:30 AM',
      isOwn: false
    },
    {
      id: 2,
      senderId: 'me',
      senderName: 'You',
      text: 'Thank you for letting me know, Professor.',
      timestamp: '10:32 AM',
      isOwn: true
    },
    {
      id: 3,
      senderId: 1,
      senderName: 'Dr. Sarah Johnson',
      text: 'The assignment deadline has been extended to next Friday. Please make sure to submit your work on time.',
      timestamp: '10:35 AM',
      isOwn: false
    }
  ];

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // Add message sending logic here
      setMessageText('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 flex-1">
            {selectedChat ? selectedChat.name : 'Messages'}
          </h1>
          {selectedChat && (
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Phone size={20} className="text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Video size={20} className="text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreVertical size={20} className="text-gray-600" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Chat List */}
        <div className={`${selectedChat ? 'hidden md:block' : 'block'} w-full md:w-80 bg-white border-r border-gray-200 flex flex-col`}>
          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Search conversations..."
              />
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {filteredChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className={`w-full p-4 flex items-center space-x-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                  selectedChat?.id === chat.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    {chat.avatar ? (
                      <img 
                        src={chat.avatar} 
                        alt={chat.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-blue-600 font-semibold text-lg">
                        {chat.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  {chat.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {chat.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {chat.timestamp}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {chat.lastMessage}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500">
                      {chat.role === 'group' ? `${chat.members} members` : 
                       chat.role === 'teacher' ? `${chat.role} • ${chat.department}` :
                       chat.role === 'alumni' ? `${chat.role} • ${chat.company}` :
                       `${chat.role} • ${chat.department}`}
                    </p>
                    {chat.unreadCount > 0 && (
                      <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`${selectedChat ? 'block' : 'hidden md:block'} flex-1 flex flex-col bg-white`}>
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="hidden md:block p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        {selectedChat.avatar ? (
                          <img 
                            src={selectedChat.avatar} 
                            alt={selectedChat.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-blue-600 font-semibold">
                            {selectedChat.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      {selectedChat.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        {selectedChat.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {selectedChat.online ? 'Online' : 'Last seen 2 hours ago'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Phone size={20} className="text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Video size={20} className="text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreVertical size={20} className="text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.isOwn 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="text-sm">{message.text}</p>
                      <p className={`text-xs mt-1 ${
                        message.isOwn ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Paperclip size={20} className="text-gray-600" />
                  </button>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Type a message..."
                    />
                    <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors">
                      <Smile size={18} className="text-gray-600" />
                    </button>
                  </div>
                  <button 
                    onClick={handleSendMessage}
                    className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                <p className="text-gray-500">Choose a chat from the sidebar to start messaging.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;