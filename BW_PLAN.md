# Black & White Filter Plan

## Summary of decisions

| Question | Answer |
|---|---|
| Scope | Only the toggling peer's own feed: their local video + the remote peer's remote video (which shows them) |
| Implementation | CSS `filter: grayscale(1)` + PeerJS data channel to sync state |
| Button placement | In-call only (alongside Mute, Hide Video, Share Screen) |
| Sync behavior | Each peer controls only their own B&W state. Toggling affects only your own local video; the remote peer's remote feed (showing you) also goes B&W via data channel — nothing else changes. |

---

## Visual behavior

Each peer has their own toggle. A peer can only toggle their own filter — not the other's.

```
Peer A toggles B&W ON:

  Peer A's screen          Peer B's screen
  ┌──────────┐            ┌──────────┐
  │ Local    │ ← B&W      │ Local    │ ← color (unchanged)
  │ (Peer A) │            │ (Peer B) │
  └──────────┘            └──────────┘
  ┌──────────┐            ┌──────────┐
  │ Remote   │ ← color    │ Remote   │ ← B&W (synced via data channel)
  │ (Peer B) │ (unchanged)│ (Peer A) │
  └──────────┘            └──────────┘

Peer B toggles B&W ON (independently):

  Peer A's screen          Peer B's screen
  ┌──────────┐            ┌──────────┐
  │ Local    │ ← color    │ Local    │ ← B&W
  │ (Peer A) │ (unchanged)│ (Peer B) │
  └──────────┘            └──────────┘
  ┌──────────┐            ┌──────────┐
  │ Remote   │ ← B&W      │ Remote   │ ← color (unchanged)
  │ (Peer B) │ (synced)   │ (Peer A) │
  └──────────┘            └──────────┘

Both peers toggle B&W ON:

  Peer A's screen          Peer B's screen
  ┌──────────┐            ┌──────────┐
  │ Local    │ ← B&W      │ Local    │ ← B&W
  │ (Peer A) │            │ (Peer B) │
  └──────────┘            └──────────┘
  ┌──────────┐            ┌──────────┐
  │ Remote   │ ← B&W      │ Remote   │ ← B&W
  │ (Peer B) │ (synced)   │ (Peer A) │ (synced)
  └──────────┘            └──────────┘
```

---

## State changes

Add two new state variables to `VideoCall.jsx`:

```js
const [isLocalBW, setIsLocalBW]   = useState(false); // this peer toggled B&W
const [isRemoteBW, setIsRemoteBW] = useState(false); // remote peer has B&W on
```

Add one new ref:
```js
const dataConnRef = useRef(null); // PeerJS data connection
```

Reset both to `false` in `endCall()`.

---

## CSS filter application

```jsx
// Local video — B&W when this peer toggled it
<video
  ref={localVideoRef}
  style={isLocalBW ? { filter: 'grayscale(1)' } : {}}
  ...
/>

// Remote video — B&W only when the remote peer has toggled their own filter
<video
  ref={remoteVideoRef}
  style={isRemoteBW ? { filter: 'grayscale(1)' } : {}}
  ...
/>
```

---

## Data channel protocol

Message shape:
```json
{ "type": "bw-filter", "enabled": true }
```

### Caller side (`callPeer`)

Open a data connection immediately after the call:
```js
const outgoingCall = peer.call(remotePeerId, stream);
const dataConn = peer.connect(remotePeerId);
dataConn.on('open', () => { dataConnRef.current = dataConn; });
dataConn.on('data', handleRemoteData);
```

### Callee side (`peer.on('call', ...)`)

Listen for the incoming data connection on the peer:
```js
newPeer.on('connection', dataConn => {
  dataConnRef.current = dataConn;
  dataConn.on('data', handleRemoteData);
});
```

### Shared data handler

```js
const handleRemoteData = (data) => {
  if (data?.type === 'bw-filter') {
    setIsRemoteBW(data.enabled);
  }
};
```

---

## Toggle function

```js
const toggleBWFilter = () => {
  const next = !isLocalBW;
  setIsLocalBW(next);
  dataConnRef.current?.send({ type: 'bw-filter', enabled: next });
};
```

---

## Button

Added inside the `{call && (...)}` block alongside the other in-call buttons:
```jsx
<button onClick={toggleBWFilter} className="button black">
  {isLocalBW ? 'Color' : 'B&W'}
</button>
```

New CSS class:
```css
.button.black {
  background-color: #222;
}
```

---

## Files to change

| File | Change |
|---|---|
| `src/components/VideoCall.jsx` | Add state, ref, data connection setup in both caller and callee flows, `toggleBWFilter`, `handleRemoteData`, inline styles on `<video>` elements, new button |
| `src/style.css` | Add `.button.black` rule |

No new dependencies required.

---

## Edge cases to handle

- **Call ends before data channel opens**: the `dataConnRef` is `null`, so `dataConnRef.current?.send(...)` is a no-op (safe).
- **Peer B reloads / reconnects**: on reconnect, `isRemoteBW` resets to `false` (filter off). Peer A would need to re-toggle to re-sync — acceptable given the session-based nature of the app.
- **Filter reset on end call**: `setIsLocalBW(false)` and `setIsRemoteBW(false)` called inside `endCall()`.
