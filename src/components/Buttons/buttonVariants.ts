import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
    'rounded text-center min-w-16 flex items-center justify-center text-sm',
    {
        variants: {
            variant: {
                default: 'bg-primaryBlue text-white ',
                outline:
                    'text-primaryBlue border  border-primaryBlue hover:bg-primaryBlue hover:text-white',
                delete: 'bg-red-500 text-white ',
                cancel: 'border border-gray-300 text-gray-400 ',
            },
            size: {
                default: 'h-9 py-2 px-3',
                sm: 'h-8 px-2 rounded-md ',
                icon: 'p-2',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
);
