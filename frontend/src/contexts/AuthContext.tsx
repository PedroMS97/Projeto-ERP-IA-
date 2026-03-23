import { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  companyId: string;
}

interface AuthContextType {
  user: User | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// sessionStorage: não persiste entre abas/sessões (mais seguro que localStorage).
// O token de acesso tem validade curta (15min); o refresh token fica em cookie httpOnly.
function readSession(): { user: User | null } {
  try {
    const storedUser = sessionStorage.getItem('user');
    const token = sessionStorage.getItem('token');
    if (!storedUser || !token) return { user: null };

    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp * 1000 < Date.now()) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      return { user: null };
    }

    return { user: JSON.parse(storedUser) as User };
  } catch {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    return { user: null };
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const { user: restoredUser } = readSession();
    if (restoredUser) setUser(restoredUser);
  }, []);

  const login = (token: string, userData: User) => {
    // Armazena apenas dados não-sensíveis; token fica em sessionStorage (não persiste ao fechar aba)
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};