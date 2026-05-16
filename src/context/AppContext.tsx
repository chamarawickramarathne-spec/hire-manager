import React, { createContext, useContext, useState, useEffect } from 'react';

export type AppType = 'lens_manager' | 'workshop' | 'calculator';

interface AppContextType {
  currentApp: AppType;
  setCurrentApp: (app: AppType) => void;
  appTitle: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentApp, setCurrentApp] = useState<AppType>(() => {
    const saved = localStorage.getItem('currentApp');
    return (saved as AppType) || 'lens_manager';
  });

  useEffect(() => {
    localStorage.setItem('currentApp', currentApp);
  }, [currentApp]);

  const appTitles: Record<AppType, string> = {
    lens_manager: 'Lens Booking Pro',
    workshop: 'Workshop Manager',
    calculator: 'Lens Calculator'
  };

  return (
    <AppContext.Provider value={{ currentApp, setCurrentApp, appTitle: appTitles[currentApp] }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
