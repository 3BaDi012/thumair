import { supabase } from './supabaseClient';

export const AVATAR_BUCKET = 'avatars';

export function avatarPublicUrl(path: string): string {
  return supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path).data.publicUrl;
}

export async function uploadAvatar(params: {
  userId: string;
  file: File;
}): Promise<{ storagePath: string; publicUrl: string }> {
  const ext = (params.file.name.split('.').pop() || 'jpg').toLowerCase();
  const safeExt = ext.length > 10 ? 'jpg' : ext;
  const fileName = `${crypto.randomUUID()}.${safeExt}`;
  const storagePath = `${params.userId}/${fileName}`;

  const { error } = await supabase.storage.from(AVATAR_BUCKET).upload(storagePath, params.file, {
    upsert: true,
    cacheControl: '3600',
    contentType: params.file.type || undefined,
  });
  if (error) throw error;

  const publicUrl = avatarPublicUrl(storagePath);
  return { storagePath, publicUrl };
}

