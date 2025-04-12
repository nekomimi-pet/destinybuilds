'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import pb from '@/lib/pocketbase';

type User = {
  id: string;
  email: string;
  username?: string;
  name?: string;
  avatar?: string;
} | null;

type AuthContextType = {
  user: User;
  isAuthenticated: boolean;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if we have auth data in PocketBase
    const authData = pb.authStore.model;
    
    if (authData) {
      setUser({
        id: authData.id,
        email: authData.email,
        username: authData.username,
        name: authData.name,
        avatar: authData.avatar,
      });
    }
    
    setIsLoading(false);
    
    // Listen for auth state changes
    pb.authStore.onChange(() => {
      const authData = pb.authStore.model;
      
      if (authData) {
        setUser({
          id: authData.id,
          email: authData.email,
          username: authData.username,
          name: authData.name,
          avatar: authData.avatar,
        });
      } else {
        setUser(null);
      }
    });
  }, []);

  // Sync client-side auth with server-side auth from cookie
  useEffect(() => {
    const syncAuth = async () => {
      try {
        const res = await fetch('/api/auth/sync');
        const data = await res.json();
        
        if (data.token) {
          pb.authStore.save(data.token, data.model);
        } else {
          pb.authStore.clear();
        }
      } catch (error) {
        console.error('Error syncing auth:', error);
      }
    };
    
    syncAuth();
  }, [pathname]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
} 