"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { SingleImagePicker } from "@/components/admin/image-manager";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveSettings } from "@/lib/actions/settings";
import { settingsSchema, type SettingsFormValues } from "@/lib/validations";

type TextField = Exclude<keyof SettingsFormValues, "hero_image">;

export function SettingsForm({ initial }: { initial: SettingsFormValues }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const { register, control, handleSubmit, formState: { errors, isDirty } } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: initial,
  });

  const onSubmit = handleSubmit(
    (values) =>
      startTransition(async () => {
        const res = await saveSettings(values);
        if (!res.ok) return void toast.error(res.error);
        toast.success("Settings saved — the website is updated.");
        router.refresh();
      }),
    () => toast.error("Please fix the highlighted fields."),
  );

  function field(name: TextField, label: string, opts: { hint?: string; multiline?: boolean; placeholder?: string; type?: string; inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"] } = {}) {
    const error = errors[name]?.message;
    return (
      <div className="space-y-1.5">
        <Label htmlFor={name}>{label}</Label>
        {opts.multiline ? (
          <Textarea id={name} rows={4} placeholder={opts.placeholder} {...register(name)} />
        ) : (
          <Input id={name} type={opts.type ?? "text"} inputMode={opts.inputMode} placeholder={opts.placeholder} {...register(name)} />
        )}
        {opts.hint && !error && <p className="text-xs text-ink/60">{opts.hint}</p>}
        {error && <p className="text-xs font-medium text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Store details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {field("store_name", "Store name *")}
            {field("tagline", "Tagline *")}
            {field("address", "Address", { multiline: true })}
            {field("opening_hours", "Opening hours", { multiline: true, hint: "One line per day range, e.g. Mon–Sat: 10 AM – 9 PM" })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {field("whatsapp_number", "WhatsApp number", {
              inputMode: "numeric",
              placeholder: "919876543210",
              hint: "Country code + number, digits only, no + or spaces. Orders are sent here.",
            })}
            {field("phone", "Phone (for Call button)", { type: "tel", placeholder: "+91 98765 43210" })}
            {field("email", "Email", { type: "email" })}
            {field("instagram_url", "Instagram URL", { type: "url", placeholder: "https://instagram.com/…" })}
            {field("facebook_url", "Facebook URL", { type: "url", placeholder: "https://facebook.com/…" })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Google Maps</CardTitle>
            <CardDescription>Open the store on Google Maps → Share.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {field("maps_url", "Directions link", { type: "url", hint: "Share → Copy link (e.g. https://maps.app.goo.gl/…)" })}
            {field("maps_embed_url", "Map embed URL", {
              type: "url",
              hint: "Share → Embed a map → copy only the src=\"…\" URL",
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Home page banner</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {field("hero_title", "Headline")}
            {field("hero_subtitle", "Sub-text", { multiline: true })}
            <div className="space-y-1.5">
              <Label>Banner image (optional)</Label>
              <Controller
                control={control}
                name="hero_image"
                render={({ field: f }) => (
                  <SingleImagePicker value={f.value} onChange={f.onChange} folder="site" aspect="aspect-[4/5]" />
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>About page</CardTitle>
          </CardHeader>
          <CardContent>{field("about_text", "Our story", { multiline: true })}</CardContent>
        </Card>
      </div>

      <div className="sticky bottom-[72px] z-20 -mx-4 flex justify-end border-t bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:bottom-0 lg:mx-0 lg:rounded-xl lg:border lg:shadow-card">
        <Button type="submit" disabled={pending || !isDirty} className="min-w-36">
          {pending ? <Loader2 className="animate-spin" /> : <Save />} Save settings
        </Button>
      </div>
    </form>
  );
}
