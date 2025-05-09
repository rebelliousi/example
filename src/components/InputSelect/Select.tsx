import React, { useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';

interface Option {
  id: number | string;
  name: string;
}

interface CustomSelectProps {
  options: Option[];
  value: number | string| undefined;
  onChange: (value: number | string) => void;
  placeholder?: string;
  className?: string;
}

const Select: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.id === value);

  return (
    <div className="relative w-full">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-2 border rounded-md bg-white shadow-sm flex justify-between items-center cursor-pointer focus:outline-none ${className}`}
      >
        <span className={selectedOption ? 'text-gray-600' : 'text-gray-400'}>
          {selectedOption ? selectedOption.name : placeholder || 'Select an option'}
        </span>
        <FiChevronDown className={`ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <ul className="absolute z-10 w-full bg-white rounded shadow mt-1 max-h-60 overflow-y-auto focus:outline-none">
          {options.map((opt) => (
            <li
              key={opt.id}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700"
              onClick={() => {
                onChange(opt.id);
                setIsOpen(false);
              }}
            >
              {opt.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Select;
