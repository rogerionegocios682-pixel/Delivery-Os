import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, Store, StoreSettings } from '../types.ts';

interface AuthContextType {
  currentUser: UserProfile | null;
  currentStore: Store | null;
  settings: StoreSettings | null;
  availableProfiles: UserProfile[];
  availableStores: Store[];
  isMaster: boolean;
  masterTargetStoreId: string | null;
  loading: boolean;
  switchPersona: (email: string) => Promise<void>;
  accessStoreAsMaster: (storeId: string) => Promise<void>;
  exitMasterStoreContext: () => void;
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>;
  refreshContext: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [currentStore, setCurrentStore] = useState<Store | null>(null);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [availableProfiles, setAvailableProfiles] = useState<UserProfile[]>([]);
  const [availableStores, setAvailableStores] = useState<Store[]>([]);
  const [activeUserEmail, setActiveUserEmail] = useState<string>('rogerionegocios682@gmail.com');
  const [masterTargetStoreId, setMasterTargetStoreId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchWithAuth = useCallback(
    async (url: string, options: RequestInit = {}) => {
      const headers = new Headers(options.headers || {});
      headers.set('x-deliveryos-user-email', activeUserEmail);
      if (masterTargetStoreId) {
        headers.set('x-target-store-id', masterTargetStoreId);
      }
      if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
      }
      return fetch(url, { ...options, headers });
    },
    [activeUserEmail, masterTargetStoreId]
  );

  const loadSession = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchWithAuth('/api/me');
      if (!res.ok) throw new Error('Falha ao autenticar');
      const data = await res.json();
      setCurrentUser(data.user);
      setCurrentStore(data.store);
      setSettings(data.settings);
      setAvailableProfiles(data.availableProfiles || []);
      setAvailableStores(data.availableStores || []);
    } catch (err) {
      console.error('Session load error:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const switchPersona = async (email: string) => {
    setActiveUserEmail(email);
    setMasterTargetStoreId(null);
  };

  const accessStoreAsMaster = async (storeId: string) => {
    try {
      const res = await fetchWithAuth('/api/master/access-store', {
        method: 'POST',
        body: JSON.stringify({ storeId }),
      });
      if (res.ok) {
        setMasterTargetStoreId(storeId);
      }
    } catch (e) {
      console.error('Error switching store as master:', e);
    }
  };

  const exitMasterStoreContext = () => {
    setMasterTargetStoreId(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentStore,
        settings,
        availableProfiles,
        availableStores,
        isMaster: currentUser?.role === 'MASTER',
        masterTargetStoreId,
        loading,
        switchPersona,
        accessStoreAsMaster,
        exitMasterStoreContext,
        fetchWithAuth,
        refreshContext: loadSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
