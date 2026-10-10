import { SettingsForm } from "@/components/admin/settings-form";
import { requireAdmin } from "@/lib/auth";
import { DEFAULT_SETTINGS } from "@/lib/data";

export const metadata = { title: "Store settings" };

export default async function SettingsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("settings").select("*").eq("id", 1).maybeSingle();
  const s = data ?? DEFAULT_SETTINGS;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl sm:text-3xl">Store settings</h1>
        <p className="text-sm text-ink/60">Changes appear on the website immediately after saving.</p>
      </div>
      <SettingsForm
        key={s.updated_at}
        initial={{
          store_name: s.store_name,
          tagline: s.tagline,
          address: s.address ?? "",
          opening_hours: s.opening_hours ?? "",
          phone: s.phone ?? "",
          whatsapp_number: s.whatsapp_number ?? "",
          email: s.email ?? "",
          instagram_url: s.instagram_url ?? "",
          facebook_url: s.facebook_url ?? "",
          maps_url: s.maps_url ?? "",
          maps_embed_url: s.maps_embed_url ?? "",
          hero_title: s.hero_title ?? "",
          hero_subtitle: s.hero_subtitle ?? "",
          about_text: s.about_text ?? "",
          hero_image: s.hero_image_url && s.hero_image_path ? { url: s.hero_image_url, path: s.hero_image_path } : null,
        }}
      />
    </div>
  );
}
