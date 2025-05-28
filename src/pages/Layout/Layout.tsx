import { Outlet } from "react-router-dom"
import Sidebar from "../../components/Sidebar/Sidebar"
import Main from "../../components/Main/Main"



const Layout:React.FC=()=>{
    return(
        <div className="flex">
            
            <Sidebar/>
           
             
                <Main>
                  
                <Outlet/>
                </Main>
        
             </div>
              
       

    )
}
export default Layout