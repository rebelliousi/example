import Navbar from "../Navbar/Navbar"

interface MainProps{
    children?:React.ReactNode
   }

const Main:React.FC<MainProps>=({children})=>{

   
    return(
        <div className="flex-1"> {/**hemme galan bosh yerleri almasy uchin */}
         <Navbar/>
         {children}   {/**main ichine salnan hemme zatlar diymek children  */}
        </div>
    )
}
export default Main