import React, { createContext, useContext, useState } from 'react';

const LoginDataContext = createContext();

export const useLoginData = () => useContext(LoginDataContext);

export const LoginDataProvider = ({ children }) => {
  const [loginData, setLoginData] = useState({
    UserName: "",
    Password: "",
  });

  return (
    <LoginDataContext.Provider value={{ loginData, setLoginData }}>
      {children}
    </LoginDataContext.Provider>
  );
};