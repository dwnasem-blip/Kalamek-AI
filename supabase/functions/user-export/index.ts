// Export user data - GDPR Right to Portability / PDPL Article 17
// Endpoint: POST /user-export
// Auth: Bearer token required

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

interface ExportData {
  export_date: string;
  export_version: string;
  user_id: string;
  profile?: Record<string, unknown>;
  projects?: Record<string, unknown>[];
  financial_documents?: Record<string, unknown>[];
  transactions?: Record<string, unknown>[];
  consents?: Record<string, unknown>[];
  audit_logs?: Record<string, unknown>[];
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
        JSON.stringify({ error: 'Missing or invalid authorization header' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ============================================
    // 2. INITIALIZE SUPABASE CLIENT
    // ============================================
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // ============================================
    // 3. VERIFY JWT TOKEN
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
    // 4. COLLECT USER DATA FROM ALL TABLES
    // ============================================
    console.log(`Starting data export for user: ${userId}`);

    const [
      profileResult,
      projectsResult,
      documentsResult,
      transactionsResult,
      consentsResult,
      auditResult,
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('projects').select('*').eq('user_id', userId),
      supabase.from('financial_documents').select('*').eq('user_id', userId),
      supabase.from('credit_transactions').select('*').eq('user_id', userId),
      supabase.from('consent_records').select('*').eq('user_id', userId),
      supabase.from('audit_logs').select('*').eq('user_id', userId),
    ]);

    // ============================================
    // 5. CHECK FOR ERRORS IN DATA RETRIEVAL
    // ============================================
    const errors = [
      { table: 'profiles', error: profileResult.error },
      { table: 'projects', error: projectsResult.error },
      { table: 'financial_documents', error: documentsResult.error },
      { table: 'credit_transactions', error: transactionsResult.error },
      { table: 'consent_records', error: consentsResult.error },
      { table: 'audit_logs', error: auditResult.error },
    ].filter((e) => e.error);

    if (errors.length > 0) {
      console.error('Errors retrieving data:', errors);
      // Log only first error, don't expose database structure
      return new Response(
        JSON.stringify({
          error: `Failed to export data from ${errors[0].table}`,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ============================================
    // 6. BUILD EXPORT OBJECT
    // ============================================
    const exportData: ExportData = {
      export_date: new Date().toISOString(),
      export_version: '1.0',
      user_id: userId,
      profile: profileResult.data || undefined,
      projects: projectsResult.data || [],
      financial_documents: documentsResult.data || [],
      transactions: transactionsResult.data || [],
      consents: consentsResult.data || [],
      audit_logs: auditResult.data || [],
    };

    // ============================================
    // 7. LOG THE EXPORT REQUEST
    // ============================================
    const { error: logError } = await supabase
      .from('audit_logs')
      .insert({
        user_id: userId,
        action: 'data_export',
        resource_type: 'user_data',
        status: 'success',
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown',
      });

    if (logError) {
      console.warn('Failed to log export action:', logError.message);
      // Don't fail the export if logging fails
    }

    // ============================================
    // 8. RETURN EXPORT DATA
    // ============================================
    const fileName = `wain_export_${userId}_${new Date().toISOString().split('T')[0]}.json`;

    return new Response(
      JSON.stringify(exportData, null, 2),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'X-Export-Date': new Date().toISOString(),
          'X-User-ID': userId,
        },
      }
    );
  } catch (error) {
    console.error('Export error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return new Response(
      JSON.stringify({
        error: 'Internal server error during export',
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
USAGE:

  curl -X POST \
    -H "Authorization: Bearer YOUR_JWT_TOKEN" \
    -H "Content-Type: application/json" \
    https://your-project.supabase.co/functions/v1/user-export

RESPONSE (on success):

  HTTP 200
  Content-Disposition: attachment; filename="wain_export_uuid_2026-11-14.json"
  Content-Type: application/json

  {
    "export_date": "2026-11-14T10:30:00.000Z",
    "export_version": "1.0",
    "user_id": "...",
    "profile": {...},
    "projects": [...],
    "financial_documents": [...],
    "transactions": [...],
    "consents": [...],
    "audit_logs": [...]
  }

ERROR RESPONSES:

  HTTP 401 - Unauthorized
  { "error": "Invalid or expired token" }

  HTTP 405 - Method Not Allowed
  { "error": "Method not allowed" }

  HTTP 500 - Server Error
  { "error": "Internal server error during export" }
*/
