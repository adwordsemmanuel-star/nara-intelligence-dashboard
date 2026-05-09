import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import Login from './components/Login';
import ChatList from './components/Inbox/ChatList';
import ChatWindow from './components/Inbox/ChatWindow';
import ProfilingSidebar from './components/Inbox/ProfilingSidebar';
import QuickResponseScripts from './components/Inbox/QuickResponseScripts';
import CalendarView from './components/Agenda/CalendarView';
import ConfigToggle from './components/Admin/ConfigToggle';
import { useAdminConfig } from './hooks/useAdminConfig';
import type { Session } from '@supabase/supabase-js';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'inbox' | 'agenda' | 'config'>('inbox');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);

  const { config } = useAdminConfig();

  useEffect(() => {
    // 1. Verificar sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. Escuchar cambios en la autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch contactId when conversation changes
  useEffect(() => {
    if (selectedConversationId) {
      const fetchContactId = async () => {
        const { data } = await supabase
          .from('conversaciones')
          .select('contacto_id')
          .eq('id', selectedConversationId)
          .single();
        if (data) setSelectedContactId(data.contacto_id);
      };
      fetchContactId();
    } else {
      setSelectedContactId(null);
    }
  }, [selectedConversationId]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-nara-blue/20 border-t-nara-blue rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-stone-500 font-sans animate-pulse">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  const EmergencyBanner = () => {
    if (config?.mode !== 'emergency') return null;
    return (
      <div className="bg-rose-600 text-white py-2 px-4 flex items-center justify-center gap-3 animate-pulse z-50 shadow-md">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
        <span className="text-sm font-bold uppercase tracking-widest">Modo de Emergencia Activo - IA Desactivada</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-stone-50 overflow-hidden font-sans">
      <EmergencyBanner />
      <div className="flex flex-1 overflow-hidden">
        {/* Mini Sidebar Nav - NARA Style */}
        <nav className="w-16 bg-nara-navy flex flex-col items-center py-6 gap-8 z-30 shadow-xl">
          <div className="w-10 h-10 bg-nara-gradient rounded-xl shadow-lg mb-4" />
          
          <button 
            onClick={() => setActiveTab('inbox')}
            className={`p-3 rounded-xl transition-all ${activeTab === 'inbox' ? 'bg-white/10 text-white shadow-inner' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
            title="Inbox Inteligente"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </button>

          <button 
            onClick={() => setActiveTab('agenda')}
            className={`p-3 rounded-xl transition-all ${activeTab === 'agenda' ? 'bg-white/10 text-white shadow-inner' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
            title="Agenda Global"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </button>

          <button 
            onClick={() => setActiveTab('config')}
            className={`p-3 rounded-xl transition-all ${activeTab === 'config' ? 'bg-white/10 text-white shadow-inner' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
            title="Configuración"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>

          <div className="mt-auto flex flex-col gap-4 items-center">
            <button 
              onClick={handleLogout}
              className="p-3 text-white/40 hover:text-rose-400 transition-colors"
              title="Cerrar Sesión"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
          </div>
        </nav>

        {/* Sidebar - Chat List (only in Inbox) */}
        {activeTab === 'inbox' && (
          <aside className="w-full md:w-80 flex flex-col border-r border-stone-200 bg-white z-20 animate-in slide-in-from-left duration-300">
            <header className="p-4 border-b border-stone-100">
              <h2 className="text-xl font-serif text-nara-navy">Inbox</h2>
            </header>

            <ChatList 
              onSelectConversation={setSelectedConversationId} 
              selectedId={selectedConversationId}
            />

            <footer className="p-4 border-t border-stone-100 bg-stone-50 text-[10px] text-stone-400 flex justify-between items-center">
              <span className="truncate mr-2">{session.user.email}</span>
              <div className="flex items-center gap-1 shrink-0">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                <span>Online</span>
              </div>
            </footer>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 flex flex-col relative bg-white overflow-hidden">
          {activeTab === 'inbox' ? (
            <div className="hidden md:flex flex-1 h-full overflow-hidden">
              <div className="flex-1 flex flex-col border-r border-stone-100">
                <ChatWindow conversacionId={selectedConversationId} />
              </div>
              
              <aside className="w-80 flex flex-col bg-white overflow-y-auto border-l border-stone-100 animate-in slide-in-from-right duration-500">
                <ProfilingSidebar 
                  contactId={selectedContactId} 
                  conversationId={selectedConversationId}
                  onNavigateToAgenda={() => setActiveTab('agenda')} 
                />
                <QuickResponseScripts />
              </aside>
            </div>
          ) : activeTab === 'agenda' ? (
            <div className="flex-1 flex flex-col animate-in fade-in duration-500">
              <header className="p-4 border-b border-stone-100 bg-white flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-serif text-nara-navy">Agenda Global</h2>
                  <p className="text-xs text-stone-500">Gestiona las sesiones de todos los psicólogos</p>
                </div>
                {selectedContactId && (
                  <div className="px-3 py-1 bg-nara-blue/10 rounded-full border border-nara-blue/20 flex items-center gap-2">
                    <span className="w-2 h-2 bg-nara-blue rounded-full animate-pulse" />
                    <span className="text-xs font-medium text-nara-blue">Agendando para contacto activo</span>
                  </div>
                )}
              </header>
              <CalendarView 
                selectedContactId={selectedContactId} 
                selectedConversationId={selectedConversationId}
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col animate-in fade-in duration-500 overflow-y-auto">
              <ConfigToggle />
            </div>
          )}
        </main>

        {/* Mobile Overlay */}
        {activeTab === 'inbox' && selectedConversationId && (
          <div className="fixed inset-0 z-40 md:hidden flex flex-col bg-white">
            <header className="p-3 border-b border-stone-100 flex items-center gap-3">
              <button 
                onClick={() => setSelectedConversationId(null)}
                className="p-1 text-stone-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <span className="font-serif text-nara-navy">Conversación</span>
            </header>
            <ChatWindow conversacionId={selectedConversationId} />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
