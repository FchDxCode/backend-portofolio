"use client";

import { signInAction } from "@/src/services/AuthServices";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { useState, useEffect } from "react";

// Definisikan interface untuk elemen floating
interface FloatingElement {
  id: number;
  shape: 'circle' | 'square' | 'triangle';
  color: 'indigo' | 'purple' | 'blue' | 'pink';
  size: number;
  left: string;
  top: string;
  duration: number;
  delay: number;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="relative w-full rounded-lg px-6 py-4 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-md bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 focus:ring-indigo-500 disabled:from-slate-400 disabled:to-slate-500 transform hover:scale-[1.02] active:scale-[0.98]"
    >
      <span className={`${pending ? "opacity-0" : "opacity-100"} flex items-center justify-center`}>
        Masuk ke Akun
      </span>
      {pending && (
        <span className="absolute inset-0 flex items-center justify-center">
          <svg
            className="h-5 w-5 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="ml-2">Sedang Masuk...</span>
        </span>
      )}
    </button>
  );
}

export default function Login() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  
  // Animasi efek muncul
  useEffect(() => {
    setMounted(true);
  }, []);

  // Animasi floating efek untuk elemen latar belakang
  const [floatingElements, setFloatingElements] = useState<FloatingElement[]>([]);

  useEffect(() => {
    const generateElements = () => {
      const newElements: FloatingElement[] = [];
      const shapes: FloatingElement['shape'][] = ['circle', 'square', 'triangle'];
      const colors: FloatingElement['color'][] = ['indigo', 'purple', 'blue', 'pink'];
      
      for (let i = 0; i < 8; i++) {
        newElements.push({
          id: i,
          shape: shapes[Math.floor(Math.random() * shapes.length)],
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.floor(Math.random() * 50) + 20,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          duration: Math.floor(Math.random() * 20) + 10,
          delay: Math.floor(Math.random() * 5)
        });
      }
      
      setFloatingElements(newElements);
    };

    generateElements();
  }, []);

  // Definisi inline style untuk elemen floating
  const getFloatingElementStyle = (el: FloatingElement): React.CSSProperties => ({
    width: `${el.size}px`,
    height: `${el.size}px`,
    left: el.left,
    top: el.top,
    borderRadius: el.shape === 'circle' ? '50%' : el.shape === 'square' ? '0' : '50% 50% 0 50%',
    backgroundColor: el.shape === 'triangle' ? 'transparent' : `var(--color-${el.color}-400)`,
    boxShadow: el.shape === 'triangle' ? 'none' : `0 0 30px var(--color-${el.color}-300)`,
    animation: `float ${el.duration}s ease-in-out ${el.delay}s infinite alternate`,
    transform: el.shape === 'triangle' ? 'rotate(45deg)' : '',
  });
  
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900 p-4 overflow-hidden">
      {/* Background elements - floating decoration */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {floatingElements.map((el) => (
          <div 
            key={el.id}
            className={`absolute opacity-20 blur-xl animate-float`}
            style={getFloatingElementStyle(el)}
          />
        ))}
        <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-yellow-300 dark:bg-yellow-500 blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-blue-300 dark:bg-blue-600 blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-40 h-40 rounded-full bg-pink-300 dark:bg-pink-600 blur-3xl opacity-20 animate-pulse"></div>
      </div>
      
      {/* Login card */}
      <div className={`relative z-10 w-full max-w-md overflow-hidden rounded-2xl backdrop-blur-xl bg-white/60 dark:bg-slate-800/60 shadow-2xl transition-all transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'} duration-700 ease-out`}>
        {/* Card decoration */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 rounded-full blur-xl"></div>
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full blur-xl"></div>
        
        <div className="relative px-8 pt-8 pb-6">
          <div className="text-center mb-8">
            <div className="mb-4 inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/40 transform hover:scale-105 transition-transform duration-300 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Selamat Datang Kembali</h2>
            <p className="text-slate-600 dark:text-slate-300 max-w-xs mx-auto">
              Masuk ke akun Anda untuk melanjutkan
            </p>
          </div>
          
          <form className="space-y-6" action={signInAction}>
            {/* Email field */}
            <div className="relative">
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70 px-4 py-3.5 pl-10 text-slate-900 dark:text-white placeholder-slate-400 shadow-sm transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 focus:bg-white dark:focus:bg-slate-800"
                  placeholder="nama@perusahaan.com"
                  required
                />
                <div className="absolute inset-y-0 right-3 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="text-xs text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-md">
                    Email Anda
                  </div>
                </div>
              </div>
            </div>
            
            {/* Password field */}
            <div className="relative">
              <div className="flex justify-between items-center mb-1.5">
                <label 
                  htmlFor="password" 
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Password
                </label>
                <Link
                  className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors duration-200 hover:underline"
                  href="/forgot-password"
                >
                  Lupa Password?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70 px-4 py-3.5 pl-10 pr-10 text-slate-900 dark:text-white placeholder-slate-400 shadow-sm transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 focus:bg-white dark:focus:bg-slate-800"
                  placeholder="Masukkan password Anda"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="text-xs text-slate-500 mt-1.5 ml-1 dark:text-slate-400">
                Password harus memiliki minimal 8 karakter
              </div>
            </div>
            
            <div className="pt-4">
              <SubmitButton />
            </div>
            
            {/* Register option */}
            <div className="text-center mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-slate-600 dark:text-slate-400">
                Belum punya akun?{" "}
                <Link 
                  href="/register" 
                  className="font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors hover:underline"
                >
                  Daftar sekarang
                </Link>
              </p>
            </div>
          </form>
        </div>
        
        {/* Bottom decoration */}
        <div className="w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
      </div>
      
      {/* Brand/Copyright */}
      <div className="absolute bottom-4 text-center text-white/70 text-sm w-full">
        <p>© 2025 Perusahaan Anda • Semua Hak Dilindungi</p>
      </div>
    </div>
  );
}