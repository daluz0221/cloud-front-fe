import { useId } from 'react';
import { cn } from './ui/utils';

interface InputProps {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  hint?: string;
  maxLength?: number;
  showCounter?: boolean;
  required?: boolean;
  type?: string;
}

export function Input({
  label,
  value,
  onChange,
  placeholder,
  error,
  hint,
  maxLength,
  showCounter,
  required,
  type = 'text',
}: InputProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  const describedBy = [
    error ? errorId : null,
    hint ? hintId : null,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-[#212121] font-medium mb-2">
          {label}{' '}
          {required && (
            <span className="text-red-600" aria-hidden="true">*</span>
          )}
          {required && <span className="sr-only">(obligatorio)</span>}
        </label>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        required={required}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={describedBy || undefined}
        className={cn(
          'w-full px-4 py-3 bg-[#F5F5F5] border rounded-xl text-[#212121] placeholder:text-[#757575] focus:outline-none focus:ring-2 focus:ring-[#00BFA5] focus:border-transparent transition-colors',
          error ? 'border-red-500' : 'border-[#E0E0E0]'
        )}
      />
      <div className="flex justify-between items-start mt-1">
        <div>
          {error && (
            <p id={errorId} role="alert" className="text-red-600 text-sm">
              {error}
            </p>
          )}
          {hint && !error && (
            <p id={hintId} className="text-[#757575] text-sm">
              {hint}
            </p>
          )}
        </div>
        {showCounter && maxLength && (
          <p className="text-[#757575] text-sm ml-auto" aria-live="polite">
            {value.length}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
}
