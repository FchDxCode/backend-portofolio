import { forgotPasswordAction } from "@/src/services/AuthServices";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";

// Komponen Button yang dibuat tanpa menggunakan komponen yang sudah ada
function SubmitButtonCustom({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="submit"
      className="relative w-full rounded-xl px-6 py-3.5 font-medium transition-all duration-300 focus:outline-none shadow-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 active:scale-[0.98] transform hover:scale-[1.01]"
      formAction={forgotPasswordAction}
    >
      {children}
    </button>
  );
}

// Komponen Input yang dibuat tanpa menggunakan komponen yang sudah ada
function InputCustom({ name, placeholder, required = false }: { name: string; placeholder: string; required?: boolean }) {
  return (
    <input
      name={name}
      placeholder={placeholder}
      required={required}
      className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70 px-4 py-3.5 pl-10 text-slate-900 dark:text-white placeholder-slate-400 shadow-sm transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 focus:bg-white dark:focus:bg-slate-800"
    />
  );
}

export default async function ForgotPassword(){

  
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900 p-4 overflow-hidden">
      {/* Background decoration elements */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-yellow-300 dark:bg-yellow-500 blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-blue-300 dark:bg-blue-600 blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-40 h-40 rounded-full bg-pink-300 dark:bg-pink-600 blur-3xl opacity-20 animate-pulse"></div>
        
        {/* Animated floating circles */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div 
            key={i}
            className={`absolute opacity-20 blur-xl`}
            style={{
              width: `${Math.random() * 60 + 20}px`,
              height: `${Math.random() * 60 + 20}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              borderRadius: '50%',
              backgroundColor: `rgba(${Math.random() * 255}, ${Math.random() * 200}, ${Math.random() * 255}, 0.4)`,
              animation: `float ${Math.random() * 20 + 10}s ease-in-out ${Math.random() * 5}s infinite alternate`
            }}
          />
        ))}
      </div>
      
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl backdrop-blur-xl bg-white/60 dark:bg-slate-800/60 shadow-2xl transition-all">
        {/* Card decoration */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 rounded-full blur-xl"></div>
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full blur-xl"></div>
        
        <div className="px-8 py-10 relative">
          {/* Header with icon */}
          <div className="text-center mb-8">
            <div className="mb-4 inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/40 transform hover:scale-105 transition-transform duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Reset Password</h1>
            <p className="text-slate-600 dark:text-slate-300 max-w-xs mx-auto">
              Masukkan email Anda dan kami akan mengirimkan tautan untuk mereset password Anda
            </p>
          </div>

          <form className="space-y-6">
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
                <InputCustom
                  name="email"
                  placeholder="nama@perusahaan.com"
                  required={true}
                />
              </div>
            </div>

            <SubmitButtonCustom>
              Kirim Tautan Reset
            </SubmitButtonCustom>
            
            {/* Back to Login Link */}
            <div className="text-center mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-slate-600 dark:text-slate-400">
                Ingat password Anda?{" "}
                <Link 
                  href="/sign-in" 
                  className="font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors hover:underline"
                >
                  Kembali ke Login
                </Link>
              </p>
            </div>
          </form>
        </div>
        
        {/* Bottom decoration */}
        <div className="w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
      </div>
      
      
    </div>
  );
}