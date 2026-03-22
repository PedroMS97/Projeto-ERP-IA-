import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';

const schema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type FormData = z.infer<typeof schema>;

export const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await api.post('/auth/login', data);
      login(response.data.token, response.data.user);
      navigate('/dashboard');
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-md p-10 rounded-3xl shadow-xl shadow-primary/5 border border-gray-100/50 animate-in slide-in-from-bottom-5 duration-500 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>
        
        <div className="relative">
          <div className="flex justify-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-indigo-500 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg shadow-primary/30 transform hover:rotate-12 transition-transform duration-300">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
            </div>
          </div>
          
          <h2 className="text-[28px] font-extrabold text-center text-text mb-2 tracking-tight">Welcome Back</h2>
          <p className="text-center text-textMuted text-sm font-medium mb-8">Sign in to your CRM dashboard</p>

          {errorMsg && (
            <div className="bg-danger/10 text-danger text-sm p-4 rounded-xl mb-6 font-medium text-center border border-danger/20">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-text mb-2 ml-1">Email Address</label>
              <input 
                {...register('email')}
                className="w-full px-5 py-3.5 bg-background border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-[15px] font-medium placeholder-gray-400 group-hover:border-gray-300"
                placeholder="admin@example.com"
              />
              {errors.email && <p className="text-danger text-xs mt-1.5 ml-1 font-bold">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-2 ml-1">
                <label className="block text-sm font-bold text-text">Password</label>
                <a href="#" className="text-xs text-primary font-bold hover:underline">Forgot password?</a>
              </div>
              <input 
                {...register('password')}
                type="password"
                className="w-full px-5 py-3.5 bg-background border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-[15px] font-medium placeholder-gray-400"
                placeholder="••••••••"
              />
              {errors.password && <p className="text-danger text-xs mt-1.5 ml-1 font-bold">{errors.password.message}</p>}
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-primary to-indigo-600 hover:from-indigo-600 hover:to-primary text-white rounded-xl font-bold text-[15px] shadow-lg shadow-primary/25 transition-all active:scale-[0.98] disabled:opacity-70 mt-6 flex justify-center items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Signing in...
                </>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-xs text-textMuted font-medium mt-8">
            Need an account? Contact your administrator.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
