import { useState, useRef, useEffect } from 'react';

const WHATSAPP_NUMBER = '2347065896598';
const BTN_SIZE = 56;
const STORAGE_KEY = 'wa-btn-pos';

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function getInitialPos() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const p = JSON.parse(saved);
      return {
        x: clamp(p.x, 0, window.innerWidth  - BTN_SIZE),
        y: clamp(p.y, 0, window.innerHeight - BTN_SIZE),
      };
    }
  } catch {}
  return {
    x: window.innerWidth  - BTN_SIZE - 24,
    y: window.innerHeight - BTN_SIZE - 24,
  };
}

export default function DraggableWhatsApp() {
  const [pos, setPos] = useState(getInitialPos);
  const posRef      = useRef(pos);
  const btnRef      = useRef(null);
  const dragging    = useRef(false);
  const hasMoved    = useRef(false);
  const startMouse  = useRef({ x: 0, y: 0 });
  const startPos    = useRef({ x: 0, y: 0 });

  /* Keep posRef in sync so onPointerUp closure reads latest value */
  useEffect(() => { posRef.current = pos; }, [pos]);

  /* Clamp on resize */
  useEffect(() => {
    const onResize = () =>
      setPos(p => ({
        x: clamp(p.x, 0, window.innerWidth  - BTN_SIZE),
        y: clamp(p.y, 0, window.innerHeight - BTN_SIZE),
      }));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const onPointerDown = (e) => {
    e.preventDefault();
    dragging.current  = true;
    hasMoved.current  = false;
    startMouse.current = { x: e.clientX, y: e.clientY };
    startPos.current   = { ...posRef.current };
    btnRef.current?.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!dragging.current) return;
    const dx = e.clientX - startMouse.current.x;
    const dy = e.clientY - startMouse.current.y;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) hasMoved.current = true;
    setPos({
      x: clamp(startPos.current.x + dx, 0, window.innerWidth  - BTN_SIZE),
      y: clamp(startPos.current.y + dy, 0, window.innerHeight - BTN_SIZE),
    });
  };

  const onPointerUp = () => {
    if (!dragging.current) return;
    dragging.current = false;
    if (hasMoved.current) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(posRef.current)); } catch {}
    } else {
      window.open(`https://wa.me/${WHATSAPP_NUMBER}`, '_blank', 'noreferrer');
    }
  };

  return (
    <div
      ref={btnRef}
      role="button"
      aria-label="Chat with us on WhatsApp"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      style={{
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        width: BTN_SIZE,
        height: BTN_SIZE,
        backgroundColor: '#25D366',
        touchAction: 'none',
        zIndex: 9999,
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
      className="rounded-full shadow-xl flex items-center justify-center cursor-grab active:cursor-grabbing transition-shadow hover:shadow-2xl"
    >
      <svg viewBox="0 0 32 32" width="30" height="30" fill="white" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.163 0 0 7.163 0 16c0 2.822.737 5.469 2.027 7.773L0 32l8.466-2.001A15.93 15.93 0 0016 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.333a13.27 13.27 0 01-6.77-1.854l-.486-.29-5.026 1.188 1.232-4.892-.317-.502A13.267 13.267 0 012.667 16C2.667 8.637 8.637 2.667 16 2.667S29.333 8.637 29.333 16 23.363 29.333 16 29.333zm7.273-9.969c-.398-.199-2.355-1.162-2.72-1.295-.365-.133-.631-.199-.897.199-.265.398-1.029 1.295-1.261 1.561-.232.265-.465.298-.863.1-.398-.199-1.681-.619-3.202-1.977-1.184-1.056-1.983-2.36-2.215-2.758-.232-.398-.025-.613.174-.811.179-.178.398-.465.597-.698.199-.232.265-.398.398-.664.133-.265.066-.498-.033-.697-.1-.199-.897-2.162-1.229-2.96-.324-.777-.653-.672-.897-.684l-.764-.013c-.265 0-.697.1-.1063.498-.365.398-1.395 1.362-1.395 3.322 0 1.96 1.428 3.854 1.627 4.12.199.265 2.811 4.292 6.811 6.021.952.411 1.695.656 2.274.84.955.304 1.824.261 2.511.158.766-.114 2.355-.963 2.687-1.893.332-.93.332-1.727.232-1.893-.099-.166-.365-.265-.764-.464z"/>
      </svg>
    </div>
  );
}
