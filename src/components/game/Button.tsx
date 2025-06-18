"use client";
import { getCurrentCoin } from "@/actions/user/status/coin/getCurrentCoin";
import { reduceCoin } from "@/actions/user/status/coin/reduceCoin";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";

function ButtonTest() {
  const { data: session } = useSession();
  const [coin, setCoin] = useState<number>(0);

  const handleReduceCoin = async () => {
    if (session?.user?.email) {
      await reduceCoin(session.user.email, 10);
      // コインを減らした後に現在のコインを再取得
      const currentCoin = await getCurrentCoin(session.user.email);
      setCoin(currentCoin || 0);
    }
  };

  useEffect(() => {
    const fetchCoin = async () => {
      if (session?.user?.email) {
        const currentCoin = await getCurrentCoin(session.user.email);
        setCoin(currentCoin || 0);
      }
    };
    fetchCoin();
  }, [session]);

  return (
    <div>
      <Button onClick={handleReduceCoin}>10減らす</Button>
      <h1>現在のコイン: {coin}</h1>
    </div>
  );
}

export default ButtonTest;
