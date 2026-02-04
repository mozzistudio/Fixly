'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Wrench, Menu, X, User, LogOut, Settings, Plus } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Wrench className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">Fixly</span>
            </Link>

            <div className="hidden md:flex ml-10 space-x-8">
              <Link
                href="/repairs"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >
                My Repairs
              </Link>
              <Link
                href="/shops"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >
                Find Shops
              </Link>
              <Link
                href="/how-it-works"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >
                How It Works
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {status === 'loading' ? (
              <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
            ) : session?.user ? (
              <>
                <Link href="/repairs/new" className="btn-primary hidden sm:flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  New Repair
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary-600" />
                    </div>
                    <span className="hidden md:block text-sm font-medium">
                      {session.user.name}
                    </span>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                      <Link
                        href="/dashboard"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Dashboard
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Link>
                      <button
                        onClick={() => signOut()}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/signin" className="btn-secondary">
                  Sign In
                </Link>
                <Link href="/auth/register" className="btn-primary hidden sm:block">
                  Get Started
                </Link>
              </>
            )}

            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-600" />
              ) : (
                <Menu className="h-6 w-6 text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100">
          <div className="px-4 py-3 space-y-2">
            <Link
              href="/repairs"
              className="block px-3 py-2 text-gray-600 hover:text-gray-900"
              onClick={() => setMobileMenuOpen(false)}
            >
              My Repairs
            </Link>
            <Link
              href="/shops"
              className="block px-3 py-2 text-gray-600 hover:text-gray-900"
              onClick={() => setMobileMenuOpen(false)}
            >
              Find Shops
            </Link>
            <Link
              href="/how-it-works"
              className="block px-3 py-2 text-gray-600 hover:text-gray-900"
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </Link>
            {session?.user && (
              <Link
                href="/repairs/new"
                className="block btn-primary text-center mt-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                New Repair Request
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
