import { useId } from 'react';
import { cn } from './ui/utils';

interface TextAreaProps {
  label: string;
  value: string;
  onChange: (value: string) => void | ((e: React.ChangeEvent<HTMLTextAreaElement>) => void);
  placeholder?: string;
  error?: string;
  maxWords?: number;
  required?: boolean;
}

export function TextArea({
  label,
  value,
  onChange,
  placeholder,
  error,
  maxWords,
  required,
}: TextAreaProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const counterId = `${id}-counter`;
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const isOverLimit = maxWords ? wordCount > maxWords : false;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (typeof onChange === 'function') {
      // Support both (value: string) and (e: ChangeEvent) signatures
      (onChange as (v: string) => void)(e.target.value);
    }
  };

  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-[#212121] font-medium mb-2">
        {label}{' '}
        {required && <span className="text-red-600" aria-hidden="true">*</span>}
        {required && <span className="sr-only">(obligatorio)</span>}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={4}
        required={required}
        aria-required={required}
        aria-invalid={!!error || isOverLimit}
        aria-describedby={[error ? errorId : null, maxWords ? counterId : null].filter(Boolean).join(' ') || undefined}
        className={cn(
          'w-full px-4 py-3 bg-[#F5F5F5] border rounded-xl text-[#212121] placeholder:text-[#757575] resize-none focus:outline-none focus:ring-2 focus:ring-[#00BFA5] focus:border-transparent transition-colors',
          error || isOverLimit ? 'border-red-500' : 'border-[#E0E0E0]'
        )}
      />
      <div className="flex justify-between items-start mt-1">
        <div>
          {error && (
            <p id={errorId} role="alert" className="text-red-600 text-sm">
              {error}
            </p>
          )}
        </div>
        {maxWords && (
          <p
            id={counterId}
            className={cn('text-sm ml-auto', isOverLimit ? 'text-red-600 font-medium' : 'text-[#757575]')}
            aria-live="polite"
          >
            {wordCount}/{maxWords} palabras
          </p>
        )}
      </div>
    </div>
  );
}
