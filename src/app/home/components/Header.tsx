import { UserWithStatus } from "@/types/user/userStatus";
import { Coins, Shield, User } from "lucide-react";
import React from "react";

function Header({ userStatus }: { userStatus: UserWithStatus }) {
  return (
    <div className="mb-4">
      <div className="guild-header">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <span className="guild-chip h-11 w-11 p-0"><Shield className="h-5 w-5" /></span>
            <div><p className="guild-kicker">Guild Status</p><h1 className="guild-title break-words text-2xl sm:text-3xl">冒険者ギルド</h1></div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-4">
            <div className="guild-chip">
              <User className="w-5 h-5" />
              <span>Lv.{userStatus?.status?.level}</span>
            </div>
            <div className="guild-chip">
              <Coins className="w-5 h-5" />
              <span>{userStatus?.status?.coin ?? 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
