import React, { useState, useEffect } from 'react';
import { useAdminConfig, type AdminConfig } from '../../hooks/useAdminConfig';

const ConfigToggle: React.FC = () => {
  const { config, loading, updateMode } = useAdminConfig();
  const [localConfig, setLocalConfig] = useState<AdminConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (config) {
      setLocalConfig(config);
    }
  }, [config]);

  const handleToggleMode = () => {
    if (!localConfig) return;
    setLocalConfig({
      ...localConfig,
      mode: localConfig.mode === 'intelligent' ? 'emergency' : 'intelligent'
    });
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!localConfig) return;
    setLocalConfig({
      ...localConfig,
      manual_number: e.target.value
    });
  };

  const handleSave = async () => {
    if (!localConfig) return;
    setSaving(true);
    setMessage(null);
    try {
      await updateMode(localConfig);
      setMessage({ type: 'success', text: 'Configuración guardada correctamente' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Error al guardar la configuración' });
    } finally {
      setSaving(false);
    }
  };

  if (loading && !localConfig) {
    return (
      <div className="p-8 flex justify-center">
        <div className="w-8 h-8 border-4 border-nara-blue/20 border-t-nara-blue rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto overflow-y-auto h-full">
      <header className="mb-8">
        <h2 className="text-2xl font-serif text-nara-navy">Configuración del Sistema</h2>
        <p className="text-stone-500">Gestiona el modo operativo de NARA y el respaldo manual.</p>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="p-6 space-y-8">
          {/* Modo de Operación */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-stone-900 uppercase tracking-wider">Modo de Operación</h3>
              <p className="text-sm text-stone-500 mt-1">
                {localConfig?.mode === 'intelligent' 
                  ? 'NARA responde automáticamente usando IA.' 
                  : 'Modo de Emergencia: La IA está desactivada.'}
              </p>
            </div>
            <button
              onClick={handleToggleMode}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-nara-blue focus:ring-offset-2 ${
                localConfig?.mode === 'emergency' ? 'bg-rose-500' : 'bg-stone-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  localConfig?.mode === 'emergency' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <hr className="border-stone-100" />

          {/* Número de Respaldo */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-stone-900 uppercase tracking-wider">
              Número de Respaldo (WhatsApp)
            </label>
            <div className="relative">
              <input
                type="text"
                value={localConfig?.manual_number || ''}
                onChange={handleNumberChange}
                placeholder="Ej: 521..."
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nara-blue/20 focus:border-nara-blue transition-all"
              />
              <p className="mt-2 text-xs text-stone-400">
                Este número recibirá las redirecciones cuando el sistema esté saturado o en modo emergencia.
              </p>
            </div>
          </div>
        </div>

        {/* Footer con Botón */}
        <div className="bg-stone-50 p-6 flex items-center justify-between">
          <div>
            {message && (
              <span className={`text-sm font-medium ${message.type === 'success' ? 'text-green-600' : 'text-rose-600'} animate-in fade-in slide-in-from-left-2`}>
                {message.text}
              </span>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={saving || !localConfig}
            className={`px-6 py-2 rounded-xl font-medium transition-all shadow-md active:scale-95 ${
              saving 
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed' 
                : 'bg-nara-navy text-white hover:bg-nara-navy/90'
            }`}
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>

      {/* Warning Box */}
      {localConfig?.mode === 'emergency' && (
        <div className="mt-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex gap-3 animate-in zoom-in-95 duration-300">
          <svg className="text-rose-500 shrink-0" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
          <div className="text-sm text-rose-700">
            <p className="font-bold">¡Atención!</p>
            <p>El modo emergencia desactiva todas las automatizaciones de IA. Las nuevas conversaciones deberán ser atendidas manualmente.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigToggle;
