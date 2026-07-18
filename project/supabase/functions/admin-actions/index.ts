// Server-side home for every operation that previously required the Supabase
// service-role key inside the browser bundle (VITE_SUPABASE_SERVICE_ROLE_KEY).
// The service-role key lives only here, as the SUPABASE_SERVICE_ROLE_KEY
// secret injected by the Supabase platform at deploy time — it is never
// read via import.meta.env / VITE_* and therefore never ships to a browser.
//
// Every privileged action re-derives "who is calling" from the verified
// caller JWT (supabase.auth.getUser(jwt)), never from a client-supplied
// parameter. This closes the approve_user() RPC bypass where a caller could
// previously pass ANY super_admin's UUID as p_approved_by.

import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') ?? '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Identify the caller from their JWT. This is the only source of truth
  // for "who is making this request" — request bodies are never trusted
  // for identity.
  const authHeader = req.headers.get('Authorization') ?? '';
  const jwt = authHeader.replace(/^Bearer\s+/i, '');
  if (!jwt) {
    return json({ error: 'Missing Authorization header' }, 401);
  }

  const { data: callerData, error: callerError } = await admin.auth.getUser(jwt);
  if (callerError || !callerData?.user) {
    return json({ error: 'Invalid or expired session' }, 401);
  }
  const caller = callerData.user;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }
  const action = body.action as string | undefined;
  if (!action) {
    return json({ error: 'Missing action' }, 400);
  }

  const { data: callerProfile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', caller.id)
    .single();

  const requireSuperAdmin = () => callerProfile?.role === 'super_admin';

  try {
    switch (action) {
      // Self-service cleanup: a user who just failed to create their own
      // profile row is allowed to delete their own just-created auth
      // account, and only their own.
      case 'cleanupOwnRegistration': {
        const userId = body.userId as string;
        if (userId !== caller.id) {
          return json({ error: 'You may only clean up your own account' }, 403);
        }
        const { error } = await admin.auth.admin.deleteUser(userId);
        if (error) return json({ error: error.message }, 400);
        return json({ success: true });
      }

      case 'approveUser': {
        if (!requireSuperAdmin()) return json({ error: 'Unauthorized: super admin access required' }, 403);
        const userId = body.userId as string;
        const approved = body.approved as boolean;
        const rejectionReason = (body.rejectionReason as string | undefined) ?? null;

        const { error } = await admin
          .from('profiles')
          .update({
            approval_status: approved ? 'approved' : 'rejected',
            approved_by: caller.id,
            approved_at: new Date().toISOString(),
            rejection_reason: approved ? null : rejectionReason,
          })
          .eq('id', userId);

        if (error) return json({ error: error.message }, 400);
        return json({ success: true });
      }

      case 'approveStudentRegistration': {
        if (!requireSuperAdmin()) return json({ error: 'Unauthorized: super admin access required' }, 403);
        const profileId = body.profileId as string;

        const { data: pendingProfile, error: fetchError } = await admin
          .from('profiles')
          .select('*')
          .eq('id', profileId)
          .eq('approval_status', 'pending')
          .single();
        if (fetchError || !pendingProfile) {
          return json({ error: 'Pending registration not found' }, 404);
        }

        const { error: confirmError } = await admin.auth.admin.updateUserById(profileId, { email_confirm: true });
        if (confirmError) return json({ error: `Failed to confirm auth account: ${confirmError.message}` }, 400);

        const { error: updateError } = await admin
          .from('profiles')
          .update({ approval_status: 'approved', approved_by: caller.id, approved_at: new Date().toISOString() })
          .eq('id', profileId);
        if (updateError) return json({ error: `Failed to update profile: ${updateError.message}` }, 400);

        return json({ success: true });
      }

      case 'createTeacher': {
        if (!requireSuperAdmin()) return json({ error: 'Unauthorized: super admin access required' }, 403);
        const { name, email, password, faculty_id, department, bio, phone_number } = body as {
          name: string; email: string; password: string; faculty_id: string; department: string;
          bio?: string; phone_number?: string;
        };

        const { data: newUser, error: createUserError } = await admin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { name, role: 'teacher' },
        });
        if (createUserError || !newUser.user) {
          return json({ error: createUserError?.message ?? 'Failed to create teacher user account' }, 400);
        }

        const { error: profileError } = await admin.from('profiles').insert([{
          id: newUser.user.id,
          name,
          email,
          role: 'teacher',
          faculty_id,
          department,
          bio,
          phone_number,
          auth_provider: 'email',
          requires_password_change: true,
          approval_status: 'approved',
          approved_by: caller.id,
          approved_at: new Date().toISOString(),
        }]);

        if (profileError) {
          await admin.auth.admin.deleteUser(newUser.user.id);
          return json({ error: profileError.message }, 400);
        }

        return json({ success: true, teacherId: newUser.user.id });
      }

      case 'updateUserStatus': {
        if (!requireSuperAdmin()) return json({ error: 'Unauthorized: super admin access required' }, 403);
        const userId = body.userId as string;
        const active = body.active as boolean;
        const { error } = await admin.auth.admin.updateUserById(userId, {
          ban_duration: active ? 'none' : '876000h',
        });
        if (error) return json({ error: error.message }, 400);
        return json({ success: true });
      }

      case 'deleteUser': {
        if (!requireSuperAdmin()) return json({ error: 'Unauthorized: super admin access required' }, 403);
        const userId = body.userId as string;
        const { error } = await admin.auth.admin.deleteUser(userId);
        if (error) return json({ error: error.message }, 400);
        return json({ success: true });
      }

      default:
        return json({ error: `Unknown action: ${action}` }, 400);
    }
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Internal error' }, 500);
  }
});
