import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Upload,
  Eye,
  MapPin,
  Clock,
  User,
  Camera,
  CheckCircle,
  AlertCircle,
  Filter,
  Download,
  Share
} from 'lucide-react';

const LostFound: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [reporterName, setReporterName] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [capStream, setCapStream] = useState<MediaStream | null>(null);

  // Load items
  const fetchItems = async () => {
    try {
      const res = await fetch('/api/lostfound');
      const data = await res.json();
      setItems(data?.items || []);
    } catch (e) {
      console.warn(e);
    }
  };
  useEffect(() => {
    fetchItems();
  }, []);

  // Handle file upload
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setUploadedImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  // Camera capture
  const startCapture = async () => {
    const s = await navigator.mediaDevices.getUserMedia({ video: true });
    setCapStream(s);
    if (videoRef.current) videoRef.current.srcObject = s;
  };
  const takeSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current as HTMLVideoElement;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    setUploadedImage(canvas.toDataURL('image/jpeg'));
  };
  const stopCapture = () => {
    capStream?.getTracks().forEach(t => t.stop());
    setCapStream(null);
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  // Submit missing person report
  const submitReport = async () => {
    if (!uploadedImage || !reporterName) {
      alert("Please provide both name and photo.");
      return;
    }
    setIsAnalyzing(true);
    try {
      const blob = await (await fetch(uploadedImage)).blob();
      const form = new FormData();
      form.append('reporter', reporterName);
      form.append('image', blob, 'capture.jpg');
      const res = await fetch('http://localhost:5000/api/lostfound/report', {
        method: 'POST',
        body: form,
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Report submitted: ${data.status}`);
        await fetchItems();
        setIsUploadModalOpen(false);
        setUploadedImage(null);
        setReporterName('');
      } else {
        alert('Error submitting report');
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setIsAnalyzing(false);
      stopCapture();
    }
  };

  <img
  src="http://127.0.0.1:5000/video_feed"
  alt="Live Detection"
  className="rounded-lg w-full"
/>



  useEffect(() => {
  const interval = setInterval(async () => {
    const res = await fetch('/api/alert_status');
    const data = await res.json();
    if (data.alert) {
      alert('🚨 Missing person detected on camera!');
    }
  }, 4000);
  return () => clearInterval(interval);
}, []);


  // Static example data
  const missingPersons = [
    {
      id: 1,
      name: 'Sarah Johnson',
      age: 28,
      lastSeen: 'Central Plaza',
      timeMissing: '2 hours ago',
      description: 'Wearing blue jacket, brown hair, 5\'6"',
      status: 'searching',
      reporter: 'Security Guard Mike'
    }
  ];

  const foundItems = [
    {
      id: 1,
      item: 'Black Backpack',
      location: 'Central Plaza',
      foundTime: '30 min ago',
      description: 'Black backpack with laptop compartment',
      status: 'unclaimed',
      finder: 'Security Guard Tom'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'searching': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'found': return 'text-green-400 bg-green-400/10 border-green-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'searching': return AlertCircle;
      case 'found': return CheckCircle;
      default: return AlertCircle;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500/10 via-transparent to-blue-500/10 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <Search className="w-6 h-6 text-white" />
                </div>
                <span>Lost & Found</span>
              </h1>
              <p className="text-gray-300">
                AI-powered facial recognition and item tracking system
              </p>
            </div>
            <div className="mt-4 lg:mt-0 flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-2 bg-indigo-500/20 border border-indigo-500/30 rounded-lg">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-indigo-400">AI Active</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
<div className="relative mt-6 border border-gray-700 rounded-xl overflow-hidden">
  <img
    src="http://127.0.0.1:5000/video_feed"
    alt="Live Detection"
    className="w-full object-cover"
    onError={(e) => {
      e.currentTarget.src = "";
      e.currentTarget.alt = "Camera feed not available";
    }}
  />
  <div className="absolute bottom-2 right-2 bg-black/50 px-2 py-1 rounded text-xs text-white">
    YOLO Live Detection
  </div>
</div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300"
          >
            <Upload className="w-4 h-4" />
            <span>Report Missing</span>
          </button>
        </div>

        {/* Upload Modal */}
        {isUploadModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsUploadModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass rounded-2xl p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold text-white mb-6">Report Missing Person</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                  <input
                    type="text"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter full name"
                  />
                </div>

                {/* Upload or Camera */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Photo</label>
                  {!uploadedImage ? (
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
                      <label className="cursor-pointer">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">Click to upload photo</p>
                        <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                      </label>
                      <p className="text-gray-500 text-sm mt-2">or use webcam</p>
                      {!capStream ? (
                        <button onClick={startCapture} className="mt-2 text-indigo-400 underline">Start Camera</button>
                      ) : (
                        <button onClick={takeSnapshot} className="mt-2 text-blue-400 underline">Capture Snapshot</button>
                      )}
                    </div>
                  ) : (
                    <img src={uploadedImage} alt="Preview" className="w-full rounded-lg mt-2" />
                  )}
                </div>

                {capStream && (
                  <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg mt-2" />
                )}
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 bg-gray-500/20 border border-gray-500/30 rounded-lg text-gray-400 hover:bg-gray-500/30 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={submitReport}
                  disabled={isAnalyzing}
                  className={`px-4 py-2 font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/25 ${
                    isAnalyzing
                      ? 'bg-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white'
                  }`}
                >
                  {isAnalyzing ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default LostFound;
