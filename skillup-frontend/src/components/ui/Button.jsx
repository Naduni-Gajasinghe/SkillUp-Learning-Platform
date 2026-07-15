export default function Button({
  children,
  className = '',
  variant = 'primary',
  type = 'button',
  ...props
}) {
  const variants = {
    primary: 'bg-skill-accent text-white hover:bg-skill-accentHover shadow-soft',
    secondary: 'bg-white text-skill-dark border border-skill-border hover:bg-[#f5f8f4]',
    danger: 'bg-skill-error text-white hover:brightness-95 shadow-soft',
    ghost: 'bg-transparent text-skill-dark hover:bg-[#e5eeea]',
  };

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-btn px-4 py-2.5 text-sm font-medium tracking-[0.02em] transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-70 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
