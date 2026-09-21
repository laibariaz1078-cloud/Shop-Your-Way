"use client";

import { Smartphone, Monitor, Watch, Camera, Headphones, Gamepad2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const categoryDefinitions = [
  { slug: "phones", name: "Phones", icon: Smartphone },
  { slug: "computers", name: "Computers", icon: Monitor },
  { slug: "smartwatch", name: "SmartWatch", icon: Watch },
  { slug: "camera", name: "Camera", icon: Camera },
  { slug: "headphones", name: "HeadPhones", icon: Headphones },
  { slug: "gaming", name: "Gaming", icon: Gamepad2 },
];

export default function CategoryTabs() {
  const [categories, setCategories] = useState([]);
  const [active, setActive] = useState("camera");
  const router = useRouter();

  useEffect(() => {
    let activeRequest = true;
    const loadCategories = async () => {
      try {
        const response = await fetch("/api/categories", { cache: "no-store" });
        if (!response.ok) throw new Error("Unable to load categories");
        const data = await response.json();
        if (!activeRequest) return;
        const categoryMap = new Map((data.categories || []).map((category) => [category.slug, category]));
        const mergedCategories = categoryDefinitions
          .map((definition) => ({ ...definition, ...(categoryMap.get(definition.slug) || {}) }))
          .filter((category) => category.name);
        setCategories(mergedCategories.length ? mergedCategories : categoryDefinitions);
      } catch {
        if (activeRequest) setCategories(categoryDefinitions);
      }
    };

    loadCategories();
    const refreshTimer = setInterval(loadCategories, 30_000);

    return () => {
      activeRequest = false;
      clearInterval(refreshTimer);
    };
  }, []);

  return (
    <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {categories.map((category) => {
        const Icon = category.icon;
        const isActive = active === category.slug;

        return (
          <button
            key={category.slug}
            type="button"
            onClick={() => {
              setActive(category.slug);
              router.push(`/shop?category=${encodeURIComponent(category.slug)}`);
            }}
            className={`flex h-[145px] w-full flex-col items-center justify-center gap-4 rounded-md border transition-all duration-300 ${
              isActive
                ? "border-[#DB4444] bg-[#DB4444] text-white shadow-sm"
                : "border-black/30 bg-white text-black hover:border-[#DB4444] hover:bg-[#DB4444] hover:text-white"
            }`}
          >
            {/* Outline Thin Icons */}
            <Icon className="h-14 w-14 stroke-[1.25]" />
            <span className="text-base font-normal tracking-wide">
              {category.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}