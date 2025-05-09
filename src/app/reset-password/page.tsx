"use client";

import { resetPasswordAction } from "@/src/services/AuthServices";
import { useState } from "react";

// Komponen Button custom
function SubmitButtonCustom({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="submit"
      className="relative w-full rounded-xl px-6 py-3.5 font-medium transition-all duration-300 focus:outline-none shadow-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 active:scale-[0.98] transform hover:scale-[1.01]"
      formAction={resetPasswordAction}
    >
      {children}
    </button>
  );
}

// Komponen Input custom
function InputCustom({ 
  type, 
  name, 
  placeholder, 
  required = false,
  icon
}: { 
  type: string; 
  name: string; 
  placeholder: string; 
  required?: boolean;
  icon: React.ReactNode;
}) {
  return (
    <div className="relative group">
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
        {icon}
      </div>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70 px-4 py-3.5 pl-10 text-slate-900 dark:text-white placeholder-slate-400 shadow-sm transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 focus:bg-white dark:focus:bg-slate-800"
      />
    </div>
  );
}

// Komponen Label custom
function LabelCustom({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label 
      htmlFor={htmlFor} 
      className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
    >
      {children}
    </label>
  );
}

export default function ResetPassword(){
 
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  
  // Password strength indicator
  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  
  // Function to check password strength
  const checkPasswordStrength = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 1;
    
    // Contains uppercase
    if (/[A-Z]/.test(password)) strength += 1;
    
    // Contains lowercase
    if (/[a-z]/.test(password)) strength += 1;
    
    // Contains numbers
    if (/[0-9]/.test(password)) strength += 1;
    
    // Contains special characters
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    setPasswordStrength(strength);
  };
  
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
            className="absolute opacity-20 blur-xl"
            style={{
              width: `${(i * 15) + 20}px`,
              height: `${(i * 15) + 20}px`,
              left: `${(i * 20) % 100}%`,
              top: `${(i * 18) % 100}%`,
              borderRadius: '50%',
              backgroundColor: `rgba(${100 + i * 30}, ${80 + i * 25}, ${150 + i * 20}, 0.4)`,
              animation: `float ${10 + i * 2}s ease-in-out ${i}s infinite alternate`
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
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Reset Password</h1>
            <p className="text-slate-600 dark:text-slate-300 max-w-xs mx-auto">
              Buat password baru yang kuat untuk mengamankan akun Anda
            </p>
          </div>

          <form className="space-y-6">
            {/* Password field */}
            <div className="relative">
              <LabelCustom htmlFor="password">
                Password Baru
              </LabelCustom>
              <div className="relative">
                <InputCustom
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Masukkan password baru"
                  required={true}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  }
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
              
              {/* Password strength indicator */}
              <div className="mt-2">
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      passwordStrength === 0 ? 'w-0' :
                      passwordStrength === 1 ? 'w-1/5 bg-red-500' :
                      passwordStrength === 2 ? 'w-2/5 bg-orange-500' :
                      passwordStrength === 3 ? 'w-3/5 bg-yellow-500' :
                      passwordStrength === 4 ? 'w-4/5 bg-blue-500' :
                      'w-full bg-green-500'
                    }`}
                  ></div>
                </div>
                <div className="text-xs text-slate-500 mt-1 dark:text-slate-400">
                  Password harus memiliki minimal 8 karakter dengan kombinasi huruf besar, huruf kecil, angka, dan simbol
                </div>
              </div>
            </div>
            
            {/* Confirm Password field */}
            <div className="relative">
              <LabelCustom htmlFor="confirmPassword">
                Konfirmasi Password
              </LabelCustom>
              <div className="relative">
                <InputCustom
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Konfirmasi password baru"
                  required={true}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  }
                />
                <button 
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  {showConfirmPassword ? (
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
            </div>

            <div className="pt-2">
              <SubmitButtonCustom>
                Reset Password
              </SubmitButtonCustom>
            </div>
            
            {/* Security tips */}
            <div className="mt-6 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl p-4">
              <h3 className="text-sm font-medium text-indigo-800 dark:text-indigo-200 mb-2">Tips Keamanan</h3>
              <ul className="text-xs text-indigo-700 dark:text-indigo-300 space-y-1.5">
                <li className="flex items-center">
                  <svg className="h-3.5 w-3.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  Gunakan minimal 8 karakter dengan kombinasi huruf, angka, dan simbol
                </li>
                <li className="flex items-center">
                  <svg className="h-3.5 w-3.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  Hindari menggunakan informasi pribadi seperti tanggal lahir
                </li>
                <li className="flex items-center">
                  <svg className="h-3.5 w-3.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  Jangan gunakan password yang sama untuk akun lain
                </li>
              </ul>
            </div>
          </form>
        </div>
        
        {/* Bottom decoration */}
        <div className="w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
      </div>
    </div>
  );
}