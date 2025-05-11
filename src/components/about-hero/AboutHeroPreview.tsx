"use client";

import { About } from "@/src/models/SingletonModels";
import { getImageUrl } from "@/src/utils/client/GetImageUrl";
import { ArrowRight } from "lucide-react";

interface AboutHeroPreviewProps {
  about: About | null;
  currentLang: string;
}

export default function AboutHeroPreview({
  about,
  currentLang,
}: AboutHeroPreviewProps) {
  if (!about) {
    return (
      <div className="text-center py-12 border border-dashed rounded-lg">
        <p className="text-muted-foreground">
          No preview available. Please save content first.
        </p>
      </div>
    );
  }

  const getContent = (
    field: Record<string, string> | undefined,
    fallback = ""
  ) => {
    if (!field) return fallback;
    return field[currentLang] || Object.values(field)[0] || fallback;
  };

  return (
    <div className="space-y-8">
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-center justify-between">
        <div>
          <h3 className="font-medium text-primary">Preview Mode</h3>
          <p className="text-sm text-muted-foreground">
            This is a preview of how the About hero section will appear on your
            site.
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          Language:{" "}
          <span className="font-medium">{currentLang.toUpperCase()}</span>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg border overflow-hidden shadow-sm">
        <div className="relative h-[300px] lg:h-[500px] overflow-hidden">
          {about.image && (
            <img
              src={getImageUrl(about.image)}
              alt={getContent(about.title, "About Us")}
              className="w-full h-full object-cover"
            />
          )}

          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white p-6">
            {about.subtitle_image && (
              <img
                src={getImageUrl(about.subtitle_image)}
                alt=""
                className="h-16 w-auto mb-4"
              />
            )}

            <h5 className="text-lg font-medium mb-2 text-center">
              {getContent(about.subtitle, "Welcome to our company")}
            </h5>

            <h2 className="text-3xl lg:text-5xl font-bold mb-6 text-center max-w-3xl">
              {getContent(about.title, "About Our Company")}
            </h2>

            <p className="text-lg text-center max-w-2xl mb-8">
              {getContent(
                about.description,
                "Learn more about our company, our mission, and our values."
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
