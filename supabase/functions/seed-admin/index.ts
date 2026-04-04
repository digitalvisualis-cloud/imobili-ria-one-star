import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.100.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const email = "pablomedinafilmes@gmail.com";
    const tempPassword = "Admin@2024Init";

    // Check if user already exists
    const { data: existingProfiles } = await supabaseAdmin
      .from("profiles")
      .select("id, email")
      .eq("email", email)
      .limit(1);

    if (existingProfiles && existingProfiles.length > 0) {
      return new Response(JSON.stringify({ message: "Admin já existe", user_id: existingProfiles[0].id }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create admin user
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
    });

    if (createError) {
      return new Response(JSON.stringify({ error: createError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (newUser?.user) {
      // Update profile
      await supabaseAdmin
        .from("profiles")
        .update({ must_change_password: true, full_name: "Administrador" })
        .eq("id", newUser.user.id);

      // Assign admin role
      await supabaseAdmin.from("user_roles").insert({
        user_id: newUser.user.id,
        role: "admin",
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      user_id: newUser?.user?.id,
      message: "Admin criado com sucesso. Senha temporária: " + tempPassword
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Seed error:", e);
    return new Response(JSON.stringify({ error: "Erro interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
