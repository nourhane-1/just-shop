"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  ShoppingBag,
  Heart,
  MapPin,
  Settings,
  LogOut,
  User,
} from "lucide-react";

const navItems = [
  { href: "/profile/orders", label: "My Orders", icon: ShoppingBag },
  { href: "/profile/wishlist", label: "Wishlist", icon: Heart },
  { href: "/profile/addresses", label: "Addresses", icon: MapPin },
  { href: "/profile/settings", label: "Settings", icon: Settings },
];

interface ProfileSidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function ProfileSidebar({ user }: ProfileSidebarProps) {
  const pathname = usePathname();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
  
      <div className="p-6 border-b border-gray-100 text-center">
        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-[#1E3A5F] flex items-center justify-center overflow-hidden">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name ?? "User"}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <span className="text-white text-xl font-bold">
              {user.name?.[0]?.toUpperCase() ?? "U"}
            </span>
          )}
        </div>
        <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
        <p className="text-xs text-gray-500 mt-1">{user.email}</p>
      </div>

    
      <nav className="p-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all mb-1
                ${
                  active
                    ? "bg-orange-50 text-[#F97316] border-l-4 border-[#F97316]"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}

      
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all w-full mt-2"
        >
          <LogOut size={18} />
          Log Out
        </button>
      </nav>
    </div>
  );
}