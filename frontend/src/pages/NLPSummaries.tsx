import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Send,
  Bot,
  User,
  Clock,
  FileText,
  Download,
  Share,
  Copy,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Eye
} from 'lucide-react';

const NLPSummaries: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSummary, setSelectedSummary] = useState<string | null>(null);

  const sampleQueries = [
    "Summarize all incidents from the last 24 hours",
    "What are the current crowd density trends?",
    "Generate a report on emergency response times",
    "Analyze security alerts and their patterns",
    "Create a summary of missing person cases"
  ];

  const generatedSummaries = [
    {
      id: 1,
      query: "Summarize all incidents from the last 24 hours",
      summary: "Over the past 24 hours, there were 12 total incidents reported across the venue. The most common type was crowd density alerts (5 incidents), followed by medical emergencies (3 incidents), and security concerns (2 incidents). The average response time was 2.3 minutes, which is within acceptable limits. Main Square had the highest incident concentration with 4 reports. All incidents were resolved successfully with no serious injuries reported.",
      timestamp: "2 minutes ago",
      status: "completed",
      confidence: 94,
      wordCount: 89
    },
    {
      id: 2,
      query: "What are the current crowd density trends?",
      summary: "Current crowd density analysis shows a steady increase from 1,200 people at 6 AM to 4,800 people at 12 PM. The peak density was recorded at Central Plaza (95% capacity) at 11:30 AM. Flow patterns indicate normal movement with no congestion detected. Predictive models suggest a 25% increase in the next 2 hours, reaching maximum capacity by 3 PM. Recommended actions: deploy additional security personnel to Central Plaza and monitor North Gate for potential overflow.",
      timestamp: "5 minutes ago",
      status: "completed",
      confidence: 91,
      wordCount: 95
    },
    {
      id: 3,
      query: "Generate a report on emergency response times",
      summary: "Emergency response performance analysis for the current shift shows excellent results. Average response time: 1.8 minutes (target: <3 minutes). Alpha Team responded fastest at 1.2 minutes, while Charlie Team averaged 2.1 minutes. All teams were deployed within 30 seconds of incident detection. Equipment readiness: 100%. Personnel availability: 95%. Recommendations: maintain current staffing levels and consider additional training for Charlie Team to improve response consistency.",
      timestamp: "8 minutes ago",
      status: "completed",
      confidence: 96,
      wordCount: 87
    },
    {
      id: 4,
      query: "Analyze security alerts and their patterns",
      summary: "Security alert analysis reveals 8 alerts triggered in the last 6 hours. Pattern analysis shows: 3 false alarms (37.5%), 4 legitimate security concerns (50%), and 1 system malfunction (12.5%). Most alerts occurred in high-traffic areas during peak hours (11 AM - 2 PM). Anomaly detection accuracy: 87%. Recommendations: adjust sensitivity thresholds for Zone A and B, implement additional verification steps for high-traffic periods, and schedule system maintenance for malfunctioning sensors.",
      timestamp: "12 minutes ago",
      status: "completed",
      confidence: 89,
      wordCount: 92
    },
    {
      id: 5,
      query: "Create a summary of missing person cases",
      summary: "Missing person case summary: 4 active cases, 1 resolved today. Current cases: Sarah Johnson (2 hours missing, Central Plaza), Emma Wilson (1 hour missing, East Wing), David Rodriguez (6 hours missing, Main Square). Resolved case: Michael Chen found safe at North Gate. Search operations ongoing for all active cases. AI facial recognition has processed 2,847 images with 94% accuracy. Recommendations: continue search operations, increase patrols in reported areas, and maintain communication with families.",
      timestamp: "15 minutes ago",
      status: "completed",
      confidence: 93,
      wordCount: 88
    }
  ];

  const handleGenerateSummary = async () => {
    if (!query.trim()) return;
    
    setIsGenerating(true);
    // Simulate API call
    setTimeout(() => {
      setIsGenerating(false);
      // In a real app, this would add the new summary to the list
    }, 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'generating': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'error': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'generating': return RefreshCw;
      case 'error': return AlertTriangle;
      default: return Clock;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500/10 via-transparent to-cyan-500/10 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <span>NLP Summaries</span>
              </h1>
              <p className="text-gray-300">
                AI-powered natural language processing for intelligent reporting
              </p>
            </div>
            <div className="mt-4 lg:mt-0 flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-2 bg-teal-500/20 border border-teal-500/30 rounded-lg">
                <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-teal-400">AI Processing</span>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Reports Generated</div>
                <div className="text-2xl font-bold text-white">24</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Query Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <div className="glass rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Bot className="w-5 h-5 text-teal-400" />
              <span>Generate AI Summary</span>
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Enter your query or request:
                </label>
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask for a summary, analysis, or report on any aspect of the emergency management system..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 resize-none"
                  rows={3}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  {query.length} characters
                </div>
                <button
                  onClick={handleGenerateSummary}
                  disabled={!query.trim() || isGenerating}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Generate Summary</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Sample Queries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Sample Queries</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sampleQueries.map((sampleQuery, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                onClick={() => setQuery(sampleQuery)}
                className="text-left p-4 glass rounded-lg hover:bg-white/10 transition-all duration-200 group"
              >
                <p className="text-sm text-gray-300 group-hover:text-white transition-colors duration-200">
                  {sampleQuery}
                </p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Generated Summaries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
            <FileText className="w-5 h-5 text-teal-400" />
            <span>Generated Summaries</span>
          </h2>
          <div className="space-y-6">
            {generatedSummaries.map((summary, index) => {
              const StatusIcon = getStatusIcon(summary.status);
              return (
                <motion.div
                  key={summary.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                  className={`glass rounded-xl p-6 border ${getStatusColor(summary.status)}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">Query: {summary.query}</h3>
                        <div className="flex items-center space-x-2">
                          <StatusIcon className="w-4 h-4" />
                          <span className="text-xs uppercase tracking-wide">{summary.status}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{summary.timestamp}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="w-4 h-4" />
                          <span>{summary.confidence}% confidence</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FileText className="w-4 h-4" />
                          <span>{summary.wordCount} words</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4 mb-4">
                    <div className="flex items-start space-x-3">
                      <Bot className="w-5 h-5 text-teal-400 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-300 leading-relaxed">
                          {summary.summary}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex items-center space-x-3">
                      <button className="flex items-center space-x-2 px-3 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 text-sm hover:bg-blue-500/30 transition-colors duration-200">
                        <Eye className="w-4 h-4" />
                        <span>View Details</span>
                      </button>
                      <button className="flex items-center space-x-2 px-3 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-sm hover:bg-green-500/30 transition-colors duration-200">
                        <Download className="w-4 h-4" />
                        <span>Export</span>
                      </button>
                      <button className="flex items-center space-x-2 px-3 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-400 text-sm hover:bg-purple-500/30 transition-colors duration-200">
                        <Copy className="w-4 h-4" />
                        <span>Copy</span>
                      </button>
                    </div>
                    <button className="flex items-center space-x-2 px-3 py-2 bg-gray-500/20 border border-gray-500/30 rounded-lg text-gray-400 text-sm hover:bg-gray-500/30 transition-colors duration-200">
                      <Share className="w-4 h-4" />
                      <span>Share</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NLPSummaries;
