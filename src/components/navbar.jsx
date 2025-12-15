import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const { pathname } = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const items = [
    { name: "HOME", path: "/" },
    { name: "PROJECTS", path: "/projects" },
    { name: "ABOUT", path: "/about" },
    { name: "SYS", path: "/sys" },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 z-50 w-full border-b-2 border-green-900/50 bg-black/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
          
          {/* LEFT: Logo or Mobile Menu Button */}
          <div className="flex items-center gap-4">
            
            {/* Hamburger Button (Mobile Only) */}
            <button 
              onClick={() => setIsOpen(true)}
              className="md:hidden text-green-500 hover:text-green-400 focus:outline-none"
              aria-label="Open Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Desktop Navigation (Hidden on Mobile) */}
            <div className="hidden md:flex gap-4">
              {items.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link key={item.path} to={item.path}>
                    <button
                      className={`
                        relative font-arcade text-sm px-4 py-2 transition-all duration-200 whitespace-nowrap
                        border-2 
                        ${isActive 
                          ? "border-green-500 bg-green-900/20 text-green-400 shadow-[0_0_10px_rgba(0,255,0,0.4)]" 
                          : "border-transparent text-gray-500 hover:text-green-200 hover:border-green-800/50"
                        }
                      `}
                    >
                      {isActive && <span className="absolute left-1.5 animate-pulse">▶</span>}
                      {item.name}
                    </button>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Theme Toggle & Status Light */}
          <div className="flex items-center gap-4 shrink-0 border-l border-green-900/30 pl-4">
            <div className="hidden sm:flex items-center gap-2 font-tech text-xs text-green-600">
               <span className="relative flex h-2 w-2">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
               </span>
               <span className="hidden md:inline">NET:ON</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
        
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-green-500/50 to-transparent"></div>
      </nav>

      {/* === MOBILE SIDEBAR OVERLAY === */}
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <div className={`
        fixed top-0 left-0 bottom-0 z-[70] w-64 bg-black border-r-2 border-green-900/50 shadow-[0_0_50px_rgba(0,255,0,0.1)]
        transform transition-transform duration-300 ease-out md:hidden flex flex-col
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        
        {/* Sidebar Header */}
        <div className="p-4 border-b border-green-900/50 flex justify-between items-center bg-green-900/10">
          <span className="font-arcade text-green-500 tracking-widest">MENU_SYS</span>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-green-700 hover:text-green-400"
          >
            [X]
          </button>
        </div>

        {/* Sidebar Links */}
        <div className="flex-1 p-4 space-y-2 overflow-y-auto">
          {items.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)}>
                <div className={`
                  font-arcade text-sm px-4 py-3 border-l-2 transition-all duration-200
                  ${isActive 
                    ? "border-green-500 bg-green-900/20 text-green-400 pl-6" 
                    : "border-transparent text-gray-500 hover:text-green-200 hover:bg-white/5"
                  }
                `}>
                  {isActive && <span className="mr-2 animate-pulse">▶</span>}
                  {item.name}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-green-900/50 font-tech text-[10px] text-green-900 text-center">
          SYSTEM_ID: JAYDE.EXE
        </div>
      </div>
    </>
  );
}