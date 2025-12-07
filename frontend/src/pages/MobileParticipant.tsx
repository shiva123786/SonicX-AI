import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Mic,
  MicOff,
  Camera,
  CameraOff,
  MapPin,
  AlertTriangle,
  Shield,
  Phone,
  Wifi,
  Battery,
  Volume2,
  VolumeX,
  Users,
  Bell,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { SoundDetector } from '../utils/soundDetection';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
}

interface VoiceAlert {
  id: string;
  type: 'help' | 'scream' | 'child' | 'distress';
  timestamp: string;
  status?: string;
  confidence?: number;
  location?: LocationData;
  audioLevel?: number;
  description?: string;
}

const MobileParticipant: React.FC = () => {
  const [permissions, setPermissions] = useState({
    camera: false,
    microphone: false,
    location: false
  });
  const [isConnected, setIsConnected] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isHelpListening, setIsHelpListening] = useState(false);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [voiceAlerts, setVoiceAlerts] = useState<VoiceAlert[]>([]);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  // Lost & Found state (participant)
  const [lfReporter, setLfReporter] = useState<string>("Participant");
  const [lfDesc, setLfDesc] = useState<string>("");
  const [lfFile, setLfFile] = useState<File | null>(null);
  const [lfItems, setLfItems] = useState<any[]>([]);
  const [lfFilter, setLfFilter] = useState<'all'|'reported'|'resolved'>('all');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [isAskingAi, setIsAskingAi] = useState(false);
  const [nlpSummary, setNlpSummary] = useState("");
  const [participantId, setParticipantId] = useState<string>("");
  const [isCameraStreaming, setIsCameraStreaming] = useState(false);
  const [participantName, setParticipantName] = useState<string>("");

  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamIntervalRef = useRef<number | null>(null);
  const soundDetectorRef = useRef<SoundDetector | null>(null);

  useEffect(() => {
    // Generate unique participant ID
    const id = localStorage.getItem('participantId') || `participant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('participantId', id);
    setParticipantId(id);
    
    // Get participant name from localStorage or prompt (guard if prompt unsupported)
    const name = (() => {
      try {
        const stored = localStorage.getItem('participantName');
        if (stored) return stored;
        const canPrompt = typeof window !== 'undefined' && typeof (window as any).prompt === 'function';
        const entered = canPrompt ? (window as any).prompt('Enter your name:', 'Participant') : null;
        return entered || 'Anonymous';
      } catch {
        return 'Anonymous';
      }
    })();
    localStorage.setItem('participantName', name);
    setParticipantName(name);
    
    requestPermissions();
    startLocationTracking();
  }, []);

  // Poll Lost & Found list
  useEffect(() => {
    const loadLf = async () => {
      try {
        const r = await fetch('/api/lostfound');
        const d = await r.json();
        setLfItems(d?.items || []);
      } catch {}
    };
    loadLf();
    const id = setInterval(loadLf, 5000);
    return () => clearInterval(id);
  }, []);

  // Initialize sound detector (start only after mic permission granted)
  useEffect(() => {
    const detector = new SoundDetector({
      volumeThreshold: 100, // High volume threshold for distress
      onHelpDetected: () => {
        console.log('🆘 "HELP" DETECTED!');
        // NO POPUP - Just add to voice alerts list
        const newAlert: VoiceAlert = {
          id: Date.now().toString(),
          type: 'help',
          timestamp: new Date().toISOString(),
          status: 'active'
        };
        setVoiceAlerts(prev => [newAlert, ...prev]);
        setIsEmergencyMode(true);
      },
      onDistressDetected: (volume) => {
        console.log(`📢 High volume detected: ${volume}`);
        // NO POPUP - Just add to voice alerts list
        const newAlert: VoiceAlert = {
          id: Date.now().toString(),
          type: 'distress',
          timestamp: new Date().toISOString(),
          status: 'active'
        };
        setVoiceAlerts(prev => [newAlert, ...prev]);
      }
    });
    
    soundDetectorRef.current = detector;
    
    return () => {
      if (soundDetectorRef.current) {
        soundDetectorRef.current.stopListening();
        console.log('🛑 Sound detection stopped');
      }
    };
  }, []);
  
  // Auto-start sound detection ONLY after microphone permission granted
  useEffect(() => {
    if (permissions.microphone) {
      console.log('🎙️ Microphone permission granted - starting sound detection...');
      
      // Force recreate the SoundDetector to ensure it's properly initialized
      console.log('🔄 Creating new SoundDetector instance...');
      const detector = new SoundDetector({
        volumeThreshold: 100, // High volume threshold for distress
        onHelpDetected: () => {
          console.log('🆘 "HELP" DETECTED!');
          // Add to voice alerts list only (no popup)
          const newAlert: VoiceAlert = {
            id: Date.now().toString(),
            type: 'help',
            timestamp: new Date().toISOString(),
            status: 'active'
          };
          setVoiceAlerts(prev => [newAlert, ...prev]);
          setIsEmergencyMode(true);
          
          // Send help alert to backend
          fetch('/api/alert/help', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              participantId,
              participantName,
              location,
              timestamp: new Date().toISOString()
            })
          }).catch(err => console.error('Failed to send help alert:', err));
        },
        onDistressDetected: (volume) => {
          console.log(`📢 High volume detected: ${volume}`);
          // Add to voice alerts list
          const newAlert: VoiceAlert = {
            id: Date.now().toString(),
            type: 'distress',
            timestamp: new Date().toISOString(),
            status: 'active'
          };
          setVoiceAlerts(prev => [newAlert, ...prev]);
        }
      });
      
      // Store the detector in ref
      soundDetectorRef.current = detector;
      
      // Start listening with explicit console logs for debugging
      console.log('🎤 Attempting to start sound detection...');
      detector.startListening().then((success) => {
        console.log('✅ Sound detection started successfully:', success);
        if (success) setIsHelpListening(true);
        
        // Add a test message to verify speech recognition is working
        console.log('🔊 SPEECH TEST: Say "help" clearly to test detection');
        
        // Add a global test function that can be called from console
        (window as any).testHelpDetection = () => {
          console.log('🧪 Manual test: Simulating "help" detection');
          if (detector) {
            (detector as any).triggerHelpDetection('help (test)', 1.0);
          }
        };
        
        console.log('💡 TIP: Open browser console and type testHelpDetection() to manually test');

        // Auto-run help detection test if URL contains ?autoHelpTest
        try {
          const params = new URLSearchParams(window.location.search);
          if (params.has('autoHelpTest')) {
            console.log('🧪 Auto Help Test param detected — running testHelpDetection...');
            setTimeout(() => {
              try {
                (window as any).testHelpDetection?.();
                console.log('🧪 Auto Help Test executed');
              } catch (e) {
                console.warn('⚠️ Auto Help Test failed:', e);
              }
            }, 300);
          }
        } catch {}
      }).catch((err) => {
        console.error('❌ Failed to start sound detection:', err);
        
        // Try alternative approach if first attempt fails
        setTimeout(() => {
          console.log('🔄 Retrying sound detection with alternative approach...');
          if (soundDetectorRef.current) {
            console.log('🎤 Second attempt to start sound detection...');
            soundDetectorRef.current.startListening().then(success => {
              console.log('✅ Second attempt succeeded:', success);
              if (success) setIsHelpListening(true);
            }).catch(e => {
              console.error('❌ Second attempt also failed:', e);
              
              // Last resort - recreate with minimal options
              console.log('🔄 Final attempt with minimal configuration...');
              const simpleDetector = new SoundDetector({
                onHelpDetected: () => {
                  console.log('🆘 HELP detected in final attempt!');
                  // No popup; rely on Voice Alerts section and backend alert
                  const newAlert: VoiceAlert = {
                    id: Date.now().toString(),
                    type: 'help',
                    timestamp: new Date().toISOString(),
                    status: 'active'
                  };
                  setVoiceAlerts(prev => [newAlert, ...prev]);
                }
              });
              soundDetectorRef.current = simpleDetector;
              simpleDetector.startListening().then(ok => setIsHelpListening(!!ok));
            });
          }
        }, 1000);
      });
    }
  }, [permissions.microphone, participantId, participantName, location]);

  // Explicit user-gesture start/stop for speech recognition
  const startHelpListening = async () => {
    console.log('▶️ User clicked Start Help Listening');
    if (!soundDetectorRef.current) {
      console.warn('No SoundDetector instance available');
      return;
    }
    try {
      const ok = await soundDetectorRef.current.startListening();
      setIsHelpListening(!!ok);
      console.log('🎤 Help listening status:', ok);
    } catch (e) {
      console.error('Failed to start help listening:', e);
    }
  };

  const stopHelpListening = () => {
    console.log('⏹️ User clicked Stop Help Listening');
    try {
      soundDetectorRef.current?.stopListening();
      setIsHelpListening(false);
    } catch (e) {
      console.error('Failed to stop help listening:', e);
    }
  };

  // Fetch NLP summary periodically
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch('/api/nlp/summary');
        const data = await res.json();
        setNlpSummary(data?.summary || '');
      } catch {}
    };
    fetchSummary();
    const id = setInterval(fetchSummary, 10000);
    return () => clearInterval(id);
  }, []);

  const requestPermissions = async () => {
    try {
      // Check if browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('❌ getUserMedia not supported in this browser');
        return;
      }
      
      // Request camera permission
      try {
        const cameraStream = await navigator.mediaDevices.getUserMedia({ 
          video: true,
          audio: false 
        });
        setPermissions(prev => ({ ...prev, camera: true }));
        cameraStream.getTracks().forEach(track => track.stop());
        console.log('✅ Camera permission granted');
      } catch (err) {
        console.log('⚠️ Camera permission denied:', err);
      }

      // Request microphone permission
      try {
        const micStream = await navigator.mediaDevices.getUserMedia({ 
          video: false,
          audio: true 
        });
        setPermissions(prev => ({ ...prev, microphone: true }));
        micStream.getTracks().forEach(track => track.stop());
        console.log('✅ Microphone permission granted');
      } catch (err) {
        console.log('⚠️ Microphone permission denied:', err);
      }

      // Request location permission
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          () => {
            setPermissions(prev => ({ ...prev, location: true }));
            console.log('✅ Location permission granted');
          },
          (err) => console.log('⚠️ Location permission denied:', err.message)
        );
      } else {
        console.log('⚠️ Geolocation not supported');
      }

    } catch (error) {
      console.error('Permission request failed:', error);
    }
  };

  const startLocationTracking = () => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString()
        });
      },
      (error) => console.error('Location error:', error),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  };

  // Camera streaming functions
  const startCameraStreaming = async () => {
    try {
      console.log('📹 Starting camera streaming...');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setIsCameraStreaming(true);
      
      // Send frames to backend every 2 seconds
      const sendFrame = async () => {
        if (!videoRef.current || !isCameraStreaming) return;
        
        try {
          const video = videoRef.current;
          if (video.readyState < 2) return; // Video not ready
          
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 360;
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.6));
            
            if (blob) {
              const formData = new FormData();
              formData.append('participant_id', participantId);
              formData.append('participant_name', participantName);
              formData.append('image', blob, 'frame.jpg');
              
              await fetch('/api/participant/stream', {
                method: 'POST',
                body: formData
              });
              
              console.log('📤 Frame sent to authority dashboard');
            }
          }
        } catch (error) {
          console.error('❌ Error sending frame:', error);
        }
      };
      
      // Send first frame immediately
      await sendFrame();
      
      // Then send every 2 seconds
      streamIntervalRef.current = window.setInterval(sendFrame, 2000);
      
      console.log('✅ Camera streaming started');
    } catch (error) {
      console.error('❌ Failed to start camera streaming:', error);
      alert('Failed to access camera. Please check permissions.');
    }
  };

  const stopCameraStreaming = () => {
    console.log('⏹️ Stopping camera streaming...');
    
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
      streamIntervalRef.current = null;
    }
    
    setIsCameraStreaming(false);
    console.log('✅ Camera streaming stopped');
  };

  const startVoiceMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      });

      streamRef.current = stream;
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      // Start audio level monitoring
      monitorAudioLevel();

      // Start voice detection
      detectVoice();

      // Notify backend that participant joined
      try {
        await fetch('/api/participant/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            deviceId: 'mobile-participant-' + Date.now(),
            location
          })
        });
      } catch {}

      setIsMonitoring(true);
    } catch (error) {
      console.error('Failed to start voice monitoring:', error);
    }
  };

  const monitorAudioLevel = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const updateLevel = () => {
      analyserRef.current!.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setAudioLevel(average);
      animationFrameRef.current = requestAnimationFrame(updateLevel);
    };
    
    updateLevel();
  };

  const detectVoice = () => {
    let lastSent = 0;
    const detectionInterval = setInterval(() => {
      if (!analyserRef.current) return;

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      
      // Detect high audio levels (potential screaming/help calls)
      if (average > 110 && Date.now() - lastSent > 2500) {
        const alertType = detectVoiceType(average);
        
        const newAlert: VoiceAlert = {
          id: Date.now().toString(),
          type: alertType,
          confidence: Math.min(average / 2, 95),
          timestamp: new Date().toISOString(),
          location: location || { latitude: 0, longitude: 0, accuracy: 0, timestamp: '' },
          audioLevel: average
        };

        setVoiceAlerts(prev => [newAlert, ...prev.slice(0, 9)]);
        
        // Send alert to authorities
        sendVoiceAlert(newAlert);
        lastSent = Date.now();
      }
    }, 1000);

    return () => clearInterval(detectionInterval);
  };

  const detectVoiceType = (audioLevel: number): 'help' | 'scream' | 'child' | 'distress' => {
    // Simple voice type detection based on audio characteristics
    if (audioLevel > 150) return 'scream';
    if (audioLevel > 120) return 'help';
    if (audioLevel > 90) return 'distress';
    return 'child';
  };

  const sendVoiceAlert = async (alert: VoiceAlert) => {
    try {
      await fetch('/api/voice-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...alert,
          deviceId: 'mobile-participant-' + Date.now(),
          deviceInfo: {
            userAgent: navigator.userAgent,
            platform: navigator.platform
          }
        })
      });
    } catch (error) {
      console.error('Failed to send voice alert:', error);
    }
  };

  const stopVoiceMonitoring = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    setIsMonitoring(false);
  };

  const triggerEmergency = () => {
    setIsEmergencyMode(true);
    const emergencyAlert: VoiceAlert = {
      id: 'emergency-' + Date.now(),
      type: 'help',
      confidence: 100,
      timestamp: new Date().toISOString(),
      location: location || { latitude: 0, longitude: 0, accuracy: 0, timestamp: '' },
      audioLevel: 255
    };
    
    setVoiceAlerts(prev => [emergencyAlert, ...prev]);
    sendVoiceAlert(emergencyAlert);
    
    setTimeout(() => setIsEmergencyMode(false), 5000);
  };

  const connectToEvent = async () => {
    try {
      const participantId = `participant_${Date.now()}`;
      const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language
      };
      
      const response = await fetch('/api/participant/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participant_id: participantId,
          location: location,
          device_info: deviceInfo,
          timestamp: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        setIsConnected(true);
        setParticipantId(participantId);
        startVoiceMonitoring();
        // Start periodic location updates
        startLocationTracking();
      }
    } catch (error) {
      console.log('Failed to connect to event:', error);
      // Still connect locally for demo
      setIsConnected(true);
      startVoiceMonitoring();
    }
  };

  const disconnectFromEvent = () => {
    setIsConnected(false);
    stopVoiceMonitoring();
    setVoiceAlerts([]);
  };

  const submitLostFound = async () => {
    if (!lfFile) return;
    const form = new FormData();
    form.append('reporter', lfReporter || 'Participant');
    form.append('description', lfDesc);
    form.append('image', lfFile);
    try {
      const res = await fetch('/api/lostfound/report', { method: 'POST', body: form });
      if (res.ok) {
        setLfDesc("");
        setLfFile(null);
        const r = await fetch('/api/lostfound');
        const d = await r.json();
        setLfItems(d?.items || []);
      }
    } catch {}
  };

  const askAI = async () => {
    if (!aiQuestion.trim()) return;
    setIsAskingAi(true);
    try {
      // Capture current camera frame for AI analysis
      let cameraFrame = null;
      if (streamRef.current) {
        try {
          const video = document.createElement('video');
          video.srcObject = streamRef.current;
          await video.play();
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 360;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            cameraFrame = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.7));
          }
        } catch (e) {
          console.log('Camera frame capture failed:', e);
        }
      }

      const res = await fetch('/api/nlp/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question: aiQuestion,
          camera_frame: cameraFrame ? 'available' : 'unavailable'
        })
      });
      const data = await res.json();
      setAiAnswer(data?.answer || 'No answer received');
      
      // If asking about emergency situations, trigger voice alert
      if (aiQuestion.toLowerCase().includes('help') || 
          aiQuestion.toLowerCase().includes('emergency') || 
          aiQuestion.toLowerCase().includes('fire') ||
          aiQuestion.toLowerCase().includes('danger')) {
        
        // Create emergency alert
        const emergencyAlert: VoiceAlert = {
          id: Date.now().toString(),
          type: 'help' as const,
          confidence: 90,
          timestamp: new Date().toISOString(),
          audioLevel: 100,
          description: `Emergency help requested via AI: ${aiQuestion}`,
          location: {
            latitude: location?.latitude || 0,
            longitude: location?.longitude || 0,
            accuracy: location?.accuracy || 0,
            timestamp: location?.timestamp || Date.now().toString()
          }
        };
        
        setVoiceAlerts(prev => [emergencyAlert, ...prev.slice(0, 4)]);
        
        // Send to backend
        try {
          await fetch('/api/voice-alert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'emergency_help_request',
              confidence: 90,
              audioLevel: 100,
              location: {
                latitude: location?.latitude || 0,
                longitude: location?.longitude || 0
              },
              timestamp: new Date().toISOString(),
              description: `Emergency help requested via AI: ${aiQuestion}`
            })
          });
        } catch (e) {
          console.log('Failed to send emergency alert:', e);
        }
      }
    } catch (e) {
      setAiAnswer('Unable to get AI response');
    } finally {
      setIsAskingAi(false);
    }
  };

  const liveScan = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const track = stream.getVideoTracks()[0];
      // @ts-ignore
      const ImageCaptureClass = (window as any).ImageCapture;
      const imageCapture = ImageCaptureClass ? new ImageCaptureClass(track) : null;
      let blob: Blob | null = null;
      if (imageCapture && imageCapture.takePhoto) {
        blob = await imageCapture.takePhoto();
      } else {
        const video = document.createElement('video');
        video.srcObject = stream;
        await video.play();
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 360;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        blob = await new Promise(res=> canvas.toBlob(b=> res(b as Blob), 'image/jpeg', 0.7));
      }
      stream.getTracks().forEach(t=>t.stop());
      if (!blob) return;
      const form = new FormData();
      form.append('image', blob, 'frame.jpg');
      const r = await fetch('/api/lostfound/match', { method: 'POST', body: form });
      const d = await r.json();
      const top = d?.matches?.[0];
      if (top && top.score > 0.85) {
        await fetch('/api/incidents/add', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ zone: 'Participant', type: 'lost_found_match', severity: Math.min(top.score, 0.99), status: 'active', description: `Possible match: ${top.description || ''}` })
        });
      }
    } catch {}
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border-b border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center space-x-2">
              <Shield className="w-6 h-6 text-blue-400" />
              <span>Event Participant</span>
            </h1>
            <p className="text-sm text-gray-400">Mobile Safety Monitor</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
            <span className="text-sm text-gray-400">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Permissions Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-4"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Device Permissions</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Camera className="w-5 h-5 text-blue-400" />
                <span className="text-white">Camera Access</span>
              </div>
              {permissions.camera ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400" />
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Mic className="w-5 h-5 text-green-400" />
                <span className="text-white">Microphone Access</span>
              </div>
              {permissions.microphone ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400" />
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-purple-400" />
                <span className="text-white">Location Access</span>
              </div>
              {permissions.location ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400" />
              )}
            </div>
          </div>
        </motion.div>

        {/* Location Info */}
        {location && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-4"
          >
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-purple-400" />
              <span>Your Location</span>
            </h2>
            <div className="text-sm text-gray-300 space-y-1">
              <div>Lat: {location.latitude.toFixed(6)}</div>
              <div>Lng: {location.longitude.toFixed(6)}</div>
              <div>Accuracy: ±{Math.round(location.accuracy)}m</div>
            </div>
          </motion.div>
        )}

        {/* Camera Streaming to Authority */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-4"
        >
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Camera className="w-5 h-5 text-blue-400" />
            <span>Camera Stream to Authority</span>
          </h2>
          
          {/* Video element (hidden - only for streaming, preview shows on Authority Dashboard) */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ display: 'none' }}
          />
          
          <div className="space-y-3">
            {!isCameraStreaming ? (
              <button
                onClick={startCameraStreaming}
                disabled={!permissions.camera}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Camera className="w-5 h-5" />
                Start Camera Streaming
              </button>
            ) : (
              <button
                onClick={stopCameraStreaming}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl text-white font-semibold hover:from-red-600 hover:to-orange-600 transition-all duration-300"
              >
                <CameraOff className="w-5 h-5" />
                Stop Camera Streaming
              </button>
            )}
            
            <p className="text-xs text-gray-400 text-center">
              {isCameraStreaming 
                ? `📹 Streaming to authority dashboard as ${participantName}` 
                : '📹 Authority dashboard will see your camera when you start streaming'}
            </p>
          </div>
        </motion.div>

        {/* Connection Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-xl p-4"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Event Connection</h2>
          
          {!isConnected ? (
            <button
              onClick={connectToEvent}
              disabled={!permissions.camera || !permissions.microphone}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl text-white font-semibold hover:from-green-600 hover:to-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Wifi className="w-5 h-5" />
              Connect to Event Safety Network
            </button>
          ) : (
            <div className="space-y-4">
              <button
                onClick={disconnectFromEvent}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl text-white font-semibold hover:from-red-600 hover:to-orange-600 transition-all duration-300"
              >
                <Wifi className="w-5 h-5" />
                Disconnect from Event
              </button>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Voice Monitoring:</span>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                <span className="text-sm text-gray-300">
                  {isMonitoring ? 'Active' : 'Inactive'}
                </span>
              </div>
              </div>

              {/* Voice Help Detection Controls (user gesture required by browsers) */}
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Help Keyword Detection:</span>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${isHelpListening ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`}></div>
                    <span className="text-xs text-gray-400">{isHelpListening ? 'Listening' : 'Stopped'}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!isHelpListening ? (
                    <button onClick={startHelpListening} className="px-3 py-2 bg-blue-500/20 border border-blue-500/30 rounded text-blue-400 text-sm hover:bg-blue-500/30">
                      Start Help Listening
                    </button>
                  ) : (
                    <button onClick={stopHelpListening} className="px-3 py-2 bg-gray-500/20 border border-gray-500/30 rounded text-gray-300 text-sm hover:bg-gray-500/30">
                      Stop Help Listening
                    </button>
                  )}
                  <button
                    onClick={() => {
                      console.log('🧪 Run Help Test button clicked');
                      try {
                        (window as any).testHelpDetection?.();
                      } catch (e) {
                        console.warn('⚠️ Failed to run testHelpDetection:', e);
                      }
                    }}
                    className="px-3 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded text-yellow-400 text-sm hover:bg-yellow-500/30"
                  >
                    Run Help Test
                  </button>
                </div>
                <p className="text-xs text-gray-500">Say "help"; the event appears under Voice Alerts.</p>
              </div>
              
              {isMonitoring && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Audio Level:</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-400 to-red-400 transition-all duration-100"
                        style={{ width: `${(audioLevel / 255) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-300">{Math.round(audioLevel)}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Emergency Button */}
        {isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-xl p-4"
          >
            <div className="space-y-3">
              <button
                onClick={triggerEmergency}
                disabled={isEmergencyMode}
                className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl text-white font-bold transition-all duration-300 ${
                  isEmergencyMode 
                    ? 'bg-red-600 animate-pulse' 
                    : 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600'
                }`}
              >
                <AlertTriangle className="w-6 h-6" />
                {isEmergencyMode ? 'EMERGENCY SENT!' : 'EMERGENCY ALERT'}
              </button>
              
              {/* Manual Help Button (Fallback) */}
              <button
                onClick={() => {
                  console.log('🆘 Manual HELP button pressed!');
                  // Trigger the same actions as voice detection
                  if (soundDetectorRef.current) {
                    // Create help alert
                    const newAlert: VoiceAlert = {
                      id: Date.now().toString(),
                      type: 'help',
                      timestamp: new Date().toISOString(),
                      status: 'active'
                    };
                setVoiceAlerts(prev => [newAlert, ...prev]);
                setIsEmergencyMode(true);
                
                // Send help alert to backend
                fetch('/api/alert/help', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        participantId,
                        participantName,
                        location,
                        timestamp: new Date().toISOString()
                      })
                    }).catch(err => console.error('Failed to send help alert:', err));
                  }
                }}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-red-500 rounded-xl text-white font-bold hover:bg-red-600 transition-all duration-300"
              >
                <AlertTriangle className="w-5 h-5" />
                HELP! (Manual Trigger)
              </button>
              <p className="text-xs text-gray-400 text-center">
                Press if you need immediate help
              </p>
            </div>
          </motion.div>
        )}

        {/* Voice Alerts */}
        {voiceAlerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-xl p-4"
          >
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Bell className="w-5 h-5 text-yellow-400" />
              <span>Voice Alerts Detected</span>
            </h2>
            
            <div className="space-y-3">
              {voiceAlerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Volume2 className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm font-medium text-white capitalize">
                        {alert.type} detected
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {alert.confidence ? Math.round(alert.confidence) : 0}%
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(alert.timestamp).toLocaleTimeString()} • 
                    Audio: {alert.audioLevel}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Lost & Found (Participant) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-xl p-4"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Lost & Found</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="space-y-3">
              <input
                value={lfReporter}
                onChange={e=>setLfReporter(e.target.value)}
                placeholder="Your name"
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white placeholder-gray-400"
              />
              <input
                value={lfDesc}
                onChange={e=>setLfDesc(e.target.value)}
                placeholder="Description (e.g., Blue backpack)"
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white placeholder-gray-400"
              />
              <input
                type="file"
                accept="image/*"
                onChange={e=>setLfFile(e.target.files?.[0]||null)}
                className="text-sm text-gray-300"
              />
              <button
                onClick={submitLostFound}
                className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded text-blue-400 text-sm hover:bg-blue-500/30"
              >
                Submit Report
              </button>
              <button
                onClick={liveScan}
                className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded text-purple-400 text-sm hover:bg-purple-500/30"
              >
                Live Scan
              </button>
            </div>
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">Reports</span>
                <select value={lfFilter} onChange={e=>setLfFilter(e.target.value as any)} className="px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm">
                  <option value="all">All</option>
                  <option value="reported">Reported</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
              <div className="space-y-2">
                {lfItems.filter(i=> lfFilter==='all' || (i.status||'reported')===lfFilter).map(i=> (
                  <div key={i.id} className="bg-white/5 border border-white/10 rounded p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-white text-sm">{i.description || 'No description'}</div>
                      <div className="text-xs text-gray-400">{i.reporter}</div>
                    </div>
                    <div className="text-xs text-gray-500">{new Date(i.timestamp).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* AI Assistant */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-xl p-4"
        >
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <span>🤖</span>
            <span>AI Assistant</span>
          </h2>
          <div className="space-y-3">
            <input
              value={aiQuestion}
              onChange={e => setAiQuestion(e.target.value)}
              placeholder="Ask about safety, incidents, lost & found..."
              className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white placeholder-gray-400"
              onKeyPress={e => e.key === 'Enter' && askAI()}
            />
            <div className="flex gap-2">
              <button
                onClick={askAI}
                disabled={isAskingAi || !aiQuestion.trim()}
                className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded text-purple-400 text-sm hover:bg-purple-500/30 disabled:opacity-50"
              >
                {isAskingAi ? 'Asking AI...' : 'Ask AI'}
              </button>
              <button
                onClick={async () => {
                  if (!streamRef.current) return;
                  try {
                    const video = document.createElement('video');
                    video.srcObject = streamRef.current;
                    await video.play();
                    const canvas = document.createElement('canvas');
                    canvas.width = video.videoWidth || 640;
                    canvas.height = video.videoHeight || 360;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.7));
                      const form = new FormData();
                      form.append('image', blob as Blob);
                      const res = await fetch('/api/camera/analyze', { method: 'POST', body: form });
                      const data = await res.json();
                      if (data.status === 'ok') {
                        const analysis = data.analysis;
                        if (analysis.camera_status === 'blocked') {
                          setAiAnswer(`🚫 CAMERA BLOCKED: Your camera appears to be covered or blocked (brightness: ${analysis.brightness.toFixed(1)}). I cannot analyze the scene. Please:\n• Remove any covers or obstructions\n• Ensure camera lens is clear\n• Check camera positioning\n• Restart camera if needed`);
                        } else if (analysis.camera_status === 'dark') {
                          setAiAnswer(`⚠️ CAMERA ISSUE: Your camera feed is too dark for analysis (brightness: ${analysis.brightness.toFixed(1)}). I cannot detect fire, smoke, or crowd activity. Please:\n• Check if your camera is covered or blocked\n• Ensure adequate lighting\n• Try adjusting camera settings\n• Restart the camera feed`);
                        } else if (analysis.camera_status === 'error') {
                          setAiAnswer(`❌ CAMERA ERROR: Unable to analyze your camera feed. Please check:\n• Camera permissions\n• Camera connection\n• Try refreshing the page\n• Contact support if issue persists`);
                        } else {
                          let response = `📹 Live Camera Analysis:\n• Fire Detected: ${analysis.fire_detected ? '🚨 YES' : '✅ No'}\n• Smoke Detected: ${analysis.smoke_detected ? '🚨 YES' : '✅ No'}\n• Crowd Density: ${analysis.crowd_density}\n• People Count: ${analysis.people_count}\n• Activity Level: ${analysis.activity_level}\n• Safety Score: ${analysis.safety_score}/10\n• Camera Status: ${analysis.camera_status}\n• Brightness: ${analysis.brightness.toFixed(1)}`;
                          
                          if (analysis.missing_person_detected) {
                            response += `\n🔍 MISSING PERSON DETECTED: Potential match found!`;
                          }
                          if (analysis.suspicious_activity) {
                            response += `\n⚠️ SUSPICIOUS ACTIVITY: Requires attention!`;
                          }
                          if (analysis.description) {
                            response += `\n📝 Description: ${analysis.description}`;
                          }
                          
                          setAiAnswer(response);
                          
                          // Auto-create alert for suspicious activity
                          if (analysis.suspicious_activity || analysis.fire_detected || analysis.missing_person_detected) {
                            const alertType = analysis.fire_detected ? 'fire_detected' : analysis.missing_person_detected ? 'missing_person_detected' : 'suspicious_activity';
                            const newAlert: VoiceAlert = {
                              id: Date.now().toString(),
                              type: alertType === 'fire_detected' ? 'help' as const : 'distress' as const,
                              confidence: 85,
                              timestamp: new Date().toISOString(),
                              audioLevel: 0,
                              description: analysis.description || 'Suspicious activity detected',
                              location: {
                                latitude: location?.latitude || 0,
                                longitude: location?.longitude || 0,
                                accuracy: location?.accuracy || 0,
                                timestamp: location?.timestamp || Date.now().toString()
                              }
                            };
                            setVoiceAlerts(prev => [newAlert, ...prev.slice(0, 4)]);
                          }
                        }
                      }
                    }
                  } catch (e) {
                    setAiAnswer('Camera analysis failed');
                  }
                }}
                disabled={!streamRef.current}
                className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded text-blue-400 text-sm hover:bg-blue-500/30 disabled:opacity-50"
              >
                📹 Analyze Live
              </button>
            </div>
            {aiAnswer && (
              <div className="mt-3 p-3 bg-white/5 border border-white/10 rounded text-sm text-gray-300">
                <div className="text-gray-400 mb-1">AI Response:</div>
                <div>{aiAnswer}</div>
              </div>
            )}
            {nlpSummary && (
              <div className="mt-3 p-3 bg-white/5 border border-white/10 rounded text-sm text-gray-300">
                <div className="text-gray-400 mb-1">Live Summary:</div>
                <div>{nlpSummary}</div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
      {/* Footer actions */}
      <div className="p-4">
        <div className="flex items-center justify-end gap-3">
          <button onClick={()=>setSettingsOpen(true)} className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm hover:bg-white/20">Settings</button>
          <button onClick={()=>{ localStorage.clear(); sessionStorage.clear(); window.location.href='/login'; }} className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm hover:bg-white/20">Logout</button>
        </div>
      </div>
      {/* Settings Modal */}
      {settingsOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="w-full max-w-lg bg-black border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Settings</h3>
              <button onClick={()=>setSettingsOpen(false)} className="text-gray-400 hover:text-gray-200">Close</button>
            </div>
            <div className="space-y-4 text-sm text-gray-300">
              <div className="flex items-center justify-between">
                <span>Share voice alerts</span>
                <input type="checkbox" defaultChecked className="accent-blue-500" />
              </div>
              <div className="flex items-center justify-between">
                <span>Share location</span>
                <input type="checkbox" defaultChecked className="accent-blue-500" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileParticipant;
