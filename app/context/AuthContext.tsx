import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

export type UserRole = 'user' | 'admin' | 'super_admin';
export type UserStatus = 'active' | 'suspended' | 'banned';
export type UserType = 'buyer' | 'farmer' | 'supplier';

export interface AppUser {
  id: string;
  email: string;
  name: string;
  locale: 'ar' | 'en';
  userType?: UserType;
  role: UserRole;
  status: UserStatus;
  image?: string;
}

interface AuthContextType {
  user: AppUser | null;
  supabaseUser: SupabaseUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  signInWithPassword: (params: { email: string; password: string }) => Promise<void>;
  signUp: (params: {
    email: string;
    password: string;
    displayName: string;
    phone?: string;
    locale?: 'ar' | 'en';
    userType?: UserType;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function boot() {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSupabaseUser(data.session?.user ?? null);
    }

    void boot();

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      setSupabaseUser(session?.user ?? null);
      if (event === 'SIGNED_IN' && session?.user) {
        void supabase.from('login_events').insert({
          user_id: session.user.id,
          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
        });
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function loadProfile(sUser: SupabaseUser | null): Promise<void> {
    if (!sUser) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, locale, user_type, role, status')
      .eq('id', sUser.id)
      .maybeSingle();

    if (error || !data) {
      setUser({
        id: sUser.id,
        email: sUser.email ?? '',
        name: sUser.email ?? 'User',
        locale: 'ar',
        role: 'user',
        status: 'active',
      });
      setIsLoading(false);
      return;
    }

    // Force sign-out if banned
    if (data.status === 'banned') {
      await supabase.auth.signOut();
      setUser(null);
      setIsLoading(false);
      return;
    }

    setUser({
      id: sUser.id,
      email: sUser.email ?? '',
      name: data.display_name ?? sUser.email ?? 'User',
      locale: (data.locale === 'en' ? 'en' : 'ar') as 'ar' | 'en',
      userType: (data.user_type ?? undefined) as UserType | undefined,
      role: (data.role ?? 'user') as UserRole,
      status: (data.status ?? 'active') as UserStatus,
    });
    setIsLoading(false);
  }

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    void (async () => {
      if (cancelled) return;
      await loadProfile(supabaseUser);
    })();
    return () => {
      cancelled = true;
    };
  }, [supabaseUser]);

  const value = useMemo<AuthContextType>(() => {
    return {
      user,
      supabaseUser,
      isAuthenticated: !!supabaseUser,
      isAdmin: user?.role === 'admin' || user?.role === 'super_admin',
      isLoading,
      signInWithPassword: async ({ email, password }) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      },
      signUp: async ({ email, password, displayName, phone, locale, userType }) => {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        if (data.user) {
          const { error: profileError } = await supabase.from('profiles').insert({
            id: data.user.id,
            display_name: displayName,
            phone: phone ?? null,
            locale: locale ?? 'ar',
            user_type: userType ?? null,
          });
          if (profileError) throw profileError;
        }
      },
      signOut: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      },
      logout: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      },
      refreshProfile: async () => {
        await loadProfile(supabaseUser);
      },
    };
  }, [supabaseUser, user, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
