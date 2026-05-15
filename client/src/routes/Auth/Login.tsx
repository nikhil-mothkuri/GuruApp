import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginDto } from '@guruapp/shared';
import { useLogin } from '@/hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleAuthButton } from '@/components/ui/GoogleAuthButton';
import { Logo } from '@/components/ui/Logo';

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginDto>({ resolver: zodResolver(loginSchema) });
  const login = useLogin();
  const navigate = useNavigate();

  const onSubmit = async (data: LoginDto) => {
    const result = await login.mutateAsync(data);
    if (result.user.isGuru) navigate('/dashboard/guru');
    else navigate('/dashboard/student');
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Card */}
        <div className="border border-[#dadce0] rounded-3xl px-8 py-10 bg-white shadow-sm">
          {/* Logo */}
          <div className="text-center mb-6">
            <Logo />
            <h1 className="text-2xl font-normal text-[#111827] mt-6">Sign in</h1>
            <p className="text-[#475569] text-sm mt-2">Access your SakshamBharat workspace to teach and sell.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm text-[#202124] mb-1.5 font-medium">Email</label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                className="w-full border border-[#dadce0] rounded px-3 py-2.5 text-sm text-[#202124] placeholder-[#9aa0a6] outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] transition-colors"
              />
              {errors.email && <p className="text-[#d93025] text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm text-[#202124] mb-1.5 font-medium">Password</label>
              <input
                {...register('password')}
                type="password"
                autoComplete="current-password"
                className="w-full border border-[#dadce0] rounded px-3 py-2.5 text-sm text-[#202124] placeholder-[#9aa0a6] outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] transition-colors"
              />
              {errors.password && <p className="text-[#d93025] text-xs mt-1">{errors.password.message}</p>}
            </div>

            {login.error && (
              <p className="text-[#d93025] text-sm bg-[#fce8e6] px-3 py-2 rounded">
                {(login.error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message ?? 'Sign in failed'}
              </p>
            )}

            <div className="flex items-center justify-between pt-2">
              <Link to="/signup" className="text-sm text-[#1a73e8] hover:text-[#1557b0] font-medium">
                Create account
              </Link>
              <button
                type="submit"
                disabled={login.isPending}
                className="px-6 py-2 bg-[#1a73e8] text-white text-sm font-medium rounded-full hover:bg-[#1557b0] transition-colors disabled:opacity-60 shadow-sm"
              >
                {login.isPending ? 'Signing in…' : 'Next'}
              </button>
            </div>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[#e8eaed]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-[#5f6368]">or</span>
            </div>
          </div>

          <div className="flex justify-center">
            <GoogleAuthButton
              onSuccess={(user) => user.isGuru ? navigate('/dashboard/guru') : navigate('/dashboard/student')}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
