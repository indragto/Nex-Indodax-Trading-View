"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { name: "Market", href: "/" },
    { name: "Trading", href: "/trade" },
    { name: "Calculator", href: "/calculator" },
  ];

  return (
    <nav className="bg-gray-800 text-white shadow">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo and title */}
        <div className="flex items-center space-x-3">
          <img
            src="next.svg" // Ganti dengan path logo Anda
            alt="Logo"
            className="h-5"
          />
          <Link href="/" className="text-2xl font-bold">
            <span className="text-red-500">Indodax</span> Trading View
          </Link>
        </div>
        <div className="hidden md:flex space-x-6">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`hover:text-blue-200 p-2 ${
                pathname === item.href ? "nav-menu-active font-semibold" : ""
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            />
          </svg>
        </button>
      </div>
      {isOpen && (
        <div className="md:hidden bg-blue-500">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-2 hover:bg-blue-400 ${
                pathname === item.href ? "bg-yellow-400 font-semibold" : ""
              }`}
              onClick={() => setIsOpen(false)}
            >
              {item.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
