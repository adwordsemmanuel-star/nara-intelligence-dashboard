import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface Contact {
  id: string;
  nombre: string;
  fuente: string;
  estado: string;
  motivo_consulta?: string;
  notas_admin?: string;
}

interface Conversation {
  id: string;
  resumen_ia: string | null;
}

interface ProfilingSidebarProps {
  contactId: string | null;
  conversationId: string | null;
  onNavigateToAgenda: () => void;
}

const ProfilingSidebar: React.FC<ProfilingSidebarProps> = ({ contactId, conversationId, onNavigateToAgenda }) => {
  const [contact, setContact] = useState<Contact | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!contactId || !conversationId) return;
      setLoading(true);

      const { data: contactData } = await supabase
        .from('contactos')
        .select('*')
        .eq('id', contactId)
        .single();

      const { data: convData } = await supabase
        .from('conversaciones')
        .select('id, resumen_ia')
        .eq('id', conversationId)
        .single();

      if (contactData) setContact(contactData);
      if (convData) setConversation(convData);
      setLoading(false);
    };

    fetchData();
  }, [contactId, conversationId]);

  if (!contactId) return (
    <div className="h-full flex items-center justify-center p-8 text-center text-stone-400">
      <p className="text-sm italic">Selecciona una conversación para ver el perfil</p>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-6 bg-stone-200 rounded w-1/2"></div>
        <div className="space-y-3">
          <div className="h-4 bg-stone-100 rounded"></div>
          <div className="h-4 bg-stone-100 rounded"></div>
          <div className="h-4 bg-stone-100 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 flex flex-col h-full overflow-y-auto">
      <section className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400">Perfil del Contacto</h3>
        <div className="space-y-3">
          <div>
            <label className="text-[10px] text-stone-400 uppercase">Nombre</label>
            <p className="text-nara-navy font-medium">{contact?.nombre || 'Sin nombre'}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-stone-400 uppercase">Fuente</label>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`w-2 h-2 rounded-full ${contact?.fuente?.toLowerCase() === 'meta' ? 'bg-blue-500' : 'bg-green-500'}`} />
                <p className="text-sm font-medium">{contact?.fuente || 'Google'}</p>
              </div>
            </div>
            <div>
              <label className="text-[10px] text-stone-400 uppercase">Estado</label>
              <p className="text-sm font-medium mt-1 capitalize">{contact?.estado || 'Nuevo'}</p>
            </div>
          </div>
          <div>
            <label className="text-[10px] text-stone-400 uppercase">Motivo de Consulta</label>
            <p className="text-sm text-stone-600 mt-1">{contact?.motivo_consulta || 'No especificado'}</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400">Inteligencia NARA</h3>
        <div className="bg-nara-blue/5 border border-nara-blue/10 rounded-2xl p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-10">
             <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M12 12L2.1 12.1"/><path d="M12 12v10a10 10 0 0 0 10-10H12z"/></svg>
          </div>
          <label className="text-[10px] text-nara-blue font-bold uppercase block mb-2">Resumen IA</label>
          <p className="text-sm text-stone-700 leading-relaxed italic">
            {conversation?.resumen_ia ? `"${conversation.resumen_ia}"` : 'Generando resumen...'}
          </p>
        </div>
      </section>

      <section className="mt-auto pt-6 space-y-3">
        <button 
          onClick={onNavigateToAgenda}
          className="w-full py-3 px-4 bg-nara-navy text-white rounded-xl font-medium shadow-lg shadow-nara-navy/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          Ver en Agenda
        </button>
      </section>
    </div>
  );
};

export default ProfilingSidebar;
