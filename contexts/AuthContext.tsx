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
      const mockRole = email.includes('admin') ? 'webmaster' : email.includes('vorstand') ? 'vorstand' : 'mitglied';
      const mockUser: User = {
        id: 1,
        email: email,
        first_name: 'Dev',
        last_name: mockRole === 'webmaster' ? 'Webmaster' : mockRole === 'vorstand' ? 'Vorstand' : 'Mitglied',
        is_admin: mockRole === 'webmaster',
        is_member: true,
        is_active: true,
        created_at: new Date().toISOString(),
        roles: mockRole === 'webmaster' 
          ? [{ id: '1', name: 'webmaster', upload_limit_mb: 100, priority: 100 }]
          : mockRole === 'vorstand'
          ? [{ id: '2', name: 'vorstand', upload_limit_mb: 50, priority: 50 }]
          : [{ id: '3', name: 'mitglied', upload_limit_mb: 5, priority: 10 }],
        permissions: mockRole === 'webmaster' 
          ? ['articles.create', 'articles.edit.all', 'members.edit', 'system.database', 'system.roles.manage']
          : mockRole === 'vorstand'
          ? ['articles.create', 'articles.edit.own', 'members.view.details', 'events.create']
          : ['articles.view', 'members.view', 'flugbuch.create'],
        maxUploadMb: mockRole === 'webmaster' ? 100 : mockRole === 'vorstand' ? 50 : 5
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
    if (!user) return false;
    // Check RBAC roles
    if (user.roles && user.roles.some(r => r.name === role)) return true;
    // Legacy check for old system
    return false;
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    // Old admin system compatibility
    if (user.is_admin) return true;
    // Check RBAC permissions
    return user.permissions?.includes(permission) || false;
  };

  // isAdmin: Legacy is_admin field OR webmaster role
  const isAdmin = user?.is_admin || hasRole('webmaster') || false;
  
  // isBoard: vorstand role OR admin
  const isBoard = hasRole('vorstand') || isAdmin || false;
  
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
