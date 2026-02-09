"use client";

import Icon from "./Icon";

interface MobileNavProps {
  currentSection: string;
  onNavigate: (section: string, data?: Record<string, unknown>) => void;
}

const navItems = [
  { id: "dashboard", icon: "home", label: "Home" },
  { id: "chapter", icon: "auto_stories", label: "Study" },
  { id: "library", icon: "library_books", label: "Library" },
  { id: "daily", icon: "workspace_premium", label: "Daily", accent: true },
  { id: "profile", icon: "person", label: "Profile" },
];

export default function MobileNav({ currentSection, onNavigate }: MobileNavProps) {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 ios-blur border-t border-gray-100 z-50">
      {/* League bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-50">
        <div className="flex items-center gap-3">
          <div className="size-8 flex items-center justify-center bg-primary text-white rounded-full font-bold text-[10px] ring-4 ring-primary/10">
            #142
          </div>
          <div>
            <h4 className="text-xs font-bold text-primary leading-tight">Gold League</h4>
            <div className="flex items-center gap-1">
              <Icon name="trending_up" className="text-green-600 text-[12px]" />
              <span className="text-[9px] text-green-600 font-bold uppercase">Moving Up</span>
            </div>
          </div>
        </div>
        <div className="flex gap-1 items-end h-5">
          <div className="w-1 h-2 bg-primary/20 rounded-full" />
          <div className="w-1 h-4 bg-primary/40 rounded-full" />
          <div className="w-1 h-1.5 bg-primary/20 rounded-full" />
          <div className="w-1 h-3 bg-primary/60 rounded-full" />
          <div className="w-1 h-5 bg-primary rounded-full" />
        </div>
      </div>

      {/* Nav icons */}
      <div className="flex items-center justify-around px-2 py-2 pb-3">
        {navItems.map((item) => {
          const isActive = currentSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-1 cursor-pointer transition-colors
                ${isActive ? "text-primary" : "text-light-grey"}`}
            >
              <Icon
                name={item.icon}
                className={item.accent && !isActive ? "text-accent-red" : ""}
                filled={isActive}
              />
              <span className={`text-[10px] uppercase tracking-tighter ${isActive ? "font-bold" : "font-medium"}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}