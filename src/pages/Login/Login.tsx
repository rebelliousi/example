import LoginIcon from '../../assets/icons/LoginIcon';
import PersonIcon from '../../assets/icons/PersonIcon';
import ShieldLockIcon from '../../assets/icons/ShieldLockIcon';
import { cn } from '../../assets/utils';
import { useAuth } from '../../hooks/useAuth';
import { CircularProgress } from '@mui/material';
import { AxiosError } from 'axios';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

interface ILoginForm {
    username: string;
    password: string;
}
const LoginPage = () => {
    const [err, setErr] = useState<string | null>(null);
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ILoginForm>({ mode: 'onSubmit' });
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const { mutateAsync, isPending } = useAuth();
    const submit: SubmitHandler<ILoginForm> = async data => {
        try {
            await mutateAsync(data);
        } catch (error) {
            const resp = error as AxiosError;
            console.log(resp);
            if (resp.response?.status === 401) {
                setErr('Login or password incorrect!');
            } else if (resp.response?.status === 500) {
                setErr('Server error!');
            } else if (resp.code === 'ERR_NETWORK') {
                setErr('Network error! Check host configuration!');
            }
        }
    };
    return (
        <div className="w-screen h-screen top-0 left-0 fixed z-50 bg-white">
            <div className="w-full h-full flex items-center justify-center bg-gray-50/50 max-lg:px-5">
                <div className="w-[390px] min-h-[380px] border shadow-md rounded-xl bg-white">
                    <div className="pt-8 pb-3 px-8" >
                        <div className='flex items-center justify-center p-4'>
                        <LoginIcon className='text-center'/>
                        </div>
                      
                    
                       
                        <form onSubmit={handleSubmit(submit)} className="py-4 space-y-6">
                            <div className="space-y-2 text-sm w-full">
                                <h1 className="text-gray-500">Username</h1>
                                <div
                                    className={cn(
                                        'flex items-center px-3 gap-1 border p-1 rounded-lg focus-within:border-blue-500 text-gray-400 focus-within:text-blue-500',
                                        errors.username?.message && 'border-red-600'
                                    )}
                                >
                                    <div className="pl-2">
                                        <PersonIcon size={22} />
                                    </div>
                                    <input
                                        type="text"
                                        className=" border-none bg-transparent autofill:bg-transparent outline-white focus:ring-0 w-full h-full rounded-md px-3  outline-none transition-colors ease-in-out placeholder:text-gray-300"
                                        placeholder="User"
                                        autoFocus
                                        {...register('username', {
                                            required: 'This field is required!',
                                        })}
                                    />
                                </div>
                                <p className="text-sm text-red-600">{errors.username?.message}</p>
                            </div>
                            <div className="space-y-2 text-sm w-full">
                                <h1 className="text-gray-500">Password</h1>
                                <div
                                    className={cn(
                                        'flex items-center px-3 gap-1 border p-1 focus-within:border-blue-500 text-gray-400 focus-within:text-blue-500 rounded-lg',
                                        errors.password?.message && 'border-red-600'
                                    )}
                                >
                                    <button
                                        type="button"
                                        className="pl-2"
                                        tabIndex={-1}
                                        onClick={() => setShowPassword(prev => !prev)}
                                    >
                                        <ShieldLockIcon size={22} />
                                    </button>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className=" border-none bg-transparent autofill:bg-transparent outline-white focus:ring-0 w-full h-full rounded-md px-3  outline-none transition-colors ease-in-out placeholder:text-gray-300"
                                        placeholder="Password"
                                        {...register('password', {
                                            required: 'This field is required!',
                                        })}
                                    />
                                </div>
                                <p className="text-sm text-red-600">{errors.password?.message}</p>
                            </div>
                            <div>
                                <h1 className="text-sm text-red-600">{err}</h1>
                            </div>
                            <div className="h-11">
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="w-full h-full flex justify-center items-center rounded-lg bg-blue-500 text-white table-content"
                                >
                                    {isPending ? (
                                        <CircularProgress size={20} color="inherit" />
                                    ) : (
                                        'Log in'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                
            </div>
        </div>
    );
};
export default LoginPage;
