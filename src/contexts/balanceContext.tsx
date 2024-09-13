import React, { createContext, useState, useContext, ReactNode } from 'react';

interface BalanceContextType {
  balance: number;
  addToBalance: (amount: number) => void;
}

const BalanceContext = createContext<BalanceContextType | undefined>(undefined);

export const BalanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [balance, setBalance] = useState(0);

  const addToBalance = (amount: number) => {
    setBalance((prevBalance) => prevBalance + amount);
    // Здесь в будущем можно добавить логику для обновления баланса на бэкенде
  };

  return (
    <BalanceContext.Provider value={{ balance, addToBalance }}>
      {children}
    </BalanceContext.Provider>
  );
};

export const useBalance = () => {
  const context = useContext(BalanceContext);
  if (context === undefined) {
    throw new Error('useBalance must be used within a BalanceProvider');
  }
  return context;
};