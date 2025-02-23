import React, { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';

const VideoCall = () => {
  const [peerId, setPeerId] = useState(null);
  const [remotePeerId, setRemotePeerId] = useState('');
  const [peer, setPeer] = useState(null);
  const [call, setCall] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    const newPeer = new Peer();

    newPeer.on('open', id => {
      setPeerId(id);
    });

    newPeer.on('call', incomingCall => {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then(stream => {
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
          incomingCall.answer(stream);
          incomingCall.on('stream', remoteStream => {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
            }
          });
          setCall(incomingCall);
        });
    });

    setPeer(newPeer);

    return () => {
      newPeer.destroy();
    };
  }, []);

  const callPeer = () => {
    if (!peer || !remotePeerId) return;

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then(stream => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        const outgoingCall = peer.call(remotePeerId, stream);
        outgoingCall.on('stream', remoteStream => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
        });
        setCall(outgoingCall);
      });
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
      <button
        onClick={callPeer}
        style={{
          padding: '5px 10px',
          backgroundColor: 'blue',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        Call
      </button>
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        <div>
          <h3>Local Video</h3>
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            style={{ width: '250px', border: '1px solid black' }}
          />
        </div>
        <div>
          <h3>Remote Video</h3>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={{ width: '250px', border: '1px solid black' }}
          />
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
