import { createContext, useContext, ReactNode } from 'react';

// Create an empty context since we're not using WebSockets
const SocketContext = createContext<null>(null);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  return (
    <SocketContext.Provider value={null}>
      {children}
    </SocketContext.Provider>
  );
};

// Keep the hook for compatibility but make it a no-op
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return { socket: null, connected: false };
};