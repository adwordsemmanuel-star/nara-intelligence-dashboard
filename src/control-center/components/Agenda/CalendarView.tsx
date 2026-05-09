import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import SlotPicker from './SlotPicker';

interface Psicologo {
  id: string;
  nombre: string;
  especialidad: string;
}

interface AgendaItem {
  id: string;
  psicologo_id: string;
  contacto_id: string | null;
  fecha_hora: string;
  estado_reserva: 'disponible' | 'apartado' | 'confirmada';
  monto_total: number;
}

interface CalendarViewProps {
  selectedContactId: string | null;
  selectedConversationId: string | null;
}

const CalendarView: React.FC<CalendarViewProps> = ({ selectedContactId, selectedConversationId }) => {
  const [psicologos, setPsicologos] = useState<Psicologo[]>([]);
  const [agenda, setAgenda] = useState<AgendaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<AgendaItem | null>(null);

  // Generar los próximos 7 días para el selector
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM a 8 PM

  useEffect(() => {
    fetchData();

    // Suscripción en tiempo real
    const channel = supabase
      .channel('agenda-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'agenda' },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedDay]);

  const fetchData = async () => {
    setLoading(true);
    
    // 1. Fetch Psicólogos
    const { data: psis, error: psisError } = await supabase
      .from('psicologos')
      .select('*');
    
    if (psisError) console.error('Error fetching psychologists:', psisError);
    else setPsicologos(psis || []);

    // 2. Fetch Agenda para el día seleccionado
    const startOfDay = new Date(selectedDay);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDay);
    endOfDay.setHours(23, 59, 59, 999);

    const { data: age, error: ageError } = await supabase
      .from('agenda')
      .select('*')
      .gte('fecha_hora', startOfDay.toISOString())
      .lte('fecha_hora', endOfDay.toISOString());

    if (ageError) console.error('Error fetching agenda:', ageError);
    else setAgenda(age || []);

    setLoading(false);
  };

  const getSlot = (psicologoId: string, hour: number) => {
    return agenda.find(item => {
      const itemDate = new Date(item.fecha_hora);
      return item.psicologo_id === psicologoId && itemDate.getHours() === hour;
    });
  };

  const formatDay = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' };
    return date.toLocaleDateString('es-ES', options);
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getDate() === d2.getDate() && 
           d1.getMonth() === d2.getMonth() && 
           d1.getFullYear() === d2.getFullYear();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'disponible': return 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200';
      case 'apartado': return 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200';
      case 'confirmada': return 'bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200';
      default: return 'bg-stone-50 text-stone-400 border-stone-100';
    }
  };

  if (loading && psicologos.length === 0) {
    return <div className="p-8 text-center text-stone-500">Cargando agenda...</div>;
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Day Selector */}
      <div className="p-4 border-b border-stone-100 flex gap-2 overflow-x-auto">
        {days.map((day, i) => (
          <button
            key={i}
            onClick={() => setSelectedDay(day)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              isSameDay(day, selectedDay)
                ? 'bg-nara-navy text-white shadow-sm'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {formatDay(day)}
          </button>
        ))}
      </div>

      {/* Grid Header */}
      <div className="flex-1 overflow-auto">
        <div 
          className="grid gap-px bg-stone-100 border-b border-stone-100"
          style={{ gridTemplateColumns: `80px repeat(${psicologos.length}, minmax(150px, 1fr))` }}
        >
          {/* Top Left Corner */}
          <div className="bg-stone-50 p-4 sticky top-0 left-0 z-10 border-r border-stone-200">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Hora</span>
          </div>

          {/* Psychologist Headers */}
          {psicologos.map(psi => (
            <div key={psi.id} className="bg-white p-4 sticky top-0 z-10 text-center border-r border-stone-100">
              <h3 className="font-serif text-nara-navy text-sm font-semibold">{psi.nombre}</h3>
              <p className="text-[10px] text-stone-400 uppercase">{psi.especialidad}</p>
            </div>
          ))}

          {/* Grid Rows */}
          {hours.map(hour => (
            <React.Fragment key={hour}>
              {/* Hour Label */}
              <div className="bg-stone-50 p-3 text-right border-r border-stone-200 sticky left-0 z-10 flex items-center justify-end">
                <span className="text-xs font-medium text-stone-500">
                  {hour}:00
                </span>
              </div>

              {/* Slots */}
              {psicologos.map(psi => {
                const slot = getSlot(psi.id, hour);
                return (
                  <div key={`${psi.id}-${hour}`} className="bg-white p-1 min-h-[60px] border-r border-stone-100 group">
                    {slot ? (
                      <button
                        onClick={() => setSelectedSlot(slot)}
                        className={`w-full h-full p-2 rounded-lg border text-left transition-all text-xs flex flex-col justify-between ${getStatusColor(slot.estado_reserva)}`}
                      >
                        <span className="font-bold capitalize">{slot.estado_reserva}</span>
                        {slot.contacto_id && (
                          <span className="text-[10px] opacity-80 truncate">Ocupado</span>
                        )}
                      </button>
                    ) : (
                      <div className="w-full h-full rounded-lg border border-dashed border-stone-100 flex items-center justify-center">
                        <span className="text-[10px] text-stone-300">No disp.</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Slot Picker Modal */}
      {selectedSlot && (
        <SlotPicker 
          slot={selectedSlot} 
          contactId={selectedContactId}
          conversationId={selectedConversationId}
          onClose={() => setSelectedSlot(null)}
          onConfirm={fetchData}
        />
      )}
    </div>
  );
};

export default CalendarView;
