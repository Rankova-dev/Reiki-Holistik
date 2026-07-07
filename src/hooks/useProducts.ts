import { useQuery } from "@tanstack/react-query";
import { contentApi } from "@/lib/contentApi";

export interface PricingOption {
  label: string;
  amount: number;
  perUnit?: string;
  note?: string;
  highlight?: boolean;
}

export interface CoursePromo {
  enabled: boolean;
  eyebrow?: string;
  title?: string;
  text?: string;
  dates?: { label: string; value: string }[];
  cta_label?: string | null;
  cta_pricing_label?: string | null;
  cta_amount?: number | null;
}

export interface ProductMetadata {
  subtitle?: string;
  badge?: string | null;
  image_url?: string | null;
  includes?: string[];
  audience?: string[];
  benefits?: string[];
  pricing_options?: PricingOption[];
  timeline?: { step: string; detail: string }[];
  faqs?: { q: string; a: string }[];
  promo?: CoursePromo;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  type: string;
  metadata: ProductMetadata;
}

function normalize(row: any): Product {
  return { ...row, metadata: (row.metadata as ProductMetadata) ?? {} };
}

export function useProductsBySlug(slugs: string[]) {
  const { data = [], isLoading } = useQuery({
    queryKey: ["products-by-slug", slugs],
    queryFn: async () => {
      const rows = await contentApi.getProducts(slugs);
      return rows.map(normalize);
    },
  });

  const bySlug = Object.fromEntries(data.map((p) => [p.slug, p]));
  return { products: data, bySlug, isLoading };
}

export function useProduct(slug: string | undefined) {
  const { data, isLoading } = useQuery({
    queryKey: ["product-by-slug", slug],
    queryFn: async () => {
      try {
        return normalize(await contentApi.getProduct(slug!));
      } catch {
        return null;
      }
    },
    enabled: !!slug,
  });

  return { product: data, isLoading };
}
