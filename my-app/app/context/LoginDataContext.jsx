import React, { createContext, useContext, useState } from 'react';

const LoginDataContext = createContext(); //creates a React Context to share login data across components (parent and grandchildren)

export const useLoginData = () => useContext(LoginDataContext); //a hook that makes it easy to access the context

//children represents any components that will be wrapped by this provider
export const LoginDataProvider = ({ children }) => { 
  const [loginData, setLoginData] = useState({
    UserName: "",
    Password: "",
  });

  /*The context holds two pieces of data:
loginData: The current login state (username and password)
setLoginData: A function to update the login state
 */
//a special component that "provides" the context data to all its children
  return (
    <LoginDataContext.Provider value={{ loginData, setLoginData }}>
      {children}
    </LoginDataContext.Provider>
  );
};