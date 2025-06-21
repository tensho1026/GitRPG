export interface Equipment {
  id: string;
  name: string;
  image: string;
  type: "weapon" | "armor" | "accessory" | string;
  attack?: number | null;
  defense?: number | null;
  price: number;
  owned: boolean;
  equipped: boolean;
  description: string;
  equipmentId?: string;
  userId?: string;
}
