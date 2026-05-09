import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface SlotPickerProps {
  slot: any;
  contactId: string | null;
  conversationId: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

const SlotPicker: React.FC<SlotPickerProps> = ({ slot, contactId, conversationId, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false);
  const [contactName, setContactName] = useState<string | null>(null);

  useEffect(() => {
    if (contactId) {
      const fetchContact = async () => {
        const { data, error } = await supabase
          .from('contactos')
          .select('nombre')
          .eq('id', contactId)
          .single();
        
        if (data) setContactName(data.nombre);
      };
      fetchContact();
    }
  }, [contactId]);

  const handleConfirm = async () => {
    if (!contactId || !conversationId) {
      alert('Por favor, selecciona un contacto en el chat antes de agendar.');
      return;
    }

    setLoading(true);
    
    // 1. Apartar el slot en la base de datos
    const { error } = await supabase
      .from('agenda')
      .update({
        contacto_id: contactId,
        estado_reserva: 'apartado'
      })
      .eq('id', slot.id);

    if (error) {
      console.error('Error updating slot:', error);
      alert('Error al agendar: ' + error.message);
    } else {
      // 2. Generar y enviar mensaje automático de confirmación
      const fecha = formatDate(slot.fecha_hora);
      const hora = formatTime(slot.fecha_hora);
      
      const mensajeConfirmacion = `¡Excelente decisión! He apartado tu espacio para el ${fecha} a las ${hora}. 👋\n\nTu lugar queda reservado temporalmente por 2 horas para recibir el comprobante. Puedes realizar el pago aquí: https://pago.narapsychology.com/reserva?id=${slot.id}\n\n¿Tienes alguna duda sobre el proceso?`;

      await supabase.from('mensajes').insert([{
        conversacion_id: conversationId,
        contacto_id: contactId,
        direccion: 'saliente',
        tipo: 'text',
        contenido: mensajeConfirmacion
      }]);

      onConfirm();
      onClose();
    }
    setLoading(false);
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-nara-navy/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <header className="p-6 bg-stone-50 border-b border-stone-100">
          <h2 className="text-xl font-serif text-nara-navy">Confirmar Cita</h2>
          <p className="text-sm text-stone-500 mt-1">Revisa los detalles antes de agendar</p>
        </header>

        <div className="p-6 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-nara-blue/10 flex items-center justify-center text-nara-blue shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <div>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Fecha y Hora</p>
              <p className="text-nara-navy font-medium capitalize">{formatDate(slot.fecha_hora)}</p>
              <p className="text-stone-600">{formatTime(slot.fecha_hora)}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-nara-pink/10 flex items-center justify-center text-nara-pink shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Paciente</p>
              <p className="text-nara-navy font-medium">
                {contactName || (contactId ? 'Cargando...' : 'Ningún contacto seleccionado')}
              </p>
              {!contactId && (
                <p className="text-xs text-rose-500 mt-1">⚠️ Debes estar en un chat activo para agendar.</p>
              )}
            </div>
          </div>

          <div className="bg-nara-blue/5 p-4 rounded-xl border border-nara-blue/10">
            <div className="flex justify-between items-center mb-1">
              <span className="text-stone-600 text-sm">Sesión Individual</span>
              <span className="font-bold text-nara-navy">${slot.monto_total || '0'}</span>
            </div>
            <p className="text-[10px] text-stone-400 uppercase">El pago se gestionará posteriormente</p>
          </div>
        </div>

        <footer className="p-6 bg-stone-50 border-t border-stone-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-stone-600 font-medium hover:bg-stone-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || !contactId || slot.estado_reserva !== 'disponible'}
            className="flex-1 px-4 py-2 bg-nara-navy text-white font-medium rounded-lg shadow-lg shadow-nara-navy/20 hover:bg-slate-800 disabled:opacity-50 transition-all"
          >
            {loading ? 'Agendando...' : 'Confirmar Cita'}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default SlotPicker;
