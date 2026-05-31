import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthLayout from '../layouts/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { clearAuthError, loginUser } from '../store/authSlice';

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
    <AuthLayout title="Welcome back" subtitle="Login to continue your learning journey.">
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email', { required: 'Email is required' })}
        />

        <Input
          label="Password"
          type="password"
          placeholder="********"
          error={errors.password?.message}
          {...register('password', { required: 'Password is required' })}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </Button>
      </form>

      <div className="mt-5 text-sm text-slate-600">
        <p>
          Need an account? <Link to="/register" className="font-semibold text-cyan-700">Register</Link>
        </p>
      </div>
    </AuthLayout>
  );
}
