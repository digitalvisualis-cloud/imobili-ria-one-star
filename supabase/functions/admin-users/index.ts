import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.100.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify caller is authenticated and is admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return jsonResponse({ error: "Não autorizado" }, 401);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user: caller }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !caller) return jsonResponse({ error: "Não autorizado" }, 401);

    // Check admin role
    const { data: callerRole } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .eq("role", "admin")
      .single();

    if (!callerRole) return jsonResponse({ error: "Apenas administradores podem gerenciar usuários" }, 403);

    const body = await req.json();
    const { action } = body;

    if (action === "create") {
      const { email, password, role, full_name } = body;
      if (!email || !password || !role) return jsonResponse({ error: "Campos obrigatórios: email, password, role" }, 400);
      if (password.length < 10) return jsonResponse({ error: "Senha deve ter no mínimo 10 caracteres" }, 400);

      // Create user
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (createError) return jsonResponse({ error: createError.message }, 400);

      // Update profile name
      if (full_name && newUser.user) {
        await supabaseAdmin
          .from("profiles")
          .update({ full_name, must_change_password: true })
          .eq("id", newUser.user.id);
      }

      // Insert role
      if (newUser.user) {
        await supabaseAdmin.from("user_roles").insert({
          user_id: newUser.user.id,
          role,
        });
      }

      return jsonResponse({ success: true, user_id: newUser.user?.id });
    }

    if (action === "update-role") {
      const { user_id, role } = body;
      if (!user_id || !role) return jsonResponse({ error: "Campos obrigatórios: user_id, role" }, 400);

      // Upsert role
      await supabaseAdmin.from("user_roles").delete().eq("user_id", user_id);
      await supabaseAdmin.from("user_roles").insert({ user_id, role });

      return jsonResponse({ success: true });
    }

    if (action === "deactivate") {
      const { user_id } = body;
      if (!user_id) return jsonResponse({ error: "Campo obrigatório: user_id" }, 400);

      // Ban user
      const { error } = await supabaseAdmin.auth.admin.updateUserById(user_id, { ban_duration: "876000h" });
      if (error) return jsonResponse({ error: error.message }, 400);

      return jsonResponse({ success: true });
    }

    return jsonResponse({ error: "Ação inválida" }, 400);
  } catch (e) {
    console.error("admin-users error:", e);
    return jsonResponse({ error: "Erro interno" }, 500);
  }
});
