import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Tag } from 'lucide-react';
import { useGuruSearch, useGuruSuggestions } from '@/hooks/useGurus';
import { useDebounce } from '@/hooks/useDebounce';
import { GuruCard, type GuruCardData } from '@/components/guru/GuruCard';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { FeatureCard } from '@/components/ui/FeatureCard';
import { SectionHeader } from '@/components/ui/SectionHeader';

type ActiveField = 'q' | 'skill' | null;

export default function Landing() {

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

  // Debounce the active input so we don't query on every keystroke
  const debouncedQ = useDebounce(q, 250);
  const debouncedSkill = useDebounce(skill, 250);
  const suggestionQuery = activeField === 'q' ? debouncedQ : activeField === 'skill' ? debouncedSkill : '';

  const { data: suggestions } = useGuruSuggestions(suggestionQuery);

  // Build the flat suggestion list based on which field is active
  const items: Array<{ type: 'name'; id: string; label: string; avatarUrl: string | null } | { type: 'skill'; label: string }> =
    activeField === 'q'
      ? (suggestions?.names ?? []).map((n) => ({ type: 'name', id: n.id, label: n.user.name, avatarUrl: n.user.avatarUrl }))
      : (suggestions?.skills ?? []).map((s) => ({ type: 'skill', label: s }));

  const showDropdown = activeField !== null && suggestionQuery.length >= 1 && items.length > 0;

  // Reset highlight when items change
  useEffect(() => { setHighlightedIdx(-1); }, [items.length, activeField]);

  const closeDropdown = useCallback(() => {
    setActiveField(null);
    setHighlightedIdx(-1);
  }, []);

  // Close on outside click
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
    // Delay so that clicking a suggestion fires before the dropdown closes
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
      <section className="flex flex-col items-center justify-center px-4 pt-20 pb-10">
        <div className="w-full max-w-3xl text-center">
          <Logo />
          <p className="text-[#475569] text-base sm:text-lg mt-4 max-w-2xl mx-auto">
            A modern platform for every Indian to learn skills, sell services, and grow a digital business.
          </p>
        </div>

        {/* Search container — relative so the dropdown can be absolute below it */}
        <div ref={containerRef} className="w-full max-w-xl relative mt-10">
          <form onSubmit={handleSearch}>
            {/* Search bar pill */}
            <div
              className={`brand-card flex items-center gap-3 bg-white px-5 py-3 transition-shadow ${
                showDropdown
                  ? 'rounded-b-none border-b-0 shadow-none'
                  : 'border border-[#dfe1e5] g-search-shadow'
              }`}
            >
              <Search className="w-5 h-5 text-[#9aa0a6] flex-shrink-0" />

              {/* Name input */}
              <input
                ref={qInputRef}
                value={q}
                onChange={(e) => { setQ(e.target.value); setHighlightedIdx(-1); }}
                onFocus={() => handleFocus('q')}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                placeholder="Guru name…"
                autoComplete="off"
                className="flex-1 outline-none text-[#202124] text-base placeholder-[#9aa0a6] bg-transparent min-w-0"
              />

              <div className="w-px h-5 bg-[#dfe1e5] flex-shrink-0" />

              {/* Skill input */}
              <Tag className="w-4 h-4 text-[#9aa0a6] flex-shrink-0" />
              <input
                ref={skillInputRef}
                value={skill}
                onChange={(e) => { setSkill(e.target.value); setHighlightedIdx(-1); }}
                onFocus={() => handleFocus('skill')}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                placeholder="Skill…"
                autoComplete="off"
                className="w-28 outline-none text-[#202124] text-base placeholder-[#9aa0a6] bg-transparent"
              />
            </div>

            {/* Autocomplete dropdown */}
            {showDropdown && (
              <div className="absolute left-0 right-0 bg-white border border-[#dfe1e5] border-t-0 rounded-b-2xl shadow-lg z-50 overflow-hidden">
                <div className="border-t border-[#ececec] mx-4" />
                <ul className="py-2">
                  {items.map((item, idx) => (
                    <li key={`${item.type}-${item.label}`}>
                      <button
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); applySuggestion(item); }}
                        onMouseEnter={() => setHighlightedIdx(idx)}
                        className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors ${
                          idx === highlightedIdx ? 'bg-[#f1f3f4]' : 'hover:bg-[#f8f9fa]'
                        }`}
                      >
                        {item.type === 'name' ? (
                          <>
                            {item.avatarUrl ? (
                              <img src={item.avatarUrl} alt={item.label} className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-[#1E3A8A] flex items-center justify-center text-white text-xs font-medium flex-shrink-0 select-none">
                                {item.label[0]?.toUpperCase()}
                              </div>
                            )}
                            <span className="text-sm text-[#202124] flex-1 truncate">{item.label}</span>
                            <span className="text-xs text-[#475569]">Guru</span>
                          </>
                        ) : (
                          <>
                            <Tag className="w-4 h-4 text-[#9aa0a6] flex-shrink-0" />
                            <span className="text-sm text-[#202124] flex-1">{item.label}</span>
                            <span className="text-xs text-[#475569]">Skill</span>
                          </>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
              <Button type="submit" className="w-full sm:w-auto">Search Gurus</Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full sm:w-auto text-[#3c4043] border border-[#dfe1e5] hover:bg-[#f1f3f4]"
                onClick={() => { setQ(''); setSkill(''); setSubmitted({ q: '', skill: '' }); closeDropdown(); }}
              >
                Browse All
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* Results */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="border-t border-[#e8eaed] mb-8" />
        <h2 className="text-[#202124] text-lg font-normal mb-6">
          {hasSearch ? (
            <><span className="text-[#5f6368] text-sm">Results for </span><span className="font-medium">"{submitted.q || submitted.skill}"</span></>
          ) : 'Featured Gurus'}
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-52 bg-[#f1f3f4] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : data?.data?.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#5f6368]">No results for <strong>"{submitted.q || submitted.skill}"</strong></p>
            <p className="text-[#5f6368] text-sm mt-1">Try different keywords or browse all gurus</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {data?.data?.map((guru: GuruCardData) => (
              <GuruCard key={guru.id} guru={guru} />
            ))}
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="bg-[#f8fafc] border-t border-[#e8eaed] py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <SectionHeader
            title="How SakshamBharat works"
            subtitle="Find a guru, book a session, and grow your business with a simple marketplace designed for India."
            className="text-center mx-auto mb-10"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '🔍', title: 'Find a Guru', desc: 'Browse profiles, skills, videos and ratings to find your perfect teacher.' },
              { icon: '📅', title: 'Book a Session', desc: 'Pick a one-time appointment or a daily subscription that fits your schedule.' },
              { icon: '⭐', title: 'Learn & Grow', desc: 'Attend the session and share your experience with a review.' },
            ].map((item) => (
              <FeatureCard key={item.title} icon={item.icon} title={item.title} description={item.desc} />
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-[#e8eaed] bg-[#f8f9fa] py-4 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-[#5f6368]">
          <span>© {new Date().getFullYear()} SakshamBharat</span>
          <div className="flex gap-6">
            <a href="/signup" className="hover:text-[#202124] transition-colors">Get started</a>
            <a href="/login" className="hover:text-[#202124] transition-colors">Sign in</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
