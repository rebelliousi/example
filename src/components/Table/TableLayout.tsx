import { cn } from '../../assets/utils';
import React, { FC } from 'react';

interface TableLayoutProps {
    children?: React.ReactNode;
    className?: string;
}
const TableLayout: FC<TableLayoutProps> = ({ children, className }) => {
    return (
        <div className={cn('rounded overflow-hidden border text-sm text-tableTopText', className)}>
            {children}
        </div>
    );
};

export default TableLayout;
