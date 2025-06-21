export interface AvatarCharacter {
  id: string;
  name: string;
  type: "warrior" | "guardian" | "mage";
  image: string;
  level: number;
  unlocked: boolean;
  unlockLevel: number;
  price: number;
  statBonus: {
    hp: number;
    attack: number;
    defense: number;
  };
  description: string;
}