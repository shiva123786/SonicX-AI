import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Shield,
  AlertTriangle,
  Users,
  MapPin,
  Clock,
  Phone,
  Mail,
  Camera,
  Bell,
  Eye,
  Settings,
  RefreshCw,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  Zap
} from 'lucide-react';

interface Alert {
  id: string;
  type: 'fire_detected' | 'smoke_detected' | 'crowd_surge' | 'panic' | 'voice_help' | 'voice_scream' | 'voice_child' | 'voice_distress';
  severity: number;
  confidence: number;
  zone: string;
  timestamp: string;
  status: 'active' | 'acknowledged' | 'resolved';
  description: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  deviceId?: string;
}

interface Authority {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  department: string;
  status: 'available' | 'busy' | 'offline';
}

const AuthorityDashboard: React.FC = () => {
  const [eventData, setEventData] = useState<any>(null);
  const [authorities, setAuthorities] = useState<Authority[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [cameraStatus, setCameraStatus] = useState<'stopped' | 'starting' | 'running'>('stopped');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [nlpSummary, setNlpSummary] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [camStream, setCamStream] = useState<MediaStream | null>(null);
  const [detectionResults, setDetectionResults] = useState<any>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const detectionIntervalRef = useRef<number | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [lfItems, setLfItems] = useState<any[]>([]);
  const [lfReporter, setLfReporter] = useState("");
  const [lfDesc, setLfDesc] = useState("");
  const [lfFile, setLfFile] = useState<File | null>(null);
  const [lfFilter, setLfFilter] = useState<'all'|'reported'|'resolved'>('all');
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [isAskingAi, setIsAskingAi] = useState(false);
  const [participants, setParticipants] = useState<any[]>([]);
  const [participantStreams, setParticipantStreams] = useState<any[]>([]);
  const [alertedReports, setAlertedReports] = useState<Set<number>>(new Set()); // Track which reports already showed popup
  const alertedReportsRef = useRef<Set<number>>(new Set()); // Synchronous ref to prevent race conditions

  useEffect(() => {
    // Load event setup data
    const savedEvent = localStorage.getItem('eventSetup');
    if (savedEvent) {
      const eventSetup = JSON.parse(savedEvent);
      setEventData(eventSetup.event);
      setAuthorities(eventSetup.authorities.map((auth: any) => ({
        ...auth,
        status: 'available' as const
      })));
    }

    // Poll live incidents from backend
    const poll = async () => {
      try {
        const res = await fetch('/incidents');
        const data = await res.json();
        const incs = data?.incidents || [];

        // Map incidents to candidate alerts (do not set directly)
        const candidates: Alert[] = incs.slice(-20).reverse().map((i: any) => ({
          id: String(i.id ?? i.timestamp ?? Date.now()),
          type: i.type,
          severity: i.severity ?? 0.5,
          confidence: typeof i.confidence === 'number' ? i.confidence : Math.round((i.severity ?? 0.5) * 100),
          zone: i.zone || 'Unknown',
          timestamp: i.timestamp || new Date().toISOString(),
          status: i.status || 'active',
          description: i.description || `AI detected ${i.type} in ${i.zone || 'zone'}`,
          location: i.lat && i.lng ? { latitude: i.lat, longitude: i.lng, accuracy: 10 } : undefined,
        }));

        // Merge with existing alerts while enforcing filters and limit to 5
        setAlerts(prevAlerts => {
          const resolvedAlertIds: string[] = JSON.parse(localStorage.getItem('resolvedAlerts') || '[]');

          // Normalize IDs to strings for reliable comparisons
          const isResolved = (id: string) => resolvedAlertIds.includes(String(id));

          // Keep only non-resolved existing alerts
          const activeAlerts = prevAlerts.filter(a => a.status !== 'resolved' && !isResolved(String(a.id)));

          const existingAlertsMap = new Map(activeAlerts.map(a => [String(a.id), a]));

          const isDuplicate = (newAlert: Alert) => {
            return Array.from(existingAlertsMap.values()).some(existingAlert =>
              existingAlert.type === newAlert.type && existingAlert.description === newAlert.description
            );
          };

          // Apply filters: remove Lost&Found lost_person_report; curb participant_joined duplicates
          const filtered = candidates.filter(alert => {
            if (alert.status === 'resolved' || isResolved(String(alert.id))) return false;

            if (alert.type === 'lost_person_report' && alert.zone === 'Lost&Found') return false;

            if (alert.type === 'participant_joined' && alert.zone === 'Participants') {
              const existingParticipant = Array.from(existingAlertsMap.values()).filter(a => a.type === 'participant_joined');
              if (existingParticipant.length >= 2) return false;
            }

            return true;
          });

          // Add new filtered alerts if not duplicates
          filtered.forEach((a) => {
            const id = String(a.id);
            if (!existingAlertsMap.has(id) && !isDuplicate(a)) {
              existingAlertsMap.set(id, a);
            }
          });

          // Return top 5 by timestamp
          return Array.from(existingAlertsMap.values())
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 5);
        });
      } catch (e) {
        console.warn('Failed to fetch incidents', e);
      }
    };

    poll();
    const t = setInterval(poll, 3000);
    return () => clearInterval(t);
  }, []);

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
    const id = setInterval(fetchSummary, 5000);
    return () => clearInterval(id);
  }, []);

  // Lost & Found list poll
  useEffect(() => {
    const loadLf = async () => {
      try { const r = await fetch('/api/lostfound'); const d = await r.json(); setLfItems(d?.items||[]); } catch {}
    };
    loadLf();
    const id = setInterval(loadLf, 5000);
    return () => clearInterval(id);
  }, []);

  const submitLf = async () => {
    const fd = new FormData();
    fd.append('reporter', lfReporter);
    fd.append('description', lfDesc);
    if (lfFile) fd.append('image', lfFile);
    await fetch('/api/lostfound/report', { method: 'POST', body: fd });
    setLfReporter('');
    setLfDesc('');
    setLfFile(null);
  };

  const deleteReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    try {
      await fetch(`/api/lostfound/${reportId}`, { method: 'DELETE' });
      
      // Handle both string and number IDs safely
      const numericId = Number(reportId);
      
      if (!isNaN(numericId)) {
        // Clear from BOTH ref and state
        alertedReportsRef.current.delete(numericId);
        setAlertedReports(prev => {
          const newSet = new Set(prev);
          newSet.delete(numericId);
          return newSet;
        });
      }
      
      console.log(`🗑️ Cleared report #${reportId} from alerted list (ref + state)`);
      
      // Refresh the list
      const r = await fetch('/api/lostfound');
      const d = await r.json();
      setLfItems(d?.items || []);
    } catch (e) {
      console.error('Failed to delete report:', e);
    }
  };

  // Local webcam preview controls
  const startLocalCamera = async () => {
    try {
      console.log('Starting camera...');
      
      // First check if permissions are already granted
      const permissionStatus = await navigator.permissions.query({name: 'camera' as PermissionName});
      if (permissionStatus.state === 'denied') {
        throw new Error('Camera permission is denied. Please enable camera access in your browser settings.');
      }
      
      const constraints = { 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user', // Changed to user-facing camera for easier testing
          frameRate: { ideal: 15 } // Ensure stable frame rate for detection
        }, 
        audio: false 
      };
      
      const s = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(e => {
            console.error('Video play failed:', e);
            alert('Video playback failed. Please refresh and try again.');
          });
        };
      }
      setCamStream(s);
      // Start continuous detection
      setIsDetecting(true);
      console.log('Camera started successfully');
      
      // Start detection after camera is ready
      startDetection();
    } catch (e: any) {
      console.error('Camera access failed:', e);
      const errorMessage = e.name === 'NotAllowedError' 
        ? 'Camera access denied. Please allow camera access in your browser settings and refresh the page.'
        : 'Camera access failed. Please check your camera permissions and try again.';
      alert(errorMessage);
    }
  };

  const stopLocalCamera = () => {
    camStream?.getTracks().forEach(t => t.stop());
    setCamStream(null);
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsDetecting(false);
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    // Clear canvas
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  };

  const liveScan = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current as HTMLVideoElement;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 360;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob: Blob = await new Promise(res=> canvas.toBlob(b=> res(b as Blob), 'image/jpeg', 0.7));
    const form = new FormData();
    form.append('image', blob, 'frame.jpg');
    try {
      const r = await fetch('/api/lostfound/match', { method: 'POST', body: form });
      const d = await r.json();
      const top = d?.matches?.[0];
      if (top && top.score > 0.85) {
        // Add incident so both dashboards see it
        await fetch('/api/incidents/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            zone: 'LiveScan', type: 'lost_found_match', severity: Math.min(top.score, 0.99), status: 'active', description: `Possible match: ${top.description || ''}`
          })
        });
      }
    } catch {}
  };

  const handleLogout = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } finally {
      window.location.href = '/login';
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/incidents/${alertId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'acknowledged' })
      });
      
      if (response.ok) {
        console.log(`✅ Acknowledged alert #${alertId}`);
        // Update local state
        setAlerts(prev => prev.map(a => 
          a.id === alertId ? { ...a, status: 'acknowledged' as const } : a
        ));
      } else {
        console.error('Failed to acknowledge alert');
      }
    } catch (e) {
      console.error('Error acknowledging alert:', e);
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/incidents/${alertId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'resolved' })
      });
      
      if (response.ok) {
        console.log(`✅ Resolved alert #${alertId}`);
        // Remove the alert completely from the display
        setAlerts(prev => prev.filter(a => a.id !== alertId));
        
        // Store the resolved alert ID in localStorage to prevent it from reappearing
        const resolvedAlerts = JSON.parse(localStorage.getItem('resolvedAlerts') || '[]');
        resolvedAlerts.push(alertId);
        localStorage.setItem('resolvedAlerts', JSON.stringify(resolvedAlerts));
      } else {
        console.error('Failed to resolve alert');
      }
    } catch (e) {
      console.error('Error resolving alert:', e);
    }
  };

  const askAI = async () => {
    if (!aiQuestion.trim()) return;
    setIsAskingAi(true);
    try {
      // Capture current camera frame for AI analysis
      let cameraFrame = null;
      if (videoRef.current && camStream) {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = videoRef.current.videoWidth || 640;
          canvas.height = videoRef.current.videoHeight || 360;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
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
    } catch (e) {
      setAiAnswer('Unable to get AI response');
    } finally {
      setIsAskingAi(false);
    }
  };

  // Load live incidents (NO MOCK DATA - only real incidents from backend)
  useEffect(() => {
    const loadIncidents = async () => {
      try {
        const res = await fetch('/incidents');
        const data = await res.json();
        
        if (data && data.incidents) {
          const totalIncidents = data.incidents.length;
          
          // Debug: Show all incident types
          const incidentTypes = data.incidents.map((inc: any) => inc.type);
          console.log(`📊 Backend has ${totalIncidents} total incidents:`, incidentTypes);
          
          // Filter: Only show person detection, fire, participant joined, and lost & found alerts
          const incidentAlerts = data.incidents
            .filter((inc: any) => {
              // Show both active and acknowledged alerts (only filter out explicitly resolved)
              if (inc.status === 'resolved') {
                console.log(`⏭️ Skipping resolved incident: ${inc.type} #${inc.id}`);
                return false;
              }
              
              // Only show lost person reports and matches
              const allowedTypes = [
                'lost_person_report',      // Lost person report
                'missing_person_found',    // Missing person match
                'missing_person_detected', // Alternative backend name
                'lost_found_match'         // Lost & Found match
              ];
              const isAllowed = allowedTypes.includes(inc.type);
              
              if (!isAllowed) {
                console.log(`⏭️ Skipping non-allowed type: ${inc.type}`);
              }
              
              return isAllowed;
            })
            .map((inc: any) => ({
              id: inc.id || Date.now() + Math.random(),
              type: inc.type,
              zone: inc.zone || 'Unknown',
              confidence: inc.confidence || 75,
              timestamp: inc.timestamp || new Date().toISOString(),
              severity: inc.severity || 1,
              status: inc.status || 'active',
              description: inc.description || `${inc.type} in ${inc.zone}`
            }))
            .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); // Sort by newest first
            // Removed the limit of 5 alerts to show all alerts
          
          console.log(`✅ Showing ${incidentAlerts.length} alerts (filtered from ${totalIncidents})`);
          setAlerts(incidentAlerts);
        } else {
          console.log('⚠️ No incidents data from backend');
          setAlerts([]);
        }
      } catch (e) {
        console.log('❌ Failed to load incidents:', e);
        setAlerts([]);
      }
    };
    
    // Initial load of incidents
    loadIncidents();
    
    // Only refresh alerts every 10 seconds and merge with existing alerts instead of replacing
    const refreshIncidents = async () => {
      try {
        const res = await fetch('/incidents');
        const data = await res.json();
        
        if (data && data.incidents) {
          // Get new alerts that match our criteria
          const newIncidents = data.incidents
            .filter((inc: any) => {
              if (inc.status === 'resolved') return false;
              
              const allowedTypes = [
                'lost_person_report',
                'missing_person_found',
                'missing_person_detected',
                'lost_found_match'
              ];
              return allowedTypes.includes(inc.type);
            })
            .map((inc: any) => ({
              id: inc.id || Date.now() + Math.random(),
              type: inc.type,
              zone: inc.zone || 'Unknown',
              confidence: inc.confidence || 75,
              timestamp: inc.timestamp || new Date().toISOString(),
              severity: inc.severity || 1,
              status: inc.status || 'active',
              description: inc.description || `${inc.type} in ${inc.zone}`
            }));
          
          // Merge with existing alerts, keeping existing ones unless explicitly resolved
          setAlerts(prevAlerts => {
            // Get resolved alert IDs from localStorage
            const resolvedAlertIds = JSON.parse(localStorage.getItem('resolvedAlerts') || '[]');
            
            // Filter out any resolved alerts first
            const activeAlerts = prevAlerts.filter(alert => 
              alert.status !== 'resolved' && !resolvedAlertIds.includes(alert.id)
            );
            
            // Create a map of existing alerts by ID
            const existingAlertsMap = new Map(activeAlerts.map(alert => [alert.id, alert]));
            
            // Check for duplicate alerts (same type and description)
            const isDuplicate = (newAlert: any) => {
              return Array.from(existingAlertsMap.values()).some(existingAlert => 
                existingAlert.type === newAlert.type && 
                existingAlert.description === newAlert.description
              );
            };
            
            // Filter duplicate participant_joined alerts but allow lost person reports
            const filteredIncidents = newIncidents.filter((alert: Alert) => {
              // Allow all lost person reports to be detected
              if (alert.type === 'lost_person_report') {
                return true;
              }
              
              // Limit participant_joined alerts to prevent duplicates
              if (alert.type === 'participant_joined' && alert.zone === 'Participants') {
                // Check if we already have similar alerts
                const existingParticipantAlerts = Array.from(existingAlertsMap.values()).filter(
                  (existingAlert: any) => existingAlert.type === 'participant_joined'
                );
                
                // If we already have 2 or more participant alerts, don't add more
                if (existingParticipantAlerts.length >= 2) {
                  return false;
                }
              }
              
              return true;
            });
            
            // Add new alerts that don't exist yet, aren't duplicates, and aren't in resolved list
            filteredIncidents.forEach((newAlert: Alert) => {
              if (!existingAlertsMap.has(newAlert.id) && 
                  !isDuplicate(newAlert) && 
                  !resolvedAlertIds.includes(newAlert.id)) {
                existingAlertsMap.set(newAlert.id, newAlert);
              }
            });
            
            // Convert back to array, sort by timestamp, and limit to 5 alerts
            return Array.from(existingAlertsMap.values())
              .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .slice(0, 5);
          });
        }
      } catch (e) {
        console.log('❌ Failed to refresh incidents:', e);
      }
    };
    
    const interval = setInterval(refreshIncidents, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  // Load participants
  useEffect(() => {
    const loadParticipants = async () => {
      try {
        const res = await fetch('/api/participants');
        const data = await res.json();
        if (data && data.participants) {
          setParticipants(data.participants);
        }
      } catch (e) {
        console.log('Failed to load participants:', e);
      }
    };
    
    loadParticipants();
    const interval = setInterval(loadParticipants, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  // Load participant camera streams
  useEffect(() => {
    const loadStreams = async () => {
      try {
        const res = await fetch('/api/participant/streams');
        const data = await res.json();
        if (data && data.streams) {
          setParticipantStreams(data.streams);
          console.log(`📹 Loaded ${data.streams.length} participant streams`);
        }
      } catch (e) {
        console.log('Failed to load participant streams:', e);
      }
    };
    
    loadStreams();
    const interval = setInterval(loadStreams, 3000); // Update every 3 seconds for near real-time
    return () => clearInterval(interval);
  }, []);

  // Function to start detection explicitly
  const startDetection = () => {
    if (!videoRef.current || !canvasRef.current || !camStream) {
      console.log('Cannot start detection - missing required elements');
      return;
    }
    
    console.log('▶️ Starting detection explicitly...');
    setIsDetecting(true);
  };

  // Continuous detection loop with bounding box rendering
  useEffect(() => {
    if (!isDetecting || !videoRef.current || !canvasRef.current || !camStream) {
      console.log('⏸️ Detection not running:', { isDetecting, hasVideo: !!videoRef.current, hasCanvas: !!canvasRef.current, hasCamStream: !!camStream });
      return;
    }

    console.log('▶️ Starting continuous detection loop...');
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Force canvas dimensions to match video
    if (video.videoWidth && video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      console.log(`📏 Set canvas dimensions to match video: ${canvas.width}x${canvas.height}`);
    }
    
    const runDetection = async () => {
      try {
        // Ensure video is ready
        if (video.readyState < 2) {
          console.log('⏳ Video not ready yet, readyState:', video.readyState);
          // Try again in 500ms
          setTimeout(runDetection, 500);
          return;
        }
        
        // Set canvas size to match video
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 360;
        }

        // Capture frame
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = video.videoWidth || 640;
        tempCanvas.height = video.videoHeight || 360;
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return;
        
        tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
        const blob = await new Promise<Blob | null>(resolve => tempCanvas.toBlob(resolve, 'image/jpeg', 0.7));
        if (!blob) return;

        // Send to backend for analysis
        const form = new FormData();
        form.append('image', blob, 'frame.jpg');
        form.append('detect_missing_persons', 'true'); // Explicitly request missing person detection
        form.append('check_reported_persons', 'true'); // Explicitly check for reported persons
        console.log('📤 Sending frame to backend for analysis...');
        
        // Use the lostfound endpoint which has better person detection
        const res = await fetch('/api/lostfound/match', { 
          method: 'POST', 
          body: form 
        });
        let data = await res.json();
        
        // If we have matches from the lostfound endpoint, use them
        if (data && data.matches && data.matches.length > 0) {
          console.log('🔍 Found reported person matches:', data.matches);
          
          // First get the regular camera analysis for bounding boxes
          const cameraRes = await fetch('/api/camera/analyze', { 
            method: 'POST', 
            body: form 
          });
          const cameraData = await cameraRes.json();
          console.log('📥 Received camera analysis:', cameraData);
          
          // Format the data to match the expected structure
          const analysisData = {
            status: 'ok',
            analysis: {
              people_count: cameraData.analysis?.people_count || data.matches.length,
              matched_persons: data.matches.map((match: any) => ({
                description: match.description || 'Reported person',
                similarity: match.score * 100 || 90,
                reporter: match.reporter || 'Unknown',
                id: match.id || `match-${Date.now()}`
              })),
              // Use actual bounding boxes from camera analysis if available
              bounding_boxes: cameraData.analysis?.bounding_boxes || data.matches.map((match: any, index: number) => ({
                x1: 100 + (index * 50),
                y1: 100 + (index * 30),
                x2: 300 + (index * 50),
                y2: 400 + (index * 30),
                confidence: Math.round(match.score * 100) || 90
              }))
            }
          };
          console.log('📥 Processed match data:', analysisData);
          // Replace data with the analysis data
          data = analysisData;
        } else {
          // Fallback to regular camera analysis
          const cameraRes = await fetch('/api/camera/analyze', { 
            method: 'POST', 
            body: form 
          });
          // Directly assign to data variable
          data = await cameraRes.json();
          console.log('📥 Received camera analysis:', data);
        }
        
        if (data.status === 'ok' && data.analysis) {
          const analysis = data.analysis;
          console.log('✅ Analysis success:', {
            people: analysis.people_count,
            boxes: analysis.bounding_boxes?.length,
            matches: analysis.matched_persons?.length
          });
          setDetectionResults(analysis);
          
          // Draw bounding boxes
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            if (analysis.bounding_boxes && analysis.bounding_boxes.length > 0) {
              console.log(`🎨 Drawing ${analysis.bounding_boxes.length} bounding boxes`);
              analysis.bounding_boxes.forEach((box: any, idx: number) => {
                try {
                  // Ensure box coordinates are valid numbers
                  const x1 = parseInt(box.x1) || 0;
                  const y1 = parseInt(box.y1) || 0;
                  const x2 = parseInt(box.x2) || (x1 + 200);
                  const y2 = parseInt(box.y2) || (y1 + 300);
                  const width = x2 - x1;
                  const height = y2 - y1;
                  
                  // Skip invalid boxes
                  if (width <= 0 || height <= 0 || width > canvas.width || height > canvas.height) {
                    console.log(`⚠️ Skipping invalid box: (${x1},${y1},${x2},${y2})`);
                    return;
                  }
                  
                  // Green box for normal detection, red for missing person match
                  const isMatch = analysis.matched_persons && analysis.matched_persons.length > 0;
                  ctx.strokeStyle = isMatch ? '#ff0000' : '#00ff00';
                  ctx.lineWidth = 4;
                  ctx.strokeRect(x1, y1, width, height);
                  
                  // Draw confidence label with background
                  ctx.fillStyle = isMatch ? 'rgba(255, 0, 0, 0.8)' : 'rgba(0, 255, 0, 0.8)';
                  ctx.fillRect(x1, y1 - 25, 80, 20);
                  ctx.fillStyle = '#ffffff';
                  ctx.font = 'bold 14px Arial';
                  ctx.fillText(`Person ${idx + 1}`, x1 + 5, y1 - 10);
                  ctx.fillText(`${box.confidence}%`, x1 + 5, y1 + 15);
                  console.log(`  Box ${idx + 1}: (${x1}, ${y1}) to (${x2}, ${y2}) - ${box.confidence}%`);
                } catch (e) {
                  console.error('Error drawing box:', e);
                }
              });
            } else {
              console.log('⭕ No bounding boxes to draw');
            }
          }
          
          // Trigger alert notification for missing person match - ONLY ONCE per report!
          if (analysis.matched_persons && analysis.matched_persons.length > 0) {
            const match = analysis.matched_persons[0];
            const reportId = match.id;
            
            console.log('🚨 MISSING PERSON MATCH:', match);
            
            // Check if we already alerted for this report
            if (!alertedReportsRef.current.has(reportId)) {
              console.log(`✅ FIRST detection for report #${reportId} - Adding to Active Alerts (NO POPUP)`);
              
              // NO POPUP - Alert will appear in Active Alerts section automatically
              // Backend already created the incident, frontend will poll and display it
              
              // IMMEDIATELY lock in ref (synchronous - blocks future checks instantly!)
              alertedReportsRef.current.add(reportId);
              console.log(`🔒 LOCKED in ref immediately - report #${reportId}`);
              
              // Also update state (for UI consistency)
              setAlertedReports(prev => new Set(prev).add(reportId));
            } else {
              console.log(`⏭️ Report #${reportId} already alerted - Alert stays in Active Alerts only`);
            }
          }
        }
      } catch (e) {
        console.error('❌ Detection cycle error:', e);
      }
    };

    // Run detection every 2 seconds for real-time responsiveness
    console.log('⏰ Setting up detection interval (every 2 seconds)');
    
    // Start detection immediately
    runDetection();
    
    // Set up interval
    detectionIntervalRef.current = window.setInterval(runDetection, 2000);
    runDetection(); // Run immediately

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
    };
  }, [isDetecting, camStream]);

  const notifyAuthorities = async (alert: Alert) => {
    // In a real app, this would send SMS/Email
    console.log(`🚨 CRITICAL ALERT: ${alert.type} in ${alert.zone}`);
    
    // Update authority status to busy
    setAuthorities(prev => prev.map(auth => ({
      ...auth,
      status: 'busy' as const
    })));
  };

  const startMonitoring = async () => {
    setCameraStatus('starting');
    setIsMonitoring(true);
    
    try {
      // Start camera monitoring
      const response = await fetch('/camera/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zone: 'A', source: 'webcam' })
      });
      
      if (response.ok) {
        setCameraStatus('running');
      }
    } catch (error) {
      console.error('Failed to start monitoring:', error);
      setCameraStatus('stopped');
    }
  };

  const stopMonitoring = async () => {
    setIsMonitoring(false);
    setCameraStatus('stopped');
    
    try {
      await fetch('/camera/stop/A', { method: 'POST' });
    } catch (error) {
      console.error('Failed to stop monitoring:', error);
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'fire_detected': return '🔥';
      case 'smoke_detected': return '💨';
      case 'crowd_surge': return '👥';
      case 'panic': return '🚨';
      case 'voice_help': return '🆘';
      case 'voice_scream': return '😱';
      case 'voice_child': return '👶';
      case 'voice_distress': return '😰';
      default: return '⚠️';
    }
  };

  const getAlertColor = (severity: number) => {
    if (severity > 0.8) return 'text-red-400 bg-red-400/10 border-red-400/20';
    if (severity > 0.6) return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
    return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-red-400 bg-red-400/20';
      case 'acknowledged': return 'text-yellow-400 bg-yellow-400/20';
      case 'resolved': return 'text-green-400 bg-green-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  if (!eventData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Event Setup Found</h2>
          <p className="text-gray-400 mb-6">Please setup an event first.</p>
          <Link
            to="/event-setup"
            className="px-6 py-3 bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Setup Event
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
                <Shield className="w-8 h-8 text-red-400" />
                <span>Authority Dashboard</span>
              </h1>
              <p className="text-gray-300">{eventData.eventName} - {eventData.location}</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  isMonitoring ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                }`}></div>
                <span className="text-sm">
                  {isMonitoring ? 'Monitoring Active' : 'Monitoring Stopped'}
                </span>
              </div>
              
              <button
                onClick={isMonitoring ? stopMonitoring : startMonitoring}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isMonitoring 
                    ? 'bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30'
                    : 'bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30'
                }`}
              >
                {isMonitoring ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
              </button>
              <button
                onClick={() => setSettingsOpen(true)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm hover:bg-white/20"
              >
                Settings
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm hover:bg-white/20"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{alerts.filter(a => a.status === 'active').length}</div>
                <div className="text-sm text-gray-400">Active Alerts</div>
              </div>
            </div>
          </div>

          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{authorities.filter(a => a.status === 'available').length}</div>
                <div className="text-sm text-gray-400">Available Staff</div>
              </div>
            </div>
          </div>

          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Camera className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{eventData.expectedAttendees}</div>
                <div className="text-sm text-gray-400">Expected Guests</div>
              </div>
            </div>
          </div>

          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">&lt;30s</div>
                <div className="text-sm text-gray-400">Avg Response</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Live Webcam Tile */}
          <div className="glass rounded-xl p-4">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
              <Camera className="w-5 h-5 text-blue-400" />
              <span>Live Preview</span>
            </h2>
            <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
              <video 
                ref={videoRef} 
                autoPlay 
                muted 
                playsInline 
                className="w-full h-full rounded-lg border border-white/10 bg-black absolute top-0 left-0"
                style={{ objectFit: 'cover' }}
              />
              {!camStream && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                  <button
                    onClick={startLocalCamera}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Start Camera
                  </button>
                </div>
              )}
              <canvas ref={canvasRef} className="w-full h-full rounded-lg absolute top-0 left-0 pointer-events-none" />
            </div>
            {/* Detection Status Indicator */}
            {isDetecting && (
              <div className="mt-2 p-2 bg-blue-500/20 border border-blue-500/30 rounded text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                  <span className="text-green-400 font-medium">Live Detection Active</span>
                </div>
              </div>
            )}
            {detectionResults && detectionResults.people_count > 0 && (
              <div className="mt-2 text-sm">
                <div className="flex items-center gap-2 text-green-400">
                  <span className="font-bold">👥 Detected:</span>
                  <span>{detectionResults.people_count} {detectionResults.people_count === 1 ? 'person' : 'people'}</span>
                </div>
                {/* Real-time detection match */}
                {detectionResults.matched_persons && detectionResults.matched_persons.length > 0 && (
                  <div className="mt-2 p-3 bg-red-500/20 border-2 border-red-500 rounded animate-pulse">
                    <div className="text-red-400 font-bold text-base">🔍 MISSING PERSON MATCH FOUND!</div>
                    <div className="text-yellow-300 mt-1">
                      {detectionResults.matched_persons[0].description}
                    </div>
                    <div className="text-green-300 text-sm mt-1">
                      Similarity: {detectionResults.matched_persons[0].similarity}% | Reporter: {detectionResults.matched_persons[0].reporter}
                    </div>
                  </div>
                )}
                
                {/* Persistent missing person alerts from Active Alerts */}
                {alerts.filter(a => a.type === 'missing_person_found' || a.type === 'missing_person_detected').map(alert => (
                  <div key={alert.id} className="mt-2 p-3 bg-red-500/20 border-2 border-red-500 rounded">
                    <div className="text-red-400 font-bold text-base">🔍 MISSING PERSON DETECTED</div>
                    <div className="text-yellow-300 mt-1 text-sm">
                      {alert.description}
                    </div>
                    <div className="text-green-300 text-xs mt-1">
                      Confidence: {alert.confidence}% | {new Date(alert.timestamp).toLocaleString()}
                    </div>
                    <button
                      onClick={() => resolveAlert(alert.id)}
                      className="mt-2 px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded transition-colors"
                    >
                      ✅ Resolve
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2 mt-3">
              <button onClick={startLocalCamera} className="px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded text-green-400 text-sm">Start</button>
              <button onClick={stopLocalCamera} className="px-3 py-1.5 bg-red-500/20 border border-red-500/30 rounded text-red-400 text-sm">Stop</button>
              <button onClick={liveScan} className="px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 rounded text-blue-400 text-sm">Live Scan</button>
            </div>
            {nlpSummary && (
              <div className="mt-4 text-sm text-gray-300">
                <span className="text-gray-400">AI Summary:</span> {nlpSummary}
              </div>
            )}
          </div>

          {/* AI Question Interface */}
          <div className="glass rounded-xl p-4">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
              <span>🤖</span>
              <span>AI Assistant</span>
            </h2>
            <div className="space-y-3">
              <input
                value={aiQuestion}
                onChange={e => setAiQuestion(e.target.value)}
                placeholder="Ask about incidents, crowd status, fire safety, etc..."
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
                    if (!videoRef.current || !camStream) return;
                    try {
                      const canvas = document.createElement('canvas');
                      canvas.width = videoRef.current.videoWidth || 640;
                      canvas.height = videoRef.current.videoHeight || 360;
                      const ctx = canvas.getContext('2d');
                      if (ctx) {
                        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
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
                          }
                        }
                      }
                    } catch (e) {
                      setAiAnswer('Camera analysis failed');
                    }
                  }}
                  disabled={!camStream}
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
            </div>
          </div>

          {/* Participant Camera Feed */}
          <div className="glass rounded-xl p-4">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
              <span>📱</span>
              <span>Participant Camera Feeds</span>
              <span className="text-sm text-gray-400">({participantStreams.filter(s => s.status === 'active').length} active)</span>
            </h2>
            
            {participantStreams.length === 0 ? (
              <div className="w-full h-48 bg-black rounded border border-white/20 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="text-2xl mb-2">📱</div>
                  <div className="text-sm">No participant cameras streaming</div>
                  <div className="text-xs mt-1">Waiting for participants to start streaming...</div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {participantStreams.map((stream) => (
                  <div key={stream.id} className="relative bg-black rounded-lg overflow-hidden border border-white/20">
                    {/* Stream Status Badge */}
                    <div className="absolute top-2 left-2 z-10 flex items-center space-x-2 bg-black/70 px-2 py-1 rounded-full">
                      <div className={`w-2 h-2 rounded-full ${stream.status === 'active' ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                      <span className="text-xs text-white font-semibold">{stream.status === 'active' ? 'LIVE' : 'OFFLINE'}</span>
                    </div>
                    
                    {/* Participant Camera Preview */}
                    <div className="w-full h-48 bg-black">
                      <img 
                        src={stream.lastFrame || '/placeholder-camera.jpg'} 
                        alt={`Participant ${stream.id}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Participant Name */}
                    <div className="absolute bottom-2 left-2 right-2 z-10 bg-black/70 px-3 py-2 rounded">
                      <div className="text-sm text-white font-semibold">{stream.name}</div>
                      <div className="text-xs text-gray-400">{new Date(stream.timestamp).toLocaleTimeString()}</div>
                    </div>
                    
                    {/* Video Frame */}
                    {stream.frame && stream.status === 'active' ? (
                      <img 
                        src={`data:image/jpeg;base64,${stream.frame}`}
                        alt={`${stream.name}'s camera`}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 flex items-center justify-center bg-gray-800">
                        <div className="text-center text-gray-400">
                          <div className="text-3xl mb-2">📷</div>
                          <div className="text-sm">Stream Inactive</div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-4 text-xs text-gray-400 text-center">
              💡 Participants can start camera streaming from their mobile dashboard
            </div>
          </div>

          {/* Connected Participants */}
          <div className="glass rounded-xl p-4">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
              <span>👥</span>
              <span>Connected Participants</span>
              <span className="text-sm text-gray-400">({participants.length})</span>
            </h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {participants.length === 0 ? (
                <div className="text-center text-gray-400 py-4">
                  <div className="text-2xl mb-2">📱</div>
                  <div className="text-sm">No participants connected yet</div>
                </div>
              ) : (
                participants.map((participant, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                        <span className="text-green-400 text-xs">📱</span>
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium">
                          {participant.participant_id || `Participant ${index + 1}`}
                        </div>
                        <div className="text-gray-400 text-xs">
                          Joined: {new Date(participant.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 text-xs">● Active</div>
                      {participant.lat && participant.lng && (
                        <div className="text-gray-400 text-xs">
                          📍 {participant.lat.toFixed(4)}, {participant.lng.toFixed(4)}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active Alerts */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
              <Bell className="w-5 h-5 text-red-400" />
              <span>Active Alerts</span>
            </h2>
            
            <div className="space-y-4">
              {alerts.length === 0 ? (
                <div className="glass rounded-lg p-8 text-center">
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <p className="text-gray-300">No active alerts. All systems normal.</p>
                </div>
              ) : (
                alerts.map((alert) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`glass rounded-lg p-6 border ${getAlertColor(alert.severity)}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getAlertIcon(alert.type)}</span>
                        <div>
                          <h3 className="font-semibold text-white capitalize">
                            {alert.type.replace('_', ' ')}
                          </h3>
                          <p className="text-sm text-gray-300">{alert.zone}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-white">
                          {Math.round(alert.confidence)}%
                        </div>
                        <div className="text-xs text-gray-400">confidence</div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-300 mb-4">{alert.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(alert.status)}`}>
                          {alert.status}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      
                      {alert.status === 'active' && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => acknowledgeAlert(alert.id)}
                            className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded text-yellow-400 text-sm hover:bg-yellow-500/30 transition-colors"
                          >
                            Acknowledge
                          </button>
                          <button
                            onClick={() => resolveAlert(alert.id)}
                            className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded text-green-400 text-sm hover:bg-green-500/30 transition-colors"
                          >
                            Resolve
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Authorities */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
              <Users className="w-5 h-5 text-green-400" />
              <span>Emergency Team</span>
            </h2>
            
            <div className="space-y-4">
              {authorities.map((authority) => (
                <div key={authority.id} className="glass rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-white">{authority.name}</h3>
                      <p className="text-sm text-gray-300">{authority.role}</p>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${
                      authority.status === 'available' ? 'bg-green-400' :
                      authority.status === 'busy' ? 'bg-yellow-400' : 'bg-red-400'
                    }`}></div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-400">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4" />
                      <span>{authority.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{authority.email}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lost & Found Quick Report + List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="glass rounded-xl p-4">
            <h2 className="text-xl font-semibold text-white mb-4">Lost & Found Report</h2>
            <div className="space-y-3">
              <input value={lfReporter} onChange={e=>setLfReporter(e.target.value)} placeholder="Reporter name" className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white placeholder-gray-400" />
              <input value={lfDesc} onChange={e=>setLfDesc(e.target.value)} placeholder="Description" className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white placeholder-gray-400" />
              <input type="file" accept="image/*" onChange={e=>setLfFile(e.target.files?.[0]||null)} className="text-sm text-gray-300" />
              <button onClick={submitLf} className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded text-blue-400 text-sm hover:bg-blue-500/30">Submit Report</button>
            </div>
          </div>
          <div className="lg:col-span-2 glass rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Reports</h2>
              <select value={lfFilter} onChange={e=>setLfFilter(e.target.value as any)} className="px-3 py-2 bg-white/5 border border-white/20 rounded text-white">
                <option value="all">All</option>
                <option value="reported">Reported</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            <div className="space-y-3">
              {lfItems.filter(i=> lfFilter==='all' || (i.status||'reported')===lfFilter).map(i=> (
                <div key={i.id} className="bg-white/5 border border-white/10 rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <div className="text-white text-sm font-medium">{i.description || 'No description'}</div>
                      <div className="text-xs text-gray-400 mt-1">Reporter: {i.reporter}</div>
                      <div className="text-xs text-gray-500">{new Date(i.timestamp).toLocaleString()}</div>
                    </div>
                    <button
                      onClick={() => deleteReport(i.id)}
                      className="ml-3 px-3 py-1.5 bg-red-500/20 border border-red-500/30 rounded text-red-400 text-sm hover:bg-red-500/30 transition-colors"
                      title="Delete this report"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
                <span>Auto-start monitoring on load</span>
                <input type="checkbox" className="accent-blue-500" />
              </div>
              <div className="flex items-center justify-between">
                <span>Play sound on critical alert</span>
                <input type="checkbox" className="accent-blue-500" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthorityDashboard;
