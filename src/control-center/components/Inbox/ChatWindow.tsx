import React, { useEffect, useRef, useState } from 'react';
import { useRealtimeMessages } from '../../hooks/useRealtimeMessages';
import type { Message } from '../../hooks/useRealtimeMessages';

const SUGGESTED_RESPONSES = [
  {
    nombre: "Bienvenida",
    respuestas: [
      { etiqueta: "Saludo Inicial", texto: "¡Hola! Qué gusto saludarte. Soy NARA, asistente virtual de NARA Psychology. 👋 Vi que nos contactaste por nuestro anuncio. ¿En qué podemos apoyarte hoy?" },
      { etiqueta: "Preguntar Nombre", texto: "Un gusto saludarte. Para darte una mejor atención, ¿podrías decirme tu nombre y el motivo de tu consulta?" }
    ]
  },
  {
    nombre: "Tarifas",
    respuestas: [
      { etiqueta: "Individual", texto: "Para Terapia Individual, el Dr. Emmanuel tiene una tarifa de $1,300 y las especialistas de $1,000. ¿Te gustaría agendar una valoración?" },
      { etiqueta: "Pareja", texto: "Para Terapia de Pareja, el Dr. Emmanuel tiene una tarifa de $1,400 y las especialistas de $1,200. ¿Te gustaría que revisemos disponibilidad?" }
    ]
  },
  {
    nombre: "Cierre",
    respuestas: [
      { etiqueta: "Confirmar Slot", texto: "¡Excelente decisión! He apartado tu espacio para el [Día/Hora]. Tu lugar queda reservado temporalmente por 2 horas para recibir el comprobante. Puedes realizar el pago aquí: https://pago.narapsychology.com/reserva" }
    ]
  }
];

interface ChatWindowProps {
  conversacionId: string | null;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ conversacionId }) => {
  const { messages, loading, sendMessage } = useRealtimeMessages(conversacionId);
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!conversacionId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-stone-50 text-stone-400">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="font-serif text-lg">Selecciona una conversación</p>
          <p className="text-sm">para ver el historial de mensajes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#003366 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10"
      >
        {loading && messages.length === 0 ? (
          <div className="flex justify-center p-8">
            <div className="w-8 h-8 border-2 border-nara-blue/20 border-t-nara-blue rounded-full animate-spin"></div>
          </div>
        ) : (
          messages.map((msg: Message) => (
            <div
              key={msg.id}
              className={`flex ${msg.direccion === 'saliente' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3 shadow-sm ${
                  msg.direccion === 'saliente'
                    ? 'bg-nara-blue text-white rounded-tr-none'
                    : 'bg-stone-100 text-stone-800 rounded-tl-none'
                }`}
              >
                {renderMessageContent(msg)}
                <div className={`text-[10px] mt-1 opacity-60 ${msg.direccion === 'saliente' ? 'text-right' : 'text-left'}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Suggested Responses Bar */}
      <div className="px-4 py-2 border-t border-stone-100 bg-stone-50 overflow-x-auto flex gap-2 no-scrollbar">
        {SUGGESTED_RESPONSES.map((cat, i) => (
          <div key={i} className="flex gap-2 shrink-0">
            {cat.respuestas.map((resp, j) => (
              <button
                key={`${i}-${j}`}
                type="button"
                onClick={() => setInputText(resp.texto)}
                className="px-3 py-1.5 bg-white border border-stone-200 rounded-full text-xs font-medium text-stone-600 hover:border-nara-blue hover:text-nara-blue transition-all whitespace-nowrap shadow-sm"
              >
                {resp.etiqueta}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Input area functional form */}
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          if (inputText.trim() && messages.length > 0) {
            sendMessage(inputText, messages[0].contacto_id);
            setInputText('');
          }
        }}
        className="p-4 border-t border-stone-100 bg-white relative z-10"
      >
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-2 flex items-end gap-2 focus-within:border-nara-blue focus-within:ring-2 focus-within:ring-nara-blue/20 transition-all">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (inputText.trim() && messages.length > 0) {
                  sendMessage(inputText, messages[0].contacto_id);
                  setInputText('');
                }
              }
            }}
            placeholder="Escribe un mensaje..."
            className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[44px] py-3 px-2 text-sm outline-none text-stone-700 font-sans"
          />
          <button 
            type="submit"
            disabled={!inputText.trim()}
            className="p-3 bg-nara-navy text-white rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-all shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </form>
    </div>
  );
};

const renderMessageContent = (msg: Message) => {
  switch (msg.tipo) {
    case 'image':
      return (
        <div className="space-y-2">
          <img 
            src={msg.media_url || ''} 
            alt="Multimedia" 
            className="rounded-lg max-w-full h-auto border border-white/20"
            onClick={() => msg.media_url && window.open(msg.media_url, '_blank')}
          />
          {msg.contenido && <p className="text-sm leading-relaxed">{msg.contenido}</p>}
          {msg.direccion === 'entrante' && msg.media_url?.includes('comprobante') && (
            <div className="mt-2 p-2 bg-green-500/20 rounded border border-green-500/30 text-[10px] font-bold uppercase tracking-wider text-center">
              Previsualización de Pago Detectada
            </div>
          )}
        </div>
      );
    case 'audio':
      return (
        <div className="space-y-2 min-w-[200px]">
          <audio controls className="w-full h-8">
            <source src={msg.media_url || ''} type="audio/mpeg" />
            Tu navegador no soporta audio.
          </audio>
          {msg.contenido && <p className="text-sm italic opacity-80">{msg.contenido}</p>}
        </div>
      );
    default:
      return <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.contenido}</p>;
  }
};

export default ChatWindow;
