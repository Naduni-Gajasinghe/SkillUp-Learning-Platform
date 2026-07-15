import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthLayout from '../layouts/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { clearAuthError, loginUser } from '../store/authSlice';

const Icons = {
  Mail: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
  ),
  Lock: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
  ),
  ArrowRight: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
  ),
};

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, accessToken, isLoading, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearAuthError());
    }
  }, [dispatch, error]);

  useEffect(() => {
    if (accessToken && user) {
      if ((user.roles || []).includes('TUTOR')) navigate('/tutor/dashboard');
      else navigate('/learner/dashboard');
    }
  }, [accessToken, navigate, user]);

  const onSubmit = async (values) => {
    const action = await dispatch(loginUser(values));
    if (loginUser.fulfilled.match(action)) {
      toast.success('Logged in successfully');
    }
  };

  return (
    <AuthLayout 
      title="Welcome Back" 
      subtitle="Enter your credentials to access your account."
      illustration={(
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
      )}
    >
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-skill-dark/50">
            <Icons.Mail />
          </div>
          <Input
            label=""
            type="email"
            placeholder="Email Address"
            className="pl-10 h-12 bg-[#f6faf8]"
            error={errors.email?.message}
            {...register('email', { required: 'Email is required' })}
          />
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-skill-dark/50">
            <Icons.Lock />
          </div>
          <Input
            label=""
            type="password"
            placeholder="Password"
            className="pl-10 h-12 bg-[#f6faf8]"
            error={errors.password?.message}
            {...register('password', { required: 'Password is required' })}
          />
        </div>

        <div className="flex items-center justify-between">
            <div className="flex items-center">
                <input id="remember-me" type="checkbox" className="h-4 w-4 rounded border-skill-border text-skill-accent focus:ring-skill-accent" />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-skill-dark/80">Remember me</label>
            </div>
            <a href="#" className="text-sm font-medium text-skill-accent hover:text-skill-accentHover">Forgot password?</a>
        </div>

        <Button type="submit" className="w-full h-12 text-base flex items-center justify-center gap-2 group" disabled={isLoading}>
          {isLoading ? 'Processing...' : 'Sign In'}
          {!isLoading && <Icons.ArrowRight />}
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-skill-border text-center">
        <p className="text-sm text-skill-dark/80">
          New to SkillUp? <Link to="/register" className="font-semibold text-skill-accent hover:text-skill-accentHover underline underline-offset-4">Create an account</Link>
        </p>
      </div>
    </AuthLayout>
  );
}
