
import React, { useState } from 'react';
import { ShieldCheckIcon, LockClosedIcon, UserIcon } from '@heroicons/react/24/solid';
import { User } from '../types';

interface LoginProps {
  onLoginAttempt: (credentials: {username: string, password: string}) => {success: boolean, error?: string};
}

const Login: React.FC<LoginProps> = ({ onLoginAttempt }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }

    const result = onLoginAttempt({ username, password });
    if (!result.success) {
      setError(result.error || 'Sai thông tin đăng nhập.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-red-900/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]"></div>

      <div className="max-w-md w-full p-8 z-10">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center p-4 bg-red-600 rounded-2xl shadow-lg mb-6 transform hover:scale-110 transition-transform">
              <ShieldCheckIcon className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white uppercase tracking-wider">Hệ thống Chi bộ</h1>
            <p className="text-slate-400 text-sm mt-2 font-medium uppercase">Công tác Đảng - QĐND Việt Nam</p>
          </div>

          <form onSubmit={handleLogin} className="p-8 pt-0 space-y-5">
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 text-xs p-3 rounded-lg text-center animate-pulse">
                {error}
              </div>
            )}
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 uppercase ml-1">Tên đăng nhập</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  placeholder="admin hoặc tài khoản đảng viên"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 uppercase ml-1">Mật khẩu</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="password"
                  className="block w-full pl-10 pr-3 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transform active:scale-95 transition-all uppercase tracking-widest mt-4"
            >
              Đăng nhập hệ thống
            </button>
          </form>

          <div className="p-6 bg-white/5 border-t border-white/10 text-center">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">
              Bảo mật tuyệt đối theo quy định Quân đội <br/> Tài khoản mặc định: admin/123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
