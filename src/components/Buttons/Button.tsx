import { cn } from '../../assets/utils';

import { VariantProps } from 'class-variance-authority';
import { ButtonHTMLAttributes, FC } from 'react';
import { buttonVariants } from './buttonVariants';

interface ButtonProps
    extends ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {}

const Button: FC<ButtonProps> = ({ className, size, variant, ...props }) => {
    return (
        <button
            {...props}
            className={cn(
                buttonVariants({
                    size,
                    variant,
                    className,
                })
            )}
        ></button>
    );
};

export default Button;
