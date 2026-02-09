"use client";

import Icon from "./Icon";

interface SidebarProps {
  currentSection: string;
  onNavigate: (section: string, data?: Record<string, unknown>) => void;
}

const navItems = [
  { id: "dashboard", icon: "home", label: "Home" },
  { id: "chapter", icon: "auto_stories", label: "Study" },
  { id: "library", icon: "library_books", label: "Library" },
  { id: "daily", icon: "workspace_premium", label: "Daily Insights", accent: true },
  { id: "profile", icon: "person", label: "Profile" },
];

export default function Sidebar({ currentSection, onNavigate }: SidebarProps) {
  return (
    <aside className="hidden lg:flex flex-col fixed top-0 left-0 h-screen w-[240px] bg-white border-r border-gray-100 z-50">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Icon name="auto_stories" className="text-deep-red text-2xl" />
          <div>
            <p className="text-primary text-sm font-bold leading-tight">The Rambam</p>
            <p className="text-deep-red text-[10px] font-bold uppercase tracking-widest">
              Experience
            </p>
          </div>
        </div>
      </div>

      {/* User */}
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
            NR
          </div>
          <div>
            <p className="text-primary text-sm font-semibold">Noa Riley</p>
            <p className="text-accent-red text-[10px] font-bold uppercase tracking-wider">
              Scholar · Gold
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex items-center gap-3 px-5 py-3 w-full text-left text-sm transition-colors cursor-pointer
              ${currentSection === item.id
                ? "text-primary bg-primary/[0.06] border-r-[3px] border-primary font-semibold"
                : "text-slate-grey hover:text-primary hover:bg-primary/[0.03]"
              }`}
          >
            <Icon
              name={item.icon}
              className={`text-xl ${item.accent ? "text-accent-red" : ""}`}
              filled={currentSection === item.id}
            />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Streak footer */}
      <div className="px-5 py-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <Icon name="local_fire_department" className="text-accent-red streak-glow" filled />
          <span className="text-primary text-sm font-bold">12 Day Streak</span>
        </div>
        <p className="text-warm-grey text-[10px] font-bold mt-1 uppercase tracking-wider">
          2,450 XP · #142 Gold
        </p>
      </div>
    </aside>
  );
}