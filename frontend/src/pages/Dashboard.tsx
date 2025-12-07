import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Users,
  AlertTriangle,
  Truck,
  BarChart3,
  Search,
  MessageSquare,
  Bell,
  TrendingUp,
  Clock,
  MapPin,
  Activity,
  Shield,
  Eye,
  Zap,
} from "lucide-react";

interface Alert {
  id?: number;
  type: string;
  message?: string;
  location?: string;
  confidence?: number | string;
  time?: string;
  severity?: string;
}

const Dashboard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [alerts, setAlerts] = useState<Alert[]>([]);

  // ⏰ Time updater
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 🚨 Fetch only real detections (fire, smoke, or person)
  useEffect(() => {
    async function fetchAlerts() {
      try {
        const response = await fetch("http://localhost:8000/api/alerts");
        const data: Alert[] = await response.json();

        // Only show if it’s a real detection
        const filtered = data.filter((alert: Alert) =>
          ["fire", "smoke_detected", "person_detected"].includes(alert.type)
        );

        setAlerts(filtered);
      } catch (err) {
        console.error("Error fetching live alerts:", err);
      }
    }

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      title: "Crowd Monitoring",
      description: "Real-time crowd analysis",
      icon: Users,
      href: "/crowd-monitoring",
      metrics: { value: "2,847", label: "People Tracked" },
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Anomaly Detection",
      description: "AI-powered threat detection",
      icon: AlertTriangle,
      href: "/anomaly-detection",
      metrics: { value: alerts.length.toString(), label: "Active Alerts" },
      color: "from-red-500 to-orange-500",
    },
    {
      title: "Help Dispatch",
      description: "Emergency response coordination",
      icon: Truck,
      href: "/help-dispatch",
      metrics: { value: "12", label: "Teams Deployed" },
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Predictive Analytics",
      description: "Crowd surge forecasting",
      icon: BarChart3,
      href: "/predictive-analytics",
      metrics: { value: "85%", label: "Accuracy Rate" },
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Lost & Found",
      description: "AI facial recognition",
      icon: Search,
      href: "/lost-found",
      metrics: { value: "7", label: "Missing Reports" },
      color: "from-indigo-500 to-blue-500",
    },
    {
      title: "NLP Summaries",
      description: "Intelligent reporting",
      icon: MessageSquare,
      href: "/nlp-summaries",
      metrics: { value: "24", label: "Reports Generated" },
      color: "from-teal-500 to-cyan-500",
    },
  ];

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case "high":
        return "text-red-400 bg-red-400/10 border-red-400/20";
      case "medium":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      case "low":
        return "text-blue-400 bg-blue-400/10 border-blue-400/20";
      default:
        return "text-gray-400 bg-gray-400/10 border-gray-400/20";
    }
  };

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
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Emergency Command Center
              </h1>
              <p className="text-gray-300">
                Real-time monitoring and response coordination
              </p>
            </div>
            <div className="mt-4 lg:mt-0 flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-400">Current Time</div>
                <div className="text-lg font-mono text-white">
                  {currentTime.toLocaleTimeString()}
                </div>
              </div>
              <div className="flex items-center space-x-2 px-3 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-400">System Online</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Alerts Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
              <Bell className="w-5 h-5 text-yellow-400" />
              <span>Active Alerts</span>
            </h2>
          </div>

          {alerts.length === 0 ? (
            <p className="text-gray-400 text-sm">
              ✅ No active fire, smoke, or person detections right now.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {alerts.map((alert, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`glass rounded-lg p-4 border ${getSeverityColor(
                    alert.severity
                  )}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-white font-medium">
                        {alert.type.replace("_", " ")} detected{" "}
                        {alert.location ? `at ${alert.location}` : ""}
                      </p>
                      {alert.confidence && (
                        <p className="text-xs text-gray-400 mt-1">
                          Confidence: {alert.confidence}%
                        </p>
                      )}
                      {alert.time && (
                        <p className="text-xs text-gray-400 mt-1">
                          {alert.time}
                        </p>
                      )}
                    </div>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        alert.severity === "high"
                          ? "bg-red-400"
                          : alert.severity === "medium"
                          ? "bg-yellow-400"
                          : "bg-blue-400"
                      }`}
                    ></div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-xl font-semibold text-white mb-6">
            System Modules
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  whileHover={{ scale: 1.02 }}
                  className="group"
                >
                  <Link to={feature.href}>
                    <div className="glass rounded-xl p-6 hover:bg-white/10 transition-all duration-300 cursor-pointer">
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg group-hover:scale-110 transition-transform duration-300`}
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-xs text-green-400 uppercase tracking-wide">
                            Active
                          </span>
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-300 mb-4">
                        {feature.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-white">
                            {feature.metrics.value}
                          </div>
                          <div className="text-xs text-gray-400">
                            {feature.metrics.label}
                          </div>
                        </div>
                        <TrendingUp className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
