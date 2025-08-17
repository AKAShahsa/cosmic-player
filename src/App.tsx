import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Search,
  Music,
  Users,
  Plus,
  LogOut,
  Crown,
  Share2,
  Copy,
  X,
  Trash2,
  UserCheck
} from 'lucide-react';
import { RoomProvider, useRoom } from './contexts/RoomContext';
import { Track } from './roomUtils';
import { PlayerControls } from './components/player/PlayerControls';
import { NowPlaying } from './components/player/NowPlaying';
import { ConfirmationPopup } from './components/ui/ConfirmationPopup';
import { useRoomPersistence, useLeaveConfirmation } from './hooks/useRoomPersistence';

const YOUTUBE_API_KEY = 'AIzaSyDVsNWHoXP0vt6q8Me7PURlZKyQk-D1rCk';

// Room Setup Modals
const CreateRoomModal = () => {
  const { createNewRoom, showCreateRoom, setShowCreateRoom } = useRoom();
  const [hostName, setHostName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    if (!hostName.trim()) return;
    
    setIsLoading(true);
    try {
      await createNewRoom(hostName);
    } catch (error) {
      console.error('Failed to create room:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!showCreateRoom) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="glass-morphism p-6 w-full max-w-md rounded-2xl"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold gradient-text">Create Room</h2>
          <button
            onClick={() => setShowCreateRoom(false)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-4">
          <input
            type="text"
            value={hostName}
            onChange={(e) => setHostName(e.target.value)}
            placeholder="Your name"
            className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-neon-blue focus:outline-none"
            maxLength={20}
          />
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreate}
            disabled={!hostName.trim() || isLoading}
            className="w-full p-4 bg-gradient-to-r from-neon-blue to-neon-purple rounded-xl font-semibold
                     disabled:opacity-50 hover:shadow-lg hover:shadow-neon-blue/30 transition-all"
          >
            {isLoading ? '🚀 Creating...' : '🎵 Create Room'}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

const JoinRoomModal = () => {
  const { joinExistingRoom, showJoinRoom, setShowJoinRoom } = useRoom();
  const [roomId, setRoomId] = useState('');
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async () => {
    // Clean and validate inputs for mobile
    const cleanRoomId = roomId.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    const cleanUserName = userName.trim();
    
    if (!cleanRoomId || cleanRoomId.length !== 6) {
      setError('Room code must be exactly 6 characters (letters and numbers only)');
      return;
    }
    
    if (!cleanUserName || cleanUserName.length < 1) {
      setError('Please enter your name');
      return;
    }
    
    setIsLoading(true);
    setError('');
    try {
      console.log('🔗 Attempting to join room:', cleanRoomId, 'as:', cleanUserName);
      const success = await joinExistingRoom(cleanRoomId, cleanUserName);
      if (!success) {
        setError('Room not found. Please check the room code and try again.');
      }
    } catch (error) {
      console.error('Join room error:', error);
      setError('Failed to join room. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!showJoinRoom) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="glass-morphism p-6 w-full max-w-md rounded-2xl"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold gradient-text">Join Room</h2>
          <button
            onClick={() => setShowJoinRoom(false)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-4">
          <input
            type="text"
            value={roomId}
            onChange={(e) => {
              // Clean input for mobile: only allow alphanumeric characters
              const cleaned = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
              setRoomId(cleaned);
              setError(''); // Clear error when typing
            }}
            placeholder="Room Code (e.g. ABC123)"
            className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-neon-purple focus:outline-none text-center font-mono text-lg"
            maxLength={6}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="characters"
            spellCheck="false"
            inputMode="text"
            onKeyPress={(e) => {
              // Allow Enter to trigger join if both fields are filled
              if (e.key === 'Enter' && roomId.length === 6 && userName.trim()) {
                handleJoin();
              }
            }}
          />
          
          <input
            type="text"
            value={userName}
            onChange={(e) => {
              setUserName(e.target.value);
              setError(''); // Clear error when typing
            }}
            placeholder="Your name"
            className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-neon-purple focus:outline-none"
            maxLength={20}
            autoComplete="name"
            autoCorrect="off"
            spellCheck="false"
            onKeyPress={(e) => {
              // Allow Enter to trigger join if both fields are filled
              if (e.key === 'Enter' && roomId.length === 6 && userName.trim()) {
                handleJoin();
              }
            }}
          />
          
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg"
            >
              <p className="text-red-400 text-sm text-center">{error}</p>
            </motion.div>
          )}
          
          {/* Debug info for mobile testing */}
          <div className="text-xs text-gray-500 text-center">
            Room: {roomId.length}/6 chars • Name: {userName.length > 0 ? '✓' : '✗'}
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleJoin}
            disabled={roomId.length !== 6 || !userName.trim() || isLoading}
            className="w-full p-4 bg-gradient-to-r from-neon-purple to-neon-pink rounded-xl font-semibold
                     disabled:opacity-50 hover:shadow-lg hover:shadow-neon-purple/30 transition-all
                     touch-manipulation" // Better touch handling on mobile
            style={{ minHeight: '56px' }} // Ensure minimum touch target size
          >
            {isLoading ? '🔗 Joining...' : roomId.length === 6 && userName.trim() ? '🎶 Join Room' : '📝 Fill in details'}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

// Main Music Player Component
const MusicPlayer = () => {
  const { 
    roomState, 
    isHost, 
    isConnected,
    playTrack,
    addToPlaylist,
    updateCurrentTime,
    leaveCurrentRoom,
    setShowJoinRoom,
    setShowCreateRoom
  } = useRoom();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [playerStatus, setPlayerStatus] = useState('Loading YouTube API...');
  const [localCurrentTime, setLocalCurrentTime] = useState(0);
  const [localDuration, setLocalDuration] = useState(0);
  const [mobileAudioEnabled, setMobileAudioEnabled] = useState(false);

  const playerRef = useRef<any>(null);

  // Room persistence and leave confirmation
  useRoomPersistence();
  const { showLeavePopup, handleLeaveConfirm, handleLeaveCancel } = useLeaveConfirmation();

  // Initialize YouTube Player
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 30; // Reduced retries since element should be available
    
    const initializePlayer = () => {
      if (playerRef.current) {
        console.log('🎵 Player already initialized');
        return; // Already initialized
      }
      
      retryCount++;
      if (retryCount > maxRetries) {
        console.error('❌ Failed to initialize YouTube player after max retries');
        setPlayerStatus('Failed to initialize player');
        return;
      }

      const playerElement = document.getElementById('youtube-player');
      if (!playerElement) {
        console.log(`⏳ Player element not found, retry ${retryCount}/${maxRetries}...`);
        setTimeout(initializePlayer, 200);
        return;
      }

      if (!(window as any).YT || !(window as any).YT.Player) {
        console.log(`⏳ YouTube API not ready, retry ${retryCount}/${maxRetries}...`);
        setTimeout(initializePlayer, 200);
        return;
      }

      try {
        console.log('🎵 Creating YouTube Player...');
        setPlayerStatus('Creating YouTube player...');
        
        playerRef.current = new (window as any).YT.Player('youtube-player', {
          height: '0',
          width: '0',
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            rel: 0,
            playsinline: 1, // Critical for mobile iOS
            enablejsapi: 1,
            origin: window.location.origin
          },
          events: {
            onReady: (event: any) => {
              console.log('✅ YouTube Player Ready!');
              setIsPlayerReady(true);
              setPlayerStatus('Ready!');
              
              // Mobile audio fix: Set initial volume
              try {
                event.target.setVolume(70);
                console.log('🔊 Mobile: Set initial volume to 70');
              } catch (error) {
                console.log('⚠️ Could not set initial volume:', error);
              }
            },
            onStateChange: onPlayerStateChange,
            onError: (event: any) => {
              console.error('❌ YouTube Player Error:', event.data);
              setPlayerStatus('Player error occurred');
            },
          },
        });
      } catch (error) {
        console.error('Error creating player:', error);
        setPlayerStatus('Error creating player');
      }
    };

    // Load YouTube API if needed
    if (!(window as any).YT) {
      console.log('Loading YouTube API...');
      setPlayerStatus('Loading YouTube API...');
      
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      (window as any).onYouTubeIframeAPIReady = () => {
        // Small delay to ensure DOM is ready
        setTimeout(initializePlayer, 200);
      };
    } else {
      // API already loaded, delay to ensure DOM is ready
      setTimeout(initializePlayer, 100);
    }

    // Cleanup
    return () => {
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
        } catch (error) {
          console.error('Error destroying player:', error);
        }
      }
      playerRef.current = null;
      setIsPlayerReady(false);
    };
  }, []);

  // Mobile audio initialization
  const initializeMobileAudio = useCallback(async () => {
    if (!playerRef.current) return;
    
    try {
      // On mobile, we need user interaction to enable audio
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        console.log('📱 Mobile detected, initializing audio context');
        setMobileAudioEnabled(true);
        
        // Try to play/pause to initialize audio context
        const currentState = playerRef.current.getPlayerState?.();
        if (currentState !== 1) { // Not already playing
          playerRef.current.playVideo();
          setTimeout(() => {
            if (playerRef.current && !roomState?.isPlaying) {
              playerRef.current.pauseVideo();
            }
          }, 100);
        }
      }
    } catch (error) {
      console.log('⚠️ Mobile audio init error:', error);
    }
  }, [roomState?.isPlaying]);

  // Manual mobile audio enabler
  const enableMobileAudio = useCallback(async () => {
    if (!playerRef.current) return;
    
    try {
      console.log('🔊 User enabling mobile audio');
      await playerRef.current.playVideo();
      setTimeout(() => {
        if (playerRef.current && !roomState?.isPlaying) {
          playerRef.current.pauseVideo();
        }
      }, 100);
      setMobileAudioEnabled(true);
    } catch (error) {
      console.log('⚠️ Failed to enable mobile audio:', error);
    }
  }, [roomState?.isPlaying]);

  // Sync with room state - only sync for track changes and play state, not time updates
  useEffect(() => {
    if (roomState?.currentTrack && playerRef.current && isPlayerReady) {
      const { currentTrack, isPlaying, currentTime } = roomState;
      
      try {
        // Only load video if it's different
        const currentVideoData = playerRef.current.getVideoData?.();
        const currentVideoId = currentVideoData?.video_id;
        
        if (currentVideoId !== currentTrack.videoId) {
          console.log('🎵 Loading new track:', currentTrack.title);
          playerRef.current.loadVideoById(currentTrack.videoId);
          
          // Wait for video to load, then sync time and play state
          setTimeout(async () => {
            if (playerRef.current) {
              // Initialize mobile audio first
              await initializeMobileAudio();
              
              // Sync to current time for new joiners
              if (currentTime > 0) {
                console.log('⏰ Syncing new track to time:', currentTime);
                playerRef.current.seekTo(currentTime, true);
              }
              
              if (isPlaying) {
                console.log('▶️ Starting playback on mobile');
                playerRef.current.playVideo();
              }
            }
          }, 1000);
        } else {
          // Same video - only sync play state, not time (to avoid restarts)
          const playerState = playerRef.current.getPlayerState?.();
          const isCurrentlyPlaying = playerState === 1; // YT.PlayerState.PLAYING = 1
          
          if (isPlaying && !isCurrentlyPlaying) {
            console.log('▶️ Resuming playback');
            initializeMobileAudio(); // Ensure mobile audio is ready
            playerRef.current.playVideo();
          } else if (!isPlaying && isCurrentlyPlaying) {
            console.log('⏸️ Pausing playback');
            playerRef.current.pauseVideo();
          }
        }
      } catch (error) {
        console.error('❌ Sync error:', error);
      }
    }
  }, [roomState?.currentTrack?.videoId, roomState?.isPlaying, isPlayerReady, initializeMobileAudio]);

  // Separate effect for time sync when user first joins or significant time drift
  useEffect(() => {
    if (roomState?.currentTrack && playerRef.current && isPlayerReady && roomState.currentTime > 0) {
      const currentPlayerTime = playerRef.current.getCurrentTime?.() || 0;
      const timeDifference = Math.abs(currentPlayerTime - roomState.currentTime);
      
      // Only sync if time difference is significant (> 5 seconds) to avoid constant syncing
      if (timeDifference > 5) {
        console.log('⏰ Large time drift detected, syncing:', timeDifference, 'seconds');
        playerRef.current.seekTo(roomState.currentTime, true);
      }
    }
  }, [roomState?.currentTrack?.videoId, isPlayerReady]); // Removed roomState.currentTime to prevent constant updates

  // Track current time for UI and update room state (host only)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (roomState?.isPlaying && isPlayerReady && playerRef.current && isHost) {
      interval = setInterval(() => {
        const currentTime = playerRef.current?.getCurrentTime?.() || 0;
        setLocalCurrentTime(currentTime);
        
        // Update room state with current time (host only) - but less frequently to avoid loops
        if (Math.floor(currentTime) % 3 === 0) { // Only update every 3 seconds
          updateCurrentTime(currentTime);
        }
      }, 1000); // Check every second but only update room every 3 seconds
    } else if (roomState?.isPlaying && isPlayerReady && playerRef.current && !isHost) {
      // Non-host users just update local time for UI
      interval = setInterval(() => {
        const currentTime = playerRef.current?.getCurrentTime?.() || 0;
        setLocalCurrentTime(currentTime);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [roomState?.isPlaying, isPlayerReady, isHost]); // Removed updateCurrentTime to prevent loop

  const onPlayerStateChange = useCallback((event: any) => {
    // Non-host users shouldn't control playback directly
    if (!isHost) return;
    
    // Get duration when video starts playing
    if (event.data === (window as any).YT.PlayerState.PLAYING && playerRef.current) {
      const duration = playerRef.current.getDuration?.() || 0;
      setLocalDuration(duration);
    }
    
    if (event.data === (window as any).YT.PlayerState.ENDED) {
      // Auto-play next track
      if (roomState?.playlist && roomState.playlist.length > 1) {
        const currentIndex = roomState.playlist.findIndex((t: Track) => t.id === roomState.currentTrack?.id);
        const nextIndex = (currentIndex + 1) % roomState.playlist.length;
        playTrack(roomState.playlist[nextIndex]);
      }
    }
  }, [isHost, roomState?.playlist, roomState?.currentTrack?.id, playTrack]);

  // Handle time update from PlayerControls
  const handleTimeUpdate = useCallback((time: number) => {
    setLocalCurrentTime(time);
  }, []);

  const searchMusic = useCallback(async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=${encodeURIComponent(searchQuery + ' music')}&type=video&key=${YOUTUBE_API_KEY}`
      );
      const data = await response.json();
      
      const tracks: Track[] = data.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title.replace(/[^\w\s-]/gi, ''),
        artist: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default.url,
        duration: '0:00',
        videoId: item.id.videoId,
      }));
      
      setSearchResults(tracks);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  const handleTrackSelect = useCallback(async (track: Track) => {
    try {
      await addToPlaylist(track);
      if (isHost && isPlayerReady) {
        await playTrack(track);
      } else if (isHost && !isPlayerReady) {
        console.warn('YouTube player not ready yet. Please wait a moment.');
        // Could show a toast notification here
      }
    } catch (error) {
      console.error('Error selecting track:', error);
    }
  }, [addToPlaylist, isHost, isPlayerReady, playTrack]);

  const copyRoomCode = useCallback(() => {
    if (roomState) {
      navigator.clipboard.writeText(roomState.id);
      // Could add a toast notification here
    }
  }, [roomState]);

  // Show room setup if not connected
  if (!isConnected) {
    return (
      <div className="min-h-screen cosmic-bg flex flex-col items-center justify-center p-4">
        {/* Background Particles */}
        <div className="fixed inset-0 z-0">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-neon-blue rounded-full opacity-30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center">
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-bold font-['Orbitron'] gradient-text mb-4 neon-text">
              COSMIC BEATS
            </h1>
            <p className="text-lg md:text-xl text-gray-300 font-light mb-8">
              🚀 Sync Music with Friends 🌌
            </p>
          </motion.div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="glass-morphism p-6 md:p-8 max-w-md mx-auto rounded-2xl"
          >
            <h2 className="text-2xl font-bold mb-6 gradient-text">Get Started</h2>
            
            <div className="space-y-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCreateRoom(true)}
                className="w-full p-4 bg-gradient-to-r from-neon-blue to-neon-purple rounded-xl font-semibold
                         hover:shadow-lg hover:shadow-neon-blue/30 transition-all flex items-center justify-center gap-2"
              >
                <Crown size={20} />
                Create Room
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowJoinRoom(true)}
                className="w-full p-4 bg-gradient-to-r from-neon-purple to-neon-pink rounded-xl font-semibold
                         hover:shadow-lg hover:shadow-neon-purple/30 transition-all flex items-center justify-center gap-2"
              >
                <Users size={20} />
                Join Room
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Main music player interface
  return (
    <div className="min-h-screen cosmic-bg text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 glass-morphism p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl font-bold gradient-text">COSMIC BEATS</h1>
            {isHost && <Crown size={20} className="text-yellow-400" />}
            {/* Player Status Indicator */}
            <div className={`w-2 h-2 rounded-full ${
              isPlayerReady ? 'bg-green-400' : 'bg-yellow-400'
            }`} title={playerStatus} />
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMembers(true)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-1"
            >
              <Users size={18} />
              <span className="text-sm">{Object.keys(roomState?.members || {}).length}</span>
            </button>
            
            <button
              onClick={copyRoomCode}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              title={`Room: ${roomState?.id}`}
            >
              <Share2 size={18} />
            </button>
            
            <button
              onClick={leaveCurrentRoom}
              className="p-2 hover:bg-red-500/20 text-red-400 rounded-full transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Search Section - Only for hosts */}
      {isHost && (
        <div className="p-4">
          <div className="glass-morphism p-4 rounded-2xl">
            {/* Mobile Audio Enable Button */}
            {!mobileAudioEnabled && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && (
              <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500/50 rounded-lg text-center">
                <p className="text-blue-400 text-sm mb-2">📱 Tap to enable audio on mobile</p>
                <button
                  onClick={enableMobileAudio}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium"
                >
                  🔊 Enable Audio
                </button>
              </div>
            )}
            
            {/* Player Status Indicator */}
            {!isPlayerReady && (
              <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-center">
                <p className="text-yellow-400 text-sm">🎵 {playerStatus}</p>
              </div>
            )}
            
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neon-blue" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchMusic()}
                  placeholder="Search cosmic tracks..."
                  className="w-full pl-10 pr-4 py-3 bg-transparent border-2 border-neon-blue/30 rounded-xl 
                           focus:border-neon-blue focus:outline-none text-white placeholder-gray-400
                           transition-all duration-300"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={searchMusic}
                disabled={isLoading || !isPlayerReady}
                className="px-6 py-3 bg-gradient-to-r from-neon-blue to-neon-purple rounded-xl
                         font-semibold hover:shadow-lg hover:shadow-neon-blue/30 transition-all
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '🔍' : !isPlayerReady ? '⏳' : 'SEARCH'}
              </motion.button>
            </div>
          </div>
        </div>
      )}

      {/* Search Results - Only for hosts */}
      {isHost && searchResults.length > 0 && (
        <div className="p-4">
          <div className="glass-morphism p-4 rounded-2xl">
            <h3 className="text-lg font-bold mb-4 text-neon-blue">Search Results</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {searchResults.map((track, index) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 
                           transition-all duration-300 cursor-pointer"
                  onClick={() => handleTrackSelect(track)}
                >
                  <img
                    src={track.thumbnail}
                    alt={track.title}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate text-sm">{track.title}</h4>
                    <p className="text-gray-400 text-xs truncate">{track.artist}</p>
                  </div>
                  <Plus size={16} className="text-neon-purple" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Audio Enable for Non-Hosts */}
      {!isHost && !mobileAudioEnabled && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && (
        <div className="p-4">
          <div className="glass-morphism p-4 rounded-2xl">
            <div className="p-3 bg-blue-500/20 border border-blue-500/50 rounded-lg text-center">
              <p className="text-blue-400 text-sm mb-2">📱 Tap to enable audio on mobile</p>
              <button
                onClick={enableMobileAudio}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium"
              >
                🔊 Enable Audio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Now Playing & Player Controls */}
      {roomState?.currentTrack && (
        <>
          <NowPlaying />
          <PlayerControls
            player={playerRef.current}
            isPlaying={roomState.isPlaying}
            currentTime={localCurrentTime}
            duration={localDuration}
            onTimeUpdate={handleTimeUpdate}
          />
        </>
      )}

      {/* Members Modal */}
      <AnimatePresence>
        {showMembers && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="glass-morphism p-6 w-full max-w-md rounded-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold gradient-text">Room Members</h2>
                <button
                  onClick={() => setShowMembers(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-3">
                {Object.entries(roomState?.members || {}).map(([userId, member]) => {
                  const memberData = member as { name: string; joinedAt: number };
                  return (
                    <div key={userId} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                      <div className="w-8 h-8 bg-gradient-to-r from-neon-blue to-neon-purple rounded-full flex items-center justify-center text-sm font-bold">
                        {memberData.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="flex-1">{memberData.name}</span>
                      {userId === roomState?.hostId && (
                        <Crown size={16} className="text-yellow-400" />
                      )}
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-6 p-3 bg-white/5 rounded-lg text-center">
                <p className="text-sm text-gray-400 mb-2">Room Code</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="font-mono text-lg font-bold">{roomState?.id}</span>
                  <button
                    onClick={copyRoomCode}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Leave Confirmation Popup */}
      <ConfirmationPopup
        isOpen={showLeavePopup}
        title="Leave Room?"
        message="Are you sure you want to leave the music room? You will need to rejoin manually to continue listening with others."
        confirmText="Leave Room"
        cancelText="Stay"
        onConfirm={handleLeaveConfirm}
        onCancel={handleLeaveCancel}
        type="warning"
      />
    </div>
  );
};

// Root App Component
function App() {
  return (
    <RoomProvider>
      {/* YouTube Player (Hidden but always available) */}
      <div 
        id="youtube-player" 
        style={{ display: 'none' }} 
      />
      <MusicPlayer />
      <CreateRoomModal />
      <JoinRoomModal />
    </RoomProvider>
  );
}

export default App;
