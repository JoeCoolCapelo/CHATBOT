import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import { Bot, Send, Plus, MessageSquare, Loader2, Trash2, AlertTriangle, PanelLeftClose, PanelLeft } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/Button';
import { AppLayout } from '../components/layout/AppLayout';

interface ChatSession {
  id: string;
  title: string;
  started_at: string;
}

interface ChatMessage {
  id?: string;
  role: string;
  content: string;
  created_at?: string;
}

export default function ChatbotPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [hoveredSessionId, setHoveredSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const token = useAuthStore(state => state.accessToken);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchSessions = async () => {
    try {
      const res = await api.get('/chatbot/sessions/');
      setSessions(res.data);
    } catch (err) {
      console.error('Failed to fetch sessions', err);
    }
  };

  const fetchMessages = async (sessionId: string) => {
    setIsFetchingHistory(true);
    try {
      const res = await api.get(`/chatbot/sessions/${sessionId}/messages/`);
      setMessages(res.data);
      setActiveSessionId(sessionId);
    } catch (err) {
      console.error('Failed to fetch messages', err);
    } finally {
      setIsFetchingHistory(false);
    }
  };

  const deleteSession = async (sessionId: string) => {
    setDeletingId(sessionId);
    try {
      await api.delete(`/chatbot/sessions/${sessionId}/messages/`);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
        setMessages([]);
      }
    } catch (err) {
      console.error('Failed to delete session', err);
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  useEffect(() => { fetchSessions(); }, []);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startNewSession = () => {
    setActiveSessionId(null);
    setMessages([]);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !token) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8001/api/v1/chatbot/message/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMessage, session_id: activeSessionId })
      });

      if (!response.body) throw new Error("No response body");
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          for (const line of chunk.split('\n')) {
            if (line.startsWith('data: ')) {
              const dataStr = line.replace('data: ', '').trim();
              if (!dataStr) continue;
              try {
                const data = JSON.parse(dataStr);
                if (data.done) {
                  if (data.session_id && !activeSessionId) {
                    setActiveSessionId(data.session_id);
                    fetchSessions();
                  }
                  break;
                }
                if (data.text) {
                  setMessages(prev => {
                    const msgs = [...prev];
                    const last = msgs[msgs.length - 1];
                    msgs[msgs.length - 1] = { ...last, content: last.content + data.text };
                    return msgs;
                  });
                }
              } catch {}
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-theme(spacing.16)-4rem)] bg-base -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 lg:-mx-8 lg:-mb-8 overflow-hidden rounded-tl-xl border-t border-l border-border shadow-inner relative">
        
        {/* Sidebar Historique */}
        <div className={cn(
          "bg-card border-r border-border flex flex-col transition-all duration-300 z-20 h-full w-80 shrink-0 absolute md:relative",
          isSidebarOpen ? "translate-x-0 md:ml-0" : "-translate-x-full md:-ml-80"
        )}>
          <div className="p-4 border-b border-border flex gap-2">
            <Button
              onClick={startNewSession}
              variant="outline"
              className="flex-1 justify-start gap-3 border-purple/30 hover:border-purple hover:bg-purple/10 text-primary"
            >
              <Plus className="h-4 w-4" />
              Nouveau chat
            </Button>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="w-10 h-10 flex items-center justify-center shrink-0 rounded-lg text-muted hover:text-primary hover:bg-base transition-colors"
              title="Fermer l'historique"
            >
              <PanelLeftClose className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3 px-2 mt-2">Historique</h3>
            {sessions.length === 0 ? (
              <div className="px-2 text-sm text-muted">Aucune discussion</div>
            ) : (
              sessions.map(session => (
                <div
                  key={session.id}
                  className="relative group/item"
                  onMouseEnter={() => setHoveredSessionId(session.id)}
                  onMouseLeave={() => setHoveredSessionId(null)}
                >
                  <button
                    onClick={() => fetchMessages(session.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left text-sm transition-colors pr-10",
                      activeSessionId === session.id
                        ? "bg-purple/15 text-primary font-medium"
                        : "hover:bg-card-2 text-secondary"
                    )}
                  >
                    <MessageSquare className={cn("h-4 w-4 shrink-0", activeSessionId === session.id ? "text-purple" : "text-muted")} />
                    <span className="truncate">{session.title}</span>
                  </button>

                  {/* Bouton supprimer — visible au survol */}
                  {hoveredSessionId === session.id && confirmDeleteId !== session.id && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(session.id); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-md text-muted hover:text-danger hover:bg-danger/10 transition-all"
                      title="Supprimer la conversation"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}

                  {/* Mini confirmation inline */}
                  {confirmDeleteId === session.id && (
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-card border border-danger/30 rounded-lg px-2 py-1 shadow-lg z-10">
                      <AlertTriangle className="h-3 w-3 text-danger shrink-0" />
                      <span className="text-[10px] text-danger font-semibold whitespace-nowrap">Supprimer ?</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}
                        disabled={deletingId === session.id}
                        className="text-[10px] bg-danger text-white px-1.5 py-0.5 rounded font-bold hover:bg-danger/90 disabled:opacity-60"
                      >
                        {deletingId === session.id ? '...' : 'Oui'}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(null); }}
                        className="text-[10px] text-muted hover:text-primary px-1"
                      >
                        Non
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-base relative min-w-0">
          {/* Header */}
          <div className="h-14 border-b border-border bg-card/50 backdrop-blur-md flex items-center px-4 sm:px-6 sticky top-0 z-10 gap-3">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="w-8 h-8 flex items-center justify-center shrink-0 rounded-lg text-muted hover:text-primary hover:bg-base transition-colors"
                title="Ouvrir l'historique"
              >
                <PanelLeft className="w-5 h-5" />
              </button>
            )}
            <div className="w-8 h-8 rounded-full bg-purple flex items-center justify-center shadow-[0_0_10px_rgba(124,58,237,0.3)]">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-primary leading-tight">InternBot AI</h2>
              <div className="text-xs text-success flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
                Connecté à la base de données
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
            {isFetchingHistory ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-purple" />
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-purple/10 flex items-center justify-center mb-6">
                  <Bot className="h-8 w-8 text-purple" />
                </div>
                <h2 className="text-2xl font-bold text-primary mb-2">Comment puis-je vous aider ?</h2>
                <p className="text-muted text-sm mb-8">
                  Je connais vos informations de profil, vos stages et vos documents. Posez-moi une question !
                </p>
                <div className="grid grid-cols-1 gap-3 w-full">
                  <button onClick={() => setInput("Quel est le statut de mon stage actuel ?")} className="p-3 text-sm border border-border rounded-xl text-left hover:bg-card transition-colors text-secondary">
                    "Quel est le statut de mon stage actuel ?"
                  </button>
                  <button onClick={() => setInput("Qui est mon enseignant référent ?")} className="p-3 text-sm border border-border rounded-xl text-left hover:bg-card transition-colors text-secondary">
                    "Qui est mon enseignant référent ?"
                  </button>
                </div>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto space-y-6">
                {messages.map((msg, i) => (
                  <div key={i} className={cn("flex w-full", msg.role === 'user' ? "justify-end" : "justify-start")}>
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-purple flex items-center justify-center shrink-0 mr-3 mt-1 shadow-[0_0_10px_rgba(124,58,237,0.2)]">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <div className={cn(
                      "px-4 py-3 rounded-2xl max-w-[80%] text-[15px] leading-relaxed shadow-sm",
                      msg.role === 'user'
                        ? "bg-purple text-white rounded-br-sm shadow-[0_4px_14px_rgba(124,58,237,0.2)]"
                        : "bg-card border border-border text-primary rounded-bl-sm font-premium tracking-wide text-[16px]"
                    )}>
                      {msg.content}
                      {msg.role === 'assistant' && isLoading && i === messages.length - 1 && (
                        <span className="inline-block w-1.5 h-4 ml-1 align-middle bg-primary animate-pulse"></span>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-base border-t border-border">
            <div className="max-w-3xl mx-auto">
              <form onSubmit={sendMessage} className="relative flex items-end gap-2 bg-card border border-border rounded-2xl p-2 shadow-sm focus-within:ring-2 focus-within:ring-purple/20 focus-within:border-purple transition-all">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage(e as unknown as React.FormEvent);
                    }
                  }}
                  placeholder="Posez votre question à InternBot..."
                  className="w-full bg-transparent border-0 focus:ring-0 resize-none max-h-32 min-h-[44px] py-3 px-3 text-sm text-primary placeholder:text-muted"
                  rows={1}
                  disabled={isLoading || isFetchingHistory}
                />
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim() || isFetchingHistory}
                  className="rounded-xl h-11 w-11 p-0 shrink-0 bg-purple hover:bg-purple/90 shadow-[0_0_15px_rgba(124,58,237,0.3)] disabled:shadow-none border-none text-white mb-0.5 mr-0.5"
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </Button>
              </form>
              <div className="text-center mt-2 text-[11px] text-muted">
                L'IA peut faire des erreurs. Vérifiez les informations importantes.
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
