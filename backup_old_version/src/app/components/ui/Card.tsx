import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  variant?: 'white' | 'subtle';
  className?: string;
}

export function Card({ children, variant = 'white', className }: CardProps) {
  const variantStyles = {
    white: "bg-white border-[#E9E4DF] shadow-[0px_2px_6px_0px_rgba(0,0,0,0.04)]",
    subtle: "bg-[#F8F6F4] border-[#E9E4DF] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]"
  };

  return (
    <div className={clsx(
      "relative rounded-2xl border-2 border-solid overflow-hidden",
      variantStyles[variant],
      className
    )}>
      {children}
    </div>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return (
    <div className={clsx("p-[18px]", className)}>
      {children}
    </div>
  );
}
