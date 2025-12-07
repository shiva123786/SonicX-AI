import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Users,
  MapPin,
  Calendar,
  Clock,
  Phone,
  Mail,
  AlertTriangle,
  Save,
  Camera,
  Bell,
  UserPlus,
  Settings
} from 'lucide-react';

interface Authority {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  department: string;
}

const EventSetup: React.FC = () => {
  const navigate = useNavigate();
  const [eventData, setEventData] = useState({
    eventName: '',
    eventType: 'party',
    location: '',
    date: '',
    startTime: '',
    endTime: '',
    expectedAttendees: '',
    description: ''
  });

  const [authorities, setAuthorities] = useState<Authority[]>([
    {
      id: '1',
      name: '',
      role: 'Security Head',
      phone: '',
      email: '',
      department: 'Security'
    }
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEventChange = (field: string, value: string) => {
    setEventData(prev => ({ ...prev, [field]: value }));
  };

  const handleAuthorityChange = (id: string, field: string, value: string) => {
    setAuthorities(prev => 
      prev.map(auth => 
        auth.id === id ? { ...auth, [field]: value } : auth
      )
    );
  };

  const addAuthority = () => {
    const newAuthority: Authority = {
      id: Date.now().toString(),
      name: '',
      role: 'Security Officer',
      phone: '',
      email: '',
      department: 'Security'
    };
    setAuthorities(prev => [...prev, newAuthority]);
  };

  const removeAuthority = (id: string) => {
    setAuthorities(prev => prev.filter(auth => auth.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Save event and authority data
      const eventSetup = {
        event: eventData,
        authorities: authorities.filter(auth => auth.name.trim() !== ''),
        setupDate: new Date().toISOString(),
        status: 'active'
      };

      // In a real app, this would save to backend
      localStorage.setItem('eventSetup', JSON.stringify(eventSetup));
      
      // Show success and redirect to authority dashboard
      alert('Event setup completed! Authorities will receive alerts.');
      navigate('/authority-dashboard');
    } catch (error) {
      console.error('Failed to setup event:', error);
      alert('Failed to setup event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <span>Event Setup</span>
              </h1>
              <p className="text-gray-300">
                Configure your event and add authorities for emergency response
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Event Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="glass rounded-xl p-6"
          >
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              <span>Event Information</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Event Name
                </label>
                <input
                  type="text"
                  required
                  value={eventData.eventName}
                  onChange={(e) => handleEventChange('eventName', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Annual Company Party"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Event Type
                </label>
                <select
                  value={eventData.eventType}
                  onChange={(e) => handleEventChange('eventType', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="party">Party/Reception</option>
                  <option value="conference">Conference</option>
                  <option value="concert">Concert</option>
                  <option value="festival">Festival</option>
                  <option value="sports">Sports Event</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Location
                </label>
                <input
                  type="text"
                  required
                  value={eventData.location}
                  onChange={(e) => handleEventChange('location', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Grand Ballroom, Downtown Convention Center"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={eventData.date}
                  onChange={(e) => handleEventChange('date', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Expected Attendees
                </label>
                <input
                  type="number"
                  required
                  value={eventData.expectedAttendees}
                  onChange={(e) => handleEventChange('expectedAttendees', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={eventData.description}
                  onChange={(e) => handleEventChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of the event..."
                />
              </div>
            </div>
          </motion.div>

          {/* Authorities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
                <Users className="w-5 h-5 text-green-400" />
                <span>Emergency Authorities</span>
              </h2>
              <button
                type="button"
                onClick={addAuthority}
                className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-sm hover:bg-green-500/30 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Add Authority
              </button>
            </div>

            <div className="space-y-6">
              {authorities.map((authority, index) => (
                <motion.div
                  key={authority.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-white/5 border border-white/10 rounded-lg p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-white">Authority #{index + 1}</h3>
                    {authorities.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAuthority(authority.id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={authority.name}
                        onChange={(e) => handleAuthorityChange(authority.id, 'name', e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Role/Position
                      </label>
                      <select
                        value={authority.role}
                        onChange={(e) => handleAuthorityChange(authority.id, 'role', e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Security Head">Security Head</option>
                        <option value="Security Officer">Security Officer</option>
                        <option value="Event Manager">Event Manager</option>
                        <option value="Medical Staff">Medical Staff</option>
                        <option value="Fire Department">Fire Department</option>
                        <option value="Police Liaison">Police Liaison</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        <Phone className="w-4 h-4 inline mr-1" />
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={authority.phone}
                        onChange={(e) => handleAuthorityChange(authority.id, 'phone', e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        <Mail className="w-4 h-4 inline mr-1" />
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={authority.email}
                        onChange={(e) => handleAuthorityChange(authority.id, 'email', e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="john.doe@company.com"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex justify-center"
          >
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl text-white font-semibold hover:from-green-600 hover:to-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Setting up...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Setup Event & Start Monitoring
                </>
              )}
            </button>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

export default EventSetup;
