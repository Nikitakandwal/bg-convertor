import React, { createContext, useState } from 'react';
import { login, register } from '../utils/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const handleLogin = async (email, password) => {
    try {
      const user = await login(email, password);
      setUser(user); 
    } catch (error) {
      console.error('Login failed:', error.message);
    }
  };

  const handleRegister = async (email, password) => {
    try {
      const user = await register(email, password);
      setUser(user);  
    } catch (error) {
      console.error('Registration failed:', error.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login: handleLogin, register: handleRegister }}>
      {children}
    </AuthContext.Provider>
  );
};