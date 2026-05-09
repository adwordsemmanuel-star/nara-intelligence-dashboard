import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface Contact {
  id: string;
  nombre: string;
  fuente: string;
}

interface Conversation {
  id: string;
  contacto_id: string;
  resumen_ia: string | null;
  estado: string;
  contactos: Contact;
}

interface ChatListProps {
  onSelectConversation: (id: string) => void;
  selectedId?: string | null;
}

const ChatList: React.FC<ChatListProps> = ({ onSelectConversation, selectedId }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('conversaciones')
        .select('*, contactos(id, nombre, fuente)')
        .eq('estado', 'activa')
        .order('id', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
      } else {
        setConversations(data as any || []);
      }
      setLoading(false);
    };

    fetchConversations();

    // Realtime subscription for conversations list (if needed)
    const channel = supabase
      .channel('conversations-list')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversaciones' }, () => {
        fetchConversations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-stone-200 h-12 w-12"></div>
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-stone-200 rounded w-3/4"></div>
              <div className="h-4 bg-stone-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-4 border-b border-stone-100">
        <h2 className="text-xl font-serif text-nara-navy">Conversaciones</h2>
      </div>
      <div className="divide-y divide-stone-50">
        {conversations.length === 0 ? (
          <div className="p-8 text-center text-stone-400 text-sm">
            No hay conversaciones activas
          </div>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelectConversation(conv.id)}
              className={`w-full p-4 text-left transition-colors hover:bg-stone-50 flex flex-col gap-1 ${
                selectedId === conv.id ? 'bg-stone-100 border-l-4 border-nara-blue' : 'border-l-4 border-transparent'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="font-medium text-nara-navy">{conv.contactos?.nombre || 'Contacto desconocido'}</span>
                <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-500">
                  {conv.contactos?.fuente || 'Directo'}
                </span>
              </div>
              {conv.resumen_ia && (
                <p className="text-xs text-stone-500 line-clamp-2 italic">
                  "{conv.resumen_ia}"
                </p>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatList;
