import { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { WS_BASE } from '../api';

export default function ToastNotifications({ tripId }) {
  const [toasts, setToasts] = useState([]);
  const stompRef = useRef(null);

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(WS_BASE + '/ws'),
      reconnectDelay: 3000,
      onConnect: () => {
        client.subscribe(`/topic/trip/${tripId}/notifications`, (msg) => {
          const data = JSON.parse(msg.body);
          const id = Date.now() + Math.random();
          setToasts(prev => [...prev.slice(-4), { id, ...data }]);
          setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
        });
      },
    });
    client.activate();
    stompRef.current = client;
    return () => { if (stompRef.current) stompRef.current.deactivate(); };
  }, [tripId]);

  if (toasts.length === 0) return null;

  const icons = {
    MEMBER_JOINED: '👋',
    NEW_PROPOSAL: '📋',
    VOTE_CAST: '🗳️',
    PROPOSAL_APPROVED: '✅',
    PROPOSAL_REJECTED: '❌',
  };

  const colors = {
    MEMBER_JOINED: 'border-cyan-500/40 bg-cyan-500/10',
    NEW_PROPOSAL: 'border-violet-500/40 bg-violet-500/10',
    VOTE_CAST: 'border-amber-500/40 bg-amber-500/10',
    PROPOSAL_APPROVED: 'border-emerald-500/40 bg-emerald-500/10',
    PROPOSAL_REJECTED: 'border-red-500/40 bg-red-500/10',
  };

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2 max-w-sm">
      {toasts.map(t => (
        <div key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-lg animate-slideIn ${colors[t.type] || 'border-white/20 bg-white/10'}`}>
          <span className="text-xl">{icons[t.type] || '🔔'}</span>
          <p className="text-sm text-white/90 flex-1">{t.message}</p>
          <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
            className="text-white/30 hover:text-white text-xs ml-2">✕</button>
        </div>
      ))}
    </div>
  );
}
