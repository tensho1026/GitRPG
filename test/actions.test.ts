import { beforeEach, describe, expect, it, vi } from "vitest";

const { rpc, assertAuthenticatedUser } = vi.hoisted(() => ({
  rpc: vi.fn(),
  assertAuthenticatedUser: vi.fn().mockResolvedValue("user@example.com"),
}));

vi.mock("@/lib/authenticatedUser", () => ({ assertAuthenticatedUser }));
vi.mock("@/db/neon", () => ({
  db: { rpc },
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { equipItem } from "@/actions/item/equipItem";
import { purchaseItem } from "@/actions/item/purchaseItem";

describe("transactional server actions", () => {
  beforeEach(() => rpc.mockReset());

  it("sends the purchase to one database transaction", async () => {
    rpc.mockResolvedValue({
      data: { item: { id: "item-1" }, remainingCoin: 0 },
      error: null,
    });

    const result = await purchaseItem("user@example.com", "1");

    expect(result).toMatchObject({
      success: true,
      item: { id: "item-1" },
      remainingCoin: 0,
    });
    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith(
      "purchase_item",
      expect.objectContaining({
        p_user_id: "user@example.com",
        p_equipment_id: "1",
        p_price: 100,
      })
    );
  });

  it("propagates a failed purchase without a compensation update", async () => {
    rpc.mockResolvedValue({
      data: null,
      error: { message: "insufficient_coins" },
    });

    await expect(purchaseItem("user@example.com", "1")).rejects.toThrow(
      "insufficient_coins"
    );
    expect(rpc).toHaveBeenCalledTimes(1);
  });

  it("sends equipment changes to one database transaction", async () => {
    rpc.mockResolvedValue({
      data: { item: { id: "item-1", equipped: true } },
      error: null,
    });

    await expect(
      equipItem("user@example.com", "item-1")
    ).resolves.toMatchObject({
      success: true,
      item: { equipped: true },
    });
    expect(rpc).toHaveBeenCalledWith("equip_item", {
      p_user_id: "user@example.com",
      p_item_id: "item-1",
    });
  });
});
