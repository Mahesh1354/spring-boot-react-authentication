import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { AppConstants } from "../util/constants";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const backendUrl = AppConstants.BACKEND_URL;

  const [userData, setUserData] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Axios default config (important)
  axios.defaults.withCredentials = true;

  // Check authentication status
  const checkAuth = async () => {
    try {
      const res = await axios.get(`${backendUrl}/is-authenticated`);
      setIsLoggedIn(res.data === true);
    } catch {
      setIsLoggedIn(false);
      setUserData(null);
    }
  };

  // Fetch logged-in user profile
  const getUserData = async () => {
    try {
      const res = await axios.get(`${backendUrl}/profile`);
      setUserData(res.data);
    } catch {
      setUserData(null);
      setIsLoggedIn(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      await axios.post(`${backendUrl}/logout`);
    } catch (err) {
      console.error(err);
    } finally {
      setUserData(null);
      setIsLoggedIn(false);
    }
  };

  // On app load
  useEffect(() => {
    checkAuth();
    getUserData();
  }, []);

  const contextValue = {
    backendUrl,
    userData,
    isLoggedIn,
    getUserData,
    logout,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};
