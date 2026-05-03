import { supabase } from './supabaseClient';

export const LISTING_IMAGES_BUCKET = 'listing-images';

export function publicUrlForListingImage(storagePath: string): string {
  const { data } = supabase.storage.from(LISTING_IMAGES_BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}
