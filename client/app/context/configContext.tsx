'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

/**
 * Defines the shape of the configuration object.
 * @interface Config
 * @property {string} apiURL - The base URL for the Server.
 * @property {string} poolId - The pool ID used in the application.
 * @property {string} localStorageKey - The key used for local storage.
 */
export interface Config {
    apiURL: string;
    poolId: string;
    localStorageKey: string;
}

//Default values for prerendering
const defaultConfig: Config = {
    apiURL: '',
    poolId: '',
    localStorageKey: ''
};

/**
 * Creates a React Context for the application configuration.
 */
const ConfigContext = createContext<Config | null>(null);

/**
 * Provider component that fetches and provides the configuration to its children.
 * It retrieves the configuration from the generated config.json file.
 *
 * @param {React.ReactNode} children - The child components that will have access to the configuration.
 */
export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [config, setConfig] = useState<Config>(defaultConfig);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await fetch('/config.json');
                if (!response.ok) {
                    throw new Error('Failed to fetch config.json');
                }
                const data: Config = await response.json();
                setConfig(data);
            } catch (err) {
                console.error('Error loading config.json:', err);
                //Fallback
                setConfig({
                    apiURL: 'http://localhost:5000',
                    poolId: 'pool1dmnyhw9uthknzcq4q6pwdc4vtfxz5zzrvd9eg432u60lzl959tw',
                    localStorageKey: 'rewardData'
                });
            }
        };

        fetchConfig();

    }, []);

    return (
        <ConfigContext.Provider value={config}>
            {children}
        </ConfigContext.Provider>
    );
};

/**
 * Custom hook to access the configuration context.
 *
 * @returns {Config} The current configuration.
 * @throws {Error} If 'useConfig' is called outside of a 'ConfigProvider'.
 */
export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};

