export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }[size];

  return (
    <div className="flex items-center justify-center">
      <div className={`${sizeClass} border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin`}></div>
    </div>
  );
}
