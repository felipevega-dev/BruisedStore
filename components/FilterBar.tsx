"use client";

import { useState } from "react";
import { PAINTING_CATEGORIES, FilterOptions, PaintingCategory } from "@/types";
import { Search, SlidersHorizontal, X } from "lucide-react";

interface FilterBarProps {
  onFilterChange: (filters: FilterOptions) => void;
  totalResults: number;
}

export default function FilterBar({ onFilterChange, totalResults }: FilterBarProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    category: 'all',
    minPrice: 0,
    maxPrice: 0,
    sortBy: 'recent',
  });

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    let validatedValue = value;

    // Validar precios
    if (key === 'minPrice' || key === 'maxPrice') {
      // Convertir a número y evitar negativos
      const numValue = typeof value === 'number' ? value : Number(value);
      if (numValue < 0) {
        validatedValue = 0;
      } else {
        validatedValue = numValue;
      }

      // Validar que minPrice no sea mayor que maxPrice
      if (key === 'minPrice' && filters.maxPrice > 0 && validatedValue > filters.maxPrice) {
        validatedValue = filters.maxPrice;
      }
      if (key === 'maxPrice' && filters.minPrice > 0 && validatedValue < filters.minPrice && validatedValue > 0) {
        validatedValue = filters.minPrice;
      }
    }

    const newFilters = { ...filters, [key]: validatedValue };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const defaultFilters: FilterOptions = {
      category: 'all',
      sortBy: 'recent',
      search: '',
      minPrice: 0,
      maxPrice: 0,
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const hasActiveFilters =
    filters.category !== 'all' ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.search;

  return (
    <div className="mb-8 space-y-4">
      {/* Barra de búsqueda y botón de filtros */}
      <div className="flex flex-col gap-4 sm:flex-row">
        {/* Búsqueda */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar obras por título..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full rounded-lg border-2 border-black bg-white py-3 pl-12 pr-4 text-gray-900 placeholder-gray-500 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>

        {/* Botón de filtros */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 rounded-lg border-2 px-6 py-3 font-semibold transition-all ${showFilters || hasActiveFilters
              ? 'border-primary-500 bg-primary-500 text-white'
              : 'border-black bg-white text-gray-900 hover:bg-gray-50'
            }`}
        >
          <SlidersHorizontal className="h-5 w-5" />
          <span>Filtros</span>
          {hasActiveFilters && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-primary-600">
              !
            </span>
          )}
        </button>
      </div>

      {/* Panel de filtros desplegable */}
      {showFilters && (
        <div className="rounded-lg border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Filtros Avanzados</h3>
            {hasActiveFilters && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700"
              >
                <X className="h-4 w-4" />
                Limpiar filtros
              </button>
            )}
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Categoría */}
            <div>
              <label className="mb-2 block text-sm font-bold text-gray-900">
                Categoría
              </label>
              <select
                value={filters.category || 'all'}
                onChange={(e) => handleFilterChange('category', e.target.value as PaintingCategory | 'all')}
                className="w-full rounded-lg border-2 border-black bg-white px-4 py-2 text-gray-900 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="all">Todas las categorías</option>
                {PAINTING_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Ordenar por */}
            <div>
              <label className="mb-2 block text-sm font-bold text-gray-900">
                Ordenar por
              </label>
              <select
                value={filters.sortBy || 'recent'}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full rounded-lg border-2 border-black bg-white px-4 py-2 text-gray-900 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="recent">Más recientes</option>
                <option value="price-asc">Precio: Menor a Mayor</option>
                <option value="price-desc">Precio: Mayor a Menor</option>
                <option value="title-asc">Título: A-Z</option>
                <option value="title-desc">Título: Z-A</option>
              </select>
            </div>

            {/* Rango de precio */}
            <div>
              <label className="mb-2 block text-sm font-bold text-gray-900">
                Precio mínimo
              </label>
              <input
                type="number"
                placeholder="$0"
                min="0"
                value={filters.minPrice || ''}
                onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : 0)}
                className="w-full rounded-lg border-2 border-black bg-white px-4 py-2 text-base sm:text-sm text-gray-900 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-900">
                Precio máximo
              </label>
              <input
                type="number"
                placeholder="Sin límite"
                min="0"
                value={filters.maxPrice || ''}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : 0)}
                className="w-full rounded-lg border-2 border-black bg-white px-4 py-2 text-base sm:text-sm text-gray-900 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
          </div>
        </div>
      )}

      {/* Contador de resultados */}
      <div className="flex items-center justify-between text-sm">
        <p className="font-semibold text-gray-700">
          {totalResults} {totalResults === 1 ? 'obra encontrada' : 'obras encontradas'}
        </p>
        {hasActiveFilters && (
          <p className="text-gray-500">
            Filtros activos
          </p>
        )}
      </div>
    </div>
  );
}
