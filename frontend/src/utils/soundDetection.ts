/**
 * Sound Detection Utility
 * Detects "help" keyword and monitors audio volume for distress
 */

export class SoundDetector {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private recognition: any = null;
  private recognitionActive: boolean = false;
  private volumeThreshold = 100; // Distress detection threshold
  private isListening = false;
  private onHelpDetected?: () => void;
  private onDistressDetected?: (volume: number) => void;
  private checkInterval: number | null = null;

  constructor(options?: {
    volumeThreshold?: number;
    onHelpDetected?: () => void;
    onDistressDetected?: (volume: number) => void;
  }) {
    if (options?.volumeThreshold) {
      this.volumeThreshold = options.volumeThreshold;
    }
    this.onHelpDetected = options?.onHelpDetected;
    this.onDistressDetected = options?.onDistressDetected;
  }

  async startListening(): Promise<boolean> {
    if (this.isListening) {
      console.log('Already listening');
      return true;
    }
    
    try {
      // Check if browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia is not supported in this browser');
      }
      
      // Request microphone access with enhanced audio settings
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      // Setup audio context for volume monitoring
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.microphone = this.audioContext.createMediaStreamSource(stream);
      this.microphone.connect(this.analyser);
      
      this.analyser.fftSize = 256;
      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      // Setup speech recognition for "help" keyword
      // NO VOLUME THRESHOLD - detects even whispers!
      const SpeechRecognition = (window as any).SpeechRecognition || 
                               (window as any).webkitSpeechRecognition || 
                               (window as any).mozSpeechRecognition || 
                               (window as any).msSpeechRecognition;
      
      console.log('SpeechRecognition API available:', !!SpeechRecognition);
      
      if (SpeechRecognition) {
        console.log('🎤 Creating SpeechRecognition instance...');
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        this.recognition.maxAlternatives = 10; // Increased to 10 for better detection

        // Apply a speech grammar to bias toward help-related phrases
        const SpeechGrammarList = (window as any).SpeechGrammarList || (window as any).webkitSpeechGrammarList;
        if (SpeechGrammarList) {
          try {
            const grammars = new SpeechGrammarList();
            const grammar = '#JSGF V1.0; grammar keywords; public <keyword> = help | help! | please help | need help;';
            grammars.addFromString(grammar, 1);
            this.recognition.grammars = grammars;
            console.log('📘 Applied speech grammar for help keyword');
          } catch (e) {
            console.warn('⚠️ Failed to apply speech grammar:', e);
          }
        }

        // Track recognition lifecycle to prevent invalid restarts
        this.recognition.onstart = () => {
          this.recognitionActive = true;
          console.log('🎤 Recognition STARTED');
        };
        
        // Add audio start event handler
        this.recognition.onaudiostart = () => {
          console.log('🎤🟢 AUDIO STARTED - Speech recognition is receiving audio input');
        };
        
        // Add audio end event handler (no restart here to avoid loops)
        this.recognition.onaudioend = () => {
          console.log('🎤🔴 AUDIO ENDED - Speech recognition stopped receiving audio');
        };
        
        // Add speech start event handler
        this.recognition.onspeechstart = () => {
          console.log('🗣️ SPEECH DETECTED - User is speaking');
        };
        
        // Force microphone activation to ensure we're getting audio
        console.log('🎤 Requesting microphone access...');
        navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } 
        })
          .then(stream => {
            console.log('🎤✅ Microphone activated for speech recognition');
            // Keep the stream active
            (window as any).activeMicrophoneStream = stream;
          })
          .catch(err => {
            console.warn('⚠️ Failed to activate microphone:', err);
          });
        
        // Handle recognition ending and restart immediately
        this.recognition.onend = () => {
          this.recognitionActive = false;
          console.log('🔄 Speech recognition ended');
          if (this.isListening) {
            setTimeout(() => {
              if (this.recognition && this.isListening && !this.recognitionActive) {
                try {
                  this.recognition.start();
                  console.log('✅ Speech recognition restarted after end');
                } catch (e) {
                  console.warn('⚠️ Failed restart after end:', e);
                }
              }
            }, 150);
          }
        };

        this.recognition.onresult = (event: any) => {
          console.log('🎤 Speech recognition result received:', event);
          
          // Process results with stricter matching to reduce false positives
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const isFinal = result.isFinal;
            console.log(`🎤 Processing result ${i} (final: ${isFinal}):`, result);

            for (let j = 0; j < result.length; j++) {
              const alt = result[j];
              const transcript = alt.transcript.toLowerCase().trim();
              const confidence = alt.confidence ?? 0;
              console.log(`🎤 Alt ${j}: "${transcript}" (conf: ${confidence}, final: ${isFinal})`);

              // Strict match: require word-boundary 'help'
              const hasHelpWord = /\bhelp\b/.test(transcript);
              if (!hasHelpWord) continue;

              // Only trigger on final results OR sufficiently high confidence interim
              if (isFinal || confidence >= 0.7) {
                console.log('🆘 STRICT HELP MATCH DETECTED!', { transcript, confidence, isFinal });
                this.triggerHelpDetection(transcript, confidence);
                return;
              }
            }
          }
        };

        this.recognition.onerror = (event: any) => {
          const err = event?.error || 'unknown';
          if (err === 'no-speech') {
            console.warn('⚠️ No speech detected; continuing to listen.');
          } else if (err === 'audio-capture') {
            console.warn('⚠️ No microphone detected or permission denied. Please ensure microphone access is allowed.');
          } else if (err === 'not-allowed') {
            console.warn('⚠️ Microphone permission not allowed. Use the Start Help Listening button to re-initiate.');
          } else if (err === 'network') {
            console.warn('⚠️ Network issue during speech recognition; retrying.');
          } else if (err !== 'aborted') {
            console.warn('⚠️ Speech recognition error:', err);
          }

          // Auto-restart on error (except if we explicitly stopped)
          if (this.isListening && err !== 'aborted' && !this.recognitionActive) {
            setTimeout(() => {
              if (this.recognition && this.isListening && !this.recognitionActive) {
                try {
                  this.recognition.start();
                  console.log('✅ Speech recognition restarted after error');
                } catch (e) {
                  console.warn('⚠️ Failed to restart after error:', e);
                }
              }
            }, 300);
          }
        };

        try {
          this.recognition.start();
          console.log('✅ Speech recognition started - detects "help" even when whispered!');
        } catch (e) {
          console.warn('⚠️ Failed to start speech recognition:', e);
        }
      } else {
        console.warn('⚠️ Speech recognition not supported in this browser');
        // Fallback: Add a manual button in the UI that users can press to trigger help
        console.log('📣 Using manual help detection fallback');
        
        // Create a global function that can be called from anywhere
        (window as any).triggerHelpKeyword = () => {
          console.log('🆘 HELP manually triggered!');
          if (this.onHelpDetected) {
            this.onHelpDetected();
          }
          this.sendHelpAlert('help (manually triggered)');
        };
        
        // No popup notification; log fallback to console
        console.warn('Speech recognition is not supported; use manual Help trigger if available.');
      }

      // Start volume monitoring
      this.isListening = true;
      this.checkInterval = window.setInterval(() => {
        if (!this.analyser) return;
        
        this.analyser.getByteFrequencyData(dataArray);
        
        // Calculate average volume
        const sum = dataArray.reduce((a, b) => a + b, 0);
        const average = sum / bufferLength;
        
        // Check if volume exceeds threshold
        if (average > this.volumeThreshold) {
          console.log(`🔊 HIGH VOLUME DETECTED: ${Math.round(average)} (Threshold: ${this.volumeThreshold})`);
          if (this.onDistressDetected) {
            this.onDistressDetected(average);
          }
          // Send distress alert to backend
          this.sendDistressAlert(average);
        }
      }, 100); // Check every 100ms

      console.log(`✅ Sound detection started (Volume threshold: ${this.volumeThreshold})`);
      return true;
    } catch (error) {
      console.error('❌ Failed to start sound detection:', error);
      return false;
    }
  }

  stopListening() {
    this.isListening = false;

    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }

    if (this.recognition) {
      this.recognition.stop();
      this.recognition = null;
      this.recognitionActive = false;
    }

    if (this.microphone) {
      this.microphone.disconnect();
      this.microphone = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    console.log('⏹️ Sound detection stopped');
  }

  private triggerHelpDetection(transcript: string, confidence: number) {
    console.log('🆘 HELP DETECTED! Triggering alert...', { transcript, confidence });
    
    // Call the callback if provided
    if (this.onHelpDetected) {
      console.log('📣 Calling onHelpDetected callback');
      this.onHelpDetected();
    } else {
      console.warn('⚠️ No onHelpDetected callback provided');
    }
    
    // Send alert to backend immediately
    this.sendHelpAlert(transcript, confidence);
    
    // No front-end popup alert; rely on UI callbacks/voice alerts list
    console.log('📣 Help detection processed without popup');
  }

  private async sendHelpAlert(transcript: string, confidence: number = 0.9) {
    try {
      // Try both endpoints to ensure the alert is received
      const res1 = await fetch('/api/voice-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'voice_help',
          transcript: transcript,
          confidence: confidence,
          timestamp: new Date().toISOString()
        })
      });
      if (!res1.ok) {
        console.warn('⚠️ /api/voice-alert responded non-OK:', res1.status);
      }
      
      // Also try the /api/alert/help endpoint
      const res2 = await fetch('/api/alert/help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'help',
          transcript: transcript,
          confidence: confidence,
          timestamp: new Date().toISOString()
        })
      });
      if (!res2.ok) {
        console.warn('⚠️ /api/alert/help responded non-OK:', res2.status);
      }
      
      console.log('✅ Help alert processed');
    } catch (error) {
      console.warn('⚠️ Network issue while sending help alert:', error);
    }
  }

  private async sendDistressAlert(volume: number) {
    try {
      const res = await fetch('/api/voice-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'voice_distress',
          volume: Math.round(volume),
          threshold: this.volumeThreshold,
          confidence: 0.85,
          timestamp: new Date().toISOString()
        })
      });
      if (!res.ok) {
        console.warn('⚠️ /api/voice-alert distress responded non-OK:', res.status);
      }
      console.log(`✅ Distress alert processed (Volume: ${Math.round(volume)})`);
    } catch (error) {
      console.warn('⚠️ Network issue while sending distress alert:', error);
    }
  }

  setVolumeThreshold(threshold: number) {
    this.volumeThreshold = threshold;
    console.log(`📊 Volume threshold updated to: ${threshold}`);
  }

  getStatus(): { isListening: boolean; volumeThreshold: number } {
    return {
      isListening: this.isListening,
      volumeThreshold: this.volumeThreshold
    };
  }
}
