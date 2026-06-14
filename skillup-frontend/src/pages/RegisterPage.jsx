import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthLayout from '../layouts/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { registerUser } from '../store/authSlice';

const Icons = {
  User: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  ),
  Mail: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
  ),
  Lock: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
  ),
  Briefcase: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
  ),
};

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
    <AuthLayout 
        title="Join SkillUp" 
        subtitle="Create your account to start your journey."
        illustration={(
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-3-3.87"/><path d="M9 21v-2a4 4 0 0 0 4-4H9a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v2a4.5 4.5 0 0 1-9 0V8"/><path d="M21 15V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8"/></svg>
        )}
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Icons.User />
          </div>
          <Input
            label=""
            placeholder="Full Name"
            className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white"
            error={errors.fullName?.message}
            {...register('fullName', { required: 'Full name is required' })}
          />
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Icons.Mail />
          </div>
          <Input
            label=""
            type="email"
            placeholder="Email Address"
            className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white"
            error={errors.email?.message}
            {...register('email', { required: 'Email is required' })}
          />
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Icons.Lock />
          </div>
          <Input
            label=""
            type="password"
            placeholder="Password (min. 8 characters)"
            className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white"
            error={errors.password?.message}
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 8, message: 'Minimum 8 characters' },
            })}
          />
        </div>

        <div className="flex flex-col space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">I want to join as:</span>
          <div className="grid grid-cols-2 gap-3">
            {['LEARNER', 'TUTOR'].map((r) => (
               <label key={r} className={`relative flex items-center justify-center p-3 rounded-xl border cursor-pointer transition-all ${
                 selectedRole === r ? 'bg-cyan-50 border-cyan-500 text-cyan-700 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
               }`}>
                  <input type="radio" value={r} className="sr-only" {...register('role')} />
                  <span className="text-sm font-semibold">{r.charAt(0) + r.slice(1).toLowerCase()}</span>
                  {selectedRole === r && (
                      <div className="absolute top-1 right-1">
                          <svg className="w-4 h-4 text-cyan-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                      </div>
                  )}
               </label>
            ))}
          </div>
        </div>

        {selectedRole === 'TUTOR' && (
           <div className="relative animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Icons.Briefcase />
              </div>
              <Input
                label=""
                placeholder="What is your expertise?"
                className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white"
                error={errors.expertise?.message}
                {...register('expertise', { required: 'Expertise is required for tutors' })}
              />
           </div>
        )}

        <Button type="submit" className="w-full h-11 text-base mt-2" disabled={isLoading}>
          {isLoading ? 'Creating Account...' : 'Get Started'}
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-slate-100 text-center">
        <p className="text-sm text-slate-600">
          Already have an account? <Link to="/login" className="font-bold text-cyan-600 hover:text-cyan-500 underline underline-offset-4">Sign In</Link>
        </p>
      </div>
    </AuthLayout>
  );
}
