export interface Equipment {
  id: string;
  name: string;
  image: string;
  type: "weapon" | "armor" | "accessory";
  attack?: number;
  defense?: number;
  price: number;
  owned: boolean;
  equipped: boolean;
  description: string;
}