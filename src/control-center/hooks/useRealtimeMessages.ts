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
    
    try {
      // 1. Obtener el teléfono del contacto
      const { data: contact } = await supabase
        .from('contactos')
        .select('telefono')
        .eq('id', contactoId)
        .single();

      if (!contact?.telefono) throw new Error('No se encontró el teléfono del contacto');

      // 2. Enviar a la API del Bot (Railway)
      const BACKEND_URL = import.meta.env.PUBLIC_BACKEND_URL || 'https://nara-intelligence-core-production.up.railway.app';
      
      const response = await fetch(`${BACKEND_URL}/send-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telefono: contact.telefono,
          mensaje: contenido,
          conversacion_id: conversacionId,
          contacto_id: contactoId
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Error en el servidor de Railway');
      }

      // Nota: El backend de Railway ya hace el INSERT en Supabase al enviar con éxito.
      // No es necesario hacerlo aquí para evitar duplicados.
      
    } catch (error: any) {
      console.error('❌ Error enviando mensaje:', error.message);
      alert('Error al enviar el mensaje: ' + error.message);
    }
  };

  return { messages, loading, sendMessage };
};
