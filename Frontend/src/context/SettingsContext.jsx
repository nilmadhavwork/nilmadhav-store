import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { settingApi } from '../api/settingApi';

const SettingsContext = createContext(null);

const DEFAULT_SETTINGS = {
  storeName: 'Nilmadhav Sarees',
  shippingSettings: {
    freeShippingEnabled: true,
    freeShippingAbove: 5000,
    defaultShippingCharge: 150,
  },
  returnSettings: {
    returnWindowDays: 7,
    returnEnabled: true,
  },
  codSettings: {
    enabled: true,
  },
  paymentSettings: {
    razorpayEnabled: true,
  },
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await settingApi.getSettings();
      if (data) {
        setSettings({
          ...DEFAULT_SETTINGS,
          ...data,
          shippingSettings: {
            ...DEFAULT_SETTINGS.shippingSettings,
            ...(data.shippingSettings || {}),
          },
          returnSettings: {
            ...DEFAULT_SETTINGS.returnSettings,
            ...(data.returnSettings || {}),
          },
          codSettings: {
            ...DEFAULT_SETTINGS.codSettings,
            ...(data.codSettings || {}),
          },
          paymentSettings: {
            ...DEFAULT_SETTINGS.paymentSettings,
            ...(data.paymentSettings || {}),
          },
        });
      }
    } catch (err) {
      console.warn('Could not fetch store settings:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        shippingSettings: settings.shippingSettings,
        returnSettings: settings.returnSettings,
        codSettings: settings.codSettings,
        paymentSettings: settings.paymentSettings,
        loading,
        fetchSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export default SettingsContext;
