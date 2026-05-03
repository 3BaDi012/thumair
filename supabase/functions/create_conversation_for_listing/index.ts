import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { corsHeadersForRequest } from '../_shared/cors.ts';
import { checkRateLimit, clientKeyFromRequest } from '../_shared/rateLimit.ts';

type Body = {
  listingId: string;
};

type ParticipantRow = { user_id: string; role: string };

type ConversationWithParticipants = {
  id: string;
  conversation_participants: ParticipantRow[] | null;
};

Deno.serve(async (req) => {
  const cors = corsHeadersForRequest(req);
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization') ?? '';

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    if (!userData.user.email_confirmed_at) {
      return new Response(JSON.stringify({ error: 'EMAIL_VERIFICATION_REQUIRED' }), {
        status: 403,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    const rlOk = await checkRateLimit(admin, {
      bucket: 'create_conversation_for_listing',
      key: clientKeyFromRequest(req, userData.user.id),
      max: 120,
      windowSec: 3600,
    });
    if (!rlOk) {
      return new Response(JSON.stringify({ error: 'Too many requests' }), {
        status: 429,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    const { listingId } = (await req.json()) as Body;
    if (!listingId) {
      return new Response(JSON.stringify({ error: 'Missing listingId' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    const { data: listing, error: listingError } = await admin
      .from('listings')
      .select('id, org_id')
      .eq('id', listingId)
      .maybeSingle();

    if (listingError || !listing) {
      return new Response(JSON.stringify({ error: 'Listing not found' }), {
        status: 404,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    const { data: sellerMember, error: sellerError } = await admin
      .from('organization_members')
      .select('user_id')
      .eq('org_id', listing.org_id)
      .in('role', ['owner', 'manager'])
      .limit(1)
      .maybeSingle();

    if (sellerError || !sellerMember) {
      return new Response(JSON.stringify({ error: 'Seller not available' }), {
        status: 409,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    const buyerUserId = userData.user.id;
    const sellerUserId = sellerMember.user_id as string;

    const { data: existing } = await admin
      .from('conversations')
      .select('id, conversation_participants(user_id, role)')
      .eq('listing_id', listingId);

    const rows = (existing ?? []) as ConversationWithParticipants[];
    const found = rows.find((c) => {
      const participants = c.conversation_participants ?? [];
      const hasBuyer = participants.some((p) => p.user_id === buyerUserId);
      const hasSeller = participants.some((p) => p.user_id === sellerUserId);
      return hasBuyer && hasSeller;
    });

    if (found) {
      return new Response(JSON.stringify({ conversationId: found.id }), {
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    const { data: convo, error: convoError } = await admin
      .from('conversations')
      .insert({ listing_id: listingId })
      .select('id')
      .single();

    if (convoError) throw convoError;

    const conversationId = convo.id as string;

    const { error: participantsError } = await admin.from('conversation_participants').insert([
      { conversation_id: conversationId, user_id: buyerUserId, role: 'buyer' },
      { conversation_id: conversationId, user_id: sellerUserId, role: 'seller' },
    ]);

    if (participantsError) throw participantsError;

    return new Response(JSON.stringify({ conversationId }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
});

