import { CircularProgress } from '@mui/material';

const LoadingIndicator = () => {
    return (
        <div className="py-6 flex justify-center">
            <CircularProgress size={30} />
        </div>
    );
};

export default LoadingIndicator;
