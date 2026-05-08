"use client";

import Link from "next/link";

import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  FolderTree,
  Ticket,
  ShoppingBag,
  ArrowLeft,
  Image as ImageIcon,
  MessageSquare,
} from "lucide-react";
const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/promos", label: "Promo Codes", icon: Ticket },
  { href: "/admin/banners", label: "Banners", icon: ImageIcon },
  { href: "/admin/reviews", label: "Reviews", icon: MessageSquare },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-[240px] min-h-screen bg-[#1E3A5F] text-white flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-[#F97316] rounded-lg flex items-center justify-center">
            <ShoppingBag size={18} className="text-white" />
          </div>
          <div>
            <span className="font-bold text-lg">Just</span>
            <span className="font-bold text-lg text-[#F97316]">Shop</span>
            <p className="text-[10px] text-blue-200 -mt-1">Admin Panel</p>
          </div>
        </Link>
      </div>

    
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                ${
                  active
                    ? "bg-[#F97316] text-white shadow-lg shadow-orange-500/20"
                    : "text-blue-200 hover:bg-white/10 hover:text-white"
                }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

   
      <div className="p-4 border-t border-white/10">
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-3 text-sm text-blue-200 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Store
        </Link>
      </div>
    </div>
  );
}