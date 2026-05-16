import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Tag } from 'lucide-react';
import { useGuruSearch, useGuruSuggestions } from '@/hooks/useGurus';
import { useDebounce } from '@/hooks/useDebounce';
import { GuruCard, type GuruCardData } from '@/components/guru/GuruCard';
import { Button } from '@/components/ui/Button';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useTranslation } from 'react-i18next';

type ActiveField = 'q' | 'skill' | null;

export default function Landing() {
  const { t } = useTranslation();

  const [q, setQ] = useState('');
  const [skill, setSkill] = useState('');
  const [submitted, setSubmitted] = useState({ q: '', skill: '' });
  const [activeField, setActiveField] = useState<ActiveField>(null);
  const [highlightedIdx, setHighlightedIdx] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const qInputRef = useRef<HTMLInputElement>(null);
  const skillInputRef = useRef<HTMLInputElement>(null);
  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasSearch = !!(submitted.q || submitted.skill);

  const debouncedQ = useDebounce(q, 250);
  const debouncedSkill = useDebounce(skill, 250);
  const suggestionQuery =
    activeField === 'q' ? debouncedQ : activeField === 'skill' ? debouncedSkill : '';

  const { data: suggestions } = useGuruSuggestions(suggestionQuery);

  const items: Array<
    | { type: 'name'; id: string; label: string; avatarUrl: string | null }
    | { type: 'skill'; label: string }
  > =
    activeField === 'q'
      ? (suggestions?.names ?? []).map((n) => ({
          type: 'name',
          id: n.id,
          label: n.user.name,
          avatarUrl: n.user.avatarUrl,
        }))
      : (suggestions?.skills ?? []).map((s) => ({ type: 'skill', label: s }));

  const showDropdown = activeField !== null && suggestionQuery.length >= 1 && items.length > 0;

  useEffect(() => {
    setHighlightedIdx(-1);
  }, [items.length, activeField]);

  const closeDropdown = useCallback(() => {
    setActiveField(null);
    setHighlightedIdx(-1);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeDropdown();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [closeDropdown]);

  const handleFocus = (field: ActiveField) => {
    if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
    setActiveField(field);
  };

  const handleBlur = () => {
    blurTimerRef.current = setTimeout(closeDropdown, 150);
  };

  const applySuggestion = (item: (typeof items)[number]) => {
    if (item.type === 'name') {
      setQ(item.label);
      setSubmitted({ q: item.label, skill });
    } else {
      setSkill(item.label);
      setSubmitted({ q, skill: item.label });
    }
    closeDropdown();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIdx((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter' && highlightedIdx >= 0) {
      e.preventDefault();
      applySuggestion(items[highlightedIdx]);
    } else if (e.key === 'Escape') {
      closeDropdown();
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    closeDropdown();
    setSubmitted({ q, skill });
  };

  const { data, isLoading } = useGuruSearch({
    q: submitted.q || undefined,
    skill: submitted.skill || undefined,
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-4 pt-12 pb-10">
        <div className="w-full max-w-2xl text-center">
          <h1 className="text-4xl sm:text-5xl font-semibold text-[#111827] leading-tight">
            {t('landing.hero.title')}
          </h1>
          <p className="text-[#475569] text-base sm:text-lg mt-4 max-w-xl mx-auto">
            {t('landing.hero.subtitle')}
          </p>
        </div>

        <div ref={containerRef} className="w-full max-w-xl relative mt-8">
          <form onSubmit={handleSearch}>
            <div
              className={`brand-card flex items-center gap-3 bg-white px-5 py-3 transition-shadow ${
                showDropdown
                  ? 'rounded-b-none border-b-0 shadow-none'
                  : 'border border-[#dfe1e5] g-search-shadow'
              }`}
            >
              <Search className="w-5 h-5 text-[#9aa0a6] flex-shrink-0" />
              <input
                ref={qInputRef}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setHighlightedIdx(-1);
                }}
                onFocus={() => handleFocus('q')}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                placeholder={t('landing.search.guruPlaceholder')}
                autoComplete="off"
                className="flex-1 outline-none text-[#202124] text-base placeholder-[#9aa0a6] bg-transparent min-w-0"
              />
              <div className="w-px h-5 bg-[#dfe1e5] flex-shrink-0" />
              <Tag className="w-4 h-4 text-[#9aa0a6] flex-shrink-0" />
              <input
                ref={skillInputRef}
                value={skill}
                onChange={(e) => {
                  setSkill(e.target.value);
                  setHighlightedIdx(-1);
                }}
                onFocus={() => handleFocus('skill')}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                placeholder={t('landing.search.skillPlaceholder')}
                autoComplete="off"
                className="w-28 outline-none text-[#202124] text-base placeholder-[#9aa0a6] bg-transparent"
              />
            </div>

            {showDropdown && (
              <div className="absolute left-0 right-0 bg-white border border-[#dfe1e5] border-t-0 rounded-b-2xl shadow-lg z-50 overflow-hidden">
                <div className="border-t border-[#ececec] mx-4" />
                <ul className="py-2">
                  {items.map((item, idx) => (
                    <li key={`${item.type}-${item.label}`}>
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          applySuggestion(item);
                        }}
                        onMouseEnter={() => setHighlightedIdx(idx)}
                        className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors ${
                          idx === highlightedIdx ? 'bg-[#f1f3f4]' : 'hover:bg-[#f8f9fa]'
                        }`}
                      >
                        {item.type === 'name' ? (
                          <>
                            {item.avatarUrl ? (
                              <img
                                src={item.avatarUrl}
                                alt={item.label}
                                className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-[#1E3A8A] flex items-center justify-center text-white text-xs font-medium flex-shrink-0 select-none">
                                {item.label[0]?.toUpperCase()}
                              </div>
                            )}
                            <span className="text-sm text-[#202124] flex-1 truncate">
                              {item.label}
                            </span>
                            <span className="text-xs text-[#475569]">
                              {t('landing.search.labelGuru')}
                            </span>
                          </>
                        ) : (
                          <>
                            <Tag className="w-4 h-4 text-[#9aa0a6] flex-shrink-0" />
                            <span className="text-sm text-[#202124] flex-1">{item.label}</span>
                            <span className="text-xs text-[#475569]">
                              {t('landing.search.labelSkill')}
                            </span>
                          </>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center justify-center mt-4">
              <Button type="submit">{t('landing.search.button')}</Button>
            </div>
          </form>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-14">
        <SectionHeader
          title={
            hasSearch
              ? t('landing.discover.searchResults', { query: submitted.q || submitted.skill })
              : t('landing.discover.title')
          }
          subtitle={t('landing.discover.subtitle')}
          className="mb-10 text-center"
        />

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-52 bg-[#f1f3f4] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : data?.data?.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#5f6368]">{t('landing.discover.noGurus')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {data?.data?.map((guru: GuruCardData) => (
              <GuruCard key={guru.id} guru={guru} />
            ))}
          </div>
        )}
      </section>

      <section className="bg-[#f8fafc] py-14 px-4">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            title={t('landing.why.title')}
            subtitle={t('landing.why.subtitle')}
            className="text-center mx-auto mb-10"
          />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="brand-card p-6">
              <p className="text-sm text-[#1a73e8] uppercase tracking-wide font-semibold mb-3">
                {t('landing.why.flexible.label')}
              </p>
              <p className="text-lg font-semibold text-[#111827]">
                {t('landing.why.flexible.title')}
              </p>
              <p className="mt-4 text-sm text-[#475569] leading-relaxed">
                {t('landing.why.flexible.body')}
              </p>
            </div>
            <div className="brand-card p-6">
              <p className="text-sm text-[#1a73e8] uppercase tracking-wide font-semibold mb-3">
                {t('landing.why.earn.label')}
              </p>
              <p className="text-lg font-semibold text-[#111827]">{t('landing.why.earn.title')}</p>
              <p className="mt-4 text-sm text-[#475569] leading-relaxed">
                {t('landing.why.earn.body')}
              </p>
            </div>
            <div className="brand-card p-6">
              <p className="text-sm text-[#1a73e8] uppercase tracking-wide font-semibold mb-3">
                {t('landing.why.trusted.label')}
              </p>
              <p className="text-lg font-semibold text-[#111827]">
                {t('landing.why.trusted.title')}
              </p>
              <p className="mt-4 text-sm text-[#475569] leading-relaxed">
                {t('landing.why.trusted.body')}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-14">
        <SectionHeader
          title={t('landing.stories.title')}
          subtitle={t('landing.stories.subtitle')}
          className="mb-10"
        />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="brand-card p-6">
            <p className="text-sm text-[#1a73e8] uppercase tracking-wide font-semibold mb-3">
              {t('landing.stories.guru.label')}
            </p>
            <p className="text-lg font-semibold text-[#111827]">
              {t('landing.stories.guru.title')}
            </p>
            <p className="mt-4 text-sm text-[#475569] leading-relaxed">
              {t('landing.stories.guru.body')}
            </p>
            <p className="mt-5 text-xs text-[#9aa0a6]">{t('landing.stories.guru.author')}</p>
          </div>
          <div className="brand-card p-6">
            <p className="text-sm text-[#1a73e8] uppercase tracking-wide font-semibold mb-3">
              {t('landing.stories.learner.label')}
            </p>
            <p className="text-lg font-semibold text-[#111827]">
              {t('landing.stories.learner.title')}
            </p>
            <p className="mt-4 text-sm text-[#475569] leading-relaxed">
              {t('landing.stories.learner.body')}
            </p>
            <p className="mt-5 text-xs text-[#9aa0a6]">{t('landing.stories.learner.author')}</p>
          </div>
          <div className="brand-card p-6">
            <p className="text-sm text-[#1a73e8] uppercase tracking-wide font-semibold mb-3">
              {t('landing.stories.impact.label')}
            </p>
            <p className="text-lg font-semibold text-[#111827]">
              {t('landing.stories.impact.title')}
            </p>
            <p className="mt-4 text-sm text-[#475569] leading-relaxed">
              {t('landing.stories.impact.body')}
            </p>
            <p className="mt-5 text-xs text-[#9aa0a6]">{t('landing.stories.impact.author')}</p>
          </div>
        </div>
      </section>

      <section className="bg-[#f8fafc] py-14 px-4">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            title={t('landing.roadmap.title')}
            subtitle={t('landing.roadmap.subtitle')}
            className="text-center mx-auto mb-10"
          />
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="brand-card p-6">
              <h3 className="text-xl font-semibold text-[#111827]">
                {t('landing.roadmap.work.title')}
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-[#475569]">
                <li className="flex gap-3">
                  <span className="text-[#1a73e8]">✔</span> {t('landing.roadmap.work.item1')}
                </li>
                <li className="flex gap-3">
                  <span className="text-[#1a73e8]">✔</span> {t('landing.roadmap.work.item2')}
                </li>
                <li className="flex gap-3">
                  <span className="text-[#1a73e8]">✔</span> {t('landing.roadmap.work.item3')}
                </li>
              </ul>
            </div>
            <div className="brand-card p-6">
              <h3 className="text-xl font-semibold text-[#111827]">
                {t('landing.roadmap.why.title')}
              </h3>
              <p className="mt-4 text-sm text-[#475569] leading-relaxed">
                {t('landing.roadmap.why.body')}
              </p>
              <div className="mt-6 space-y-3 text-sm text-[#475569]">
                <p className="flex gap-3">
                  <span className="text-[#1a73e8]">⚡</span> {t('landing.roadmap.why.item1')}
                </p>
                <p className="flex gap-3">
                  <span className="text-[#1a73e8]">⚡</span> {t('landing.roadmap.why.item2')}
                </p>
                <p className="flex gap-3">
                  <span className="text-[#1a73e8]">⚡</span> {t('landing.roadmap.why.item3')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#e8eaed] bg-[#ffffff] py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-[#5f6368]">
          <span>{t('landing.footer.copyright', { year: new Date().getFullYear() })}</span>
          <div className="flex flex-wrap gap-4">
            <a href="/signup" className="hover:text-[#202124] transition-colors">
              {t('landing.footer.getStarted')}
            </a>
            <a href="/login" className="hover:text-[#202124] transition-colors">
              {t('landing.footer.signIn')}
            </a>
            <a href="/shop" className="hover:text-[#202124] transition-colors">
              {t('landing.footer.shop')}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
