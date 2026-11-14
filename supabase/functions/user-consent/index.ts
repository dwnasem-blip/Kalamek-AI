// Manage user consent - PDPL Article 18 (Right to object)
// Endpoint: POST /user-consent
// Auth: Bearer token required
// Methods: grant, revoke, get

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

interface ConsentRequest {
  method: 'grant' | 'revoke' | 'get';
  consent_type?: 'service_terms' | 'data_collection' | 'openai_vision' | 'analytics' | 'marketing_email' | 'child_parental';
}

interface ConsentRecord {
  consent_type: string;
  granted: boolean;
  given_at: string;
  revoked_at: string | null;
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
    let consentRequest: ConsentRequest;
    try {
      consentRequest = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate method
    if (!['grant', 'revoke', 'get'].includes(consentRequest.method)) {
      return new Response(
        JSON.stringify({ error: 'Invalid method. Use: grant, revoke, or get' }),
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
    // 5. HANDLE 'GET' METHOD
    // ============================================
    if (consentRequest.method === 'get') {
      const { data: consents, error: getError } = await supabase
        .from('consent_records')
        .select('consent_type, granted, given_at, revoked_at')
        .eq('user_id', userId)
        .order('given_at', { ascending: false });

      if (getError) {
        return new Response(
          JSON.stringify({ error: 'Failed to retrieve consents' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          consents: consents || [],
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // ============================================
    // 6. VALIDATE CONSENT TYPE FOR GRANT/REVOKE
    // ============================================
    if (!consentRequest.consent_type) {
      return new Response(
        JSON.stringify({ error: 'consent_type is required for grant/revoke' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const validTypes = ['service_terms', 'data_collection', 'openai_vision', 'analytics', 'marketing_email', 'child_parental'];
    if (!validTypes.includes(consentRequest.consent_type)) {
      return new Response(
        JSON.stringify({ error: `Invalid consent_type. Must be one of: ${validTypes.join(', ')}` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ============================================
    // 7. HANDLE 'GRANT' METHOD
    // ============================================
    if (consentRequest.method === 'grant') {
      const { data: existingConsent } = await supabase
        .from('consent_records')
        .select('id, granted')
        .eq('user_id', userId)
        .eq('consent_type', consentRequest.consent_type)
        .single();

      let consentId: string;

      if (existingConsent && !existingConsent.granted) {
        // Update existing record
        const { data: updateData, error: updateError } = await supabase
          .from('consent_records')
          .update({
            granted: true,
            revoked_at: null,
            given_at: new Date().toISOString(),
          })
          .eq('id', existingConsent.id)
          .select('id')
          .single();

        if (updateError) {
          return new Response(
            JSON.stringify({ error: 'Failed to grant consent' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          );
        }

        consentId = updateData.id;
      } else if (!existingConsent) {
        // Create new record
        const { data: createData, error: createError } = await supabase
          .from('consent_records')
          .insert({
            user_id: userId,
            consent_type: consentRequest.consent_type,
            granted: true,
            ip_address: req.headers.get('x-forwarded-for') || 'unknown',
            user_agent: req.headers.get('user-agent') || 'unknown',
          })
          .select('id')
          .single();

        if (createError) {
          return new Response(
            JSON.stringify({ error: 'Failed to grant consent' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          );
        }

        consentId = createData.id;
      } else {
        // Already granted
        return new Response(
          JSON.stringify({
            success: true,
            message: 'Consent already granted',
            consent_type: consentRequest.consent_type,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Log consent grant
      await supabase.from('audit_logs').insert({
        user_id: userId,
        action: 'consent_granted',
        resource_type: 'consent_records',
        resource_id: consentId,
        status: 'success',
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: `Consent granted for: ${consentRequest.consent_type}`,
          consent_type: consentRequest.consent_type,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ============================================
    // 8. HANDLE 'REVOKE' METHOD
    // ============================================
    if (consentRequest.method === 'revoke') {
      // Cannot revoke mandatory consent
      if (consentRequest.consent_type === 'service_terms') {
        return new Response(
          JSON.stringify({
            error: 'service_terms consent is mandatory and cannot be revoked',
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const { data: updateData, error: revokeError } = await supabase
        .from('consent_records')
        .update({
          granted: false,
          revoked_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('consent_type', consentRequest.consent_type)
        .select('id')
        .single();

      if (revokeError) {
        return new Response(
          JSON.stringify({ error: 'Failed to revoke consent' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Log consent revocation
      await supabase.from('audit_logs').insert({
        user_id: userId,
        action: 'consent_revoked',
        resource_type: 'consent_records',
        status: 'success',
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: `Consent revoked for: ${consentRequest.consent_type}`,
          consent_type: consentRequest.consent_type,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Should not reach here, but just in case
    return new Response(
      JSON.stringify({ error: 'Invalid request' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Consent error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: Deno.env.get('ENVIRONMENT') === 'development' ? errorMessage : undefined,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

/*
USAGE - GET CONSENTS:

  curl -X POST \
    -H "Authorization: Bearer YOUR_JWT_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"method": "get"}' \
    https://your-project.supabase.co/functions/v1/user-consent

RESPONSE:

  HTTP 200
  {
    "success": true,
    "consents": [
      {
        "consent_type": "service_terms",
        "granted": true,
        "given_at": "2026-11-14T10:30:00Z",
        "revoked_at": null
      },
      {
        "consent_type": "data_collection",
        "granted": false,
        "given_at": null,
        "revoked_at": null
      },
      ...
    ]
  }

USAGE - GRANT CONSENT:

  curl -X POST \
    -H "Authorization: Bearer YOUR_JWT_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"method": "grant", "consent_type": "openai_vision"}' \
    https://your-project.supabase.co/functions/v1/user-consent

RESPONSE:

  HTTP 200
  {
    "success": true,
    "message": "Consent granted for: openai_vision",
    "consent_type": "openai_vision"
  }

USAGE - REVOKE CONSENT:

  curl -X POST \
    -H "Authorization: Bearer YOUR_JWT_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"method": "revoke", "consent_type": "analytics"}' \
    https://your-project.supabase.co/functions/v1/user-consent

RESPONSE:

  HTTP 200
  {
    "success": true,
    "message": "Consent revoked for: analytics",
    "consent_type": "analytics"
  }

ERROR RESPONSES:

  HTTP 400 - Bad Request
  { "error": "Invalid JSON in request body" }

  HTTP 400 - Invalid Method
  { "error": "Invalid method. Use: grant, revoke, or get" }

  HTTP 400 - Cannot Revoke Mandatory
  { "error": "service_terms consent is mandatory and cannot be revoked" }

  HTTP 401 - Unauthorized
  { "error": "Invalid or expired token" }

  HTTP 405 - Method Not Allowed
  { "error": "Method not allowed" }

  HTTP 500 - Server Error
  { "error": "Internal server error" }

CONSENT TYPES:

  - service_terms: Using the app (MANDATORY - cannot revoke)
  - data_collection: Collecting personal data (optional)
  - openai_vision: OpenAI Vision API for OCR (optional)
  - analytics: Usage analytics (optional)
  - marketing_email: Marketing emails (optional)
  - child_parental: Parental consent for minors (conditional)
*/
