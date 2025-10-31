import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { login as apiLogin, logout as apiLogout, getCurrentUser, User } from '../lib/api/auth.service';
import { isAuthenticated, clearTokens } from '../lib/api-client';

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  isAdmin: boolean;
  isBoard: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // User beim Start laden (wenn Token vorhanden)
  useEffect(() => {
    const initAuth = async () => {
      // Zuerst versuchen, Dev-User aus localStorage zu laden
      const devUser = localStorage.getItem('dev_user');
      if (devUser) {
        try {
          setUser(JSON.parse(devUser));
          console.log('🔧 Development Mode: User aus localStorage wiederhergestellt');
          setIsLoading(false);
          return;
        } catch (error) {
          console.error('Fehler beim Parsen des Dev-Users:', error);
          localStorage.removeItem('dev_user');
        }
      }

      // Sonst normales Backend-Login prüfen
      if (isAuthenticated()) {
        try {
          const currentUser = await getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          console.error('Fehler beim Laden des Users:', error);
          clearTokens();
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    // Development Mode: Mock Login wenn "dev@" Email verwendet wird
    if (email.startsWith('dev@')) {
      const mockRole = email.includes('admin') ? 'admin' : email.includes('vorstand') ? 'board' : 'member';
      const mockUser: User = {
        id: 1,
        email: email,
        firstName: 'Dev',
        lastName: mockRole === 'admin' ? 'Admin' : mockRole === 'board' ? 'Vorstand' : 'Mitglied',
        roles: [mockRole],
        permissions: mockRole === 'admin' 
          ? ['manage_users', 'manage_articles', 'manage_events', 'manage_images', 'view_member_area']
          : mockRole === 'board'
          ? ['manage_articles', 'manage_events', 'manage_images', 'view_member_area']
          : ['view_member_area']
      };
      setUser(mockUser);
      // User in localStorage speichern für Persistenz
      localStorage.setItem('dev_user', JSON.stringify(mockUser));
      console.log('🔧 Development Mode: Mock Login als', mockRole);
      return;
    }

    try {
      const response = await apiLogin({ email, password });
      setUser(response.user);
    } catch (error) {
      console.error('Login fehlgeschlagen:', error);
      throw error;
    }
  };

  const logout = async () => {
    // Check if we're in dev mode
    const isDevMode = localStorage.getItem('dev_user') !== null;
    
    if (isDevMode) {
      console.log('🔧 Development Mode: Mock Logout');
    }
    
    // apiLogout kümmert sich jetzt selbst um Dev-Mode
    try {
      await apiLogout();
    } catch (error) {
      // Fehler nur loggen, Logout sollte immer funktionieren
      console.warn('Logout Warnung:', error);
    }
    
    // Always clean up
    localStorage.removeItem('dev_user');
    setUser(null);
  };

  const refreshUser = async () => {
    if (isAuthenticated()) {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Fehler beim Aktualisieren des Users:', error);
        clearTokens();
        setUser(null);
      }
    }
  };

  const hasRole = (role: string): boolean => {
    return user?.roles?.includes(role) || false;
  };

  const hasPermission = (permission: string): boolean => {
    return user?.permissions?.includes(permission) || false;
  };

  const isAdmin = hasRole('admin');
  const isBoard = hasRole('board') || isAdmin;
  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        isLoading,
        login,
        logout,
        refreshUser,
        hasRole,
        hasPermission,
        isAdmin,
        isBoard,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
