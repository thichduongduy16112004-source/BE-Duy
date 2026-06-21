export type LessonAssetCatalogItem = {
  filename: string;
  label: string;
  group: 'unit-background' | 'map' | 'object' | 'environment';
};

const FRONTEND_PUBLIC_BASE_URL = import.meta.env.VITE_FRONTEND_PUBLIC_BASE_URL || 'http://localhost:5173';

export const lessonAssetCatalog: LessonAssetCatalogItem[] = [
  { filename: 'bg_u1.png', label: 'Chương 1 — nền hiện tại', group: 'unit-background' },
  { filename: 'bg_u2.png', label: 'Chương 2 — nền hiện tại', group: 'unit-background' },
  { filename: 'bg_u3.png', label: 'Chương 3 — nền hiện tại', group: 'unit-background' },
  { filename: 'bg_u4.png', label: 'Chương 4 — nền hiện tại', group: 'unit-background' },
  { filename: 'bg_u5.png', label: 'Chương 5 — nền hiện tại', group: 'unit-background' },
  { filename: 'bg_u6.png', label: 'Chương 6 — nền hiện tại', group: 'unit-background' },
  { filename: 'bg_unit_1.png', label: 'Chương 1 — nền phụ', group: 'unit-background' },
  { filename: 'bg_unit_2.png', label: 'Chương 2 — nền phụ', group: 'unit-background' },
  { filename: 'bg_unit_3.png', label: 'Chương 3 — nền phụ', group: 'unit-background' },
  { filename: 'bg_unit_4.png', label: 'Chương 4 — nền phụ', group: 'unit-background' },
  { filename: 'bg_unit_5.png', label: 'Chương 5 — nền phụ', group: 'unit-background' },
  { filename: 'bg_unit_6.png', label: 'Chương 6 — nền phụ', group: 'unit-background' },
  { filename: 'map_bg.png', label: 'Bản đồ chiến dịch', group: 'map' },
  { filename: 'map_bg_original.png', label: 'Bản đồ gốc', group: 'map' },
  { filename: 'map_bg_tall.jpg', label: 'Bản đồ dọc', group: 'map' },
  { filename: 'map_bg_tall_blended.jpg', label: 'Bản đồ dọc blended', group: 'map' },
  { filename: 'map_bg_seamless_test.jpg', label: 'Bản đồ seamless', group: 'map' },
  { filename: 'ancient_temple.png', label: 'Đền cổ', group: 'environment' },
  { filename: 'autumn_tree.png', label: 'Cây mùa thu', group: 'environment' },
  { filename: 'jungle_tree.png', label: 'Cây rừng', group: 'environment' },
  { filename: 'rock_formation.png', label: 'Mỏm đá', group: 'environment' },
  { filename: 'round_bush.png', label: 'Bụi cây tròn', group: 'environment' },
  { filename: 'swirly_tree.png', label: 'Cây xoắn', group: 'environment' },
  { filename: 'book_3d.png', label: 'Sách 3D', group: 'object' },
  { filename: 'cartoon_drum.png', label: 'Trống cartoon', group: 'object' },
  { filename: 'cartoon_house.png', label: 'Nhà cartoon', group: 'object' },
  { filename: 'pink_book.png', label: 'Sách hồng', group: 'object' },
  { filename: 'treasure_chest.png', label: 'Rương kho báu', group: 'object' },
];

export function assetCatalogUrl(filename: string) {
  return `${FRONTEND_PUBLIC_BASE_URL}/assets/${filename}`;
}
