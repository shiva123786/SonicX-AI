import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Eye,
  MapPin,
  Clock,
  TrendingUp,
  Shield,
  Activity,
  Zap,
  Target,
  BarChart3
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
  ScatterChart,
  Scatter
} from 'recharts';

const AnomalyDetection: React.FC = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [camError, setCamError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      setCamError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }, 
        audio: false 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsCameraActive(true);
      }
    } catch (err: any) {
      setCamError(err?.message || 'Unable to access webcam');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraActive(false);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  useEffect(() => {
    // Auto-start camera when component mounts
    startCamera();
    
    return () => {
      stopCamera();
    };
  }, []);

  // Mock data
  const anomalyData = [
    { time: '00:00', count: 2, severity: 'low' },
    { time: '01:00', count: 1, severity: 'low' },
    { time: '02:00', count: 0, severity: 'none' },
    { time: '03:00', count: 1, severity: 'low' },
    { time: '04:00', count: 3, severity: 'medium' },
    { time: '05:00', count: 2, severity: 'low' },
    { time: '06:00', count: 4, severity: 'medium' },
    { time: '07:00', count: 6, severity: 'high' },
    { time: '08:00', count: 8, severity: 'high' },
    { time: '09:00', count: 5, severity: 'medium' },
    { time: '10:00', count: 3, severity: 'medium' },
    { time: '11:00', count: 7, severity: 'high' },
  ];

  const scatterData = [
    { x: 100, y: 200, severity: 'low', zone: 'Main Square' },
    { x: 150, y: 300, severity: 'medium', zone: 'North Gate' },
    { x: 200, y: 400, severity: 'high', zone: 'Central Plaza' },
    { x: 80, y: 150, severity: 'low', zone: 'East Wing' },
    { x: 300, y: 500, severity: 'high', zone: 'South Exit' },
    { x: 120, y: 250, severity: 'medium', zone: 'West Corridor' },
  ];

  const activeAnomalies = [
    {
      id: 1,
      type: 'Unusual Movement Pattern',
      zone: 'Central Plaza',
      severity: 'high',
      confidence: 94,
      time: '2 min ago',
      description: 'Detected irregular crowd flow pattern inconsistent with normal behavior',
      coordinates: { x: 245, y: 380 },
      status: 'investigating'
    },
    {
      id: 2,
      type: 'Crowd Density Spike',
      zone: 'Main Square',
      severity: 'medium',
      confidence: 87,
      time: '5 min ago',
      description: 'Sudden increase in crowd density beyond expected threshold',
      coordinates: { x: 120, y: 220 },
      status: 'monitoring'
    },
    {
      id: 3,
      type: 'Panic Behavior',
      zone: 'North Gate',
      severity: 'critical',
      confidence: 96,
      time: '8 min ago',
      description: 'Detected panic-like movement patterns suggesting emergency situation',
      coordinates: { x: 180, y: 320 },
      status: 'alert'
    },
    {
      id: 4,
      type: 'Fire Detection',
      zone: 'East Wing',
      severity: 'critical',
      confidence: 92,
      time: '12 min ago',
      description: 'Thermal anomaly detected suggesting potential fire hazard',
      coordinates: { x: 90, y: 160 },
      status: 'alert'
    },
    {
      id: 5,
      type: 'Congestion Pattern',
      zone: 'West Corridor',
      severity: 'low',
      confidence: 78,
      time: '15 min ago',
      description: 'Unusual congestion pattern detected in corridor',
      coordinates: { x: 130, y: 260 },
      status: 'resolved'
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'high': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'low': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'alert': return 'text-red-400 bg-red-400/20';
      case 'investigating': return 'text-yellow-400 bg-yellow-400/20';
      case 'monitoring': return 'text-blue-400 bg-blue-400/20';
      case 'resolved': return 'text-green-400 bg-green-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getSeverityDotColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      case 'low': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500/10 via-transparent to-orange-500/10 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <span>Anomaly Detection</span>
              </h1>
              <p className="text-gray-300">
                AI-powered threat detection and unusual pattern analysis
              </p>
            </div>
            <div className="mt-4 lg:mt-0 flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-2 bg-red-500/20 border border-red-500/30 rounded-lg">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-red-400">Active Monitoring</span>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Active Alerts</div>
                <div className="text-2xl font-bold text-white">5</div>
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
            <label className="text-sm font-medium text-gray-300">Time Range:</label>
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="1h">Last Hour</option>
              <option value="6h">Last 6 Hours</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
            </select>
          </div>
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-300">Severity:</label>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
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
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <TrendingUp className="w-5 h-5 text-red-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">5</div>
            <div className="text-sm text-gray-400">Active Alerts</div>
            <div className="text-xs text-red-400 mt-1">+2 from last hour</div>
          </div>

          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-yellow-400" />
              </div>
              <Activity className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">94%</div>
            <div className="text-sm text-gray-400">Detection Accuracy</div>
            <div className="text-xs text-green-400 mt-1">+2% improvement</div>
          </div>

          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-green-400" />
              </div>
              <Zap className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">1.2s</div>
            <div className="text-sm text-gray-400">Avg Response Time</div>
            <div className="text-xs text-green-400 mt-1">-0.3s faster</div>
          </div>

          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-400" />
              </div>
              <BarChart3 className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">12</div>
            <div className="text-sm text-gray-400">Patterns Detected</div>
            <div className="text-xs text-blue-400 mt-1">This hour</div>
          </div>
        </motion.div>

        {/* Webcam Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="glass rounded-xl p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
              <Eye className="w-5 h-5 text-yellow-400" />
              <span>Live Webcam Preview</span>
            </h3>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isCameraActive ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
              <span className="text-sm text-gray-400">
                {isCameraActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          
          {camError ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
              <div className="text-red-400 mb-4">⚠️ Camera Access Error</div>
              <div className="text-sm text-gray-300 mb-4">{camError}</div>
              <button
                onClick={startCamera}
                className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm hover:bg-red-500/30 transition-colors"
              >
                Retry Camera Access
              </button>
            </div>
          ) : (
            <div className="relative w-full max-w-4xl">
              <video
                ref={videoRef}
                muted
                playsInline
                autoPlay
                className="w-full rounded-lg border border-white/10 bg-black"
                style={{ aspectRatio: '16/9' }}
              />
              
              {/* Camera Controls */}
              <div className="flex items-center justify-center space-x-4 mt-4">
                <button
                  onClick={isCameraActive ? stopCamera : startCamera}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isCameraActive 
                      ? 'bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30'
                      : 'bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30'
                  }`}
                >
                  {isCameraActive ? 'Stop Camera' : 'Start Camera'}
                </button>
                
                <div className="text-xs text-gray-400">
                  AI analyzing: Fire, Smoke, Crowd Surge, Panic
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Anomaly Detection Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="glass rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-red-400" />
              <span>Anomaly Detection Over Time</span>
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={anomalyData}>
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
                    dataKey="count"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Anomaly Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="glass rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Target className="w-5 h-5 text-orange-400" />
              <span>Anomaly Distribution</span>
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart data={scatterData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="x" stroke="#9ca3af" />
                  <YAxis dataKey="y" stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#ffffff'
                    }}
                  />
                  <Scatter dataKey="y" fill="#ef4444" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-6 mt-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <span className="text-sm text-gray-300">Critical</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-orange-400"></div>
                <span className="text-sm text-gray-300">High</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <span className="text-sm text-gray-300">Medium</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                <span className="text-sm text-gray-300">Low</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Active Anomalies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span>Active Anomalies</span>
          </h3>
          <div className="space-y-4">
            {activeAnomalies.map((anomaly, index) => (
              <motion.div
                key={anomaly.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                className={`glass rounded-lg p-6 border ${getSeverityColor(anomaly.severity)}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: getSeverityDotColor(anomaly.severity) }}></div>
                    <h4 className="font-semibold text-white">{anomaly.type}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(anomaly.status)}`}>
                      {anomaly.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-white">{anomaly.confidence}%</div>
                    <div className="text-xs text-gray-400">confidence</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-300">{anomaly.zone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-300">{anomaly.time}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-300 mb-2">Coordinates:</div>
                    <div className="text-xs text-gray-400">X: {anomaly.coordinates.x}, Y: {anomaly.coordinates.y}</div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-300 mb-4">{anomaly.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm hover:bg-red-500/30 transition-colors duration-200">
                      Investigate
                    </button>
                    <button className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 text-sm hover:bg-blue-500/30 transition-colors duration-200">
                      Monitor
                    </button>
                  </div>
                  <button className="px-4 py-2 bg-gray-500/20 border border-gray-500/30 rounded-lg text-gray-400 text-sm hover:bg-gray-500/30 transition-colors duration-200">
                    Dismiss
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AnomalyDetection;
