import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  User,
  MapPin,
  Eye,
  Filter,
  Search,
  CheckCheck,
  Trash2,
  Settings
} from 'lucide-react';

const Notifications: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [liveNotifications, setLiveNotifications] = useState<any[]>([]);

  const notifications = [
    {
      id: 1,
      type: 'alert',
      title: 'High Crowd Density Detected',
      message: 'Crowd density at Central Plaza has reached 95% capacity. Immediate attention required.',
      timestamp: '2 minutes ago',
      status: 'unread',
      priority: 'high',
      location: 'Central Plaza',
      sender: 'Crowd Monitoring System',
      category: 'crowd'
    },
    {
      id: 2,
      type: 'info',
      title: 'Emergency Team Dispatched',
      message: 'Alpha Team has been dispatched to North Gate for medical emergency.',
      timestamp: '5 minutes ago',
      status: 'read',
      priority: 'medium',
      location: 'North Gate',
      sender: 'Dispatch System',
      category: 'dispatch'
    },
    {
      id: 3,
      type: 'warning',
      title: 'Anomaly Pattern Detected',
      message: 'Unusual movement pattern detected in East Wing. Investigation recommended.',
      timestamp: '8 minutes ago',
      status: 'unread',
      priority: 'high',
      location: 'East Wing',
      sender: 'Anomaly Detection AI',
      category: 'anomaly'
    },
    {
      id: 4,
      type: 'success',
      title: 'Missing Person Found',
      message: 'Sarah Johnson has been located and reunited with family at Central Plaza.',
      timestamp: '12 minutes ago',
      status: 'read',
      priority: 'medium',
      location: 'Central Plaza',
      sender: 'Lost & Found System',
      category: 'missing'
    },
    {
      id: 5,
      type: 'info',
      title: 'Crowd Surge Predicted',
      message: 'AI predicts 25% crowd increase at Main Square in the next 30 minutes.',
      timestamp: '15 minutes ago',
      status: 'read',
      priority: 'low',
      location: 'Main Square',
      sender: 'Predictive Analytics',
      category: 'prediction'
    },
    {
      id: 6,
      type: 'alert',
      title: 'Fire Alarm Triggered',
      message: 'Fire alarm activated in West Corridor. Emergency response initiated.',
      timestamp: '18 minutes ago',
      status: 'unread',
      priority: 'critical',
      location: 'West Corridor',
      sender: 'Fire Safety System',
      category: 'emergency'
    },
    {
      id: 7,
      type: 'info',
      title: 'Security Checkpoint Update',
      message: 'Security checkpoint at South Exit is now operational with full staffing.',
      timestamp: '22 minutes ago',
      status: 'read',
      priority: 'low',
      location: 'South Exit',
      sender: 'Security Management',
      category: 'security'
    },
    {
      id: 8,
      type: 'warning',
      title: 'Equipment Malfunction',
      message: 'Camera system in Zone A is experiencing connectivity issues.',
      timestamp: '25 minutes ago',
      status: 'read',
      priority: 'medium',
      location: 'Zone A',
      sender: 'Technical Support',
      category: 'technical'
    }
  ];

  // Merge static notifications with live notifications (live ones first)
  const mergedNotifications = [...liveNotifications, ...notifications];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'alert': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'warning': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'info': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'success': return 'text-green-400 bg-green-400/10 border-green-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'alert': return AlertTriangle;
      case 'warning': return AlertTriangle;
      case 'info': return Bell;
      case 'success': return CheckCircle;
      default: return Bell;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-400 bg-red-400/20';
      case 'high': return 'text-orange-400 bg-orange-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/20';
      case 'low': return 'text-blue-400 bg-blue-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const filteredNotifications = mergedNotifications.filter(notification => {
    const matchesFilter = selectedFilter === 'all' || 
      (selectedFilter === 'unread' && notification.status === 'unread') ||
      (selectedFilter === 'read' && notification.status === 'read') ||
      notification.category === selectedFilter;
    
    const matchesSearch = searchQuery === '' || 
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const unreadCount = mergedNotifications.filter(n => n.status === 'unread').length;

  // WebSocket to receive live events from backend
  React.useEffect(() => {
    const wsUrl = (window.location.hostname === 'localhost' ? 'ws://127.0.0.1:8000/ws' : `${window.location.protocol.replace('http','ws')}//${window.location.host}/ws`);
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => console.log('WS connected');
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        // Normalize incident messages
        if (msg.type === 'incident' && msg.incident) {
          setLiveNotifications(prev => [{
            id: `live-${Date.now()}`,
            type: 'alert',
            title: msg.incident.type.replace('_',' '),
            message: `Live incident in ${msg.incident.zone} (severity ${msg.incident.severity})`,
            timestamp: msg.incident.timestamp || 'just now',
            status: 'unread',
            priority: msg.incident.severity > 0.7 ? 'critical' : (msg.incident.severity > 0.4 ? 'high' : 'medium'),
            location: msg.incident.zone,
            sender: 'Camera AI',
            category: 'anomaly'
          }, ...prev]);
        }
      } catch (err) {
        console.error('WS message parse error', err);
      }
    };

    ws.onclose = () => console.log('WS closed');
    ws.onerror = (e) => console.error('WS error', e);

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500/10 via-transparent to-orange-500/10 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-1 bg-red-500 text-white text-sm rounded-full">
                    {unreadCount}
                  </span>
                )}
              </h1>
              <p className="text-gray-300">
                Real-time alerts and system notifications
              </p>
            </div>
            <div className="mt-4 lg:mt-0 flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-yellow-400">Live Updates</span>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Total Notifications</div>
                <div className="text-2xl font-bold text-white">{notifications.length}</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4 mb-8"
        >
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notifications..."
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-3 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="all">All Notifications</option>
              <option value="unread">Unread Only</option>
              <option value="read">Read Only</option>
              <option value="crowd">Crowd Alerts</option>
              <option value="dispatch">Dispatch Updates</option>
              <option value="anomaly">Anomaly Detection</option>
              <option value="missing">Missing Persons</option>
              <option value="prediction">Predictions</option>
              <option value="emergency">Emergencies</option>
              <option value="security">Security</option>
              <option value="technical">Technical</option>
            </select>
            <button className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/25">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <Bell className="w-5 h-5 text-red-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">{unreadCount}</div>
            <div className="text-sm text-gray-400">Unread Alerts</div>
            <div className="text-xs text-red-400 mt-1">Require attention</div>
          </div>

          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Bell className="w-6 h-6 text-blue-400" />
              </div>
              <CheckCircle className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">{notifications.length - unreadCount}</div>
            <div className="text-sm text-gray-400">Read Notifications</div>
            <div className="text-xs text-blue-400 mt-1">Already processed</div>
          </div>

          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-yellow-400" />
              </div>
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">3</div>
            <div className="text-sm text-gray-400">High Priority</div>
            <div className="text-xs text-yellow-400 mt-1">Need immediate action</div>
          </div>

          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <Eye className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">1</div>
            <div className="text-sm text-gray-400">Resolved Today</div>
            <div className="text-xs text-green-400 mt-1">Successfully handled</div>
          </div>
        </motion.div>

        {/* Notifications List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="space-y-4">
            {filteredNotifications.map((notification, index) => {
              const TypeIcon = getTypeIcon(notification.type);
              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                  className={`glass rounded-xl p-6 border transition-all duration-200 hover:bg-white/5 ${
                    notification.status === 'unread' ? 'ring-2 ring-yellow-500/50' : ''
                  } ${getTypeColor(notification.type)}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          notification.type === 'alert' ? 'bg-red-500/20' :
                          notification.type === 'warning' ? 'bg-yellow-500/20' :
                          notification.type === 'info' ? 'bg-blue-500/20' :
                          'bg-green-500/20'
                        }`}>
                          <TypeIcon className={`w-5 h-5 ${
                            notification.type === 'alert' ? 'text-red-400' :
                            notification.type === 'warning' ? 'text-yellow-400' :
                            notification.type === 'info' ? 'text-blue-400' :
                            'text-green-400'
                          }`} />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">{notification.title}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(notification.priority)}`}>
                            {notification.priority}
                          </span>
                          {notification.status === 'unread' && (
                            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-300 mb-3">{notification.message}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{notification.timestamp}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span>{notification.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span>{notification.sender}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex items-center space-x-3">
                      {notification.status === 'unread' && (
                      <button className="flex items-center space-x-2 px-3 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 text-sm hover:bg-blue-500/30 transition-colors duration-200">
                        <CheckCheck className="w-4 h-4" />
                        <span>Mark Read</span>
                      </button>
                      )}
                      <button className="flex items-center space-x-2 px-3 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-sm hover:bg-green-500/30 transition-colors duration-200">
                        <Eye className="w-4 h-4" />
                        <span>View Details</span>
                      </button>
                    </div>
                    <button className="flex items-center space-x-2 px-3 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm hover:bg-red-500/30 transition-colors duration-200">
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {filteredNotifications.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-300 mb-2">No notifications found</h3>
              <p className="text-gray-400">Try adjusting your filters or search terms</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Notifications;
