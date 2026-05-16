import { Link, useNavigate } from 'react-router-dom';
import { useAuth, useLogout } from '@/hooks/useAuth';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/ui/Logo';
import { useTranslation } from 'react-i18next';

const LANGS = ['en', 'hi', 'te'] as const;

export function Navbar() {
  const { user } = useAuth();
  const logout = useLogout();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const handleLogout = async () => {
    await logout.mutateAsync();
    navigate('/');
  };

  const initials =
    user?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() ?? '';

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-[#e8eaed]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="select-none">
            <Logo showTagline={false} />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className="px-4 py-2 rounded-full text-sm text-[#5f6368] hover:bg-[#f1f3f4] hover:text-[#202124] transition-colors font-medium"
            >
              {t('nav.findGurus')}
            </Link>
            <Link
              to="/shop"
              className="px-4 py-2 rounded-full text-sm text-[#5f6368] hover:bg-[#f1f3f4] hover:text-[#202124] transition-colors font-medium"
            >
              {t('nav.shop')}
            </Link>
            {user?.isGuru && (
              <Link
                to="/dashboard/guru"
                className="px-4 py-2 rounded-full text-sm text-[#5f6368] hover:bg-[#f1f3f4] hover:text-[#202124] transition-colors font-medium"
              >
                {t('nav.guruDashboard')}
              </Link>
            )}
            {user?.isGuru && (
              <Link
                to="/dashboard/guru/products"
                className="px-4 py-2 rounded-full text-sm text-[#5f6368] hover:bg-[#f1f3f4] hover:text-[#202124] transition-colors font-medium"
              >
                {t('nav.myShop')}
              </Link>
            )}
            {user?.isStudent && (
              <Link
                to="/dashboard/student"
                className="px-4 py-2 rounded-full text-sm text-[#5f6368] hover:bg-[#f1f3f4] hover:text-[#202124] transition-colors font-medium"
              >
                {t('nav.myBookings')}
              </Link>
            )}
            {user?.isAdmin && (
              <Link
                to="/admin"
                className="px-4 py-2 rounded-full text-sm text-[#5f6368] hover:bg-[#f1f3f4] hover:text-[#202124] transition-colors font-medium"
              >
                {t('nav.admin')}
              </Link>
            )}

            {/* Language switcher */}
            <div className="flex items-center gap-0.5 ml-1 border border-[#e8eaed] rounded-full px-1 py-0.5">
              {LANGS.map((lang) => (
                <button
                  key={lang}
                  onClick={() => i18n.changeLanguage(lang)}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                    i18n.language === lang
                      ? 'bg-[#1a73e8] text-white'
                      : 'text-[#5f6368] hover:bg-[#f1f3f4]'
                  }`}
                >
                  {t(`lang.${lang}`)}
                </button>
              ))}
            </div>

            {user ? (
              <div className="flex items-center gap-2 ml-2">
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-full text-sm text-[#5f6368] hover:bg-[#f1f3f4] transition-colors font-medium"
                >
                  {t('nav.signOut')}
                </button>
                <div className="w-9 h-9 rounded-full bg-[#1a73e8] flex items-center justify-center text-white text-sm font-medium select-none">
                  {initials}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-full text-sm text-[#1a73e8] hover:bg-[#e8f0fe] transition-colors font-medium"
                >
                  {t('nav.signIn')}
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-2 rounded-full text-sm bg-[#1a73e8] text-white hover:bg-[#1557b0] transition-colors font-medium shadow-sm"
                >
                  {t('nav.getStarted')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-full hover:bg-[#f1f3f4] transition-colors"
            onClick={() => setOpen(!open)}
          >
            {open ? (
              <X className="w-5 h-5 text-[#5f6368]" />
            ) : (
              <Menu className="w-5 h-5 text-[#5f6368]" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn('md:hidden border-t border-[#e8eaed] bg-white', open ? 'block' : 'hidden')}
      >
        <div className="flex flex-col px-4 py-2">
          <Link
            to="/"
            className="py-3 text-sm text-[#202124] border-b border-[#f1f3f4]"
            onClick={() => setOpen(false)}
          >
            {t('nav.findGurus')}
          </Link>
          <Link
            to="/shop"
            className="py-3 text-sm text-[#202124] border-b border-[#f1f3f4]"
            onClick={() => setOpen(false)}
          >
            {t('nav.shop')}
          </Link>
          {user ? (
            <>
              {user.isGuru && (
                <Link
                  to="/dashboard/guru"
                  className="py-3 text-sm text-[#202124] border-b border-[#f1f3f4]"
                  onClick={() => setOpen(false)}
                >
                  {t('nav.guruDashboard')}
                </Link>
              )}
              {user.isGuru && (
                <Link
                  to="/dashboard/guru/products"
                  className="py-3 text-sm text-[#202124] border-b border-[#f1f3f4]"
                  onClick={() => setOpen(false)}
                >
                  {t('nav.myShop')}
                </Link>
              )}
              {user.isStudent && (
                <Link
                  to="/dashboard/student"
                  className="py-3 text-sm text-[#202124] border-b border-[#f1f3f4]"
                  onClick={() => setOpen(false)}
                >
                  {t('nav.myBookings')}
                </Link>
              )}
              {user.isAdmin && (
                <Link
                  to="/admin"
                  className="py-3 text-sm text-[#202124] border-b border-[#f1f3f4]"
                  onClick={() => setOpen(false)}
                >
                  {t('nav.admin')}
                </Link>
              )}
              <button
                onClick={() => {
                  handleLogout();
                  setOpen(false);
                }}
                className="py-3 text-sm text-left text-[#ea4335]"
              >
                {t('nav.signOut')}
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="py-3 text-sm text-[#1a73e8]"
                onClick={() => setOpen(false)}
              >
                {t('nav.signIn')}
              </Link>
              <Link
                to="/signup"
                className="py-3 text-sm text-[#1a73e8] font-medium"
                onClick={() => setOpen(false)}
              >
                {t('nav.getStarted')}
              </Link>
            </>
          )}
          {/* Language switcher */}
          <div className="flex items-center gap-1 py-3">
            {LANGS.map((lang) => (
              <button
                key={lang}
                onClick={() => {
                  i18n.changeLanguage(lang);
                  setOpen(false);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  i18n.language === lang
                    ? 'bg-[#1a73e8] text-white border-[#1a73e8]'
                    : 'text-[#5f6368] border-[#e8eaed] hover:bg-[#f1f3f4]'
                }`}
              >
                {t(`lang.${lang}`)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
