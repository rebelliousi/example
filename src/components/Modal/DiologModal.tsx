import { useModalStore } from '../../store/modal';
import { CircularProgress } from '@mui/material';

const DialogModal = () => {
    const { setOpen, onSubmit, status, title } = useModalStore();
    return (
        <div className="fixed z-50 w-screen h-screen top-0 left-0 right-0 bg-popUpBackground flex justify-center items-center">
            <div className="min-h-[100px] min-w-[200px] bg-white rounded p-5 space-y-6 popup-animation fade-in">
                <h1 className="text-center text-primaryText">{title}</h1>
                <div className="flex justify-center gap-5 text-white">
                    <button onClick={() => setOpen(false)} className="w-28 bg-red-500 py-2 rounded">
                        No
                    </button>
                    <button
                        onClick={onSubmit}
                        className="w-28 bg-green-500 py-2 rounded flex justify-center items-center"
                    >
                        {status === 'pending' ? (
                            <CircularProgress size={20} sx={{ color: 'white' }} />
                        ) : (
                            'Yes'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DialogModal;
