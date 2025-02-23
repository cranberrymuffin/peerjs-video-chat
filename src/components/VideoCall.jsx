import React, { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';

const VideoCall = () => {
  const [peerId, setPeerId] = useState(null);
  const [remotePeerId, setRemotePeerId] = useState('');
  const [peer, setPeer] = useState(null);
  const [call, setCall] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoHidden, setIsVideoHidden] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);

  useEffect(() => {
    call?.on('close', () => {
      console.log('Call ended.');
      setCall(null);
      endCall();
    });
  }, [call]);

  useEffect(() => {
    const newPeer = new Peer();

    newPeer.on('open', id => {
      setPeerId(id);
    });

    newPeer.on('call', incomingCall => {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then(stream => {
          localStreamRef.current = stream;
          if (localVideoRef.current) localVideoRef.current.srcObject = stream;

          incomingCall.answer(stream);

          incomingCall.on('stream', remoteStream => {
            if (remoteVideoRef.current)
              remoteVideoRef.current.srcObject = remoteStream;
          });

          setCall(incomingCall);
        });
    });

    newPeer.on('disconnected', () => {
      console.log('Peer disconnected');
      endCall();
    });

    newPeer.on('close', () => {
      console.log('Peer connection closed');
      endCall();
    });

    setPeer(newPeer);

    const handleUnload = () => {
      endCall();
      newPeer.destroy();
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      newPeer.destroy();
    };
  }, []);

  const callPeer = () => {
    if (!peer || !remotePeerId) return;

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then(stream => {
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        const outgoingCall = peer.call(remotePeerId, stream);

        outgoingCall.on('stream', remoteStream => {
          if (remoteVideoRef.current)
            remoteVideoRef.current.srcObject = remoteStream;
        });

        setCall(outgoingCall);
      });
  };

  const endCall = () => {
    call?.close();

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    setIsMuted(false);
    setIsVideoHidden(false);
    setIsScreenSharing(false);
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoHidden(!videoTrack.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      stopScreenShare();
    } else {
      startScreenShare();
    }
  };

  const startScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      screenStreamRef.current = screenStream;

      const sender = call.peerConnection
        .getSenders()
        .find(s => s.track.kind === 'video');
      if (sender) {
        sender.replaceTrack(screenStream.getVideoTracks()[0]);
      }

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = screenStream;
      }

      screenStream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };

      setIsScreenSharing(true);
    } catch (error) {
      console.error('Error starting screen share:', error);
    }
  };

  const stopScreenShare = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
    }

    const sender = call.peerConnection
      .getSenders()
      .find(s => s.track.kind === 'video');
    if (sender && localStreamRef.current) {
      sender.replaceTrack(localStreamRef.current.getVideoTracks()[0]);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
    }

    setIsScreenSharing(false);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>PeerJS Video Call</h2>
      <div>
        <strong>Your ID:</strong> {peerId}
      </div>
      <input
        type="text"
        value={remotePeerId}
        onChange={e => setRemotePeerId(e.target.value)}
        placeholder="Enter remote peer ID"
        style={{
          margin: '10px',
          padding: '5px',
          border: '1px solid #ccc',
          borderRadius: '5px',
        }}
      />
      <button onClick={callPeer} style={buttonStyle('blue')}>
        Call
      </button>
      {call && (
        <>
          <button onClick={endCall} style={buttonStyle('red')}>
            End Call
          </button>
          <button onClick={toggleMute} style={buttonStyle('gray')}>
            {isMuted ? 'Unmute' : 'Mute'}
          </button>
          <button onClick={toggleVideo} style={buttonStyle('purple')}>
            {isVideoHidden ? 'Show Video' : 'Hide Video'}
          </button>
          <button onClick={toggleScreenShare} style={buttonStyle('green')}>
            {isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
          </button>
        </>
      )}
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        <div>
          <h3>Local Video</h3>
          <video ref={localVideoRef} autoPlay playsInline style={videoStyle} />
        </div>
        <div>
          <h3>Remote Video</h3>
          <video ref={remoteVideoRef} autoPlay playsInline style={videoStyle} />
        </div>
      </div>
    </div>
  );
};

const buttonStyle = color => ({
  padding: '5px 10px',
  backgroundColor: color,
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  marginLeft: '10px',
});

const videoStyle = {
  width: '250px',
  border: '1px solid black',
};

export default VideoCall;
