import React, { FC } from 'react';

interface ContainerProps {
    children?: React.ReactNode;
}
const Container: FC<ContainerProps> = ({ children }) => {
    return <div className="max-w-[1400px] mx-auto h-full xl:px-4">{children}</div>;
};
export default Container;
