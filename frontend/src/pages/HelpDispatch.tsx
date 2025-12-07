import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Truck,
  MapPin,
  Clock,
  User,
  Phone,
  AlertCircle,
  CheckCircle,
  XCircle,
  Radio,
  Shield,
  Zap,
  Target
} from 'lucide-react';

const HelpDispatch: React.FC = () => {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  const emergencyTeams = [
    {
      id: 1,
      name: 'Alpha Team',
      status: 'available',
      members: 4,
      specializations: ['Fire', 'Medical', 'Rescue'],
      location: 'Station A',
      responseTime: '2.3 min',
      equipment: ['Fire Truck', 'Medical Kit', 'Rescue Tools'],
      contact: '+1-555-0101'
    },
    {
      id: 2,
      name: 'Bravo Team',
      status: 'deployed',
      members: 3,
      specializations: ['Medical', 'Trauma'],
      location: 'Zone B',
      responseTime: '1.8 min',
      equipment: ['Ambulance', 'Trauma Kit'],
      contact: '+1-555-0102'
    },
    {
      id: 3,
      name: 'Charlie Team',
      status: 'available',
      members: 5,
      specializations: ['Fire', 'Hazmat', 'Rescue'],
      location: 'Station C',
      responseTime: '3.1 min',
      equipment: ['Fire Truck', 'Hazmat Suit', 'Rescue Equipment'],
      contact: '+1-555-0103'
    },
    {
      id: 4,
      name: 'Delta Team',
      status: 'busy',
      members: 3,
      specializations: ['Medical', 'Emergency'],
      location: 'Zone D',
      responseTime: '2.7 min',
      equipment: ['Ambulance', 'Emergency Kit'],
      contact: '+1-555-0104'
    },
    {
      id: 5,
      name: 'Echo Team',
      status: 'available',
      members: 4,
      specializations: ['Search', 'Rescue', 'Medical'],
      location: 'Station E',
      responseTime: '1.9 min',
      equipment: ['Search Vehicle', 'Rescue Tools', 'Medical Kit'],
      contact: '+1-555-0105'
    }
  ];

  const activeIncidents = [
    {
      id: 1,
      type: 'Fire Emergency',
      location: 'Central Plaza',
      severity: 'high',
      assignedTeam: 'Alpha Team',
      status: 'in_progress',
      time: '5 min ago',
      description: 'Structural fire detected in building complex'
    },
    {
      id: 2,
      type: 'Medical Emergency',
      location: 'North Gate',
      severity: 'medium',
      assignedTeam: 'Bravo Team',
      status: 'en_route',
      time: '8 min ago',
      description: 'Individual collapsed, requires immediate medical attention'
    },
    {
      id: 3,
      type: 'Missing Person',
      location: 'East Wing',
      severity: 'low',
      assignedTeam: 'Echo Team',
      status: 'searching',
      time: '12 min ago',
      description: 'Child reported missing, search operation in progress'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'deployed': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'busy': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'offline': return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'low': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getIncidentStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress': return 'text-orange-400 bg-orange-400/20';
      case 'en_route': return 'text-blue-400 bg-blue-400/20';
      case 'searching': return 'text-purple-400 bg-purple-400/20';
      case 'completed': return 'text-green-400 bg-green-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500/10 via-transparent to-emerald-500/10 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <span>Help Dispatch</span>
              </h1>
              <p className="text-gray-300">
                Emergency response coordination and team management
              </p>
            </div>
            <div className="mt-4 lg:mt-0 flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-400">Dispatch Active</span>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Available Teams</div>
                <div className="text-2xl font-bold text-white">3</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Truck className="w-6 h-6 text-green-400" />
              </div>
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">3</div>
            <div className="text-sm text-gray-400">Available Teams</div>
            <div className="text-xs text-green-400 mt-1">Ready for dispatch</div>
          </div>

          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Radio className="w-6 h-6 text-blue-400" />
              </div>
              <AlertCircle className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">3</div>
            <div className="text-sm text-gray-400">Active Incidents</div>
            <div className="text-xs text-blue-400 mt-1">Being handled</div>
          </div>

          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-400" />
              </div>
              <Zap className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">2.1min</div>
            <div className="text-sm text-gray-400">Avg Response</div>
            <div className="text-xs text-green-400 mt-1">-0.3min faster</div>
          </div>

          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-purple-400" />
              </div>
              <Target className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">19</div>
            <div className="text-sm text-gray-400">Total Personnel</div>
            <div className="text-xs text-blue-400 mt-1">Across all teams</div>
          </div>
        </motion.div>

        {/* Emergency Teams */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
            <Truck className="w-5 h-5 text-green-400" />
            <span>Emergency Response Teams</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {emergencyTeams.map((team, index) => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                whileHover={{ scale: 1.02 }}
                className={`glass rounded-xl p-6 border cursor-pointer transition-all duration-300 ${
                  selectedTeam === team.id.toString() ? 'ring-2 ring-green-500 bg-green-500/10' : 'hover:bg-white/5'
                } ${getStatusColor(team.status)}`}
                onClick={() => setSelectedTeam(selectedTeam === team.id.toString() ? null : team.id.toString())}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">{team.name}</h3>
                    <p className="text-sm text-gray-300">{team.location}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      team.status === 'available' ? 'bg-green-400' :
                      team.status === 'deployed' ? 'bg-blue-400' :
                      team.status === 'busy' ? 'bg-yellow-400' : 'bg-gray-400'
                    }`}></div>
                    <span className="text-xs uppercase tracking-wide">{team.status}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Members:</span>
                    <span className="text-white">{team.members}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Response Time:</span>
                    <span className="text-white">{team.responseTime}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Contact:</span>
                    <span className="text-white">{team.contact}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-sm text-gray-400 mb-2">Specializations:</div>
                  <div className="flex flex-wrap gap-2">
                    {team.specializations.map((spec, idx) => (
                      <span key={idx} className="px-2 py-1 bg-white/10 rounded text-xs text-gray-300">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-sm text-gray-400 mb-2">Equipment:</div>
                  <div className="flex flex-wrap gap-2">
                    {team.equipment.map((item, idx) => (
                      <span key={idx} className="px-2 py-1 bg-white/10 rounded text-xs text-gray-300">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {team.status === 'available' && (
                  <button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25">
                    Dispatch Team
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Active Incidents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-orange-400" />
            <span>Active Incidents</span>
          </h2>
          <div className="space-y-4">
            {activeIncidents.map((incident, index) => (
              <motion.div
                key={incident.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                className={`glass rounded-lg p-6 border ${getSeverityColor(incident.severity)}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{incident.type}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getIncidentStatusColor(incident.status)}`}>
                        {incident.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-300 mb-2">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{incident.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{incident.time}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{incident.assignedTeam}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300">{incident.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      incident.severity === 'high' ? 'bg-red-400' :
                      incident.severity === 'medium' ? 'bg-yellow-400' : 'bg-blue-400'
                    }`}></div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-2 px-3 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 text-sm hover:bg-blue-500/30 transition-colors duration-200">
                      <Radio className="w-4 h-4" />
                      <span>Contact Team</span>
                    </button>
                    <button className="flex items-center space-x-2 px-3 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-sm hover:bg-green-500/30 transition-colors duration-200">
                      <CheckCircle className="w-4 h-4" />
                      <span>Mark Complete</span>
                    </button>
                  </div>
                  <button className="flex items-center space-x-2 px-3 py-2 bg-gray-500/20 border border-gray-500/30 rounded-lg text-gray-400 text-sm hover:bg-gray-500/30 transition-colors duration-200">
                    <XCircle className="w-4 h-4" />
                    <span>Cancel</span>
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

export default HelpDispatch;