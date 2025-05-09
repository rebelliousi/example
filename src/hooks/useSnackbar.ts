type ChangeSnackbarFunction = (
    title: string,
    variant?: 'success' | 'error' | 'loading',
    isLoading?: boolean
) => void;
type PromiseSnackbar = <T>(
    func: () => Promise<T>,
    messages?: { loading: string; success: string; error: string }
) => Promise<T>;

export const useSnackbar = () => {
    const call: ChangeSnackbarFunction = async  (title, variant = 'success', isLoading = false) => {
        const { toast } = await import('react-hot-toast');

        switch (variant) {
            case 'success':
                toast.success(title, { duration: 3000 });
                break;
            case 'error':
                toast.error(title, { duration: 6000 });
                break;
            case 'loading':
                if (isLoading) {
                    toast.loading('Waiting...', { duration: 1000 });
                }
                break;
            default:
                toast.error(title, { duration: 6000 });
                break;
        }
    };
    const promise: PromiseSnackbar = async (
        func,
        messages = { loading: 'Loading...', success: 'Success!', error: 'Error occurred' }
    ) => {
        const { toast } = await import('react-hot-toast');

        return toast.promise(func(), {
            loading: messages.loading,
            success: messages.success,
            error: messages.error,
        });
    };

    return { call, promise };
};
