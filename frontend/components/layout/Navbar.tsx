'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Sun, Moon, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { NotificationBell } from '../ui/NotificationBell';
import { cn } from '../../utils/cn';

const navItems = [
  { name: 'Home', href: '/' },
  { name: 'About Us', href: '/about' },
  { name: 'Services', href: '/services' },
  { name: 'Portfolio', href: '/portfolio' },
  { name: 'Blogs', href: '/blogs' },
  { name: 'Gallery', href: '/gallery' },
  { name: 'FAQ', href: '/faq' },
  { name: 'Contact', href: '/contact' },
];

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const getPortalLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'employee') return '/employee/portal';
    if (user.role === 'client') return '/client/portal';
    return '/dashboard';
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b',
        isScrolled
          ? 'glass-panel py-3 shadow-lg'
          : 'bg-transparent py-5 border-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <span className="font-extrabold text-2xl tracking-tight text-foreground flex items-center">
              OUTPRO
              <span className="text-primary font-bold text-3xl">.</span>
              <span className="text-primary font-medium text-lg self-end tracking-wider ml-0.5">INDIA</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'relative px-4 py-2 rounded-md text-sm font-medium transition-colors hover:text-primary',
                    isActive ? 'text-primary' : 'text-foreground/80'
                  )}
                >
                  {item.name}
                  {isActive && (
                    <motion.span
                      layoutId="activeNav"
                      className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Theme & Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-secondary hover:bg-accent text-foreground transition-all duration-200"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            {user && <NotificationBell />}
            {user ? (
              <>
                <Link
                  href={getPortalLink()}
                  className="px-4 py-2 text-sm font-semibold text-primary hover:bg-primary hover:text-primary-foreground border border-primary/20 rounded-lg transition-all duration-200"
                >
                  Portal ({user.role})
                </Link>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-semibold text-foreground bg-secondary hover:bg-accent border border-border/40 rounded-lg transition-all duration-200"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-semibold text-foreground hover:text-primary transition-all duration-200"
                >
                  Sign In
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-primary-foreground bg-primary rounded-lg shadow-md hover:bg-primary/95 hover:shadow-lg hover:shadow-primary/20 transition-all duration-200 group"
                >
                  Let's Talk
                  <ArrowRight size={14} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-secondary text-foreground hover:bg-accent transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg bg-secondary text-foreground hover:bg-accent transition-colors"
              aria-label="Open menu"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-panel border-t border-border/10 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1 sm:px-3">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'block px-3 py-3 rounded-lg text-base font-semibold transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-foreground/80 hover:bg-secondary hover:text-primary'
                    )}
                  >
                    {item.name}
                  </Link>
                );
              })}
              <div className="pt-4 border-t border-border/10 space-y-2">
                {user ? (
                  <>
                    <Link
                      href={getPortalLink()}
                      className="flex w-full items-center justify-center px-4 py-3 text-base font-bold text-primary border border-primary/20 rounded-lg hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                    >
                      Portal ({user.role})
                    </Link>
                    <button
                      onClick={logout}
                      className="w-full text-center px-4 py-3 text-base font-bold text-foreground bg-secondary rounded-lg hover:bg-accent transition-all duration-200"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="flex w-full items-center justify-center px-4 py-3 text-base font-bold text-foreground bg-secondary rounded-lg hover:bg-accent transition-all duration-200"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/contact"
                      className="flex w-full items-center justify-center px-4 py-3 text-base font-bold text-primary-foreground bg-primary rounded-lg shadow-md hover:bg-primary/95 transition-all duration-200"
                    >
                      Let's Talk
                      <ArrowRight size={16} className="ml-2" />
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
