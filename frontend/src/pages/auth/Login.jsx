import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Calendar,
  Lock,
  Mail,
  Shield,
  Briefcase,
  User,
  ArrowRight,
  Sparkles,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const user = await login(data.email, data.password);
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'manager') navigate('/manager/dashboard');
      else navigate('/dashboard');
    } catch (err) {
      // toast already handled in auth context
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo fill buttons for viva/evaluation
  const fillCredentialsAndLogin = async (email, password) => {
    setValue('email', email);
    setValue('password', password);
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'manager') navigate('/manager/dashboard');
      else navigate('/dashboard');
    } catch (err) {
      // handled
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-lg shadow-primary-500/30 mb-3">
            <Calendar className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Student & College Leave Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Academic Portal for Students, Faculty Advisors & Dean
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  placeholder="name@company.com"
                  {...register('email', {
                    required: 'Email address is required',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Please enter a valid email address',
                    },
                  })}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                    errors.email
                      ? 'border-rose-300 focus:ring-rose-500/20'
                      : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/20'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-rose-500 mt-1 font-medium">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                    errors.password
                      ? 'border-rose-300 focus:ring-rose-500/20'
                      : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/20'
                  }`}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-rose-500 mt-1 font-medium">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-primary-500/25 transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins Section */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              <GraduationCap className="h-4 w-4 text-primary-600" />
              College / Student 1-Click Logins
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <button
                type="button"
                onClick={() => fillCredentialsAndLogin('student@college.edu', 'student123')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/80 text-emerald-800 transition-colors text-xs font-semibold cursor-pointer shadow-xs"
              >
                <GraduationCap className="h-4 w-4 mb-1 text-emerald-600" />
                <span>Student</span>
                <span className="text-[10px] text-emerald-600 font-normal">22CSE045</span>
              </button>
              <button
                type="button"
                onClick={() => fillCredentialsAndLogin('faculty@college.edu', 'faculty123')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100/80 text-blue-800 transition-colors text-xs font-semibold cursor-pointer shadow-xs"
              >
                <Briefcase className="h-4 w-4 mb-1 text-blue-600" />
                <span>Faculty</span>
                <span className="text-[10px] text-blue-600 font-normal">Advisor</span>
              </button>
              <button
                type="button"
                onClick={() => fillCredentialsAndLogin('admin@college.edu', 'admin123')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-purple-200 bg-purple-50/60 hover:bg-purple-100/80 text-purple-800 transition-colors text-xs font-semibold cursor-pointer shadow-xs"
              >
                <Shield className="h-4 w-4 mb-1 text-purple-600" />
                <span>Dean</span>
                <span className="text-[10px] text-purple-600 font-normal">Academics</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 mb-1.5 px-0.5">
              <span>Alternative Corporate Demo Logins:</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => fillCredentialsAndLogin('admin@company.com', 'admin123')}
                className="py-1 px-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors font-medium cursor-pointer text-center"
              >
                Admin (Co)
              </button>
              <button
                type="button"
                onClick={() => fillCredentialsAndLogin('manager.eng@company.com', 'manager123')}
                className="py-1 px-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors font-medium cursor-pointer text-center"
              >
                Manager (Co)
              </button>
              <button
                type="button"
                onClick={() => fillCredentialsAndLogin('alice@company.com', 'employee123')}
                className="py-1 px-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors font-medium cursor-pointer text-center"
              >
                Employee (Co)
              </button>
            </div>
          </div>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              New employee without an account?{' '}
              <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
