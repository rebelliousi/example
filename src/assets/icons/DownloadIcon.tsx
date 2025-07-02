import type { IconProps } from "../../models/models";

const DownloadIcon: React.FC<IconProps> = ({ size = 20, className, ...props }) => {
    return (
      <svg 
        width="18" 
        height="18" 
        viewBox="0 0 18 18" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        {...props} 
      >
        <path 
          d="M2 9.21875L2 15.3437C2 15.825 2.39375 16.2187 2.875 16.2187L15.125 16.2187C15.6063 16.2187 16 15.825 16 15.3437L16 9.21875" 
          stroke="#4570EA" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        <path 
          d="M9 1.78125L9 11.8438" 
          stroke="#4570EA" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        <path 
          d="M12.0625 8.78125L9 11.8438L5.9375 8.78125" 
          stroke="#4570EA" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
    );
};

export default DownloadIcon;