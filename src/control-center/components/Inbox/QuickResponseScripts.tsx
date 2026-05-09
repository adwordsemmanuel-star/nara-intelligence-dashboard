import React from 'react';

interface QuickResponseScriptsProps {
  onSelect?: (text: string) => void;
}

const QuickResponseScripts: React.FC<QuickResponseScriptsProps> = ({ onSelect }) => {
  const scripts = [
    { label: 'Pareja - Emmanuel', price: '$1,400', text: 'La sesión de terapia de pareja con el psic. Emmanuel tiene un costo de $1,400 MXN.' },
    { label: 'Pareja - Especialistas', price: '$1,200', text: 'La sesión de terapia de pareja con nuestros especialistas tiene un costo de $1,200 MXN.' },
    { label: 'Adultos - Emmanuel', price: '$1,300', text: 'La sesión individual para adultos con el psic. Emmanuel tiene un costo de $1,300 MXN.' },
    { label: 'Adultos - Especialistas', price: '$1,000', text: 'La sesión individual para adultos con nuestros especialistas tiene un costo de $1,000 MXN.' },
    { label: 'Niños - Aracelly', price: '$1,000', text: 'La sesión para niños con la psic. Aracelly tiene un costo de $1,000 MXN.' },
    { label: 'Paquete Niños (5)', price: '$3,600', text: 'Contamos con un paquete de 5 sesiones para niños por un costo preferencial de $3,600 MXN.' },
  ];

  const handleScriptClick = (text: string) => {
    // 1. Copiar al portapapeles (mantiene funcionalidad actual)
    navigator.clipboard.writeText(text);
    
    // 2. Ejecutar callback si existe (para autocompletar el chat)
    if (onSelect) {
      onSelect(text);
    } else {
      // Si no hay callback, avisar que se copió
      console.log('Copiado al portapapeles:', text);
      alert('Texto copiado al portapapeles. Puedes pegarlo en el chat.');
    }
  };

  return (
    <div className="p-6 border-t border-stone-100 space-y-4 bg-stone-50/30">
      <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400">Scripts de Respuesta</h3>
      <div className="grid grid-cols-1 gap-2">
        {scripts.map((script, index) => (
          <button
            key={index}
            onClick={() => handleScriptClick(script.text)}
            className="text-left p-3 rounded-xl border border-stone-200 bg-white hover:border-nara-blue hover:bg-nara-blue/5 transition-all group shadow-sm"
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-[11px] font-bold text-nara-navy group-hover:text-nara-blue">{script.label}</span>
              <span className="text-[10px] font-mono bg-stone-100 px-1.5 py-0.5 rounded text-stone-500">{script.price}</span>
            </div>
            <p className="text-[10px] text-stone-500 line-clamp-1 italic">{script.text}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickResponseScripts;
