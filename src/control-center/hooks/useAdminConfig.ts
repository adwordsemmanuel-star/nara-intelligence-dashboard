import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface AdminConfig {
  mode: 'intelligent' | 'emergency';
  manual_number: string;
}

export const useAdminConfig = () => {
  const [config, setConfig] = useState<AdminConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const getMode = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_config')
        .select('value')
        .eq('key', 'operational_mode')
        .single();

      if (error) throw error;
      if (data) {
        setConfig(data.value as AdminConfig);
        return data.value as AdminConfig;
      }
    } catch (err) {
      console.error('Error fetching admin config:', err);
    } finally {
      setLoading(false);
    }
    return null;
  };

  const updateMode = async (newConfig: AdminConfig) => {
    try {
      const { error } = await supabase
        .from('admin_config')
        .update({ 
          value: newConfig, 
          updated_at: new Date().toISOString() 
        })
        .eq('key', 'operational_mode');

      if (error) throw error;
      setConfig(newConfig);
    } catch (err) {
      console.error('Error updating admin config:', err);
      throw err;
    }
  };

  useEffect(() => {
    getMode();

    const channel = supabase
      .channel('admin_config_realtime')
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'admin_config', 
          filter: 'key=eq.operational_mode' 
        },
        (payload) => {
          if (payload.new && payload.new.value) {
            setConfig(payload.new.value as AdminConfig);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { config, loading, getMode, updateMode };
};
