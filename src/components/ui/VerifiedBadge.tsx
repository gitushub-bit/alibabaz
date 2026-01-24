import verifiedBadgeImg from '@/assets/verified-badge.png';

interface VerifiedBadgeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-4 w-auto',
  md: 'h-5 w-auto',
  lg: 'h-6 w-auto',
};

export function VerifiedBadge({ className = '', size = 'md' }: VerifiedBadgeProps) {
  return (
    <img
      src={verifiedBadgeImg}
      alt="Verified"
      className={`inline-block ${sizeClasses[size]} ${className}`}
    />
  );
}
