// Request account deletion - PDPL Right to Erasure / Article 16
// Endpoint: POST /user-delete
// Auth: Bearer token required
// Note: Implements 7-day grace period before permanent deletion

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

interface DeleteRequest {
  confirm: boolean;
  reason?: string;
}

interface DeleteResponse {
  success: boolean;
  message: string;
  deletion_scheduled_for?: string;
  grace_period_days?: number;
  cancel_until?: string;
}

serve(async (req: Request): Promise<Response> => {
  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // ============================================
    // 1. VERIFY AUTHORIZATION
    // ============================================
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ============================================
    // 2. PARSE REQUEST BODY
    // ============================================
    let deleteRequest: DeleteRequest;
    try {
      deleteRequest = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // User must explicitly confirm deletion
    if (!deleteRequest.confirm) {
      return new Response(
        JSON.stringify({
          error: 'Deletion must be confirmed with confirm: true',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ============================================
    // 3. INITIALIZE SUPABASE
    // ============================================
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // ============================================
    // 4. VERIFY JWT TOKEN
    // ============================================
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const userId = user.id;

    // ============================================
    // 5. CHECK FOR EXISTING DELETION REQUEST
    // ============================================
    const { data: existingDeletion } = await supabase
      .from('deletion_queue')
      .select('id, scheduled_for')
      .eq('user_id', userId)
      .eq('data_type', 'full_account')
      .eq('status', 'pending')
      .single();

    if (existingDeletion) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Account deletion already scheduled',
          deletion_scheduled_for: existingDeletion.scheduled_for,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ============================================
    // 6. LOG DELETION REQUEST
    // ============================================
    const { error: auditError } = await supabase
      .from('deleted_data_log')
      .insert({
        user_id: userId,
        data_type: 'full_account',
        deletion_reason: deleteRequest.reason || 'user_requested',
        deleted_by_user: true,
      });

    if (auditError) {
      console.warn('Failed to log deletion request:', auditError.message);
    }

    // ============================================
    // 7. SCHEDULE DELETION (7-day grace period)
    // ============================================
    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + 7); // 7 days from now

    const { error: deleteQueueError } = await supabase
      .from('deletion_queue')
      .insert({
        user_id: userId,
        data_type: 'full_account',
        scheduled_for: scheduledDate.toISOString(),
        reason: deleteRequest.reason || 'user_requested',
        status: 'pending',
      });

    if (deleteQueueError) {
      return new Response(
        JSON.stringify({
          error: 'Failed to schedule deletion',
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ============================================
    // 8. LOG ACTION IN AUDIT LOGS
    // ============================================
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action: 'account_deletion_requested',
      resource_type: 'user_account',
      status: 'success',
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: req.headers.get('user-agent') || 'unknown',
    });

    // ============================================
    // 9. SEND CONFIRMATION RESPONSE
    // ============================================
    const cancelUntil = new Date();
    cancelUntil.setDate(cancelUntil.getDate() + 6); // 6 days - leave 1 day to execute

    const response: DeleteResponse = {
      success: true,
      message: 'Account deletion scheduled. You have 7 days to cancel this request.',
      deletion_scheduled_for: scheduledDate.toISOString(),
      grace_period_days: 7,
      cancel_until: cancelUntil.toISOString(),
    };

    return new Response(
      JSON.stringify(response),
      {
        status: 202,  // Accepted - but not completed
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Deletion error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return new Response(
      JSON.stringify({
        error: 'Internal server error during deletion scheduling',
        details: Deno.env.get('ENVIRONMENT') === 'development' ? errorMessage : undefined,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});

/*
USAGE - REQUEST DELETION:

  curl -X POST \
    -H "Authorization: Bearer YOUR_JWT_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"confirm": true, "reason": "Leaving the platform"}' \
    https://your-project.supabase.co/functions/v1/user-delete

RESPONSE (on success):

  HTTP 202 Accepted
  {
    "success": true,
    "message": "Account deletion scheduled. You have 7 days to cancel this request.",
    "deletion_scheduled_for": "2026-11-21T10:30:00.000Z",
    "grace_period_days": 7,
    "cancel_until": "2026-11-20T10:30:00.000Z"
  }

ERROR RESPONSES:

  HTTP 400 - Bad Request
  { "error": "Deletion must be confirmed with confirm: true" }

  HTTP 400 - Deletion Already Scheduled
  {
    "success": false,
    "message": "Account deletion already scheduled",
    "deletion_scheduled_for": "2026-11-21T10:30:00.000Z"
  }

  HTTP 401 - Unauthorized
  { "error": "Invalid or expired token" }

  HTTP 405 - Method Not Allowed
  { "error": "Method not allowed" }

  HTTP 500 - Server Error
  { "error": "Internal server error during deletion scheduling" }

GRACE PERIOD:

  - User has 7 days to cancel the deletion request
  - After 7 days, the account is permanently deleted
  - User data is included in exported backup for 30 days
  - After 30 days total, backup is also deleted

WHAT GETS DELETED:

  1. User profile and authentication record
  2. All projects and content
  3. Financial documents and transaction history
  4. Consent records
  5. Most audit logs (older than 2 years are already gone)
  6. Session data
  7. Backups after 30 days

WHAT IS KEPT FOR LEGAL REASONS:

  1. Deletion records (proof of compliance)
  2. Recent audit logs (for 2 years)
  3. Older tax documents (7 years per law)
*/
