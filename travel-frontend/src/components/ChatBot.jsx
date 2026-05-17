import { useState, useRef, useEffect } from 'react';
import { chatApi, WS_BASE } from '../api';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import ReactMarkdown from 'react-markdown';

const SUGGESTIONS = [
  'Suggest offbeat places near my destination',
  'Best local food and dhabas to try?',
  'What\'s the best season to visit?',
  'Recommend a 3-day itinerary',
  'Hidden gems and secret spots',
  'Local transport tips and costs',
  'Which hotel should I book within my budget?',
  'Is it safe to travel by road at night?',
];

export default function ChatBot({ tripId, members = [] }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const stompRef = useRef(null);
  const seenIds = useRef(new Set());
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    chatApi.getHistory(tripId).then(r => {
      setMessages(r.data);
      r.data.forEach(m => { if (m.id) seenIds.current.add(m.id); });
    });

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_BASE + '/ws'),
      reconnectDelay: 3000,
      onConnect: () => {
        client.subscribe(`/topic/trip/${tripId}/chat`, (msg) => {
          const data = JSON.parse(msg.body);
          if (data.id && seenIds.current.has(data.id)) return;
          if (data.id) seenIds.current.add(data.id);
          setMessages(prev => [...prev, data]);
        });
      },
      onStompError: () => {},
    });
    client.activate();
    stompRef.current = client;

    return () => {
      if (stompRef.current) stompRef.current.deactivate();
    };
  }, [tripId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text, askAI = false) => {
    let msg = text || input;
    if (!msg.trim()) return;
    if (askAI && !msg.toLowerCase().includes('@ai')) {
      msg = '@ai ' + msg;
    }
    setInput('');
    setLoading(askAI);
    try {
      const { data } = await chatApi.send(tripId, msg, user?.id, user?.name);
      data.forEach(m => { if (m.id) seenIds.current.add(m.id); });
    } catch {
      setMessages(prev => [...prev, { role: 'AI', content: 'Sorry, something went wrong. Please try again.', userName: 'WanderTribe AI' }]);
    }
    setLoading(false);
    inputRef.current?.focus();
  };

  const clearChat = async () => {
    if (!confirm('Clear entire chat history for this trip? This cannot be undone.')) return;
    try {
      await chatApi.clearHistory(tripId, user?.email);
      setMessages([]);
      seenIds.current.clear();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to clear chat.');
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAvatarColor = (name) => {
    if (!name) return 'bg-white/20';
    const colors = ['bg-emerald-500/30', 'bg-cyan-500/30', 'bg-violet-500/30', 'bg-amber-500/30', 'bg-rose-500/30', 'bg-blue-500/30'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="flex flex-col h-[600px] sm:h-[650px]">
      <div className="flex items-center justify-between px-4 sm:px-6 py-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 text-base font-semibold">Live Group Chat</span>
          {members.length > 0 && (
            <div className="flex -space-x-2 ml-2">
              {members.slice(0, 4).map((m, i) => (
                <div key={i} className={`w-7 h-7 rounded-full ${getAvatarColor(m.name)} flex items-center justify-center text-xs font-medium border-2 border-slate-900`}>
                  {getInitials(m.name)}
                </div>
              ))}
              {members.length > 4 && (
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs border-2 border-slate-900">
                  +{members.length - 4}
                </div>
              )}
            </div>
          )}
          <span className="text-white/30 text-sm ml-2">{messages.length} msgs</span>
        </div>
        {messages.length > 0 && (
          <button onClick={clearChat}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-400/70 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            Clear
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8 sm:py-10">
            <div className="w-16 h-16 mx-auto mb-4 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
              <span className="text-3xl">💬</span>
            </div>
            <h3 className="text-2xl font-bold mb-2">Live Group Chat</h3>
            <p className="text-white/40 mb-2 text-base sm:text-lg max-w-md mx-auto">
              Chat with your trip crew in real-time! Use the <span className="text-emerald-400 font-medium">Ask AI</span> button to get travel suggestions.
            </p>
            <p className="text-white/30 text-sm mb-6">Messages appear instantly for all members</p>
            <div className="flex flex-wrap gap-3 justify-center max-w-lg mx-auto">
              {SUGGESTIONS.slice(0, 4).map((s, i) => (
                <button key={i} onClick={() => sendMessage(s, true)}
                  className="px-4 sm:px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm sm:text-base hover:bg-emerald-500/20 transition-all hover:scale-105">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={msg.id || i} className={`flex ${msg.role === 'USER' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
            {msg.role === 'AI' && (
              <div className="w-8 h-8 shrink-0 bg-emerald-500/20 rounded-full flex items-center justify-center mr-2 mt-1">
                <span className="text-sm">🤖</span>
              </div>
            )}
            <div className={`max-w-[85%] sm:max-w-[75%]`}>
              {msg.role === 'USER' && msg.userName && (
                <p className="text-sm text-white/30 text-right mb-1 mr-1">{msg.userName}</p>
              )}
              {msg.role === 'AI' && (
                <p className="text-sm text-emerald-400/60 mb-1 ml-1">WanderTribe AI</p>
              )}
              <div className={`px-4 py-3 rounded-2xl ${
                msg.role === 'USER'
                  ? 'bg-emerald-500 text-white rounded-br-md'
                  : 'bg-white/10 text-white/90 rounded-bl-md'
              }`}>
                {msg.role === 'AI' ? (
                  <div className="prose prose-invert prose-base max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm sm:text-base">{msg.content}</p>
                )}
              </div>
            </div>
            {msg.role === 'USER' && (
              <div className={`w-8 h-8 shrink-0 ${getAvatarColor(msg.userName)} rounded-full flex items-center justify-center ml-2 mt-1`}>
                <span className="text-[10px] font-medium">{getInitials(msg.userName)}</span>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="w-8 h-8 shrink-0 bg-emerald-500/20 rounded-full flex items-center justify-center mr-2 mt-1">
              <span className="text-sm">🤖</span>
            </div>
            <div className="bg-white/10 px-5 py-4 rounded-2xl rounded-bl-md">
              <div className="flex gap-1.5 items-center">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="text-white/30 text-xs ml-2">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {messages.length > 0 && messages.length < 10 && !loading && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
          {SUGGESTIONS.slice(messages.length % SUGGESTIONS.length, messages.length % SUGGESTIONS.length + 3).map((s, i) => (
            <button key={i} onClick={() => sendMessage(s, true)}
              className="shrink-0 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-white/50 text-sm hover:text-white hover:border-emerald-500/30 hover:bg-emerald-500/10 transition-colors">
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="p-3 sm:p-4 border-t border-white/10">
        <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2 sm:gap-3">
          <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)}
            placeholder="Type a message to the group..."
            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm sm:text-base placeholder:text-white/30 focus:border-emerald-500 focus:outline-none transition-colors" />
          <button type="submit" disabled={loading || !input.trim()}
            className="px-4 sm:px-5 py-3 bg-white/10 hover:bg-white/20 disabled:opacity-50 rounded-xl font-medium transition-all text-sm sm:text-base">
            Send
          </button>
          <button type="button" onClick={() => sendMessage(input, true)} disabled={loading || !input.trim()}
            className="px-4 sm:px-5 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 rounded-xl font-medium transition-all text-sm sm:text-base flex items-center gap-1.5">
            <span className="hidden sm:inline">🤖</span> Ask AI
          </button>
        </form>
        <p className="text-white/20 text-xs mt-2 text-center">"Send" for group chat only. "Ask AI" triggers AI response. Messages sync in real-time.</p>
      </div>
    </div>
  );
}
