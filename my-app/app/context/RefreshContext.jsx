import React, { createContext, useState, useContext } from 'react';

const RefreshContext = createContext();

export const RefreshProvider = ({ children }) => {
  const [shouldRefreshPlants, setShouldRefreshPlants] = useState(false);

  const triggerPlantRefresh = () => {
    setShouldRefreshPlants(prev => !prev);
  };

  return (
    <RefreshContext.Provider value={{ shouldRefreshPlants, triggerPlantRefresh }}>
      {children}
    </RefreshContext.Provider>
  );
};

export const useRefresh = () => {
  const context = useContext(RefreshContext);
  if (!context) {
    throw new Error('useRefresh must be used within a RefreshProvider');
  }
  return context;
}; 