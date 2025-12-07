import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Settings,
  Save,
  Edit,
  Camera,
  Bell,
  Key,
  Activity,
  Clock,
  CheckCircle
} from 'lucide-react';

const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const [profileData, setProfileData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@sonicx.com',
    phone: '+1-555-0123',
    role: 'Emergency Coordinator',
    department: 'Security Operations',
    location: 'Central Command',
    joinDate: '2023-01-15',
    avatar: '/api/placeholder/150/150'
  });

  const [preferences, setPreferences] = useState({
    notifications: {
      email: true,
      sms: false,
      push: true,
      emergency: true
    },
    privacy: {
      profileVisible: true,
      activityLog: false,
      locationSharing: true
    }
  });

  const recentActivity = [
    {
      id: 1,
      action: 'Logged into dashboard',
      timestamp: '2 minutes ago',
      type: 'login',
      status: 'success'
    },
    {
      id: 2,
      action: 'Dispatched Alpha Team',
      timestamp: '15 minutes ago',
      type: 'dispatch',
      status: 'success'
    },
    {
      id: 3,
      action: 'Generated crowd report',
      timestamp: '1 hour ago',
      type: 'report',
      status: 'success'
    },
    {
      id: 4,
      action: 'Updated emergency contacts',
      timestamp: '2 hours ago',
      type: 'update',
      status: 'success'
    },
    {
      id: 5,
      action: 'Failed login attempt',
      timestamp: '3 hours ago',
      type: 'security',
      status: 'warning'
    }
  ];

  const handleInputChange = (field: string, value: string) => {
    setProfileData({
      ...profileData,
      [field]: value
    });
  };

  const handleSave = () => {
    setIsEditing(false);
    // In a real app, this would save to the backend
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login': return User;
      case 'dispatch': return Shield;
      case 'report': return Activity;
      case 'update': return Settings;
      case 'security': return Key;
      default: return Activity;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-400 bg-green-400/20';
      case 'warning': return 'text-yellow-400 bg-yellow-400/20';
      case 'error': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500/10 via-transparent to-accent-500/10 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <span>Profile</span>
              </h1>
              <p className="text-gray-300">
                Manage your account settings and preferences
              </p>
            </div>
            <div className="mt-4 lg:mt-0 flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-400">Account Active</span>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Last Login</div>
                <div className="text-sm font-medium text-white">2 min ago</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex space-x-1 bg-white/5 rounded-lg p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-white/10 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Profile Info */}
            <div className="lg:col-span-2">
              <div className="glass rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">Personal Information</h2>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center space-x-2 px-3 py-2 bg-primary-500/20 border border-primary-500/30 rounded-lg text-primary-400 text-sm hover:bg-primary-500/30 transition-colors duration-200"
                  >
                    <Edit className="w-4 h-4" />
                    <span>{isEditing ? 'Cancel' : 'Edit'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                    <input
                      type="text"
                      value={profileData.role}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Department</label>
                    <input
                      type="text"
                      value={profileData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-white/10">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-gray-500/20 border border-gray-500/30 rounded-lg text-gray-400 hover:bg-gray-500/30 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/25"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Card */}
            <div>
              <div className="glass rounded-xl p-6">
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-12 h-12 text-gray-400" />
                    </div>
                    <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors duration-200">
                      <Camera className="w-4 h-4 text-white" />
                    </button>
                  </div>
                  <h3 className="text-xl font-semibold text-white">{profileData.firstName} {profileData.lastName}</h3>
                  <p className="text-gray-300">{profileData.role}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-300">{profileData.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-300">{profileData.phone}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-300">{profileData.location}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-300">Joined {profileData.joinDate}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            <div className="glass rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                <Bell className="w-5 h-5 text-blue-400" />
                <span>Notification Preferences</span>
              </h2>
              <div className="space-y-4">
                {Object.entries(preferences.notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <label className="text-sm text-gray-300 capitalize">{key} notifications</label>
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        notifications: {
                          ...preferences.notifications,
                          [key]: e.target.checked
                        }
                      })}
                      className="w-4 h-4 bg-white/5 border border-white/20 rounded text-primary-500 focus:ring-primary-500 focus:ring-2"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                <Shield className="w-5 h-5 text-green-400" />
                <span>Privacy Settings</span>
              </h2>
              <div className="space-y-4">
                {Object.entries(preferences.privacy).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <label className="text-sm text-gray-300 capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</label>
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        privacy: {
                          ...preferences.privacy,
                          [key]: e.target.checked
                        }
                      })}
                      className="w-4 h-4 bg-white/5 border border-white/20 rounded text-primary-500 focus:ring-primary-500 focus:ring-2"
                    />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="glass rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                <Activity className="w-5 h-5 text-purple-400" />
                <span>Recent Activity</span>
              </h2>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => {
                  const Icon = getActivityIcon(activity.type);
                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 * index }}
                      className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors duration-200"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary-400" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">{activity.action}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-400">{activity.timestamp}</span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(activity.status)}`}>
                          {activity.status}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            <div className="glass rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                <Key className="w-5 h-5 text-yellow-400" />
                <span>Password & Security</span>
              </h2>
              <div className="space-y-4">
                <button className="w-full text-left p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-white">Change Password</h3>
                      <p className="text-xs text-gray-400">Last changed 30 days ago</p>
                    </div>
                    <Key className="w-4 h-4 text-gray-400" />
                  </div>
                </button>
                <button className="w-full text-left p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-white">Two-Factor Authentication</h3>
                      <p className="text-xs text-gray-400">Currently disabled</p>
                    </div>
                    <Shield className="w-4 h-4 text-gray-400" />
                  </div>
                </button>
                <button className="w-full text-left p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-white">Login Sessions</h3>
                      <p className="text-xs text-gray-400">Manage active sessions</p>
                    </div>
                    <Activity className="w-4 h-4 text-gray-400" />
                  </div>
                </button>
              </div>
            </div>

            <div className="glass rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Security Status</span>
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-sm text-white">Strong Password</span>
                  </div>
                  <span className="text-xs text-green-400">Active</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-yellow-500/10 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-yellow-400" />
                    <span className="text-sm text-white">Two-Factor Auth</span>
                  </div>
                  <span className="text-xs text-yellow-400">Disabled</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Activity className="w-5 h-5 text-green-400" />
                    <span className="text-sm text-white">Recent Activity</span>
                  </div>
                  <span className="text-xs text-green-400">Normal</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Profile;
