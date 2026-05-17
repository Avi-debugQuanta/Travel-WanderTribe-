import { useState, useEffect } from 'react';
import { ideaApi } from '../api';

const CATEGORIES = ['OFFBEAT', 'ONBEAT', 'FOOD', 'VIBE', 'TRANSPORT', 'ACCOMMODATION', 'ACTIVITY'];
const CATEGORY_ICONS = { OFFBEAT: '🗺️', ONBEAT: '📍', FOOD: '🍜', VIBE: '✨', TRANSPORT: '🚗', ACCOMMODATION: '🏨', ACTIVITY: '🎯' };

export default function IdeasBoard({ tripId }) {
  const [ideas, setIdeas] = useState([]);
  const [filter, setFilter] = useState('');
  const [form, setForm] = useState({ title: '', description: '', category: 'OFFBEAT' });
  const [showForm, setShowForm] = useState(false);
  const [analyses, setAnalyses] = useState({});
  const [analyzingId, setAnalyzingId] = useState(null);
  const [tooltipId, setTooltipId] = useState(null);
  const [commentOpen, setCommentOpen] = useState(null);
  const [commentText, setCommentText] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const load = () => ideaApi.getByTrip(tripId, filter || undefined).then(r => setIdeas(r.data));
  useEffect(() => { load(); }, [tripId, filter]);

  const submit = async (e) => {
    e.preventDefault();
    const { data: newIdea } = await ideaApi.submit(tripId, { ...form, userId: user?.id });
    setShowForm(false);
    setForm({ title: '', description: '', category: 'OFFBEAT' });
    load();

    setAnalyzingId(newIdea.id);
    try {
      const { data } = await ideaApi.analyze(tripId, newIdea.id);
      setAnalyses(prev => ({ ...prev, [newIdea.id]: data.analysis }));
      setTooltipId(newIdea.id);
      setTimeout(() => setTooltipId(null), 8000);
    } catch {}
    setAnalyzingId(null);
  };

  const analyzeIdea = async (ideaId) => {
    if (analyses[ideaId]) {
      setTooltipId(tooltipId === ideaId ? null : ideaId);
      return;
    }
    setAnalyzingId(ideaId);
    try {
      const { data } = await ideaApi.analyze(tripId, ideaId);
      setAnalyses(prev => ({ ...prev, [ideaId]: data.analysis }));
      setTooltipId(ideaId);
    } catch {}
    setAnalyzingId(null);
  };

  const vote = async (ideaId) => {
    await ideaApi.vote(tripId, ideaId);
    load();
  };

  const addComment = async (ideaId) => {
    if (!commentText.trim()) return;
    await ideaApi.comment(tripId, ideaId, user?.name || 'Anonymous', commentText);
    setCommentText('');
    load();
  };

  const parseComments = (commentsStr) => {
    try { return JSON.parse(commentsStr || '[]'); } catch { return []; }
  };

  const sorted = [...ideas].sort((a, b) => b.voteCount - a.voteCount);
  const topIdeas = sorted.filter(i => i.voteCount > 0).slice(0, 3);

  return (
    <div className="p-4 sm:p-6">
      {/* Top Ideas Banner */}
      {topIdeas.length > 0 && (
        <div className="mb-6 p-5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl">
          <h3 className="text-base font-bold text-amber-400 mb-3 flex items-center gap-2">
            <span className="text-xl">🏆</span> Top Voted Ideas
          </h3>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide">
            {topIdeas.map((idea, i) => (
              <div key={idea.id} className="shrink-0 flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-xl font-bold text-amber-400">#{i + 1}</span>
                <div>
                  <p className="font-semibold text-base">{idea.title}</p>
                  <p className="text-white/40 text-sm">{CATEGORY_ICONS[idea.category]} {idea.category?.toLowerCase()} · {idea.voteCount} votes</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilter('')}
            className={`px-4 py-2 rounded-full text-sm transition-colors ${!filter ? 'bg-emerald-500 text-white' : 'bg-white/5 text-white/50 hover:text-white'}`}>
            All
          </button>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setFilter(c)}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${filter === c ? 'bg-emerald-500 text-white' : 'bg-white/5 text-white/50 hover:text-white'}`}>
              {CATEGORY_ICONS[c]} {c.toLowerCase()}
            </button>
          ))}
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 rounded-xl text-base font-medium transition-colors">
          + Add Idea
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="mb-6 p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
          <input type="text" placeholder="Idea title" required value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-base placeholder:text-white/30 focus:border-emerald-500 focus:outline-none" />
          <textarea placeholder="Describe your idea..." value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })} rows={2}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-base placeholder:text-white/30 focus:border-emerald-500 focus:outline-none resize-none" />
          <div className="flex gap-3 items-center">
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-base focus:border-emerald-500 focus:outline-none">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button type="submit" className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 rounded-xl text-base font-medium transition-colors">
              Submit
            </button>
          </div>
        </form>
      )}

      {ideas.length === 0 ? (
        <div className="text-center py-10 text-white/30">
          <span className="text-5xl block mb-3">💡</span>
          <p className="text-lg">No ideas yet. Be the first to share what you want to do!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {sorted.map(idea => {
            const comments = parseComments(idea.comments);
            return (
              <div key={idea.id} className="relative p-5 bg-white/5 border border-white/10 rounded-2xl hover:border-emerald-500/20 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm px-3 py-1.5 bg-white/10 rounded-full text-white/60">
                        {CATEGORY_ICONS[idea.category]} {idea.category?.toLowerCase()}
                      </span>
                      <button
                        onClick={() => analyzeIdea(idea.id)}
                        className={`text-sm px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 ${
                          analyses[idea.id] ? 'bg-violet-500/10 text-violet-400 hover:bg-violet-500/20' : 'bg-white/5 text-white/40 hover:text-violet-400 hover:bg-violet-500/10'
                        }`}
                        title="AI analysis of this idea">
                        {analyzingId === idea.id ? (
                          <span className="animate-spin">⏳</span>
                        ) : (
                          <span>✨</span>
                        )}
                        <span>{analyses[idea.id] ? 'AI Insight' : 'Analyze'}</span>
                      </button>
                    </div>
                    <h4 className="text-lg font-bold mt-2">{idea.title}</h4>
                    {idea.description && <p className="text-white/50 text-base mt-1">{idea.description}</p>}
                  </div>
                  <button onClick={() => vote(idea.id)}
                    className="flex flex-col items-center gap-1 px-4 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-xl transition-colors">
                    <span className="text-emerald-400 text-lg">▲</span>
                    <span className="text-emerald-400 font-bold text-base">{idea.voteCount}</span>
                  </button>
                </div>

                {tooltipId === idea.id && analyses[idea.id] && (
                  <div className="mt-3 p-3 bg-gradient-to-r from-violet-500/10 to-cyan-500/10 border border-violet-500/20 rounded-xl animate-fadeIn">
                    <div className="flex items-start gap-2">
                      <span className="text-sm mt-0.5">✨</span>
                      <div>
                        <p className="text-sm text-violet-400 font-medium mb-1">AI Impact Analysis</p>
                        <p className="text-white/70 text-base">{analyses[idea.id]}</p>
                      </div>
                      <button onClick={() => setTooltipId(null)} className="text-white/30 hover:text-white/60 ml-auto shrink-0">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {/* Comments section */}
                <div className="mt-3 pt-3 border-t border-white/5">
                  <button onClick={() => setCommentOpen(commentOpen === idea.id ? null : idea.id)}
                    className="text-sm text-white/40 hover:text-white/60 transition-colors flex items-center gap-1">
                    💬 {comments.length > 0 ? `${comments.length} comment${comments.length > 1 ? 's' : ''}` : 'Add comment'}
                  </button>

                  {commentOpen === idea.id && (
                    <div className="mt-3 space-y-2 animate-fadeIn">
                      {comments.map((c, ci) => (
                        <div key={ci} className="flex items-start gap-2 text-sm">
                          <span className="text-emerald-400 font-medium shrink-0">{c.user}:</span>
                          <span className="text-white/60">{c.text}</span>
                        </div>
                      ))}
                      <div className="flex gap-2 mt-2">
                        <input type="text" value={commentText} onChange={e => setCommentText(e.target.value)}
                          placeholder="Write a comment..."
                          onKeyDown={e => e.key === 'Enter' && addComment(idea.id)}
                          className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-white/30 focus:border-emerald-500 focus:outline-none" />
                        <button onClick={() => addComment(idea.id)}
                          className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm hover:bg-emerald-500/30 transition-colors">
                          Post
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
