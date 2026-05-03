import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

export interface ListingSummary {
  id: string;
  title: string;
  category: string | null;
  city: string | null;
  priceMin: number | null;
  priceMax: number | null;
  currency: string;
  unit: string | null;
  imageUrl?: string | null;
  orgName?: string | null;
}

interface FavoritesContextType {
  favorites: ListingSummary[];
  addToFavorites: (listing: ListingSummary) => Promise<void>;
  removeFromFavorites: (listingId: string) => Promise<void>;
  isFavorite: (listingId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { supabaseUser } = useAuth();
  const [favorites, setFavorites] = useState<ListingSummary[]>(() => {
    try {
      const saved = localStorage.getItem('favorites');
      return saved ? (JSON.parse(saved) as ListingSummary[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    let cancelled = false;

    async function loadDbFavorites() {
      if (!supabaseUser) return;

      const { data, error } = await supabase
        .from('favorites')
        .select('listing_id, listings(id, title, category, city, price_min, price_max, currency, unit, organizations(name), listing_images(storage_path, sort_order))')
        .order('created_at', { ascending: false });

      if (cancelled) return;
      if (error) return;

      const mapped: ListingSummary[] = [];
      type FavoriteRow = {
        listings: {
          id: string;
          title: string;
          category: string | null;
          city: string | null;
          price_min: number | null;
          price_max: number | null;
          currency: string | null;
          unit: string | null;
          organizations?: { name?: string | null } | null;
          listing_images?: { storage_path: string; sort_order: number }[] | null;
        } | null;
      };

      for (const row of (data ?? []) as unknown as FavoriteRow[]) {
        const listing = row.listings;
        if (!listing) continue;
        const images = listing.listing_images ?? [];
        const first = images.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0];
        const imageUrl = first?.storage_path
          ? supabase.storage.from('listing-images').getPublicUrl(first.storage_path).data.publicUrl
          : null;
        mapped.push({
          id: listing.id,
          title: listing.title,
          category: listing.category ?? null,
          city: listing.city ?? null,
          priceMin: listing.price_min ?? null,
          priceMax: listing.price_max ?? null,
          currency: listing.currency ?? 'SAR',
          unit: listing.unit ?? null,
          imageUrl,
          orgName: listing.organizations?.name ?? null,
        });
      }

      setFavorites(mapped);
    }

    void loadDbFavorites();
    return () => {
      cancelled = true;
    };
  }, [supabaseUser]);

  const addToFavorites = useCallback(async (listing: ListingSummary) => {
    setFavorites((prev) => (prev.some((p) => p.id === listing.id) ? prev : [listing, ...prev]));
    if (supabaseUser) {
      await supabase.from('favorites').insert({ user_id: supabaseUser.id, listing_id: listing.id });
    }
  }, [supabaseUser]);

  const removeFromFavorites = useCallback(async (listingId: string) => {
    setFavorites((prev) => prev.filter((p) => p.id !== listingId));
    if (supabaseUser) {
      await supabase.from('favorites').delete().eq('user_id', supabaseUser.id).eq('listing_id', listingId);
    }
  }, [supabaseUser]);

  const value = useMemo<FavoritesContextType>(() => {
    return {
      favorites,
      addToFavorites,
      removeFromFavorites,
      isFavorite: (listingId) => favorites.some((p) => p.id === listingId),
    };
  }, [addToFavorites, favorites, removeFromFavorites]);

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
