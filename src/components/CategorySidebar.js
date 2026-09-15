"use client";

import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

const categoryDefinitions = [
  { slug: "women", hasSub: true },
  { slug: "men", hasSub: true },
  { slug: "electronics" },
  { slug: "home" },
  { slug: "medicine" },
  { slug: "sports" },
  { slug: "baby" },
  { slug: "groceries" },
  { slug: "beauty" },
];

export default function CategorySidebar({ selectedCategory = "all", onSelectCategory }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let activeRequest = true;
    fetch("/api/categories")
      .then((response) => response.json())
      .then((data) => {
        if (!activeRequest) return;
        const categoryMap = new Map((data.categories || []).map((category) => [category.slug, category]));
        setCategories(categoryDefinitions
          .map((definition) => ({ ...definition, ...categoryMap.get(definition.slug) }))
          .filter((category) => category.name));
      })
      .catch(() => {
        if (activeRequest) setCategories([]);
      });

    return () => { activeRequest = false; };
  }, []);

  return (
    <nav className="hidden w-49 shrink-0  border-r border-gray-300 border-line pr-6 lg:block">
      <ul className="flex flex-col gap-3 py-2">
        <li>
          <button
            type="button"
            onClick={() => onSelectCategory?.("all")}
            className={`w-full text-left text-sm transition-colors ${selectedCategory === "all" ? "font-semibold text-brand" : "text-black hover:text-brand"}`}
          >
            All Categories
          </button>
        </li>
        {categories.map((category) => {
          const isActive = selectedCategory === category.slug;

          return (
            <li key={category.slug}>
              <button
                type="button"
                onClick={() => onSelectCategory?.(category.slug)}
                className={`flex w-full items-center justify-between text-left text-sm transition-colors ${
                  isActive ? "font-semibold text-brand" : "text-black hover:text-brand"
                }`}
              >
                <span>{category.name}</span>
                {category.hasSub && <ChevronRight className="h-4 w-4" />}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
