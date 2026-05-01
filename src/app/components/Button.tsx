import { Button as ShadcnButton } from './ui/button';
import { cn } from './ui/utils';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  type?: 'button' | 'submit';
  className?: string;
  'aria-label'?: string;
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  disabled,
  type = 'button',
  className = '',
  'aria-label': ariaLabel,
}: ButtonProps) {
  if (variant === 'secondary') {
    return (
      <ShadcnButton
        type={type}
        onClick={onClick}
        disabled={disabled}
        variant="ghost"
        aria-label={ariaLabel}
        className={cn('w-full h-[52px] text-muted-foreground', className)}
      >
        {children}
      </ShadcnButton>
    );
  }

  if (variant === 'outline') {
    return (
      <ShadcnButton
        type={type}
        onClick={onClick}
        disabled={disabled}
        variant="outline"
        aria-label={ariaLabel}
        className={cn('w-full h-[52px]', className)}
      >
        {children}
      </ShadcnButton>
    );
  }

  return (
    <ShadcnButton
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn('w-full h-[52px] bg-[#00BFA5] hover:bg-[#00A896] text-white', className)}
    >
      {children}
    </ShadcnButton>
  );
}
