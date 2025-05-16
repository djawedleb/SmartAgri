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
  const [userRole, setUserRole] = useState(null); // null = manager, 'farmer' = farmer

  const isManager = () => userRole === null;
  const isFarmer = () => userRole === 'farmer';

  const isPageVisible = (pageName) => {
    // Manager can see everything
    if (isManager()) return true;

    // Farmer restrictions
    if (isFarmer()) {
      const hiddenPages = ['ManageUsers', 'Sensors'];
      return !hiddenPages.includes(pageName); //If the page is in hiddenPages → return false (hide the page)
      //If the page is NOT in hiddenPages → return true (show the page)
    }

    return false;
  };

  return (
    <UserContext.Provider value={{ 
      userRole, 
      setUserRole, 
      isManager, 
      isFarmer, 
      isPageVisible 
    }}>
      {children}
    </UserContext.Provider>
  );
};


