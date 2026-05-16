import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, type SignupDto } from '@guruapp/shared';
import { useSignup } from '@/hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleAuthButton } from '@/components/ui/GoogleAuthButton';
import { Logo } from '@/components/ui/Logo';
import { useTranslation } from 'react-i18next';

export default function Signup() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupDto>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(signupSchema) as any,
    defaultValues: { isStudent: true, isGuru: false },
  });
  const signup = useSignup();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const onSubmit = async (data: SignupDto) => {
    const result = await signup.mutateAsync(data);
    if (result.user.isGuru) navigate('/dashboard/guru');
    else navigate('/dashboard/student');
  };

  const isGuru = watch('isGuru');
  const isStudent = watch('isStudent');

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="border border-[#dadce0] rounded-3xl px-8 py-10 bg-white shadow-sm">
          {/* Logo */}
          <div className="text-center mb-6">
            <Logo />
            <h1 className="text-2xl font-normal text-[#111827] mt-6">{t('signup.title')}</h1>
            <p className="text-[#475569] text-sm mt-2">{t('signup.subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm text-[#202124] mb-1.5 font-medium">
                {t('signup.fullName')}
              </label>
              <input
                {...register('name')}
                autoComplete="name"
                className="w-full border border-[#dadce0] rounded px-3 py-2.5 text-sm text-[#202124] placeholder-[#9aa0a6] outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] transition-colors"
              />
              {errors.name && <p className="text-[#d93025] text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm text-[#202124] mb-1.5 font-medium">
                {t('signup.email')}
              </label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                className="w-full border border-[#dadce0] rounded px-3 py-2.5 text-sm text-[#202124] placeholder-[#9aa0a6] outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] transition-colors"
              />
              {errors.email && (
                <p className="text-[#d93025] text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-[#202124] mb-1.5 font-medium">
                {t('signup.password')}
              </label>
              <input
                {...register('password')}
                type="password"
                autoComplete="new-password"
                className="w-full border border-[#dadce0] rounded px-3 py-2.5 text-sm text-[#202124] placeholder-[#9aa0a6] outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] transition-colors"
              />
              {errors.password && (
                <p className="text-[#d93025] text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Role selection */}
            <div>
              <p className="text-sm text-[#202124] mb-2 font-medium">{t('signup.joinAs')}</p>
              <div className="grid grid-cols-2 gap-2">
                <label
                  className={`flex flex-col items-center gap-2 py-3 rounded border-2 cursor-pointer transition-all ${isStudent ? 'border-[#1a73e8] bg-[#e8f0fe]' : 'border-[#dadce0] hover:border-[#aaa]'}`}
                >
                  <input type="checkbox" {...register('isStudent')} className="sr-only" />
                  <span className="text-xl">🎓</span>
                  <span className="text-xs font-medium text-[#202124]">{t('signup.student')}</span>
                </label>
                <label
                  className={`flex flex-col items-center gap-2 py-3 rounded border-2 cursor-pointer transition-all ${isGuru ? 'border-[#1a73e8] bg-[#e8f0fe]' : 'border-[#dadce0] hover:border-[#aaa]'}`}
                >
                  <input type="checkbox" {...register('isGuru')} className="sr-only" />
                  <span className="text-xl">🧑‍🏫</span>
                  <span className="text-xs font-medium text-[#202124]">{t('signup.guru')}</span>
                </label>
              </div>
              <p className="text-xs text-[#5f6368] mt-1.5">{t('signup.bothNote')}</p>
            </div>

            {signup.error && (
              <p className="text-[#d93025] text-sm bg-[#fce8e6] px-3 py-2 rounded">
                {(signup.error as { response?: { data?: { error?: { message?: string } } } })
                  .response?.data?.error?.message ?? t('signup.failed')}
              </p>
            )}

            <div className="flex items-center justify-between pt-2">
              <Link to="/login" className="text-sm text-[#1a73e8] hover:text-[#1557b0] font-medium">
                {t('signup.signInInstead')}
              </Link>
              <button
                type="submit"
                disabled={signup.isPending}
                className="px-6 py-2 bg-[#1a73e8] text-white text-sm font-medium rounded-full hover:bg-[#1557b0] transition-colors disabled:opacity-60 shadow-sm"
              >
                {signup.isPending ? t('signup.creating') : t('signup.next')}
              </button>
            </div>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[#e8eaed]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-[#5f6368]">{t('signup.or')}</span>
            </div>
          </div>

          <div className="flex justify-center">
            <GoogleAuthButton
              onSuccess={(user) =>
                user.isGuru ? navigate('/dashboard/guru') : navigate('/dashboard/student')
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
