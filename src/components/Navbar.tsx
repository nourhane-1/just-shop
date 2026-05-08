'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { 
  Search, ShoppingCart, Menu, X, User, LogOut, 
  Package, BarChart3 
} from 'lucide-react';

export default function Navbar() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const role = (session?.user as any)?.role;


  useEffect(() => {
    const updateCartCount = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const count = cart.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
        setCartCount(count);
      } catch {
        setCartCount(0);
      }
    };

    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    const interval = setInterval(updateCartCount, 1500);

    return () => {
      window.removeEventListener('storage', updateCartCount);
      clearInterval(interval);
    };
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-[#1E3A5F] text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
         
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold">
              <span className="text-white">Just</span>
              <span className="text-[#F97316]">Shop</span>
            </div>
          </Link>

        
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full px-4 py-2 pl-10 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#F97316]"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

        
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/products" className="hover:text-[#F97316] transition">
              Products
            </Link>

          
            <Link href="/cart" className="relative hover:text-[#F97316] transition">
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#F97316] text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

           
            {session ? (
              <div className="relative group">
                <button className="flex items-center gap-2 hover:text-[#F97316] transition py-1 px-3 rounded-lg hover:bg-white/10">
                  <User className="h-6 w-6" />
                  <span className="max-w-[110px] truncate text-sm">{session.user?.name}</span>
                </button>

               
                <div className="absolute right-0 mt-2 w-56 bg-white text-gray-800 rounded-xl shadow-2xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2 z-50">
                  <Link href="/profile" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
                    <User className="h-4 w-4 text-gray-500" />
                    My Profile
                  </Link>

                
                  {(role === 'seller' || role === 'admin') && (
                    <Link href="/seller" className="flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 text-emerald-600 font-medium border-t border-gray-100">
                      <BarChart3 className="h-4 w-4" />
                      Seller Dashboard
                    </Link>
                  )}

                 
                  {role === 'admin' && (
                    <Link href="/admin" className="flex items-center gap-3 px-4 py-3 hover:bg-orange-50 text-orange-600 font-medium border-t border-gray-100">
                      <Package className="h-4 w-4" />
                      Admin Panel
                    </Link>
                  )}

                  <div className="border-t border-gray-100 my-1"></div>

                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-[#F97316] px-6 py-2 rounded-lg hover:bg-[#ea6a0f] transition font-medium"
              >
                Login
              </Link>
            )}
          </div>

       
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 hover:bg-[#2a4d7a] rounded-lg transition"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

    
      {isMenuOpen && (
        <div className="md:hidden bg-[#16304d] border-t border-gray-700 py-4">
          <div className="px-6 space-y-4">
            <Link href="/products" className="block py-2 hover:text-[#F97316]" onClick={() => setIsMenuOpen(false)}>
              Products
            </Link>
            <Link href="/cart" className="flex justify-between items-center py-2 hover:text-[#F97316]" onClick={() => setIsMenuOpen(false)}>
              Cart 
              {cartCount > 0 && <span className="bg-[#F97316] text-white text-xs px-2 py-1 rounded-full">{cartCount}</span>}
            </Link>

            {session && (
              <>
                <Link href="/profile" className="block py-2 hover:text-[#F97316]" onClick={() => setIsMenuOpen(false)}>
                  My Profile
                </Link>

                {(role === 'seller' || role === 'admin') && (
                  <Link href="/seller" className="block py-2 text-emerald-400 font-medium" onClick={() => setIsMenuOpen(false)}>
                    Seller Dashboard
                  </Link>
                )}

                {role === 'admin' && (
                  <Link href="/admin" className="block py-2 text-orange-400 font-medium" onClick={() => setIsMenuOpen(false)}>
                    Admin Panel
                  </Link>
                )}

                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="w-full text-left py-2 text-red-400 hover:text-red-500"
                >
                  Logout
                </button>
              </>
            )}

            {!session && (
              <Link href="/login" className="block bg-[#F97316] text-center py-3 rounded-lg" onClick={() => setIsMenuOpen(false)}>
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}