import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import { AppLayout } from '../components/layout/AppLayout';
import { MessageSquare, Send, Search, Info, TriangleAlert, ArrowLeft, ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { useToast } from '../hooks/useToast';

export default function MessagesPage() {
  const user = useAuthStore((state) => state.user);
  const { toast } = useToast();
  
  const [internships, setInternships] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isListCollapsed, setIsListCollapsed] = useState(false);
  
  // Unread badges logic
  const [notifications, setNotifications] = useState<any[]>([]);
  const [seenConversations, setSeenConversations] = useState<Set<string>>(new Set());
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchInternships();
    fetchNotifications();
    const notifInterval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(notifInterval);
  }, []);

  useEffect(() => {
    if (selectedId) {
      setSeenConversations(prev => {
        const next = new Set(prev);
        next.add(selectedId);
        return next;
      });
      fetchMessages(selectedId);
      const interval = setInterval(() => fetchMessages(selectedId), 10000);
      return () => clearInterval(interval);
    }
  }, [selectedId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications/');
      setNotifications(res.data);
    } catch { /* silent */ }
  };

  const fetchInternships = async () => {
    try {
      const res = await api.get('/internships/');
      setInternships(res.data);
    } catch {
      toast({ type: 'error', title: 'Erreur', description: 'Impossible de charger les dossiers.' });
    }
  };

  const fetchMessages = async (internshipId: string) => {
    try {
      const res = await api.get(`/internships/${internshipId}/messages/`);
      setMessages(res.data);
    } catch { /* silent */ }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedId) return;
    setSendingMsg(true);
    try {
      const res = await api.post(`/internships/${selectedId}/messages/`, { content: newMessage.trim() });
      setMessages(prev => [...prev, res.data]);
      setNewMessage('');
    } catch {
      toast({ type: 'error', title: 'Erreur', description: 'Impossible d\'envoyer le message.' });
    } finally {
      setSendingMsg(false);
    }
  };

  const filteredInternships = internships.filter(i => 
    i.company_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    i.job_title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedInternship = internships.find(i => i.id === selectedId);

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-140px)] bg-card border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        
        {/* LEFT PANEL: Chat List */}
        <div className={`flex-col border-r border-white/10 transition-all duration-300 ${selectedId ? 'hidden md:flex' : 'flex'} ${isListCollapsed ? 'md:w-[80px]' : 'w-full md:w-[350px]'}`}>
          <div className="p-4 border-b border-white/10 bg-white/5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              {!isListCollapsed && <h2 className="text-lg font-bold text-white">Messages</h2>}
              <button 
                onClick={() => setIsListCollapsed(!isListCollapsed)}
                className={`p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors ${isListCollapsed ? 'mx-auto' : ''}`}
                title={isListCollapsed ? "Ouvrir la liste" : "Réduire la liste"}
              >
                {isListCollapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
              </button>
            </div>
            
            {!isListCollapsed && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Rechercher un dossier..."
                  className="w-full bg-base border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-cyan focus:ring-1 focus:ring-cyan/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
            {filteredInternships.length === 0 ? (
              <p className="p-4 text-sm text-slate-500 text-center">Aucun dossier trouvé.</p>
            ) : (
              filteredInternships.map(internship => {
                const unreadForThis = notifications.filter(n => !n.is_read && n.type === 'new_message' && n.link?.includes(internship.id)).length;
                const showBadge = unreadForThis > 0 && !seenConversations.has(internship.id);
                
                return (
                  <button
                    key={internship.id}
                    onClick={() => setSelectedId(internship.id)}
                    className={`w-full text-left p-4 border-b border-white/5 transition-colors hover:bg-white/5 flex items-start gap-3 relative ${selectedId === internship.id ? 'bg-cyan/10 border-l-4 border-l-cyan' : ''} ${isListCollapsed ? 'justify-center px-2' : ''}`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan to-accent flex items-center justify-center text-white font-bold shrink-0 relative" title={isListCollapsed ? (user?.role === 'student' ? internship.teacher_name : internship.student_name) : undefined}>
                      {(user?.role === 'student' ? internship.teacher_name?.[0] : internship.student_name?.[0])?.toUpperCase()}
                      {showBadge && isListCollapsed && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-danger rounded-full ring-2 ring-card animate-pulse"></span>
                      )}
                    </div>
                    {!isListCollapsed && (
                      <div className="flex-1 min-w-0 pr-4 relative">
                        <h3 className="text-sm font-bold text-white truncate">{user?.role === 'student' ? internship.teacher_name : internship.student_name}</h3>
                        <p className={`text-xs truncate ${showBadge ? 'text-white font-semibold' : 'text-cyan'}`}>{internship.company_name} - {internship.job_title}</p>
                        <p className="text-xs text-slate-500 mt-1 truncate">
                          {user?.role === 'student' ? 'Enseignant' : 'Étudiant'}
                        </p>
                        {showBadge && (
                          <span className="absolute top-1 right-0 w-2.5 h-2.5 bg-danger rounded-full animate-pulse"></span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Chat Area */}
        <div className={`flex-1 flex-col bg-base ${!selectedId ? 'hidden md:flex' : 'flex'}`}>
          {!selectedId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-slate-500" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Vos conversations</h2>
              <p className="text-slate-500 max-w-sm">Sélectionnez un dossier dans la liste à gauche pour voir les messages et communiquer.</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="h-[70px] border-b border-white/10 bg-card px-6 flex items-center gap-4 shrink-0 shadow-sm z-10">
                <button 
                  className="md:hidden p-2 -ml-2 text-slate-400 hover:text-white"
                  onClick={() => setSelectedId(null)}
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan to-accent flex items-center justify-center text-white font-bold shrink-0">
                  {(user?.role === 'student' ? selectedInternship?.teacher_name?.[0] : selectedInternship?.student_name?.[0])?.toUpperCase() || '?'}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-white leading-tight truncate">{user?.role === 'student' ? selectedInternship?.teacher_name : selectedInternship?.student_name}</h3>
                  <p className="text-xs text-cyan truncate">{selectedInternship?.company_name} - {selectedInternship?.job_title}</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <button 
                    onClick={() => setIsListCollapsed(!isListCollapsed)}
                    className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
                  >
                    <Menu className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-white transition-colors">
                    <Info className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10 flex flex-col gap-4 relative">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#00B4D8_0%,_transparent_100%)] opacity-[0.02] pointer-events-none" />
                
                {messages.length === 0 ? (
                  <div className="my-auto text-center">
                    <p className="text-slate-500 text-sm">Aucun message pour l'instant.</p>
                    <p className="text-slate-600 text-xs mt-1">Envoyez le premier message pour démarrer la discussion.</p>
                  </div>
                ) : (
                  messages.map((msg: any) => {
                    const isMe = msg.sender_id === (user as any)?.id;
                    const isTeacher = msg.sender_role === 'teacher' || msg.sender_role === 'admin';
                    return (
                      <div key={msg.id} className={`flex gap-3 max-w-[80%] ${isMe ? 'self-end flex-row-reverse' : 'self-start'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-md ${
                          isTeacher ? 'bg-gradient-to-br from-cyan to-accent text-white' : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                        }`}>
                          {msg.sender_name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className={`flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 font-medium">{msg.sender_name}</span>
                            {isTeacher && (
                              <span className="text-[10px] bg-cyan/15 text-cyan px-1.5 py-0.5 rounded font-bold">
                                {msg.sender_role === 'admin' ? 'Admin' : 'Enseignant'}
                              </span>
                            )}
                          </div>
                          <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                            isMe
                              ? 'bg-cyan text-white rounded-tr-sm'
                              : isTeacher
                                ? 'bg-amber-500/10 border border-amber-500/20 text-white rounded-tl-sm backdrop-blur-sm'
                                : 'bg-card border border-white/10 text-slate-200 rounded-tl-sm'
                          }`}>
                            {isTeacher && !isMe && (
                              <div className="flex items-center gap-1 text-amber-400 text-xs font-semibold mb-1.5">
                                <TriangleAlert className="w-3.5 h-3.5" /> Remarque de l'enseignant
                              </div>
                            )}
                            {msg.content}
                          </div>
                          <span className="text-[10px] text-slate-500">
                            {new Date(msg.created_at).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-card border-t border-white/10 shrink-0">
                <div className="flex gap-3">
                  <textarea
                    rows={1}
                    className="flex-1 bg-base border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan focus:ring-1 focus:ring-cyan/50 transition-all resize-none min-h-[44px] max-h-[120px]"
                    placeholder="Tapez votre message..."
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                    }}
                    onKeyDown={(e) => { 
                      if (e.key === 'Enter' && !e.shiftKey) { 
                        e.preventDefault(); 
                        sendMessage(); 
                        e.currentTarget.style.height = 'auto';
                      } 
                    }}
                  />
                  <button
                    onClick={() => {
                      sendMessage();
                      const ta = document.querySelector('textarea');
                      if (ta) ta.style.height = 'auto';
                    }}
                    disabled={!newMessage.trim() || sendingMsg}
                    className="w-11 h-11 self-end rounded-full bg-cyan hover:bg-cyan/80 flex items-center justify-center text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 shadow-lg shadow-cyan/20"
                  >
                    {sendingMsg
                      ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <Send className="w-5 h-5 ml-1" />}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
