"use client";

import React from "react";
import Link from "next/link";
import { useTheme } from "next-themes";

interface ButtonProps {
  label: string;
  onClick?: () => void;
  href?: string;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ label, onClick, href, icon }) => {
  const { theme } = useTheme();

  const buttonContent = (
    <span
      className={`relative z-10 block px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 ${
        theme === "light"
          ? "bg-white text-black shadow-inner shadow-sky-200"
          : "bg-gray-950 text-white shadow-lg shadow-blue-900"
      }`}
    >
      <span className="transition-all duration-500 group-hover:translate-x-1">
        {label}
      </span>
      {icon && (
        <span className="transition-transform duration-500 group-hover:translate-x-1">
          {icon}
        </span>
      )}
    </span>
  );

  return (
    <div className="relative group inline-block">
      {href ? (
        <Link href={href} passHref>
          <button
            onClick={onClick}
            className={`relative inline-block p-px font-semibold leading-6 cursor-pointer rounded-xl transition-transform duration-300 ease-in-out hover:scale-105 active:scale-95 ${
              theme === "dark" ? "shadow-xl shadow-blue-900" : "shadow-lg"
            }`}
          >
            <span
              className={`absolute inset-0 rounded-xl p-[2px] opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${
                theme === "light"
                  ? "bg-gradient-to-r from-sky-300 via-sky-400 to-sky-500"
                  : "bg-gradient-to-r from-teal-400 via-blue-500 to-purple-500"
              } ${
                theme === "dark"
                  ? "group-hover:blur-sm group-hover:shadow-[0_0_20px_rgba(56,189,248,0.6)]"
                  : ""
              }`}
            ></span>
            {buttonContent}
          </button>
        </Link>
      ) : (
        <button
          onClick={onClick}
          className={`relative inline-block p-px font-semibold leading-6 cursor-pointer rounded-xl transition-transform duration-300 ease-in-out hover:scale-105 active:scale-95 ${
            theme === "dark" ? "shadow-xl shadow-blue-900" : "shadow-lg"
          }`}
        >
          <span
            className={`absolute inset-0 rounded-xl p-[2px] opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${
              theme === "light"
                ? "bg-gradient-to-r from-sky-300 via-sky-400 to-sky-500"
                : "bg-gradient-to-r from-teal-400 via-blue-500 to-purple-500"
            } ${
              theme === "dark"
                ? "group-hover:blur-sm group-hover:shadow-[0_0_20px_rgba(56,189,248,0.6)]"
                : ""
            }`}
          ></span>
          {buttonContent}
        </button>
      )}
    </div>
  );
};

export default Button;
