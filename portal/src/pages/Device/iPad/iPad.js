import React, {useContext, useState, useEffect} from "react";
import { UserContext } from "../../../App.js";
import Navbar from "../../../subscript/universal/Navbar.js";
import Footer from '../../../subscript/universal/Footer.js';
import Patron from "./Patron/Patron.js";
import Category from '../../Provider/components/Category';


//import "./Patron.scss";

const IPad = () =>
{
    const { userId } = React.useContext(UserContext);
    const [isTesting, setIsTesting] = useState(true);
    const [isCheckedOut, setIsCheckedOut] = useState(true);
    const [currentDevice, setCurrentDevice] = useState();
    
    if (userId) {
        return (  
            <div id="page-container" style={{overflow: "hidden"}}>
                <div id="content-wrap">
                    {isCheckedOut === true && (<Patron/>)}
                    {isCheckedOut === false && isTesting === true && (
                        <div>
                            <Category name="devices" getItem={(e) => {setCurrentDevice(e)}}showDeviceStatus={0} />
                        </div>
                    )}
                    {isCheckedOut === false && isTesting === false && (
                        <div>
                            hi
                        </div>
                    )}
                    
                </div>
            </div>
        );
    }
}

export default IPad;