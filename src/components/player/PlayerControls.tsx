import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Trash2, Crown, UserCheck } from 'lucide-react';
import { useRoom } from '../../contexts/RoomContext';
import './PlayerControls.css';

interface PlayerControlsProps {
  player: any;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onTimeUpdate: (time: number) => void;
}

export function PlayerControls({ 
  player, 
  isPlaying, 
  currentTime, 
  duration, 
  onTimeUpdate 
}: PlayerControlsProps) {
  const { 
    roomState, 
    isHost, 
    pauseTrack, 
    resumeTrack, 
    removeFromPlaylist, 
    transferHost,
    setVolume,
    updateCurrentTime
  } = useRoom();
  
  const [volume, setLocalVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);

  // Format time to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle play/pause
  const handlePlayPause = () => {
    if (isPlaying) {
      pauseTrack();
    } else {
      resumeTrack();
    }
  };

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseInt(e.target.value);
    setLocalVolume(vol);
    setVolume(vol);
    if (player) {
      try {
        player.setVolume(vol);
        console.log('🔊 Volume set to:', vol);
      } catch (error) {
        console.log('⚠️ Volume change failed on mobile:', error);
      }
    }
    setIsMuted(vol === 0);
  };

  // Handle mute toggle
  const handleMuteToggle = () => {
    if (isMuted) {
      setLocalVolume(50);
      setVolume(50);
      if (player) {
        try {
          player.setVolume(50);
        } catch (error) {
          console.log('⚠️ Unmute failed on mobile:', error);
        }
      }
      setIsMuted(false);
    } else {
      setLocalVolume(0);
      setVolume(0);
      if (player) {
        try {
          player.setVolume(0);
        } catch (error) {
          console.log('⚠️ Mute failed on mobile:', error);
        }
      }
      setIsMuted(true);
    }
  };

  // Handle progress bar change
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseInt(e.target.value);
    onTimeUpdate(time);
    if (player && isHost) {
      player.seekTo(time, true);
      updateCurrentTime(time);
    }
  };

  // Remove track from playlist
  const handleRemoveTrack = (trackId: string) => {
    if (isHost) {
      removeFromPlaylist(trackId);
    }
  };

  // Transfer host to member
  const handleTransferHost = (memberId: string) => {
    if (isHost) {
      transferHost(memberId);
    }
  };

  if (!roomState) return null;

  const membersList = Object.entries(roomState.members || {});

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 p-4"
    >
      {/* Main Player Controls */}
      <div className="p-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-lg">
        <div className="space-y-4">
          {/* Play/Pause and Time Display */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {isHost && (
                <button
                  onClick={handlePlayPause}
                  className="p-3 bg-purple-600/20 border border-purple-500/50 hover:bg-purple-500/30 rounded-lg transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="h-6 w-6 text-purple-400" />
                  ) : (
                    <Play className="h-6 w-6 text-purple-400 ml-1" />
                  )}
                </button>
              )}
              <div className="text-sm text-gray-400">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            {/* Volume Control */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleMuteToggle}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={handleVolumeChange}
                className="w-20 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-xs text-gray-500 w-8">{volume}%</span>
            </div>
          </div>

          {/* Progress Bar */}
          {isHost && (
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleProgressChange}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          )}
        </div>
      </div>

      {/* Playlist Management */}
      {roomState.playlist.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-lg">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Playlist</h3>
              <span className="px-2 py-1 bg-blue-600/20 text-blue-400 text-sm rounded">
                {roomState.playlist.length} tracks
              </span>
            </div>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {roomState.playlist.map((track, index) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    roomState.currentTrack?.id === track.id
                      ? 'bg-purple-600/20 border-purple-500/50'
                      : 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-sm text-gray-400">#{index + 1}</div>
                    <div>
                      <div className="text-white font-medium">{track.title}</div>
                      <div className="text-gray-400 text-sm">{track.artist}</div>
                    </div>
                  </div>
                  
                  {isHost && roomState.currentTrack?.id !== track.id && (
                    <button
                      onClick={() => handleRemoveTrack(track.id)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Member Management */}
      {membersList.length > 1 && isHost && (
        <div className="p-4 bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-500/30 rounded-lg">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Room Members</h3>
              <span className="px-2 py-1 bg-green-600/20 text-green-400 text-sm rounded">
                {membersList.length} members
              </span>
            </div>
            
            <div className="space-y-2">
              {membersList.map(([memberId, member]) => (
                <div
                  key={memberId}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 border border-gray-700/50"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-white font-medium">{member.name}</div>
                    {memberId === roomState.hostId && (
                      <Crown className="h-4 w-4 text-yellow-400" />
                    )}
                  </div>
                  
                  {memberId !== roomState.hostId && (
                    <button
                      onClick={() => handleTransferHost(memberId)}
                      className="px-3 py-1 bg-green-600/20 border border-green-500/50 text-green-400 hover:bg-green-500/30 rounded transition-colors text-sm flex items-center space-x-1"
                    >
                      <UserCheck className="h-4 w-4" />
                      <span>Make Host</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
