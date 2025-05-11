"use client";

import { useState, useEffect, useRef } from "react";
import { About } from "@/src/models/SingletonModels";
import { ImageUpload } from "./AboutImageUpload";
import { Button } from "@/src/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getImageUrl } from "@/src/utils/client/GetImageUrl";

type MultiLangField = Record<string, string>;

interface AboutHeroFormProps {
  about: About | null;
  currentLang: string;
  availableLanguages: string[];
  onSave: (data: Partial<About>) => Promise<About>;
  onUpdateImages: (
    id: number,
    files: { image?: File; title_image?: File; subtitle_image?: File }
  ) => Promise<About>;
}

export default function AboutHeroForm({
  about,
  currentLang,
  availableLanguages,
  onSave,
  onUpdateImages,
}: AboutHeroFormProps) {
  const [formData, setFormData] = useState<Partial<About>>({
    title: about?.title ?? {},
    subtitle: about?.subtitle ?? {},
    description: about?.description ?? {},
    image: about?.image ?? "",
    title_image: about?.title_image ?? "",
    subtitle_image: about?.subtitle_image ?? "",
  });

  const [imageFiles, setImageFiles] = useState<{
    image?: File;
    title_image?: File;
    subtitle_image?: File;
  }>({});

  const [isSaving, setIsSaving] = useState(false);
  const [formTouched, setFormTouched] = useState(false);

  useEffect(() => {
    if (about) {
      setFormData({
        id: about.id,
        title: about.title ?? {},
        subtitle: about.subtitle ?? {},
        description: about.description ?? {},
        image: about.image ?? "",
        title_image: about.title_image ?? "",
        subtitle_image: about.subtitle_image ?? "",
      });
      setFormTouched(false);
    }
  }, [about]);

  const getML = (field: MultiLangField | undefined, lang: string) =>
    field?.[lang] ?? "";

  const updateML = (field: keyof About, lang: string, val: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: { ...(prev[field] as MultiLangField), [lang]: val },
    }));
    setFormTouched(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);

      const saved = await onSave(formData);

      if (Object.keys(imageFiles).length && saved.id) {
        await onUpdateImages(saved.id, imageFiles);
      }

      toast.success("About hero section saved successfully");
      setImageFiles({});
      setFormTouched(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save about hero section");
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageChange = (
    key: keyof typeof imageFiles,
    file: File | null
  ) => {
    setImageFiles((prev) => {
      const next = { ...prev };
      file ? (next[key] = file) : delete next[key];
      return next;
    });
    setFormTouched(true);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-lg font-medium mb-4">Hero Content</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={getML(formData.title as MultiLangField, currentLang)}
                onChange={(e) =>
                  updateML("title", currentLang, e.target.value)
                }
                className="w-full px-3 py-2 rounded-md border border-input focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder={`Title in ${currentLang}`}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Subtitle</label>
              <input
                type="text"
                value={getML(
                  formData.subtitle as MultiLangField,
                  currentLang
                )}
                onChange={(e) =>
                  updateML("subtitle", currentLang, e.target.value)
                }
                className="w-full px-3 py-2 rounded-md border border-input focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder={`Subtitle in ${currentLang}`}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                rows={4}
                value={getML(
                  formData.description as MultiLangField,
                  currentLang
                )}
                onChange={(e) =>
                  updateML("description", currentLang, e.target.value)
                }
                className="w-full px-3 py-2 rounded-md border border-input focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder={`Description in ${currentLang}`}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-lg font-medium mb-4">Hero Images</h2>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Main Hero Image
              </label>
              <ImageUpload
                currentImage={getImageUrl(formData.image as string)}
                onImageChange={(f) => handleImageChange("image", f)}
                className="aspect-video"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Recommended size: 1920×1080 px (max 5 MB)
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Title Background Image (optional)
              </label>
              <ImageUpload
                currentImage={getImageUrl(formData.title_image as string)}
                onImageChange={(f) => handleImageChange("title_image", f)}
                className="aspect-[4/1]"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Appears behind the title. Recommended 800×200 px.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Subtitle Icon/Image (optional)
              </label>
              <ImageUpload
                currentImage={getImageUrl(formData.subtitle_image as string)}
                onImageChange={(f) => handleImageChange("subtitle_image", f)}
                className="aspect-square w-32"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Small icon beside subtitle. Recommended 100×100 px.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 sticky bottom-0 bg-background py-4 border-t z-10">
        <Button type="button" variant="outline" onClick={() => location.reload()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving || !formTouched}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  );
}
