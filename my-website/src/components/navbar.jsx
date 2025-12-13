import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/elements/button";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const { pathname } = useLocation();

  const items = [
    { name: "HOME", path: "/" },
    { name: "PROJECTS", path: "/projects" },
    { name: "ABOUT", path: "/about" },
    { name: "SYS", path: "/sys" },
  ];

  return (
    <nav className="flex items-center justify-between p-4 bg-neutral-900 pixel-border">
      {/* Left: Navigation */}
      <div className="flex gap-4">
        {items.map((item) => (
          <Link key={item.path} to={item.path}>
            <Button
              className={`pixel-border ${
                pathname === item.path ? "bg-blue-600" : ""
              }`}
            >
              {item.name}
            </Button>
          </Link>
        ))}
      </div>

      {/* Right: Theme Toggle */}
      <ThemeToggle />
    </nav>
  );
}
