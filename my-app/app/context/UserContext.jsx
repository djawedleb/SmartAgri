import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
      throw new Error('useUser must be used within a UserProvider');
    }
    return context;
  }; 

export const UserProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(null); // null = manager, 'farmer' = farmer, 'technicien' = technicien

  const isManager = () => userRole === null;
  const isFarmer = () => userRole === 'farmer';
  const isTechnician = () => userRole === 'technicien';

  const isPageVisible = (pageName) => {
    // Manager can see everything except Account
    if (isManager()) {
      const hiddenPages = ['Account'];
      return !hiddenPages.includes(pageName);
    }

    // Farmer restrictions
    if (isFarmer()) {
      const hiddenPages = ['ManageUsers', 'Sensors'];
      return !hiddenPages.includes(pageName);
    }

    // Technicien can access Technicien folder and Account
    if (isTechnician()) {
      return pageName.startsWith('Technicien/') ;
    }

    return false;
  };

  return (
    <UserContext.Provider value={{ 
      userRole, 
      setUserRole, 
      isManager, 
      isFarmer,
      isTechnician,
      isPageVisible 
    }}>
      {children}
    </UserContext.Provider>
  );
};


