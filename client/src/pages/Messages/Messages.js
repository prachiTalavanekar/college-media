import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Phone, Video, MoreVertical, Send, Paperclip, Smile, MessageCircle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

const Messages = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userIdFromUrl = searchParams.get('userId');
  
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (userIdFromUrl) {
      // Directly fetch conversation with the user from URL
      fetchConversation(userIdFromUrl);
      
      // Poll for new messages every 3 seconds
      const interval = setInterval(() => {
        fetchConversation(userIdFromUrl, true);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [userIdFromUrl]);

  useEffect(() => {
    if (selectedChat && !userIdFromUrl) {
      fetchConversation(selectedChat.id);
      // Poll for new messages every 3 seconds
      const interval = setInterval(() => {
        fetchConversation(selectedChat.id, true);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedChat]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/messages/conversations');
      setConversations(response.data.conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchConversation = async (userId, silent = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await api.get(`/messages/conversation/${userId}`);
      // Sort messages by createdAt in ascending order (oldest first)
      const sortedMessages = response.data.messages.sort((a, b) => 
        new Date(a.createdAt) - new Date(b.createdAt)
      );
      setMessages(sortedMessages);
      
      // Always set selectedChat when we have partner data
      if (response.data.partner) {
        setSelectedChat({
          id: response.data.partner._id,
          name: response.data.partner.name,
          profileImage: response.data.partner.profileImage,
          role: response.data.partner.role,
          department: response.data.partner.department,
          online: false
        });
      }
    } catch (error) {
      console.error('Error fetching conversation:', error);
      if (error.response?.status === 403) {
        toast.error('You need to be connected to message this user');
        navigate('/');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedChat) return;

    try {
      setSending(true);
      const response = await api.post('/messages/send', {
        recipientId: selectedChat.id,
        content: messageText.trim()
      });

      // Add message to local state
      setMessages([...messages, response.data.data]);
      setMessageText('');

      // Update conversation list
      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffInMinutes = Math.floor((now - messageDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    
    return messageDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const formatTimestamp = (date) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    });
  };

  const filteredChats = conversations.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && conversations.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col pb-20 md:pb-0">
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

      <div className="flex-1 flex overflow-hidden">
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
            {filteredChats.length > 0 ? (
              filteredChats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => {
                    setSelectedChat(chat);
                    fetchConversation(chat.id);
                  }}
                  className={`w-full p-4 flex items-center space-x-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                    selectedChat?.id === chat.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      {chat.profileImage ? (
                        <img 
                          src={chat.profileImage} 
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
                        {formatTime(chat.lastMessageTime)}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {chat.lastMessage}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-500">
                        {chat.role} {chat.department && `• ${chat.department}`}
                      </p>
                      {chat.unreadCount > 0 && (
                        <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-8 text-center">
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No conversations yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Connect with users to start messaging
                </p>
              </div>
            )}
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
                        {selectedChat.profileImage ? (
                          <img 
                            src={selectedChat.profileImage} 
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
                        {selectedChat.online ? 'Online' : selectedChat.role}
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
                {messages.length > 0 ? (
                  messages.map((message) => {
                    const isOwn = message.sender._id !== selectedChat.id;
                    return (
                      <div
                        key={message._id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          isOwn 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            isOwn ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {formatTimestamp(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No messages yet</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Start the conversation!
                      </p>
                    </div>
                  </div>
                )}
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
                      disabled={sending}
                      className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      placeholder={sending ? "Sending..." : "Type a message..."}
                    />
                    <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors">
                      <Smile size={18} className="text-gray-600" />
                    </button>
                  </div>
                  <button 
                    onClick={handleSendMessage}
                    disabled={sending || !messageText.trim()}
                    className={`p-2 rounded-full transition-colors ${
                      sending || !messageText.trim()
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-blue-500 hover:bg-blue-600'
                    } text-white`}
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