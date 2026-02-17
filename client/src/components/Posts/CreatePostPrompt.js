import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Image, Video, FileText } from 'lucide-react';

const CreatePostPrompt = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const quickActions = [
    {
      icon: FileText,
      label: 'Post',
      color: 'text-blue-600 bg-blue-50 hover:bg-blue-100',
      action: () => navigate('/create?type=post')
    },
    {
      icon: Image,
      label: 'Photo',
      color: 'text-green-600 bg-green-50 hover:bg-green-100',
      action: () => navigate('/create?type=photo')
    },
    {
      icon: Video,
      label: 'Reel',
      color: 'text-purple-600 bg-purple-50 hover:bg-purple-100',
      action: () => navigate('/create?type=reel')
    }
  ];

  // Add announcement option for teachers/admin
  if (['teacher', 'principal', 'admin'].includes(user?.role)) {
    quickActions.unshift({
      icon: Plus,
      label: 'Announce',
      color: 'text-red-600 bg-red-50 hover:bg-red-100',
      action: () => navigate('/create?type=announcement')
    });
  }

  return (
    <div className="card">
      <div className="flex items-center space-x-3">
        {/* Profile Picture */}
        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
          {user?.profileImage ? (
            <img 
              src={user.profileImage} 
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <span className="text-primary-600 font-medium">
              {user?.name?.charAt(0)?.toUpperCase()}
            </span>
          )}
        </div>

        {/* Input Prompt */}
        <button
          onClick={() => navigate('/create')}
          className="flex-1 text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
        >
          What's on your mind, {user?.name?.split(' ')[0]}?
        </button>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center justify-around mt-4 pt-4 border-t border-gray-200">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              onClick={action.action}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${action.color}`}
            >
              <Icon size={20} />
              <span className="font-medium text-sm">{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CreatePostPrompt;