import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  MapPin,
  TrendingUp,
  AlertTriangle,
  Eye,
  Activity,
  Clock,
  Target,
  BarChart3,
  Zap
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const CrowdMonitoring: React.FC = () => {
  const [selectedZone, setSelectedZone] = useState('all');
  const [timeRange, setTimeRange] = useState('1h');

  // Mock data
  const crowdData = [
    { time: '00:00', count: 1200, density: 65 },
    { time: '01:00', count: 980, density: 55 },
    { time: '02:00', count: 750, density: 45 },
    { time: '03:00', count: 600, density: 35 },
    { time: '04:00', count: 450, density: 25 },
    { time: '05:00', count: 380, density: 20 },
    { time: '06:00', count: 520, density: 30 },
    { time: '07:00', count: 890, density: 50 },
    { time: '08:00', count: 1450, density: 75 },
    { time: '09:00', count: 2100, density: 85 },
    { time: '10:00', count: 2800, density: 95 },
    { time: '11:00', count: 3200, density: 100 },
  ];

  const zoneData = [
    { name: 'Main Square', count: 1200, capacity: 2000, status: 'normal', color: '#10b981' },
    { name: 'North Gate', count: 800, capacity: 1200, status: 'normal', color: '#10b981' },
    { name: 'East Wing', count: 600, capacity: 800, status: 'normal', color: '#10b981' },
    { name: 'Central Plaza', count: 1800, capacity: 1500, status: 'warning', color: '#f59e0b' },
    { name: 'South Exit', count: 400, capacity: 600, status: 'normal', color: '#10b981' },
    { name: 'West Corridor', count: 950, capacity: 1000, status: 'normal', color: '#10b981' },
  ];

  const flowData = [
    { name: 'Incoming', value: 45, color: '#0ea5e9' },
    { name: 'Outgoing', value: 35, color: '#dc56ff' },
    { name: 'Stationary', value: 20, color: '#10b981' },
  ];

  const alerts = [
    { id: 1, zone: 'Central Plaza', message: 'Crowd density approaching threshold', severity: 'warning', time: '2 min ago' },
    { id: 2, zone: 'Main Square', message: 'Unusual movement pattern detected', severity: 'info', time: '5 min ago' },
    { id: 3, zone: 'North Gate', message: 'Crowd flow rate increased', severity: 'info', time: '8 min ago' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'warning': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'critical': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'warning': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'info': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'critical': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500/10 via-transparent to-cyan-500/10 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <span>Crowd Monitoring</span>
              </h1>
              <p className="text-gray-300">
                Real-time crowd density analysis and flow tracking
              </p>
            </div>
            <div className="mt-4 lg:mt-0 flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-400">Live Tracking</span>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Total People</div>
                <div className="text-2xl font-bold text-white">2,847</div>
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
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-300">Zone:</label>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Zones</option>
              <option value="main">Main Square</option>
              <option value="north">North Gate</option>
              <option value="east">East Wing</option>
              <option value="central">Central Plaza</option>
              <option value="south">South Exit</option>
              <option value="west">West Corridor</option>
            </select>
          </div>
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-300">Time Range:</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1h">Last Hour</option>
              <option value="6h">Last 6 Hours</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
            </select>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">2,847</div>
            <div className="text-sm text-gray-400">Total People</div>
            <div className="text-xs text-green-400 mt-1">+12% from last hour</div>
          </div>

          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-yellow-400" />
              </div>
              <Activity className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">68%</div>
            <div className="text-sm text-gray-400">Avg Density</div>
            <div className="text-xs text-yellow-400 mt-1">+5% from last hour</div>
          </div>

          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-green-400" />
              </div>
              <Zap className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">1.2m/s</div>
            <div className="text-sm text-gray-400">Avg Flow Rate</div>
            <div className="text-xs text-green-400 mt-1">Stable</div>
          </div>

          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-purple-400" />
              </div>
              <BarChart3 className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">6</div>
            <div className="text-sm text-gray-400">Active Zones</div>
            <div className="text-xs text-green-400 mt-1">All monitored</div>
          </div>
        </motion.div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Crowd Density Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="glass rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              <span>Crowd Density Over Time</span>
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={crowdData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="time" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#ffffff'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="density"
                    stroke="#0ea5e9"
                    fill="#0ea5e9"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Flow Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="glass rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Activity className="w-5 h-5 text-purple-400" />
              <span>Flow Distribution</span>
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={flowData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {flowData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#ffffff'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-6 mt-4">
              {flowData.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-gray-300">{item.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Zone Status & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Zone Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-green-400" />
              <span>Zone Status</span>
            </h3>
            <div className="space-y-3">
              {zoneData.map((zone, index) => (
                <motion.div
                  key={zone.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                  className={`glass rounded-lg p-4 border ${getStatusColor(zone.status)}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-white">{zone.name}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      zone.status === 'normal' ? 'bg-green-400/20 text-green-400' :
                      zone.status === 'warning' ? 'bg-yellow-400/20 text-yellow-400' :
                      'bg-red-400/20 text-red-400'
                    }`}>
                      {zone.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">{zone.count} / {zone.capacity}</span>
                    <span className="text-gray-400">{Math.round((zone.count / zone.capacity) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${(zone.count / zone.capacity) * 100}%`,
                        backgroundColor: zone.color
                      }}
                    ></div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Alerts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <span>Recent Alerts</span>
            </h3>
            <div className="space-y-3">
              {alerts.map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                  className={`glass rounded-lg p-4 border ${getSeverityColor(alert.severity)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-white mb-1">{alert.zone}</h4>
                      <p className="text-sm text-gray-300 mb-2">{alert.message}</p>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-400">{alert.time}</span>
                      </div>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${
                      alert.severity === 'warning' ? 'bg-yellow-400' :
                      alert.severity === 'critical' ? 'bg-red-400' : 'bg-blue-400'
                    }`}></div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CrowdMonitoring;
