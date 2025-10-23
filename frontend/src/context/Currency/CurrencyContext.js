import React, { createContext, useContext, useState, useEffect } from "react";
import useCurrency from "../../hooks/useCurrency";
import { socketManager } from "../Socket/SocketContext";
import { AuthContext } from "../Auth/AuthContext";

const CurrencyContext = createContext();

const CurrencyProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const currencyHook = useCurrency();
  const [globalCurrency, setGlobalCurrency] = useState(null);

  useEffect(() => {
    const initializeCurrency = async () => {
      try {
        const currency = await currencyHook.getCurrency();
        setGlobalCurrency(currency);
      } catch (err) {
        console.error("Error initializing currency:", err);
      }
    };

    initializeCurrency();
  }, []);

  useEffect(() => {
    if (!user?.companyId) return;

    const socket = socketManager.GetSocket();

    const handleCurrencyUpdate = (data) => {
      if (data.action === "currency-update") {
        setGlobalCurrency(data.currency);
        currencyHook.clearCache();
      }
    };

    socket.on(`company-${user.companyId}-currency`, handleCurrencyUpdate);

    return () => {
      socket.off(`company-${user.companyId}-currency`, handleCurrencyUpdate);
    };
  }, [user?.companyId, currencyHook]);

  const updateCurrency = async (currencyCode) => {
    try {
      const newCurrency = await currencyHook.updateCurrency(currencyCode);
      setGlobalCurrency(newCurrency);
      return newCurrency;
    } catch (err) {
      throw err;
    }
  };

  const formatCurrency = (value) => {
    return currencyHook.formatCurrency(value, globalCurrency);
  };

  const value = {
    currency: globalCurrency,
    loading: currencyHook.loading,
    updateCurrency,
    formatCurrency,
    getAvailableCurrencies: currencyHook.getAvailableCurrencies,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

const useCurrencyContext = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrencyContext must be used within a CurrencyProvider");
  }
  return context;
};

export { CurrencyContext, CurrencyProvider, useCurrencyContext };