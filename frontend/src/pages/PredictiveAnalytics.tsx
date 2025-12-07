import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Target,
  Eye,
  Brain,
  Zap,
  Clock,
  MapPin,
  Activity
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
  BarChart as RechartsBarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const PredictiveAnalytics: React.FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  const [selectedMetric, setSelectedMetric] = useState('crowd');

  // Mock data
  const crowdForecastData = [
    { time: '12:00', actual: 2800, predicted: 2750, confidence: 92 },
    { time: '13:00', actual: 3200, predicted: 3100, confidence: 89 },
    { time: '14:00', actual: 2900, predicted: 2950, confidence: 94 },
    { time: '15:00', actual: 3100, predicted: 3050, confidence: 91 },
    { time: '16:00', actual: 3500, predicted: 3400, confidence: 87 },
    { time: '17:00', actual: 3800, predicted: 3750, confidence: 93 },
    { time: '18:00', actual: 4200, predicted: 4100, confidence: 88 },
    { time: '19:00', actual: 4500, predicted: 4600, confidence: 95 },
    { time: '20:00', actual: 4800, predicted: 4700, confidence: 90 },
    { time: '21:00', actual: 5200, predicted: 5100, confidence: 92 },
  ];

  const riskAnalysisData = [
    { zone: 'Main Square', risk: 85, trend: 'increasing', incidents: 3 },
    { zone: 'Central Plaza', risk: 72, trend: 'stable', incidents: 2 },
    { zone: 'North Gate', risk: 68, trend: 'decreasing', incidents: 1 },
    { zone: 'East Wing', risk: 45, trend: 'stable', incidents: 0 },
    { zone: 'South Exit', risk: 38, trend: 'decreasing', incidents: 0 },
    { zone: 'West Corridor', risk: 55, trend: 'increasing', incidents: 1 },
  ];

  const predictionAccuracyData = [
    { name: 'Crowd Density', accuracy: 94, color: '#0ea5e9' },
    { name: 'Flow Patterns', accuracy: 89, color: '#10b981' },
    { name: 'Incident Risk', accuracy: 91, color: '#f59e0b' },
    { name: 'Response Time', accuracy: 96, color: '#8b5cf6' },
  ];

  const surgePredictions = [
    {
      id: 1,
      location: 'Main Square',
      predictedTime: '14:30',
      expectedSurge: '35%',
      confidence: 92,
      riskLevel: 'high',
      recommendation: 'Deploy additional security personnel'
    },
    {
      id: 2,
      location: 'Central Plaza',
      predictedTime: '16:45',
      expectedSurge: '25%',
      confidence: 87,
      riskLevel: 'medium',
      recommendation: 'Monitor crowd flow closely'
    },
    {
      id: 3,
      location: 'North Gate',
      predictedTime: '18:15',
      expectedSurge: '20%',
      confidence: 84,
      riskLevel: 'low',
      recommendation: 'Standard monitoring sufficient'
    }
  ];

  const getRiskColor = (risk: number) => {
    if (risk >= 80) return 'text-red-400 bg-red-400/10 border-red-400/20';
    if (risk >= 60) return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    return 'text-green-400 bg-green-400/10 border-green-400/20';
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing': return 'text-red-400';
      case 'decreasing': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-400 bg-red-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/20';
      case 'low': return 'text-green-400 bg-green-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500/10 via-transparent to-pink-500/10 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <span>Predictive Analytics</span>
              </h1>
              <p className="text-gray-300">
                AI-powered forecasting and risk analysis for crowd management
              </p>
            </div>
            <div className="mt-4 lg:mt-0 flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-purple-400">AI Active</span>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Accuracy Rate</div>
                <div className="text-2xl font-bold text-white">92%</div>
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
            <label className="text-sm font-medium text-gray-300">Timeframe:</label>
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="1h">Next Hour</option>
              <option value="6h">Next 6 Hours</option>
              <option value="24h">Next 24 Hours</option>
              <option value="7d">Next 7 Days</option>
            </select>
          </div>
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-300">Metric:</label>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="crowd">Crowd Density</option>
              <option value="flow">Flow Patterns</option>
              <option value="risk">Risk Assessment</option>
              <option value="incidents">Incident Prediction</option>
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
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-purple-400" />
              </div>
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">92%</div>
            <div className="text-sm text-gray-400">Prediction Accuracy</div>
            <div className="text-xs text-green-400 mt-1">+3% improvement</div>
          </div>

          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-blue-400" />
              </div>
              <Target className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">3</div>
            <div className="text-sm text-gray-400">Surge Predictions</div>
            <div className="text-xs text-blue-400 mt-1">Next 6 hours</div>
          </div>

          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-yellow-400" />
              </div>
              <Activity className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">72%</div>
            <div className="text-sm text-gray-400">Avg Risk Level</div>
            <div className="text-xs text-yellow-400 mt-1">+5% from yesterday</div>
          </div>

          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-green-400" />
              </div>
              <Clock className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">15min</div>
            <div className="text-sm text-gray-400">Lead Time</div>
            <div className="text-xs text-green-400 mt-1">Avg prediction</div>
          </div>
        </motion.div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Crowd Forecast */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="glass rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <span>Crowd Density Forecast</span>
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={crowdForecastData}>
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
                  <Line type="monotone" dataKey="actual" stroke="#0ea5e9" strokeWidth={2} />
                  <Line type="monotone" dataKey="predicted" stroke="#dc56ff" strokeWidth={2} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-6 mt-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-0.5 bg-blue-400"></div>
                <span className="text-sm text-gray-300">Actual</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-0.5 bg-purple-400 border-dashed border-t-2"></div>
                <span className="text-sm text-gray-300">Predicted</span>
              </div>
            </div>
          </motion.div>

          {/* Prediction Accuracy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="glass rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Target className="w-5 h-5 text-green-400" />
              <span>Prediction Accuracy</span>
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={predictionAccuracyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#ffffff'
                    }}
                  />
                  <Bar dataKey="accuracy" fill="#10b981" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Risk Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <span>Zone Risk Analysis</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {riskAnalysisData.map((zone, index) => (
              <motion.div
                key={zone.zone}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                className={`glass rounded-xl p-6 border ${getRiskColor(zone.risk)}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">{zone.zone}</h3>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-300">Zone {zone.zone.split(' ')[0]}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{zone.risk}%</div>
                    <div className="text-xs text-gray-400">Risk Level</div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Trend:</span>
                    <span className={`${getTrendColor(zone.trend)}`}>{zone.trend}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Incidents:</span>
                    <span className="text-white">{zone.incidents}</span>
                  </div>
                </div>

                <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${zone.risk}%`,
                      backgroundColor: zone.risk >= 80 ? '#ef4444' : zone.risk >= 60 ? '#f59e0b' : '#10b981'
                    }}
                  ></div>
                </div>

                <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25">
                  Analyze Zone
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Surge Predictions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
            <Brain className="w-5 h-5 text-purple-400" />
            <span>Crowd Surge Predictions</span>
          </h2>
          <div className="space-y-4">
            {surgePredictions.map((prediction, index) => (
              <motion.div
                key={prediction.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                className="glass rounded-lg p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{prediction.location}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getRiskLevelColor(prediction.riskLevel)}`}>
                        {prediction.riskLevel} risk
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300 mb-3">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>Predicted: {prediction.predictedTime}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4" />
                        <span>Surge: {prediction.expectedSurge}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4" />
                        <span>Confidence: {prediction.confidence}%</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 mb-4">{prediction.recommendation}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      prediction.riskLevel === 'high' ? 'bg-red-400' :
                      prediction.riskLevel === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                    }`}></div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="flex items-center space-x-4">
                    <button className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-400 text-sm hover:bg-purple-500/30 transition-colors duration-200">
                      View Details
                    </button>
                    <button className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 text-sm hover:bg-blue-500/30 transition-colors duration-200">
                      Set Alert
                    </button>
                  </div>
                  <button className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-sm hover:bg-green-500/30 transition-colors duration-200">
                    Deploy Resources
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

export default PredictiveAnalytics;
