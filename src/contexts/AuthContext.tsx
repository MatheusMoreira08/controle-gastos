import {
  createContext, useContext, useState, useEffect, ReactNode
} from 'react';
import {
  User, signInWithEmailAndPassword, signOut,
  onAuthStateChanged, AuthError
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { AppUser, Owner } from '../types';

function buildAppUser(fbUser: User): AppUser {
  const email = fbUser.email?.toLowerCase() ?? '';
  const matheusConfig = import.meta.env.VITE_USER_MATHEUS_EMAIL?.toLowerCase();
  const vitoriaConfig = import.meta.env.VITE_USER_VITORIA_EMAIL?.toLowerCase();

  // 1. Verificação por variáveis de ambiente
  if (matheusConfig && email === matheusConfig) {
    return {
      uid: fbUser.uid,
      email: fbUser.email ?? '',
      displayName: 'Matheus',
      owner: 'matheus',
    };
  }

  if (vitoriaConfig && email === vitoriaConfig) {
    return {
      uid: fbUser.uid,
      email: fbUser.email ?? '',
      displayName: 'Vitória',
      owner: 'vitoria',
    };
  }

  // 2. Fallback inteligente baseado no email cadastrado
  if (email.includes('vitoria') || email.includes('vitória')) {
    return {
      uid: fbUser.uid,
      email: fbUser.email ?? '',
      displayName: 'Vitória',
      owner: 'vitoria',
    };
  }

  // Padrão para o usuário principal (Matheus)
  return {
    uid: fbUser.uid,
    email: fbUser.email ?? '',
    displayName: 'Matheus',
    owner: 'matheus',
  };
}

// ============================================================

interface AuthContextValue {
  user: AppUser | null;
  fbUser: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [fbUser, setFbUser] = useState<User | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setFbUser(firebaseUser);
      setUser(firebaseUser ? buildAppUser(firebaseUser) : null);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      const authErr = err as AuthError;
      switch (authErr.code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
          setError('Email ou senha incorretos.');
          break;
        case 'auth/invalid-email':
          setError('Formato de email inválido.');
          break;
        case 'auth/too-many-requests':
          setError('Muitas tentativas. Aguarde alguns minutos.');
          break;
        default:
          setError('Erro ao fazer login. Tente novamente.');
      }
      throw err;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, fbUser, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
