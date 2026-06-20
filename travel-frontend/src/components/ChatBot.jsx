import { useState, useRef, useEffect } from 'react';
import { chatApi, WS_BASE } from '../api';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import ReactMarkdown from 'react-markdown';

const AI_SUGGESTIONS = [
  '🏔️ Best places to visit near my destination?',
  '🍜 Must-try local food and dhabas?',
  '🏨 Hotel recommendations within budget?',
  '🗓️ Suggest a day-by-day itinerary',
  '💡 Hidden gems and offbeat spots',
  '🚗 Transport tips and road conditions',
];

export default function ChatBot({ tripId, members = [], onSwitchTab }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
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

    try {
      const client = new Client({
        webSocketFactory: () => new SockJS(WS_BASE + '/ws'),
        reconnectDelay: 5000,
        onConnect: () => {
          setWsConnected(true);
          client.subscribe(`/topic/trip/${tripId}/chat`, (msg) => {
            const data = JSON.parse(msg.body);
            if (data.id && seenIds.current.has(data.id)) {
              setMessages(prev => prev.map(m => m.id === data.id ? data : m));
              return;
            }
            if (data.id) seenIds.current.add(data.id);
            setMessages(prev => [...prev, data]);
          });
        },
        onStompError: () => setWsConnected(false),
        onWebSocketClose: () => setWsConnected(false),
      });
      client.activate();
      stompRef.current = client;
    } catch {
      setWsConnected(false);
    }

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

    const userMsg = {
      role: 'USER',
      content: msg.replace(/^@ai\s*/i, ''),
      userName: user?.name || 'You',
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(askAI);

    try {
      const { data } = await chatApi.send(tripId, msg, user?.id, user?.name);
      setMessages(prev => {
        const withoutOptimistic = prev.filter(p => p !== userMsg);
        let updated = [...withoutOptimistic];
        data.forEach(m => {
          if (!m.id) return;
          const idx = updated.findIndex(p => p.id === m.id);
          if (idx !== -1) {
             // Let the websocket stream take precedence if it already started filling content
             if (m.content === "" && updated[idx].content !== "") return;
             updated[idx] = m;
          } else {
             updated.push(m);
             seenIds.current.add(m.id);
          }
        });
        return updated;
      });
    } catch {
      setMessages(prev => [...prev, {
        role: 'AI',
        content: 'Sorry, something went wrong. The AI might be waking up — try again in a moment.',
        userName: 'WanderTribe AI'
      }]);
    }
    setLoading(false);
    inputRef.current?.focus();
  };

  const clearChat = async () => {
    if (!confirm('Clear entire chat history?')) return;
    try {
      await chatApi.clearHistory(tripId, user?.email);
      setMessages([]);
      seenIds.current.clear();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to clear chat.');
    }
  };

  const getInitials = (name) => name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';

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
          <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`} />
          <span className="text-emerald-400 text-base font-semibold">Group Chat</span>
          {members.length > 0 && (
            <div className="flex -space-x-2 ml-2">
              {members.slice(0, 4).map((m, i) => (
                <div key={i} className={`w-7 h-7 rounded-full ${getAvatarColor(m.name)} flex items-center justify-center text-xs font-medium border-2 border-slate-900`}>
                  {getInitials(m.name)}
                </div>
              ))}
            </div>
          )}
          <span className="text-white/30 text-sm ml-2">{messages.length} msgs</span>
        </div>
        {messages.length > 0 && (
          <button onClick={clearChat} className="text-xs text-red-400/70 hover:text-red-400 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors">
            🗑️ Clear
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
              <span className="text-3xl">🤖</span>
            </div>
            <h3 className="text-2xl font-bold mb-2">AI Travel Assistant</h3>
            <p className="text-white/40 mb-1 text-base max-w-md mx-auto">
              Ask me anything about your trip! I know every hidden gem, dhaba, and mountain pass.
            </p>
            <p className="text-white/30 text-sm mb-6">Your group members can also chat here in real-time.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg mx-auto">
              {AI_SUGGESTIONS.map((s, i) => (
                <button key={i} onClick={() => sendMessage(s.replace(/^.+?\s/, ''), true)}
                  className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white/60 text-sm text-left hover:bg-emerald-500/10 hover:border-emerald-500/20 hover:text-emerald-400 transition-all">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={msg.id || i} className={`flex ${msg.role === 'USER' ? 'justify-end' : 'justify-start'}`}>
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
                <p className="text-sm text-emerald-400/60 mb-1 ml-1 font-medium">✨ WanderTribe AI</p>
              )}
              <div className={`px-4 py-3 rounded-2xl ${
                msg.role === 'USER'
                  ? 'bg-emerald-500 text-white rounded-br-md'
                  : 'bg-gradient-to-br from-slate-800/90 to-slate-800/70 border border-white/10 text-white/90 rounded-bl-md shadow-lg'
              }`}>
                {msg.role === 'AI' ? (
                  <div className="prose prose-invert prose-sm sm:prose-base max-w-none
                    [&>*:first-child]:mt-0 [&>*:last-child]:mb-0
                    prose-h2:text-emerald-400 prose-h2:text-lg prose-h2:font-bold prose-h2:mt-5 prose-h2:mb-3 prose-h2:border-b prose-h2:border-white/10 prose-h2:pb-2
                    prose-h3:text-cyan-300 prose-h3:text-base prose-h3:font-semibold prose-h3:mt-4 prose-h3:mb-2
                    prose-strong:text-emerald-300
                    prose-em:text-violet-300 prose-em:not-italic
                    prose-li:text-white/80 prose-li:leading-relaxed
                    prose-p:text-white/80 prose-p:leading-relaxed
                    prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline
                    prose-table:text-xs prose-table:bg-white/5 prose-table:rounded-xl prose-table:overflow-hidden
                    prose-th:text-emerald-400 prose-th:bg-emerald-500/10 prose-th:px-3 prose-th:py-2 prose-th:text-left prose-th:font-semibold
                    prose-td:px-3 prose-td:py-2 prose-td:border-white/5 prose-td:text-white/70
                    prose-blockquote:border-l-emerald-500 prose-blockquote:bg-emerald-500/5 prose-blockquote:rounded-r-xl prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:text-emerald-200/80 prose-blockquote:text-sm prose-blockquote:italic
                    prose-code:text-cyan-300 prose-code:bg-cyan-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-xs
                    prose-hr:border-white/10">
                    <ReactMarkdown
                      components={{
                        a: ({node, href, ...props}) => {
                          if (href === '#bookings') {
                            return (
                              <button onClick={(e) => { e.preventDefault(); if (onSwitchTab) onSwitchTab('bookings'); }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600/30 to-teal-600/30 text-teal-200 font-medium rounded-lg hover:from-emerald-500/40 hover:to-teal-500/40 transition-colors my-1 border border-teal-500/30 shadow-sm"
                                title="Open Bookings Tab">
                                <span>🛒</span> {props.children}
                              </button>
                            );
                          }
                          return (
                            <a href={href} target="_blank" rel="noopener noreferrer" 
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-600/30 to-fuchsia-600/30 text-fuchsia-200 font-medium rounded-lg hover:from-violet-500/40 hover:to-fuchsia-500/40 transition-colors my-1 no-underline border border-fuchsia-500/30 shadow-sm"
                              {...props}>
                              <span>🔗</span> {props.children}
                            </a>
                          );
                        }
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
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
          {AI_SUGGESTIONS.slice(messages.length % AI_SUGGESTIONS.length, messages.length % AI_SUGGESTIONS.length + 2).map((s, i) => (
            <button key={i} onClick={() => sendMessage(s.replace(/^.+?\s/, ''), true)}
              className="shrink-0 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-white/50 text-sm hover:text-emerald-400 hover:border-emerald-500/30 transition-colors">
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="p-3 sm:p-4 border-t border-white/10">
        <form onSubmit={(e) => { e.preventDefault(); sendMessage(input, true); }} className="flex gap-2 sm:gap-3">
          <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)}
            placeholder="Ask AI anything about your trip..."
            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm sm:text-base placeholder:text-white/30 focus:border-emerald-500 focus:outline-none transition-colors" />
          <button type="submit" disabled={loading || !input.trim()}
            className="px-5 sm:px-6 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 rounded-xl font-medium transition-all text-sm sm:text-base flex items-center gap-1.5">
            <span className="hidden sm:inline">🤖</span> Ask AI
          </button>
          <button type="button" onClick={() => sendMessage(input, false)} disabled={loading || !input.trim()}
            className="px-4 py-3 bg-white/10 hover:bg-white/20 disabled:opacity-50 rounded-xl font-medium transition-all text-sm sm:text-base"
            title="Send as group message (no AI response)">
            Send
          </button>
        </form>
        <p className="text-white/20 text-xs mt-2 text-center">
          <span className="text-emerald-400/40">Ask AI</span> = get AI travel advice · <span className="text-white/40">Send</span> = message your group
        </p>
      </div>
    </div>
  );
}
