import type { Food } from '../types';

const OFF_BASE = 'https://world.openfoodfacts.org';

export interface FoodSearchResult {
  foods: Food[];
  fromAPI: boolean;
}

export async function searchFoodsAPI(query: string): Promise<FoodSearchResult> {
  try {
    const url = `${OFF_BASE}/cgi/search.pl?action=process&search_terms=${encodeURIComponent(query)}&fields=id,product_name,brands,nutriments,serving_size&json=1&page_size=20`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('API error');

    const data = await res.json();
    const products = (data.products ?? []) as Record<string, unknown>[];

    const foods: Food[] = products
      .filter((p) => {
        const n = p.nutriments as Record<string, unknown> | undefined;
        return n && typeof n['energy-kcal_100g'] === 'number';
      })
      .map((p) => {
        const n = p.nutriments as Record<string, unknown>;
        return {
          id: String(p.id ?? p._id ?? ''),
          name: String(p.product_name ?? ''),
          brand: p.brands ? String(p.brands).split(',')[0].trim() : undefined,
          kcalPer100g: Number(n['energy-kcal_100g'] ?? 0),
          proteinPer100g: Number(n.proteins_100g ?? 0),
          carbsPer100g: Number(n.carbohydrates_100g ?? 0),
          fatPer100g: Number(n.fat_100g ?? 0),
          fiberPer100g: n.fiber_100g ? Number(n.fiber_100g) : undefined,
          servingSuggestionG: 100,
          servingLabel: '100g',
          source: 'api' as const,
          apiId: String(p._id ?? p.id ?? ''),
        };
      });

    return { foods, fromAPI: true };
  } catch {
    return { foods: COMMON_FOODS, fromAPI: false };
  }
}

export async function getFoodByBarcode(barcode: string): Promise<Food | null> {
  try {
    const res = await fetch(`${OFF_BASE}/api/v0/product/${barcode}.json`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status !== 1) return null;

    const p = data.product;
    const n = p.nutriments ?? {};
    return {
      id: barcode,
      name: p.product_name ?? '',
      brand: p.brands?.split(',')[0]?.trim(),
      kcalPer100g: Number(n['energy-kcal_100g'] ?? 0),
      proteinPer100g: Number(n.proteins_100g ?? 0),
      carbsPer100g: Number(n.carbohydrates_100g ?? 0),
      fatPer100g: Number(n.fat_100g ?? 0),
      barcode,
      source: 'barcode',
      servingSuggestionG: 100,
      servingLabel: '100g',
    };
  } catch {
    return null;
  }
}

export const COMMON_FOODS: Food[] = [
  { id: 'chicken_breast', name: 'Chicken breast', brand: 'USDA', kcalPer100g: 165, proteinPer100g: 31, carbsPer100g: 0, fatPer100g: 3.6, servingSuggestionG: 150, servingLabel: '150g grilled', source: 'api' },
  { id: 'oats', name: 'Rolled oats', brand: 'Generic', kcalPer100g: 389, proteinPer100g: 17, carbsPer100g: 66, fatPer100g: 7, servingSuggestionG: 80, servingLabel: '80g dry', source: 'api' },
  { id: 'whey', name: 'Whey protein isolate', kcalPer100g: 370, proteinPer100g: 80, carbsPer100g: 6, fatPer100g: 4, servingSuggestionG: 30, servingLabel: '30g scoop', source: 'api' },
  { id: 'rice', name: 'White rice', kcalPer100g: 130, proteinPer100g: 2.7, carbsPer100g: 28, fatPer100g: 0.3, servingSuggestionG: 150, servingLabel: '150g cooked', source: 'api' },
  { id: 'eggs', name: 'Whole egg', kcalPer100g: 143, proteinPer100g: 13, carbsPer100g: 1, fatPer100g: 10, servingSuggestionG: 60, servingLabel: '1 large egg', source: 'api' },
  { id: 'banana', name: 'Banana', kcalPer100g: 89, proteinPer100g: 1.1, carbsPer100g: 23, fatPer100g: 0.3, servingSuggestionG: 120, servingLabel: '1 medium', source: 'api' },
  { id: 'greek_yogurt', name: 'Greek yogurt', kcalPer100g: 59, proteinPer100g: 10, carbsPer100g: 4, fatPer100g: 0.4, servingSuggestionG: 200, servingLabel: '200g', source: 'api' },
  { id: 'almonds', name: 'Almonds', kcalPer100g: 579, proteinPer100g: 21, carbsPer100g: 22, fatPer100g: 50, servingSuggestionG: 28, servingLabel: '28g (handful)', source: 'api' },
  { id: 'sweet_potato', name: 'Sweet potato', kcalPer100g: 86, proteinPer100g: 1.6, carbsPer100g: 20, fatPer100g: 0.1, servingSuggestionG: 200, servingLabel: '1 medium', source: 'api' },
  { id: 'salmon', name: 'Salmon fillet', kcalPer100g: 208, proteinPer100g: 20, carbsPer100g: 0, fatPer100g: 13, servingSuggestionG: 150, servingLabel: '150g', source: 'api' },
];

export function filterFoods(foods: Food[], query: string): Food[] {
  const lower = query.toLowerCase();
  return foods.filter(f => f.name.toLowerCase().includes(lower) || f.brand?.toLowerCase().includes(lower));
}

export function calcFoodMacros(food: Food, servingG: number) {
  const factor = servingG / 100;
  return {
    kcal: Math.round(food.kcalPer100g * factor),
    proteinG: Math.round(food.proteinPer100g * factor * 10) / 10,
    carbsG: Math.round(food.carbsPer100g * factor * 10) / 10,
    fatG: Math.round(food.fatPer100g * factor * 10) / 10,
  };
}
