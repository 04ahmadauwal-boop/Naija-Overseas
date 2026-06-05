import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Peer } from 'peerjs';
import { io as socketIO } from 'socket.io-client';
import {
  Video, VideoOff, Mic, MicOff, PenLine, FolderOpen, BookOpen, PhoneOff,
  Eraser, Type, RotateCcw, RotateCw, Download, Upload,
  CheckCircle, Clock, Plus, Trash2, Star, GraduationCap,
  Users, X, ChevronRight, FileText,
} from 'lucide-react';

const SERVER_URL = import.meta.env.VITE_API_URL?.replace('/api', '') ?? '';

// ─── Constants ───────────────────────────────────────────────────────────────

const COLORS = [
  '#1a1a1a', '#ef4444', '#3b82f6', '#22c55e',
  '#f59e0b', '#8b5cf6', '#ec4899', '#ffffff',
];
const WIDTHS = [2, 4, 7, 12, 20];

// ─── Whiteboard ──────────────────────────────────────────────────────────────

function Whiteboard({ roomId, isTutor }) {
  const canvasRef  = useRef(null);
  const socketRef  = useRef(null);
  const [tool,   setTool]   = useState('pen');
  const [color,  setColor]  = useState('#1a1a1a');
  const [width,  setWidth]  = useState(4);
  const [showEq, setShowEq] = useState(false);
  const [eqText, setEqText] = useState('');
  const isDrawing = useRef(false);
  const history   = useRef([]);
  const hIdx      = useRef(-1);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const norm  = (x, y) => ({ px: x / canvasRef.current.width, py: y / canvasRef.current.height });
  const denorm = (px, py) => ({ x: px * canvasRef.current.width, y: py * canvasRef.current.height });

  const applyImage = (dataUrl) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
    };
  };

  // ── Canvas resize (preserves content) ───────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const fit = () => {
      const { clientWidth: w, clientHeight: h } = canvas.parentElement;
      const snap = canvas.toDataURL();
      canvas.width  = w;
      canvas.height = h;
      applyImage(snap);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(canvas.parentElement);
    return () => ro.disconnect();
  }, []);

  // ── Socket.io connection ─────────────────────────────────────────────────
  useEffect(() => {
    if (!roomId) return;
    const socket = socketIO(SERVER_URL || window.location.origin, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.emit('board:join', roomId);

    if (!isTutor) {
      // Student: request the current board state from the tutor
      socket.emit('board:sync-request', { roomId });

      socket.on('board:sync', ({ dataUrl }) => applyImage(dataUrl));

      socket.on('board:begin', ({ tool: t, color: c, lw, px, py }) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const { x, y } = denorm(px, py);
        ctx.beginPath();
        ctx.moveTo(x, y);
        if (t === 'eraser') {
          ctx.globalCompositeOperation = 'destination-out';
          ctx.lineWidth = lw;
        } else {
          ctx.globalCompositeOperation = 'source-over';
          ctx.strokeStyle = c;
          ctx.lineWidth   = lw;
          ctx.lineCap     = 'round';
          ctx.lineJoin    = 'round';
        }
      });

      socket.on('board:move', ({ px, py }) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const { x, y } = denorm(px, py);
        const ctx = canvas.getContext('2d');
        ctx.lineTo(x, y);
        ctx.stroke();
      });

      socket.on('board:end', () => { /* stroke already rendered */ });

      socket.on('board:clear', () => {
        const canvas = canvasRef.current;
        if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
      });

      socket.on('board:text', ({ px, py, text, color: c, fontSize }) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const { x, y } = denorm(px, py);
        const ctx = canvas.getContext('2d');
        ctx.globalCompositeOperation = 'source-over';
        ctx.font      = `${fontSize}px Inter, sans-serif`;
        ctx.fillStyle = c;
        ctx.fillText(text, x, y);
      });

      socket.on('board:eq', ({ text, color: c, fontSize }) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.globalCompositeOperation = 'source-over';
        ctx.font      = `italic bold ${fontSize}px Georgia, serif`;
        ctx.fillStyle = c;
        ctx.fillText(text, canvas.width / 2 - ctx.measureText(text).width / 2, canvas.height / 2);
      });
    } else {
      // Tutor: respond to sync requests from students
      socket.on('board:sync-request', ({ from }) => {
        const canvas = canvasRef.current;
        if (canvas) socket.emit('board:sync-response', { to: from, dataUrl: canvas.toDataURL() });
      });
    }

    return () => {
      socket.emit('board:leave', roomId);
      socket.disconnect();
    };
  }, [roomId, isTutor]);

  // ── Emit helper for tutor only ───────────────────────────────────────────
  const emit = (ev, data = {}) => {
    if (isTutor && socketRef.current) socketRef.current.emit(ev, { roomId, ...data });
  };

  // ── History snap / restore ───────────────────────────────────────────────
  const snap = () => {
    const canvas = canvasRef.current;
    history.current = history.current.slice(0, hIdx.current + 1);
    history.current.push(canvas.toDataURL());
    hIdx.current = history.current.length - 1;
  };

  const restore = (idx) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (idx >= 0) applyImage(history.current[idx]);
  };

  const undo = () => { hIdx.current = Math.max(-1, hIdx.current - 1); restore(hIdx.current); };
  const redo = () => {
    if (hIdx.current >= history.current.length - 1) return;
    hIdx.current++;
    restore(hIdx.current);
  };

  const clearBoard = () => {
    canvasRef.current.getContext('2d').clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    snap();
    emit('board:clear');
  };

  // ── Canvas event handlers (tutor only) ───────────────────────────────────
  const getXY = (e) => {
    const canvas = canvasRef.current;
    const r = canvas.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return {
      x: (src.clientX - r.left) * (canvas.width / r.width),
      y: (src.clientY - r.top)  * (canvas.height / r.height),
    };
  };

  const onDown = (e) => {
    if (!isTutor) return;
    e.preventDefault();
    if (tool === 'text') return;
    isDrawing.current = true;
    const ctx = canvasRef.current.getContext('2d');
    const { x, y } = getXY(e);
    const lw = tool === 'eraser' ? width * 4 : width;
    ctx.beginPath();
    ctx.moveTo(x, y);
    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = lw;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
      ctx.lineWidth   = lw;
      ctx.lineCap     = 'round';
      ctx.lineJoin    = 'round';
    }
    emit('board:begin', { tool, color, lw, ...norm(x, y) });
  };

  const onMove = (e) => {
    if (!isTutor || !isDrawing.current) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext('2d');
    const { x, y } = getXY(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    emit('board:move', norm(x, y));
  };

  const onUp = () => {
    if (!isTutor || !isDrawing.current) return;
    isDrawing.current = false;
    snap();
    emit('board:end');
  };

  const onClick = (e) => {
    if (!isTutor || tool !== 'text') return;
    const { x, y } = getXY(e);
    const text = window.prompt('Enter text for the whiteboard:');
    if (!text) return;
    const fontSize = width * 3 + 10;
    const ctx = canvasRef.current.getContext('2d');
    ctx.globalCompositeOperation = 'source-over';
    ctx.font      = `${fontSize}px Inter, sans-serif`;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    snap();
    emit('board:text', { text, color, fontSize, ...norm(x, y) });
  };

  const placeEq = () => {
    if (!eqText.trim()) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const fontSize = Math.max(width * 2 + 14, 20);
    ctx.globalCompositeOperation = 'source-over';
    ctx.font      = `italic bold ${fontSize}px Georgia, serif`;
    ctx.fillStyle = color;
    ctx.fillText(eqText, canvas.width / 2 - ctx.measureText(eqText).width / 2, canvas.height / 2);
    snap();
    emit('board:eq', { text: eqText, color, fontSize });
    setShowEq(false);
    setEqText('');
  };

  const download = () => {
    const a = document.createElement('a');
    a.download = 'whiteboard.png';
    a.href = canvasRef.current.toDataURL();
    a.click();
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full relative">

      {/* Toolbar — tutor sees full controls; student sees read-only banner */}
      {isTutor ? (
        <div className="flex flex-wrap items-center gap-1.5 px-3 py-2 bg-white border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-0.5 border-r border-gray-200 pr-2.5 mr-1">
            {[
              { t: 'pen',    Icon: PenLine, tip: 'Pen' },
              { t: 'eraser', Icon: Eraser,  tip: 'Eraser' },
              { t: 'text',   Icon: Type,    tip: 'Text' },
            ].map(({ t, Icon, tip }) => (
              <button key={t} title={tip} onClick={() => setTool(t)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
                  tool === t ? 'bg-green-700 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'
                }`}>
                <Icon size={14} />
              </button>
            ))}
            <button title="Equation" onClick={() => setShowEq(true)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold font-serif transition ${
                showEq ? 'bg-green-700 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}>∑</button>
          </div>
          <div className="flex items-center gap-1 border-r border-gray-200 pr-2.5 mr-1">
            {COLORS.map(c => (
              <button key={c} onClick={() => setColor(c)}
                className={`w-5 h-5 rounded-full border-2 transition-transform ${color === c ? 'border-green-500 scale-125' : 'border-gray-300 hover:scale-110'}`}
                style={{ backgroundColor: c }} />
            ))}
          </div>
          <div className="flex items-center gap-1 border-r border-gray-200 pr-2.5 mr-1">
            {WIDTHS.map(w => (
              <button key={w} onClick={() => setWidth(w)}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition ${width === w ? 'bg-green-100 ring-1 ring-green-500' : 'hover:bg-gray-100'}`}>
                <div className="rounded-full bg-gray-800" style={{ width: Math.min(w, 16), height: Math.min(w, 16) }} />
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 ml-auto">
            <button onClick={undo} title="Undo" className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 transition"><RotateCcw size={13} /></button>
            <button onClick={redo} title="Redo" className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 transition"><RotateCw size={13} /></button>
            <button onClick={clearBoard} className="px-2.5 py-1 text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition">Clear</button>
            <button onClick={download} className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition">
              <Download size={12} /> Save PNG
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border-b border-blue-100 shrink-0">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-blue-700 text-xs font-semibold">Tutor's board — live view</span>
          <button onClick={download} className="ml-auto flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition">
            <Download size={12} /> Save PNG
          </button>
        </div>
      )}

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden bg-white"
        style={{ backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
        <canvas
          ref={canvasRef}
          className="absolute inset-0 touch-none"
          style={{ cursor: !isTutor ? 'default' : tool === 'eraser' ? 'cell' : tool === 'text' ? 'text' : 'crosshair' }}
          onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
          onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp}
          onClick={onClick}
        />
      </div>

      {/* Equation modal (tutor only) */}
      {showEq && isTutor && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-30">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-gray-900">Equation / Formula Editor</h3>
              <button onClick={() => { setShowEq(false); setEqText(''); }}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100"><X size={15} /></button>
            </div>
            <p className="text-xs text-gray-400 mb-3">Type any equation or formula</p>
            <input type="text" value={eqText} onChange={e => setEqText(e.target.value)}
              placeholder="e.g.  x = (-b ± √(b²−4ac)) / 2a"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-green-500"
              autoFocus onKeyDown={e => e.key === 'Enter' && placeEq()} />
            {eqText && (
              <div className="mt-3 p-4 bg-amber-50 border border-amber-100 rounded-xl text-center font-serif text-lg italic text-amber-900">{eqText}</div>
            )}
            <p className="text-[10px] text-gray-400 mt-2">
              {['E = mc²', 'F = ma', 'PV = nRT', 'a² + b² = c²'].map(ex => (
                <button key={ex} onClick={() => setEqText(ex)} className="text-green-600 hover:underline mr-2 font-mono">{ex}</button>
              ))}
            </p>
            <div className="flex gap-2 mt-4">
              <button onClick={() => { setShowEq(false); setEqText(''); }}
                className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-50 text-sm transition">Cancel</button>
              <button onClick={placeEq}
                className="flex-1 bg-green-700 text-white font-semibold py-2.5 rounded-xl hover:bg-green-800 text-sm transition">Place on Board</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Video Panel (PeerJS WebRTC) ─────────────────────────────────────────────

function VideoPanel({ roomId, userName: _userName }) {
  const localRef  = useRef(null);
  const remoteRef = useRef(null);
  const peerRef   = useRef(null);
  const streamRef = useRef(null);

  const [status,  setStatus]  = useState('init');   // init | waiting | live | error
  const [errMsg,  setErrMsg]  = useState('');
  const [muted,   setMuted]   = useState(false);
  const [camOff,  setCamOff]  = useState(false);
  const [isTutor, setIsTutor] = useState(false);     // true = host (tutor), false = guest (student)

  const hostId = `goclass-${roomId}`;

  const attachRemote = (remoteStream) => {
    if (remoteRef.current) remoteRef.current.srcObject = remoteStream;
    setStatus('live');
  };

  const joinAsGuest = useCallback((stream) => {
    // This user is the student — they will only see the tutor's remote video
    setIsTutor(false);
    const peer = new Peer(undefined, {
      config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] },
    });
    peerRef.current = peer;
    peer.on('open', () => {
      const call = peer.call(hostId, stream);
      if (!call) { setStatus('error'); setErrMsg('Tutor not in room yet — please wait and reload.'); return; }
      call.on('stream', attachRemote);
      call.on('close', () => setStatus('waiting'));
    });
    peer.on('error', (e) => { setStatus('error'); setErrMsg(e.message); });
  }, [hostId]);

  useEffect(() => {
    if (!roomId) return;
    let destroyed = false;

    (async () => {
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      } catch {
        setStatus('error');
        setErrMsg('Camera / microphone access denied. Allow access in your browser and reload.');
        return;
      }
      streamRef.current = stream;
      if (localRef.current) localRef.current.srcObject = stream;
      if (destroyed) return;

      // Try to claim the host (tutor) seat
      const peer = new Peer(hostId, {
        config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] },
      });
      peerRef.current = peer;

      peer.on('open', () => {
        if (destroyed) return;
        setIsTutor(true);   // successfully claimed host seat → this is the tutor
        setStatus('waiting');
      });

      peer.on('call', (call) => {
        call.answer(stream);
        call.on('stream', attachRemote);
        call.on('close', () => setStatus('waiting'));
      });

      peer.on('error', (err) => {
        if (destroyed) return;
        if (err.type === 'unavailable-id') {
          // Host seat already taken → this is the student
          peer.destroy();
          joinAsGuest(stream);
        } else {
          setStatus('error');
          setErrMsg(err.message);
        }
      });
    })();

    return () => {
      destroyed = true;
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (peerRef.current) peerRef.current.destroy();
    };
  }, [roomId, hostId, joinAsGuest]);

  const toggleMute = () => {
    streamRef.current?.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
    setMuted(m => !m);
  };
  const toggleCam = () => {
    streamRef.current?.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
    setCamOff(c => !c);
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Status bar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-xs text-gray-400 shrink-0">
        <span className={`w-2 h-2 rounded-full ${status === 'live' ? 'bg-green-400 animate-pulse' : status === 'error' ? 'bg-red-500' : 'bg-yellow-400 animate-pulse'}`} />
        <span>
          {status === 'init'    && 'Starting camera…'}
          {status === 'waiting' && 'Waiting for the other participant to join…'}
          {status === 'live'    && 'Connected — session live'}
          {status === 'error'   && errMsg}
        </span>
      </div>

      {/* Video area */}
      <div className="flex-1 relative bg-gray-950 overflow-hidden">
        {/* Remote video — tutor for student, student for tutor (full screen) */}
        <video ref={remoteRef} autoPlay playsInline className="w-full h-full object-cover" />

        {status !== 'live' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-950/80">
            {status === 'error' ? (
              <p className="text-red-400 text-sm text-center max-w-xs px-4">{errMsg}</p>
            ) : (
              <>
                <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 text-sm">
                  {status === 'waiting' ? 'Waiting for student to join…' : 'Joining session…'}
                </p>
              </>
            )}
          </div>
        )}

        {/* Self camera — tutor sees own PiP, student's camera is sent but not displayed */}
        <video ref={localRef} autoPlay playsInline muted
          className={isTutor
            ? 'absolute bottom-3 right-3 w-36 h-24 object-cover rounded-xl border-2 border-gray-700 shadow-lg bg-gray-800'
            : 'hidden'} />

        {/* Role badge */}
        <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-bold text-white ${isTutor ? 'bg-green-700' : 'bg-blue-700'}`}>
          {isTutor ? 'Tutor' : 'Student'}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 py-3 bg-gray-800 shrink-0">
        <button onClick={toggleMute}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-xs font-semibold transition ${muted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-500'}`}>
          {muted ? <MicOff size={14} /> : <Mic size={14} />}
          {muted ? 'Unmute' : 'Mute'}
        </button>
        <button onClick={toggleCam}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-xs font-semibold transition ${camOff ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-500'}`}>
          {camOff ? <VideoOff size={14} /> : <Video size={14} />}
          {camOff ? 'Show cam' : 'Hide cam'}
        </button>
      </div>
    </div>
  );
}

// ─── Files Panel ─────────────────────────────────────────────────────────────

function FilesPanel({ roomId, files, onFileUploaded }) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const { data } = await api.post(`/classroom/${roomId}/files`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onFileUploaded(data.room?.sharedFiles || []);
      toast.success('File shared with the class');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const extIcon = (name = '') => {
    const ext = name.split('.').pop().toLowerCase();
    if (['pdf'].includes(ext)) return '📄';
    if (['doc','docx'].includes(ext)) return '📝';
    if (['xls','xlsx'].includes(ext)) return '📊';
    if (['ppt','pptx'].includes(ext)) return '📋';
    if (['jpg','jpeg','png','gif','webp'].includes(ext)) return '🖼️';
    if (['mp4','mov','avi'].includes(ext)) return '🎬';
    return '📁';
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div>
          <h3 className="font-bold text-gray-900">Shared Files</h3>
          <p className="text-xs text-gray-400">{files.length} file{files.length !== 1 ? 's' : ''} in this session</p>
        </div>
        <button onClick={() => fileRef.current?.click()} disabled={uploading}
          className="flex items-center gap-2 bg-green-700 text-white font-semibold px-4 py-2 rounded-xl hover:bg-green-800 text-sm transition disabled:opacity-50">
          {uploading
            ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Uploading…</>
            : <><Upload size={13} /> Share File</>
          }
        </button>
        <input ref={fileRef} type="file" className="hidden" onChange={handleUpload} />
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-2">
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <FolderOpen size={48} className="text-gray-200 mb-4" />
            <p className="font-semibold text-gray-400">No files shared yet</p>
            <p className="text-xs text-gray-300 mt-1">Upload notes, slides, or resources for this session</p>
          </div>
        ) : (
          files.map((f, i) => (
            <a key={i} href={f.fileUrl} target="_blank" rel="noreferrer"
              className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 hover:border-green-200 hover:bg-green-50 transition group">
              <span className="text-2xl shrink-0">{extIcon(f.name)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-green-700">{f.name}</p>
                <p className="text-xs text-gray-400">Shared by {f.uploadedBy || 'Tutor'}</p>
              </div>
              <Download size={14} className="text-gray-400 group-hover:text-green-600 shrink-0" />
            </a>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Homework Panel ───────────────────────────────────────────────────────────

function HomeworkPanel({ roomId, userRole, userId: _userId }) {
  const [homeworks,     setHomeworks]     = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [showCreate,    setShowCreate]    = useState(false);
  const [submitting,    setSubmitting]    = useState(false);
  const [gradingId,     setGradingId]     = useState(null);
  const [gradeData,     setGradeData]     = useState({ score: '', feedback: '' });
  const [newHw,         setNewHw]         = useState({ title: '', description: '', dueDate: '' });
  const [expandedId,    setExpandedId]    = useState(null);
  const [submitText,    setSubmitText]    = useState('');

  const fetchHw = useCallback(async () => {
    try {
      const { data } = await api.get(`/homework?roomId=${roomId}`);
      setHomeworks(data.homework || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [roomId]);

  useEffect(() => { fetchHw(); }, [fetchHw]);

  const createHw = async () => {
    if (!newHw.title.trim()) { toast.error('Add a title'); return; }
    setSubmitting(true);
    try {
      const { data } = await api.post('/homework', { roomId, ...newHw });
      setHomeworks(prev => [data.homework, ...prev]);
      setNewHw({ title: '', description: '', dueDate: '' });
      setShowCreate(false);
      toast.success('Homework assigned');
    } catch { toast.error('Could not create homework'); }
    finally { setSubmitting(false); }
  };

  const submitHw = async (id) => {
    if (!submitText.trim()) { toast.error('Write your answer first'); return; }
    setSubmitting(true);
    try {
      const { data } = await api.patch(`/homework/${id}/submit`, { text: submitText });
      setHomeworks(prev => prev.map(h => h._id === id ? data.homework : h));
      setSubmitText('');
      setExpandedId(null);
      toast.success('Homework submitted!');
    } catch { toast.error('Submission failed'); }
    finally { setSubmitting(false); }
  };

  const gradeHw = async (id) => {
    if (!gradeData.score) { toast.error('Enter a score'); return; }
    setSubmitting(true);
    try {
      const { data } = await api.patch(`/homework/${id}/grade`, gradeData);
      setHomeworks(prev => prev.map(h => h._id === id ? data.homework : h));
      setGradingId(null);
      setGradeData({ score: '', feedback: '' });
      toast.success('Homework graded');
    } catch { toast.error('Could not grade'); }
    finally { setSubmitting(false); }
  };

  const deleteHw = async (id) => {
    if (!window.confirm('Delete this homework?')) return;
    await api.delete(`/homework/${id}`);
    setHomeworks(prev => prev.filter(h => h._id !== id));
  };

  const statusBadge = (status) => {
    const map = {
      assigned:  'bg-amber-100 text-amber-700',
      submitted: 'bg-blue-100 text-blue-700',
      graded:    'bg-green-100 text-green-700',
    };
    return `text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${map[status] || map.assigned}`;
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div>
          <h3 className="font-bold text-gray-900">Homework</h3>
          <p className="text-xs text-gray-400">{homeworks.length} assignment{homeworks.length !== 1 ? 's' : ''}</p>
        </div>
        {userRole !== 'student' && (
          <button onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-1.5 bg-green-700 text-white font-semibold px-4 py-2 rounded-xl hover:bg-green-800 text-sm transition">
            <Plus size={14} /> Assign
          </button>
        )}
      </div>

      {/* Create form (tutor) */}
      {showCreate && userRole !== 'student' && (
        <div className="mx-5 my-4 p-4 bg-green-50 border border-green-100 rounded-2xl space-y-3">
          <p className="text-sm font-bold text-gray-800">New Homework Assignment</p>
          <input value={newHw.title} onChange={e => setNewHw(p => ({ ...p, title: e.target.value }))}
            placeholder="Title *" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500" />
          <textarea value={newHw.description} onChange={e => setNewHw(p => ({ ...p, description: e.target.value }))}
            placeholder="Instructions (optional)" rows={3}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 resize-none" />
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Due date (optional)</label>
            <input type="datetime-local" value={newHw.dueDate} onChange={e => setNewHw(p => ({ ...p, dueDate: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowCreate(false)}
              className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2 rounded-xl text-sm hover:bg-gray-50 transition">
              Cancel
            </button>
            <button onClick={createHw} disabled={submitting}
              className="flex-1 bg-green-700 text-white font-semibold py-2 rounded-xl text-sm hover:bg-green-800 transition disabled:opacity-50">
              {submitting ? 'Saving…' : 'Assign Homework'}
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {loading && <p className="text-sm text-gray-400 text-center py-8">Loading…</p>}
        {!loading && homeworks.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <BookOpen size={48} className="text-gray-200 mb-4" />
            <p className="font-semibold text-gray-400">No homework yet</p>
            {userRole !== 'student' && (
              <p className="text-xs text-gray-300 mt-1">Click "Assign" to give the student homework</p>
            )}
          </div>
        )}

        {homeworks.map(hw => {
          const isOpen = expandedId === hw._id;
          const isGrading = gradingId === hw._id;
          const isOverdue = hw.dueDate && new Date(hw.dueDate) < new Date() && hw.status === 'assigned';

          return (
            <div key={hw._id} className="border border-gray-100 rounded-2xl overflow-hidden">
              {/* Card header */}
              <button
                className="w-full flex items-start gap-3 p-4 text-left hover:bg-gray-50 transition"
                onClick={() => setExpandedId(isOpen ? null : hw._id)}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  hw.status === 'graded'    ? 'bg-green-100 text-green-600' :
                  hw.status === 'submitted' ? 'bg-blue-100 text-blue-600'  :
                  'bg-amber-100 text-amber-600'
                }`}>
                  {hw.status === 'graded' ? <Star size={14} /> :
                   hw.status === 'submitted' ? <CheckCircle size={14} /> :
                   <FileText size={14} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p className="text-sm font-bold text-gray-800 leading-tight">{hw.title}</p>
                    <span className={statusBadge(hw.status)}>{hw.status}</span>
                    {isOverdue && <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Overdue</span>}
                  </div>
                  {hw.dueDate && (
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={10} /> Due {new Date(hw.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>
                <ChevronRight size={14} className={`text-gray-400 shrink-0 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
              </button>

              {/* Expanded content */}
              {isOpen && (
                <div className="px-4 pb-4 pt-0 space-y-3 border-t border-gray-100">
                  {hw.description && (
                    <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{hw.description}</p>
                  )}

                  {/* Submission area (student) */}
                  {userRole === 'student' && hw.status === 'assigned' && (
                    <div className="space-y-2 pt-1">
                      <textarea
                        value={submitText}
                        onChange={e => setSubmitText(e.target.value)}
                        placeholder="Type your answer here…"
                        rows={4}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 resize-none"
                      />
                      <button onClick={() => submitHw(hw._id)} disabled={submitting}
                        className="w-full bg-green-700 text-white font-semibold py-2.5 rounded-xl text-sm hover:bg-green-800 transition disabled:opacity-50">
                        {submitting ? 'Submitting…' : 'Submit Homework'}
                      </button>
                    </div>
                  )}

                  {/* Submitted answer */}
                  {hw.submission?.text && (
                    <div className="bg-blue-50 rounded-xl p-3">
                      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">Student's Answer</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{hw.submission.text}</p>
                      {hw.submission.submittedAt && (
                        <p className="text-[10px] text-gray-400 mt-1.5">
                          Submitted {new Date(hw.submission.submittedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Grade display */}
                  {hw.status === 'graded' && hw.grade && (
                    <div className="bg-green-50 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Grade</p>
                        <span className="text-lg font-extrabold text-green-700">{hw.grade.score}/100</span>
                      </div>
                      {hw.grade.feedback && <p className="text-sm text-gray-700">{hw.grade.feedback}</p>}
                    </div>
                  )}

                  {/* Grade form (tutor) */}
                  {userRole !== 'student' && hw.status === 'submitted' && (
                    <>
                      {isGrading ? (
                        <div className="space-y-2 pt-1">
                          <div className="flex items-center gap-2">
                            <label className="text-xs font-semibold text-gray-600 w-16">Score</label>
                            <input type="number" min="0" max="100" value={gradeData.score}
                              onChange={e => setGradeData(p => ({ ...p, score: e.target.value }))}
                              placeholder="0 – 100"
                              className="w-24 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-500" />
                            <span className="text-xs text-gray-400">/ 100</span>
                          </div>
                          <textarea value={gradeData.feedback}
                            onChange={e => setGradeData(p => ({ ...p, feedback: e.target.value }))}
                            placeholder="Feedback (optional)"
                            rows={2}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 resize-none" />
                          <div className="flex gap-2">
                            <button onClick={() => setGradingId(null)}
                              className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2 rounded-xl text-sm hover:bg-gray-50 transition">
                              Cancel
                            </button>
                            <button onClick={() => gradeHw(hw._id)} disabled={submitting}
                              className="flex-1 bg-green-700 text-white font-semibold py-2 rounded-xl text-sm hover:bg-green-800 transition disabled:opacity-50">
                              {submitting ? 'Grading…' : 'Submit Grade'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => setGradingId(hw._id)}
                          className="w-full flex items-center justify-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 font-semibold py-2 rounded-xl text-sm hover:bg-amber-100 transition">
                          <Star size={13} /> Grade This Homework
                        </button>
                      )}
                    </>
                  )}

                  {/* Tutor: delete */}
                  {userRole !== 'student' && (
                    <button onClick={() => deleteHw(hw._id)}
                      className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition">
                      <Trash2 size={11} /> Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main GoClass Page ────────────────────────────────────────────────────────

const PANELS = [
  { id: 'video',     label: 'Video',     Icon: Video },
  { id: 'whiteboard', label: 'Board',    Icon: PenLine },
  { id: 'files',     label: 'Files',     Icon: FolderOpen },
  { id: 'homework',  label: 'Homework',  Icon: BookOpen },
];

export default function GoClass() {
  const { roomId } = useParams();
  const navigate   = useNavigate();
  const { user }   = useAuth();

  const [activePanel,   setActivePanel]   = useState('video');
  const [elapsed,       setElapsed]       = useState(0);
  const [files,         setFiles]         = useState([]);
  const [subject,       setSubject]       = useState('');
  const [leaving,       setLeaving]       = useState(false);
  const [isStudent,     setIsStudent]     = useState(false);
  const studentCamRef = useRef(null);

  const handleStudentReady = useCallback((stream) => {
    setIsStudent(true);
    if (studentCamRef.current) studentCamRef.current.srcObject = stream;
  }, []);

  // Load / create room record
  useEffect(() => {
    if (!roomId) return;
    api.get(`/classroom/${roomId}`)
      .then(({ data }) => {
        setFiles(data.room?.sharedFiles || []);
        setSubject(data.room?.subject || '');
      })
      .catch(() => {});
  }, [roomId]);

  // Session timer
  useEffect(() => {
    const t = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const fmtTime = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return h > 0
      ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
      : `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const handleLeave = async () => {
    if (!window.confirm('Leave the classroom?')) return;
    setLeaving(true);
    try {
      await api.patch(`/classroom/${roomId}/status`, { status: 'ended' });
    } catch { /* ignore */ }
    navigate('/dashboard/student');
  };

  if (!roomId) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Invalid classroom link.</p>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-gray-950 overflow-hidden">

      {/* ── Top bar ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-900 border-b border-gray-800 shrink-0">
        {/* Brand */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center">
            <GraduationCap size={14} className="text-white" />
          </div>
          <span className="text-white font-extrabold text-sm tracking-tight">
            Go<span className="text-green-400">Class</span>
          </span>
        </div>

        <div className="w-px h-5 bg-gray-700" />

        {/* Room info */}
        <div className="min-w-0 flex-1">
          <p className="text-white text-xs font-semibold truncate">
            {subject || `Room: ${roomId}`}
          </p>
          <p className="text-gray-400 text-[10px]">
            {user?.name}
          </p>
        </div>

        {/* Live badge + timer */}
        <div className="flex items-center gap-1.5 bg-green-900/50 border border-green-700 px-2.5 py-1 rounded-full shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-green-300 text-[11px] font-bold tracking-wide">LIVE</span>
          <span className="text-green-400 text-[11px] font-mono">{fmtTime(elapsed)}</span>
        </div>

        {/* Copy link */}
        <button
          onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Room link copied!'); }}
          className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-lg transition">
          <Users size={12} /> Invite
        </button>

        {/* Leave */}
        <button onClick={handleLeave} disabled={leaving}
          className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3 py-2 rounded-xl transition disabled:opacity-50 shrink-0">
          <PhoneOff size={13} />
          <span className="hidden sm:inline">Leave</span>
        </button>
      </div>

      {/* ── Panel area ──────────────────────────────────────── */}
      <div className="flex-1 min-h-0 relative">
        {/* Video always mounted (keeps call alive) */}
        <div className={`absolute inset-0 ${activePanel === 'video' ? '' : 'hidden'}`}>
          <VideoPanel roomId={roomId} userName={user?.name} onStudentReady={handleStudentReady} />
        </div>

        {/* Whiteboard always mounted (preserves drawing) */}
        <div className={`absolute inset-0 ${activePanel === 'whiteboard' ? '' : 'hidden'}`}>
          <Whiteboard roomId={roomId} isTutor={!isStudent} />
        </div>

        {/* Files */}
        <div className={`absolute inset-0 overflow-hidden ${activePanel === 'files' ? '' : 'hidden'}`}>
          <FilesPanel roomId={roomId} files={files} onFileUploaded={setFiles} />
        </div>

        {/* Homework */}
        <div className={`absolute inset-0 overflow-hidden ${activePanel === 'homework' ? '' : 'hidden'}`}>
          <HomeworkPanel roomId={roomId} userRole={user?.role} userId={user?._id} />
        </div>

        {/* Floating student camera PiP — visible on ALL panels */}
        {isStudent && (
          <div className="absolute bottom-4 right-4 z-50 w-36 h-24 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-gray-900">
            <video ref={studentCamRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <div className="absolute bottom-1 left-1.5 text-white text-[9px] font-bold bg-black/60 px-1.5 py-0.5 rounded-full">You</div>
          </div>
        )}
      </div>

      {/* ── Bottom navigation bar ───────────────────────────── */}
      <div className="bg-gray-900 border-t border-gray-800 px-4 py-2 shrink-0">
        <div className="max-w-lg mx-auto flex items-center justify-around gap-1">
          {PANELS.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setActivePanel(id)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition flex-1 ${
                activePanel === id
                  ? 'bg-green-700 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}>
              <Icon size={18} />
              <span className="text-[10px] font-bold">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
