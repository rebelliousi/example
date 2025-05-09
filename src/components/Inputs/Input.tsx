import { FC } from 'react';
import { FieldError, FieldValues, UseFormRegister, RegisterOptions } from 'react-hook-form';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  placeholder?: string;
  type?: string;
  id?: string;
  className?: string;
  register: UseFormRegister<FieldValues>; // Bu kısmı değiştirmeyin, çünkü register genel bir fonksiyondur.
  validation?: RegisterOptions<FieldValues>; // Burada FieldValues tipini kullanıyoruz.
  error?: FieldError | undefined;
}

const Input: FC<InputProps> = ({
  name,
  placeholder,
  type = 'text',
  disabled = false,
  id,
  className,
  defaultValue,
  register,
  validation,
  error,
  ...props
}) => {
  return (
    <div>
      <input
        {...props}
        type={type}
        disabled={disabled}
        placeholder={placeholder}
        id={id}
        className={`${className} p-2 w-full border ${error ? 'border-red-500' : 'border-gray-300'} text-sm rounded`}
        defaultValue={defaultValue}
        {...(register ? register(name, validation) : {})}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
    </div>
  );
};

export default Input;
