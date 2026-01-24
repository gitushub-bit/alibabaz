import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PaymentSettings {
  otpEnabled: boolean;
  otpLength: number;
  otpExpirySeconds: number;
  otpMaxAttempts: number;
  otpChannel: string;
  requireCardVerification: boolean;
  testMode: boolean;
}

const defaultSettings: PaymentSettings = {
  otpEnabled: true,
  otpLength: 6,
  otpExpirySeconds: 60,
  otpMaxAttempts: 3,
  otpChannel: 'sms',
  requireCardVerification: true,
  testMode: true,
};

export function usePaymentSettings() {
  const [settings, setSettings] = useState<PaymentSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data: dbSettings } = await supabase
          .from('site_settings')
          .select('key, value')
          .in('key', [
            'card_otp_enabled',
            'card_otp_length',
            'card_otp_expiry_seconds',
            'card_otp_max_attempts',
            'card_otp_channel',
            'card_require_verification',
            'payment_test_mode',
          ]);

        if (dbSettings && dbSettings.length > 0) {
          const newSettings = { ...defaultSettings };

          dbSettings.forEach((setting) => {
            if (setting.key === 'card_otp_enabled') {
              newSettings.otpEnabled = setting.value !== false && setting.value !== 'false';
            }
            if (setting.key === 'card_otp_length') {
              newSettings.otpLength = Number(setting.value) || 6;
            }
            if (setting.key === 'card_otp_expiry_seconds') {
              newSettings.otpExpirySeconds = Number(setting.value) || 60;
            }
            if (setting.key === 'card_otp_max_attempts') {
              newSettings.otpMaxAttempts = Number(setting.value) || 3;
            }
            if (setting.key === 'card_otp_channel') {
              newSettings.otpChannel = String(setting.value).replace(/"/g, '') || 'sms';
            }
            if (setting.key === 'card_require_verification') {
              newSettings.requireCardVerification = setting.value !== false && setting.value !== 'false';
            }
            if (setting.key === 'payment_test_mode') {
              newSettings.testMode = setting.value !== false && setting.value !== 'false';
            }
          });

          setSettings(newSettings);
        }
      } catch (error) {
        console.error('Error loading payment settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  return { settings, loading };
}
