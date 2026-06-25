import { useState, useEffect, useRef } from 'react';
import { io as socketIO } from 'socket.io-client';
import {
  PenLine, Eraser, Type, RotateCcw, RotateCw, Download, X,
} from 'lucide-react';

const SERVER_URL = import.meta.env.VITE_API_URL?.replace('/api', '') ?? '';

const COLORS = [
  '#1a1a1a', '#ef4444', '#3b82f6', '#22c55e',
  '#f59e0b', '#8b5cf6', '#ec4899', '#ffffff',
];
const WIDTHS = [2, 4, 7, 12, 20];

export default function LiveWhiteboard({ roomId, isTutor }) {
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

  const norm   = (x, y) => ({ px: x / canvasRef.current.width,  py: y / canvasRef.current.height });
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

  // Resize canvas while preserving content
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

  // Socket.io sync
  useEffect(() => {
    if (!roomId) return;
    const socket = socketIO(SERVER_URL || window.location.origin, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;
    socket.emit('board:join', roomId);

    if (!isTutor) {
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
        const { x, y } = denorm(px, py);
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) { ctx.lineTo(x, y); ctx.stroke(); }
      });
      socket.on('board:end', () => {});
      socket.on('board:clear', () => {
        const c = canvasRef.current;
        if (c) c.getContext('2d').clearRect(0, 0, c.width, c.height);
      });
      socket.on('board:text', ({ px, py, text, color: c, fontSize }) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const { x, y } = denorm(px, py);
        const ctx = canvas.getContext('2d');
        ctx.globalCompositeOperation = 'source-over';
        ctx.font = `${fontSize}px Inter, sans-serif`;
        ctx.fillStyle = c;
        ctx.fillText(text, x, y);
      });
      socket.on('board:eq', ({ text, color: c, fontSize }) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.globalCompositeOperation = 'source-over';
        ctx.font = `italic bold ${fontSize}px Georgia, serif`;
        ctx.fillStyle = c;
        ctx.fillText(text, canvas.width / 2 - ctx.measureText(text).width / 2, canvas.height / 2);
      });
    } else {
      socket.on('board:sync-request', ({ from }) => {
        const canvas = canvasRef.current;
        if (canvas) socket.emit('board:sync-response', { to: from, dataUrl: canvas.toDataURL() });
      });
    }

    return () => { socket.emit('board:leave', roomId); socket.disconnect(); };
  }, [roomId, isTutor]);

  const emit = (ev, data = {}) => {
    if (isTutor && socketRef.current) socketRef.current.emit(ev, { roomId, ...data });
  };

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
    if (!isTutor || tool === 'text') return;
    e.preventDefault();
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
    const { x, y } = getXY(e);
    const ctx = canvasRef.current.getContext('2d');
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
    ctx.font = `${fontSize}px Inter, sans-serif`;
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
    ctx.font = `italic bold ${fontSize}px Georgia, serif`;
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

  return (
    <div className="flex flex-col h-full relative">
      {isTutor ? (
        <div className="flex flex-wrap items-center gap-1.5 px-3 py-2 bg-white border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-0.5 border-r border-gray-200 pr-2.5 mr-1">
            {[{ t: 'pen', Icon: PenLine }, { t: 'eraser', Icon: Eraser }, { t: 'text', Icon: Type }].map(({ t, Icon }) => (
              <button key={t} onClick={() => setTool(t)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${tool === t ? 'bg-green-700 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                <Icon size={14} />
              </button>
            ))}
            <button onClick={() => setShowEq(true)}
              className={`w-8 h-8 rounded-lg text-xs font-bold font-serif transition ${showEq ? 'bg-green-700 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>∑</button>
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
            <button onClick={undo} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 transition"><RotateCcw size={13} /></button>
            <button onClick={redo} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 transition"><RotateCw size={13} /></button>
            <button onClick={clearBoard} className="px-2.5 py-1 text-xs font-semibold text-red-500 hover:bg-red-50 rounded-lg transition">Clear</button>
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
