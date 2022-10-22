import Navbar from "./layout-components/Navbar";

const Layout = ({children}) => {
    return ( 
        <div className="min-h-screen pb-3 bg-purple-300 overflow-hidden">
            <Navbar/>
            {children}
        </div>
     );
}
 
export default Layout;