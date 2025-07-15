"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Save, Trash2, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import { getSupabaseBrowserClient } from '@/src/lib/supabaseClient';
import { useAuth } from '@/src/hooks/use-auth';
import { logError } from '@/src/lib/errorLogger';
import { toast } from 'sonner';

/**
 * RecordingControls component - Premium voice recording interface
 * Features theme-aware styling and smooth animations
 */
export default function RecordingControls() {
  // State management
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [timer, setTimer] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [title, setTitle] = useState<string | null>(null);
  const [savedRecordingId, setSavedRecordingId] = useState<string | null>(null);

  // Refs for MediaRecorder and stream
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get user and profile from useAuth hook
  const { user, profile, isLoading: authLoading, updateCredits, refetchProfile } = useAuth();
  
 

  /**
   * Request microphone permissions on component mount
   */
  useEffect(() => {
    const requestPermissions = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setPermissionGranted(true);
        // Stop the stream immediately after getting permission
        stream.getTracks().forEach(track => track.stop());
      } catch (error) {
        console.error('Microphone permission denied:', error);
        setPermissionGranted(false);
      }
    };

    requestPermissions();
  }, []);

  /**
   * Timer effect - runs while recording
   */
  useEffect(() => {
    if (isRecording) {
      timerIntervalRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    // Cleanup on unmount
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isRecording]);

  /**
   * Start recording audio
   */
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        
        // Create URL for audio playback
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setTimer(0);
    } catch (error) {
      console.error('Error starting recording:', error);
      setPermissionGranted(false);
    }
  };

  /**
   * Stop recording audio
   */
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  /**
   * Discard current recording and reset state
   */
  const discardRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setTimer(0);
    setTranscription(null);
    setTitle(null);
    setSavedRecordingId(null);
    setIsTranscribing(false);
  };

  /**
   * Save the recording locally
   */
  const saveRecording = () => {
    if (audioBlob) {
      // Generate unique ID for the recording
      const recordingId = `recording_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create AudioRecording object
      const audioRecording = {
        id: recordingId,
        audioUrl: audioUrl || '',
        duration: timer,
        timestamp: new Date(),
        transcription: transcription || undefined,
        title: title || `Recording ${new Date().toLocaleDateString()}`,
      };
      
      // Save to localStorage (simplified for now)
      const existingRecordings = JSON.parse(localStorage.getItem('audioRecordings') || '[]');
      existingRecordings.push(audioRecording);
      localStorage.setItem('audioRecordings', JSON.stringify(existingRecordings));
      
      setSavedRecordingId(recordingId);
      console.log('Recording saved locally:', audioRecording);
      toast({
        title: 'Recording Saved!',
        description: 'Your recording has been saved successfully.'
      });
      discardRecording();
    }
  };
  
  /**
   * Transcribe audio with AI
   */
  const transcribeWithAI = async () => {
    if (!audioBlob || !audioUrl) {
      toast({
        title: 'No recording available to transcribe.',
        description: 'Please record audio first before transcribing.'
      });
      return;
    }

    if (!user || authLoading) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to use AI transcription.'
      });
      return;
    }

    if (!profile) {
      toast({
        title: 'Profile Loading',
        description: 'Loading user profile. Please try again in a moment.'
      });
      return;
    }
    
    // Calculate transcription cost (1 credit per minute + 1 for title)
    const transcriptionCost = Math.ceil(timer / 60) + 1;
    
    // Check if user has enough credits
    if (profile.current_plan === 'free' && profile.credits < transcriptionCost) {
      toast({
        title: 'Not Enough Credits!',
        description: `You need ${transcriptionCost} credits for this transcription. You have ${profile.credits} credits.`,
        variant: 'destructive'
      });
      return;
    }
    
    setIsTranscribing(true);
    
    try {
      // Convert audio blob to base64 data URI
      const reader = new FileReader();
      const audioDataUri = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
      });
      
      // Call transcribe-audio Edge Function
      const { data: transcriptionData, error: transcriptionError } = await getSupabaseBrowserClient().functions.invoke('transcribe-audio', {
        body: { 
          audioDataUri, 
          durationSeconds: timer, 
          userId: user.id 
        },
      });
      
      if (transcriptionError || transcriptionData?.error) {
        throw new Error(transcriptionData?.error || transcriptionError?.message || 'Transcription failed');
      }
      
      const transcriptionText = transcriptionData.transcription;
      setTranscription(transcriptionText);
      
      // Call generate-title Edge Function
      const { data: titleData, error: titleError } = await getSupabaseBrowserClient().functions.invoke('generate-title', {
        body: { transcriptionText },
      });
      
      let generatedTitle = 'Untitled Note';
      if (!titleError && titleData && !titleData.error) {
        generatedTitle = titleData.title;
      }
      setTitle(generatedTitle);
      
      // Deduct credits and update profile
      const newCredits = profile.credits - transcriptionCost;
      
      // Update credits using useAuth hook
      await updateCredits(newCredits);
      
      toast({
        title: 'Transcription Complete!',
        description: `Transcription and title generation completed successfully! ${transcriptionCost} credits used.`,
      });
      
      // CRITICAL: Update credits in database using refetchProfile
      await refetchProfile({ credits: newCredits });
      
    } catch (error) {
      logError(error as Error, { 
        action: 'transcribeWithAI',
        userId: user.id,
        duration: timer
      });
      toast({
        title: 'Transcription Failed',
        description: (error as Error).message || 'An unexpected error occurred during transcription.',
        variant: 'destructive'
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  /**
   * Format timer display (MM:SS)
   */
  const formatTimer = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * Handle recording button click
   */
  const handleRecordingToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Permission denied state
  if (!permissionGranted) {
    return (
      <motion.div 
        className="w-full max-w-md mx-auto card-themed p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3, ease: "easeOut" }}
            className="mb-6"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-red-500/20 to-orange-500/20 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
          </motion.div>
          <h2 className="text-xl font-semibold mb-3 text-foreground">Microphone Access Required</h2>
          <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
            Please allow microphone access to record voice notes and capture your ideas.
          </p>
          <motion.button
            onClick={() => window.location.reload()}
            className="btn-gradient w-full py-3 px-6 rounded-lg font-medium focus-ring"
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.1 }}
          >
            Grant Permission
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="w-full max-w-sm mx-auto card-themed p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Header */}
      <motion.div 
        className="text-center mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <h2 className="text-lg font-bold mb-2 text-foreground gradient-text">Voice Recorder</h2>
        <p className="text-muted-foreground text-sm">
          {!isRecording && !audioBlob && "Tap the microphone to start recording"}
          {isRecording && "Recording in progress..."}
          {audioBlob && !isRecording && "Review your recording"}
        </p>
      </motion.div>
      
      <div className="flex flex-col items-center space-y-6">
        {/* Recording Timer */}
        <AnimatePresence>
          {isRecording && (
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-3xl font-mono text-foreground mb-3 font-bold">
                {formatTimer(timer)}
              </div>
              <div className="flex items-center justify-center space-x-2">
                <motion.div 
                  className="w-3 h-3 bg-red-500 rounded-full"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                />
                <span className="text-red-400 font-medium text-sm">Recording</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Audio Review Section */}
        <AnimatePresence>
          {audioBlob && !isRecording && (
            <motion.div 
              className="w-full space-y-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              <div className="text-center">
                <div className="text-sm text-foreground mb-3 font-medium">
                  {title || `Recording Complete (${formatTimer(timer)})`}
                </div>
                <div className="bg-muted/50 rounded-lg p-4 mb-4 border border-border">
                  <audio
                    controls
                    src={audioUrl || undefined}
                    className="w-full"
                    style={{
                      filter: 'sepia(1) hue-rotate(240deg) saturate(2)',
                    }}
                  >
                    Your browser does not support the audio element.
                  </audio>
                </div>
                
                {/* Transcription Display */}
                {transcription && (
                  <div className="bg-muted/30 rounded-lg p-4 mb-4 border border-border">
                    <h4 className="text-sm font-medium text-foreground mb-2">Transcription:</h4>
                    <p className="text-sm text-muted-foreground text-left leading-relaxed">
                      {transcription}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col space-y-3">
                {/* AI Transcription Button */}
                {!transcription && user && profile && (
                  <motion.button
                    onClick={transcribeWithAI}
                    disabled={isTranscribing || authLoading || !profile || (profile.current_plan === 'free' && profile.credits < Math.ceil(timer / 60) + 1)}
                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-accent-purple to-accent-blue hover:from-accent-purple/90 hover:to-accent-blue/90 text-white rounded-lg font-medium transition-all duration-200 text-sm focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.1 }}
                  >
                    {isTranscribing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Transcribing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>
                          Transcribe with AI ({Math.ceil(timer / 60) + 1} credits)
                          {profile && profile.current_plan === 'free' && profile.credits < Math.ceil(timer / 60) + 1 && (
                            <span className="text-red-300 ml-1">- Insufficient Credits</span>
                          )}
                        </span>
                      </>
                    )}
                  </motion.button>
                )}
                
                {/* Save and Discard Buttons */}
                <div className="flex space-x-3 justify-center">
                <motion.button
                  onClick={saveRecording}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors text-sm focus-ring"
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.1 }}
                >
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </motion.button>
                <motion.button
                  onClick={discardRecording}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors text-sm focus-ring"
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.1 }}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Discard</span>
                </motion.button>
                </div>
              </div>

              {/* Record New Note Button */}
              <div className="text-center">
                <motion.button
                  onClick={() => {
                    discardRecording();
                  }}
                  className="btn-gradient flex items-center space-x-2 px-4 py-2 rounded-lg font-medium mx-auto text-sm focus-ring"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Mic className="w-4 h-4" />
                  <span>Record New Note</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Recording Button */}
        <AnimatePresence>
          {!audioBlob && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <motion.button
                onClick={handleRecordingToggle}
                disabled={!permissionGranted}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 focus-ring ${
                  isRecording
                    ? 'bg-red-600 hover:bg-red-700 shadow-lg'
                    : 'btn-gradient shadow-xl'
                } disabled:bg-muted disabled:cursor-not-allowed`}
                whileTap={{ scale: 0.95 }}
                animate={isRecording ? { 
                  boxShadow: [
                    '0 0 0 0px rgba(239, 68, 68, 0.4)',
                    '0 0 0 15px rgba(239, 68, 68, 0.1)',
                    '0 0 0 0px rgba(239, 68, 68, 0.4)'
                  ]
                } : {}}
                transition={isRecording ? { 
                  repeat: Infinity, 
                  duration: 1.5, 
                  ease: "easeInOut" 
                } : { duration: 0.1 }}
              >
                <motion.div
                  animate={isRecording ? { rotate: 0 } : { rotate: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isRecording ? (
                    <Square className="w-6 h-6 text-white" />
                  ) : (
                    <Mic className="w-6 h-6 text-white" />
                  )}
                </motion.div>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}