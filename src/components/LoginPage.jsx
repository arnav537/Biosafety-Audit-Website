import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FlaskConical, Lock, User, ArrowRight, AlertCircle, Sun, Moon } from 'lucide-react';
import { cn } from '../lib/utils';

export default function LoginPage({ onLogin, darkMode, toggleTheme }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
      e.preventDefault();
      setIsLoading(true);
      setError('');

      // Simulate network delay for a better UX feel
      setTimeout(() => {
          if (username === 'admin' && password === 'biosafety') {
              onLogin();
          } else {
              setError('Invalid credentials. Please try again.');
              setIsLoading(false);
          }
      }, 800);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-emerald-100/40 dark:bg-emerald-900/10 blur-3xl" />
        <div className="absolute top-[40%] -right-[10%] w-[60%] h-[60%] rounded-full bg-blue-100/40 dark:bg-blue-900/10 blur-3xl" />
      </div>

      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={toggleTheme}
          className="p-3 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-lg border border-white/50 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-300 hover:scale-110"
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <motion.div 
        className="relative z-10 w-full max-w-md p-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/50 dark:border-slate-800 shadow-2xl rounded-3xl"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 mb-4">
            <FlaskConical size={32} />
          </div>
          <h1 className="text-3xl font-serif font-bold text-slate-800 dark:text-white tracking-tight">BioSafe Portal</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-center">Enter your credentials to access the biosafety management dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Username</label>
            <div className="relative group">
              <User className="absolute left-3 top-3 text-slate-400 dark:text-slate-500 group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-400 transition-colors" size={18} />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/30 focus:border-emerald-500 outline-none transition-all font-medium text-slate-800 dark:text-white placeholder:text-slate-400"
                placeholder="Enter username"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-3 text-slate-400 dark:text-slate-500 group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-400 transition-colors" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/30 focus:border-emerald-500 outline-none transition-all font-medium text-slate-800 dark:text-white placeholder:text-slate-400"
                placeholder="Enter password"
              />
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100"
            >
              <AlertCircle size={16} />
              {error}
            </motion.div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className={cn(
                "w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]",
                isLoading && "opacity-80 cursor-not-allowed"
            )}
          >
            {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
                <>
                    Sign In <ArrowRight size={18} />
                </>
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
          <p>Protected System. Authorized Personnel Only.</p>
        </div>
      </motion.div>
    </div>
  );
}
