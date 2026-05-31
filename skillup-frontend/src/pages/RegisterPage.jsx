import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthLayout from '../layouts/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { registerUser } from '../store/authSlice';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      role: 'LEARNER',
      expertise: '',
    },
  });

  const selectedRole = watch('role', 'LEARNER');

  const onSubmit = async (values) => {
    const payload = { ...values };
    if (payload.role !== 'TUTOR') delete payload.expertise;

    const action = await dispatch(registerUser(payload));
    if (registerUser.fulfilled.match(action)) {
      toast.success('Registration successful. Please login.');
      navigate('/login');
    } else {
      toast.error(action.payload || 'Registration failed');
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Start as a learner or tutor.">
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Input
          label="Full name"
          placeholder="Naduni Perera"
          error={errors.fullName?.message}
          {...register('fullName', { required: 'Full name is required' })}
        />

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
          placeholder="At least 8 characters"
          error={errors.password?.message}
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 8, message: 'Minimum 8 characters' },
          })}
        />

        <label className="block space-y-1">
          <span className="text-sm font-medium text-slate-700">Role</span>
          <select
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            {...register('role')}
          >
            <option value="LEARNER">Learner</option>
            <option value="TUTOR">Tutor</option>
          </select>
        </label>

        {selectedRole === 'TUTOR' ? (
          <Input
            label="Expertise"
            placeholder="React, Node.js, Data Science"
            error={errors.expertise?.message}
            {...register('expertise', { required: 'Expertise is required for tutors' })}
          />
        ) : null}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Creating account...' : 'Register'}
        </Button>
      </form>

      <div className="mt-5 text-sm text-slate-600">
        <p>
          Already have an account? <Link to="/login" className="font-semibold text-cyan-700">Login</Link>
        </p>
      </div>
    </AuthLayout>
  );
}
