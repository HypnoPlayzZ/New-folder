import fallback from "@/data/menu-fallback.json";

export interface MenuItem {
  _id: string;
  name: string;
  description?: string;
  price: { half?: number; full?: number };
  imageUrl?: string;
  category?: string;
  position?: number;
}

export interface MenuCategory {
  name: string;
  items: MenuItem[];
}

const API_URL = "https://steamybitesbackend.onrender.com/api/menu";

/** Only Cloudinary images are allowed through next/image; scrub anything else. */
function scrub(categories: MenuCategory[]): MenuCategory[] {
  return categories.map((cat) => ({
    ...cat,
    items: (cat.items ?? []).map((item) => ({
      ...item,
      imageUrl: item.imageUrl?.startsWith("https://res.cloudinary.com/dhc55vkds/")
        ? item.imageUrl
        : undefined,
    })),
  }));
}

/** Presentation names for API categories; 'Uncategorized' holds the street classics. */
const CATEGORY_LABELS: Record<string, string> = {
  Uncategorized: "Street Classics",
  "Italian Snacks": "Snacks",
};

export function displayCategory(name: string): string {
  return CATEGORY_LABELS[name.trim()] ?? name.trim();
}

/**
 * Live menu with ISR (1h). The backend is on Render's free tier and can
 * cold-start for ~60s, so a committed snapshot keeps the menu from ever
 * rendering empty.
 */
export async function getMenu(): Promise<MenuCategory[]> {
  try {
    const res = await fetch(API_URL, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(25_000),
    });
    if (!res.ok) throw new Error(`menu API ${res.status}`);
    const data = (await res.json()) as MenuCategory[];
    if (!Array.isArray(data) || data.length === 0) throw new Error("empty menu");
    return scrub(data);
  } catch {
    return scrub(fallback as MenuCategory[]);
  }
}
