import React from 'react';
import { Search, X, Filter, SlidersHorizontal, UserPlus } from 'lucide-react';
import ContactCard from './ContactCard';
import { translations } from '../locales/translations';

export default function ContactList({ 
  contacts, 
  allContactsCount,
  categoryCounts,
  language, 
  searchQuery, 
  onSearchChange, 
  categoryFilter, 
  onCategoryFilterChange, 
  villageFilter, 
  onVillageFilterChange, 
  wardFilter, 
  onWardFilterChange, 
  villageList, 
  wardList, 
  onToggleCategory, 
  onEdit, 
  onDelete,
  onOpenAdd
}) {
  const t = translations[language];

  const hasActiveFilters = searchQuery || categoryFilter !== 'ALL' || villageFilter || wardFilter;

  const handleClearFilters = () => {
    onSearchChange('');
    onCategoryFilterChange('ALL');
    onVillageFilterChange('');
    onWardFilterChange('');
  };

  return (
    <div className="space-y-5 animate-in fade-in max-w-7xl mx-auto pb-12 sm:pb-0">
      
      {/* 1. Search & Filter Control Center */}
      <div className="bg-slate-900/80 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-slate-800 shadow-xl space-y-4">
        
        {/* Search Input & Quick Add Button */}
        <div className="flex items-center gap-2.5">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-11 pr-10 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
            {searchQuery && (
              <button 
                onClick={() => onSearchChange('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button 
            onClick={onOpenAdd}
            className="hidden sm:inline-flex px-4 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-2xl text-xs sm:text-sm font-bold items-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95 transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t.addContact}</span>
          </button>
        </div>

        {/* Category Pills & Dropdown Selectors */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          
          {/* Category Filter Pills with Live Counters */}
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scroll pb-1 -mx-2 px-2 sm:mx-0 sm:px-0">
            {[
              { id: 'ALL', label: 'All', count: allContactsCount },
              { id: 'SUPPORTER', label: 'Supporters', count: categoryCounts.supporters, color: 'text-emerald-400' },
              { id: 'NEUTRAL', label: 'Neutral', count: categoryCounts.neutral, color: 'text-sky-400' },
              { id: 'OTHER', label: 'Other', count: categoryCounts.other, color: 'text-slate-400' }
            ].map(cat => {
              const isActive = categoryFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => onCategoryFilterChange(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition ${
                    isActive 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' 
                      : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'}`}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Village & Ward Filter Selects */}
          <div className="flex items-center gap-2 text-xs">
            <select
              value={villageFilter}
              onChange={(e) => onVillageFilterChange(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">{t.allVillages}</option>
              {villageList.map(v => <option key={v} value={v}>{v}</option>)}
            </select>

            <select
              value={wardFilter}
              onChange={(e) => onWardFilterChange(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">{t.allWards}</option>
              {wardList.map(w => <option key={w} value={w}>{w}</option>)}
            </select>

            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-bold px-2 py-1 transition"
                title="Reset all filters"
              >
                Reset
              </button>
            )}
          </div>
        </div>

      </div>

      {/* 2. Contacts Grid Header */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-400 font-semibold">
        <span>Showing <strong className="text-white">{contacts.length}</strong> matching voter contacts</span>
        <span>Directory v1.0</span>
      </div>

      {/* 3. Empty State or Contacts Grid */}
      {contacts.length === 0 ? (
        <div className="bg-slate-900/60 rounded-3xl p-12 text-center border border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto text-xl">
            <Filter className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-white">No matching voter contacts found</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search query, or clear active category and village filters.
          </p>
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {contacts.map(c => (
            <ContactCard
              key={c.id}
              contact={c}
              language={language}
              onToggleCategory={onToggleCategory}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

    </div>
  );
}
