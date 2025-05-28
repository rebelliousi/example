import Navbar from "../Navbar/Navbar"

interface MainProps{
    children?:React.ReactNode
   }

const Main:React.FC<MainProps>=({children})=>{

   
    return(
        <div className="flex-1"> 
         <Navbar/>
         {children} 
        </div>
    )
}
export default Main