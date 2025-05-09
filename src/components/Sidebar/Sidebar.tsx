import { Link } from 'react-router-dom';
import ExampleIcon from '../../assets/icons/ExampleIcon';
import { useSidebarStore } from '../../store/sidebarStore';

const Sidebar: React.FC = () => {

  const {isOpen}=useSidebarStore()
  if (isOpen)
  return (
    <div className="max-lg:hidden relative w-[270px] border-r  text-sidebarText">
      <div className="fixed top-0 left-0 h-full w-[270px] border-r">
        <div className="p-4 border-b border-sidebarBorder">
          <Link
            to='/'
            className="text-2xl mx-auto block w-fit  font-semibold text-blue-500"
          >
            Admission
          </Link>
        </div>
        <div className="py-3 pb-20 h-full overflow-y-auto hide-scrollbar text-[rgb(90,106,133)] relative flex flex-col justify-between">
            <div className='pb-20'>
                <div className='px-4'>
                    <Link to='/statistics'
                    className='flex gap-2 items-center  py-3 px-2 hover:bg-primaryBlue w-full rounded-md hover:text-white'>
                        <ExampleIcon/>  
                    Statistics
                    </Link>
                    <Link to='/admissions/list'
                    className='flex gap-2 items-center  py-3 px-2 hover:bg-primaryBlue w-full rounded-md hover:text-white'>
                        <ExampleIcon/>  
                    Admission
                    </Link>
                    <Link to='/region'
                    className='flex gap-2 items-center  py-3 px-2 hover:bg-primaryBlue w-full rounded-md hover:text-white'>
                        <ExampleIcon/>  
                    Region
                    </Link>
                    <Link to='/application_list'
                    className='flex gap-2 items-center  py-3 px-2 hover:bg-primaryBlue w-full rounded-md hover:text-white'>
                        <ExampleIcon/>  
                    Aplication list
                    </Link>
                    <Link to='/exam_subjects'
                    className='flex gap-2 items-center  py-3 px-2 hover:bg-primaryBlue w-full rounded-md hover:text-white'>
                        <ExampleIcon/>  
                    Exam Subjects
                    </Link>






                </div>

            </div>
        </div>
      </div>
    </div>
  );
};
export default Sidebar;
