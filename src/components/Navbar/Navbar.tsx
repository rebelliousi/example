import ListIcon from '../../assets/icons/ListIcon';
import { useSidebarStore } from '../../store/sidebarStore';
import Button from '../Buttons/Button';
import { Avatar } from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    const [profileModal, setProfileModal] = useState(false);
    const navigate = useNavigate();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { setIsOpen, isOpen } = useSidebarStore();
    const handleLogOut = useCallback(() => {
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
        navigate('/login', { replace: true });
    }, [navigate]);

    const handleClickOutside = useCallback((event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setProfileModal(false);
        }
    }, []);

    // Attach event listener once
    useEffect(() => {
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [handleClickOutside]);

    const handleProfileClick = (event: React.MouseEvent) => {
        event.stopPropagation();
        setProfileModal(prev => !prev);
    };

    return (
        <div className="sticky z-30 flex-1 h-[70px] top-0 bg-white">
            <div className="flex h-full gap-4 items-center justify-between px-6 text-sidebarText">
                <div className="">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="max-md:hidden p-1 hover:border border-white hover:border-gray-200 border  rounded"
                    >
                        <ListIcon className="text-primaryText" />
                    </button>
                </div>
                <div className="relative flex items-center gap-5">
                    {/* Avatar button */}
                    <button onClick={handleProfileClick}>
                        <Avatar
                            alt="User Avatar"
                            src="/img/avatar.jpeg"
                            sx={{
                                width: 35,
                                height: 35,
                            }}
                        />
                    </button>

                    {/* Profile Modal */}
                    {profileModal && (
                        <div
                            ref={dropdownRef}
                            className={`absolute shadow-lg right-0 top-10 w-[230px] pb-4 table-content bg-white rounded-md transition-all duration-500 ease-in-out 
            ${profileModal ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'}`}
                        >
                            <div className="px-5 pt-3 text-center flex  flex-col items-center text-primaryText">
                                <div className="flex py-2 items-center">
                                    <Avatar
                                        alt="User Avatar"
                                        src="/img/avatar.jpeg"
                                        sx={{ width: 60, height: 60 }}
                                    />
                                   
                                </div>
                              
                                <div>
                                    <h1 className='text-black font-semibold'>Aman Amanow</h1>

                                    <p className='text-sm text-gray-400'> Teacher</p>
                                  
                                    </div>
                                   
                                    <Button
                                        onClick={handleLogOut}
                                        className="w-full mt-4 h-10"
                                        variant="outline"
                                    >
                                        Logout
                                    </Button>
                                </div>
                            </div>
                       
                    )}
                </div>
            </div>
        </div>
    );
};

export default Navbar;
