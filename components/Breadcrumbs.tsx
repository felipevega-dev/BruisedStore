"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center gap-2 text-sm">
        {/* Home */}
        <li>
          <Link
            href="/"
            className="flex items-center gap-1 text-gray-600 transition-colors hover:text-red-600"
          >
            <Home className="h-4 w-4" />
            <span>Inicio</span>
          </Link>
        </li>

        {/* Items */}
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4 text-gray-400" />
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="text-gray-600 transition-colors hover:text-red-600"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="font-bold text-gray-900">{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
