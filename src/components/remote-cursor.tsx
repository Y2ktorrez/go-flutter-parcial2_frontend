interface RemoteCursorProps {
  x: number;
  y: number;
  username: string;
  color: string;
}

export function RemoteCursor({ x, y, username, color }: RemoteCursorProps) {
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        pointerEvents: 'none',
        zIndex: 9999,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill={color}
        style={{ transform: 'rotate(-45deg)' }}
      >
        <path d="M5,2l15,15l-5,2l-3,5l-3,-15z" />
      </svg>
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '10px',
          background: color,
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          color: 'white',
          whiteSpace: 'nowrap',
        }}
      >
        {username}
      </div>
    </div>
  );
}
