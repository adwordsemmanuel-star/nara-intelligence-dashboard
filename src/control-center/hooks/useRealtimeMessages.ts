import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

export interface Message {
  id: string;
  conversacion_id: string;
  contacto_id: string;
  direccion: 'entrante' | 'saliente';
  tipo: 'text' | 'image' | 'audio';
  contenido: string | null;
  media_url: string | null;
  created_at: string;
}

export const useRealtimeMessages = (conversacionId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    if (!conversacionId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('mensajes')
        .select('*')
        .eq('conversacion_id', conversacionId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
      } else {
        setMessages(data || []);
      }
      setLoading(false);
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`room-${conversacionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensajes',
          filter: `conversacion_id=eq.${conversacionId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe();

    subscriptionRef.current = channel;

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, [conversacionId]);

  const sendMessage = async (contenido: string, contactoId: string, tipo: 'text' | 'image' | 'audio' = 'text') => {
    if (!conversacionId || !contenido.trim() || !contactoId) return;
    
    const { error } = await supabase.from('mensajes').insert([{
      conversacion_id: conversacionId,
      contacto_id: contactoId,
      direccion: 'saliente',
      tipo,
      contenido
    }]);

    if (error) console.error('Error enviando mensaje:', error.message);
  };

  return { messages, loading, sendMessage };
};
