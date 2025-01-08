import React from "react";
import Navbar from '../subscript/universal/Navbar.js';
import Footer from '../subscript/universal/Footer.js';
import AdminOption from "./AdminOption.js";
import { UserContext } from "../App.js";


const AdminHomepage = props => {
    const { userId } = React.useContext(UserContext); // Don't delete this -Kirk  // well what if i want to??? -Tim

    const resizeWindow = () => {
        setWidth(window.innerWidth);
        setHeight(window.innerHeight);
    }
    const [width, setWidth] = React.useState(window.innerWidth);
    const [height, setHeight] = React.useState(window.innerHeight);


    // Checks if user has resized window and updates width as necessary
    React.useEffect(() => {
        window.addEventListener("resize", resizeWindow);
        return () => window.removeEventListener("resize", resizeWindow);
    });
    if (userId) {
        return (    
            <div id="page-container">
                <div id="content-wrap">
                    <Navbar />
                    <div id="admin-home">
                        <AdminOption name="devices" userId={userId}/>
                        <AdminOption name="tutors" userId={userId}/>
                        <AdminOption name="patrons" userId={userId}/>
                    </div>
                    <Footer />
                </div>
            </div>
        );
    }
}
 
export default AdminHomepage;