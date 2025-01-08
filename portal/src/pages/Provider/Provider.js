// Components
import Navbar from "../../subscript/universal/Navbar.js";
import Footer from '../../subscript/universal/Footer.js';

import CheckOutDeviceStatus from "./../Provider/components/CheckOutDeviceStatus.js";
import CheckInDeviceStatus from "./../Provider/components/CheckInDeviceStatus.js";
import DeviceManagementStatus from "./../Provider/components/DeviceManagementStatus.js";
import ProfileManagementStatus from "./../Provider/components/ProfileManagementStatus.js";

import CheckOutDevice from "./components/CheckOutDevice.js";
import CheckInDevice from "./components/CheckInDevice.js";
import DeviceManagement from "./components/DeviceManagement.js";
import ProfileManagement from "./components/ProfileManagement.js";
import Help from "./components/Help.js";

// Classes
import { Device } from "./classes/Device.js";
import { Patron } from "./classes/Patron.js";

// Other imports
import React, { useState, useEffect, useRef } from "react";
import { UserContext } from "../../App.js";

// CSS
import "./provider.scss"; 

const ProviderHomepage = () => {
    const { userId } = React.useContext(UserContext); // Don't delete this -Kirk

    const [currentDevice, setCurrentDevice] = useState();
    const [currentPatron, setCurrentPatron] = useState();
    const [pagenum, setPagenum] = useState(0);
    const [deviceDidCheckout, setDeviceDidCheckout] = useState(false);
    const [deviceDidCheckin, setDeviceDidCheckin] = useState(false);
    const [deviceDidModify, setDeviceDidModify] = useState(false);
    const [patronDidModify, setPatronDidModify] = useState(false);

    const [addingNewPatron, setAddingNewPatron] = useState(false);

    // These ifs are needed to stop a weird error where when you would save a 
    // file and it would refresh it wouldn't like the new Patron()/Device() in the usestate
    // no clue why itStop happens but alright
    if ((currentPatron === undefined) || (currentPatron === null)) {
        setCurrentPatron(new Patron());
    }
    if ((currentDevice === undefined) || (currentDevice === null)) {
        setCurrentDevice(new Device());
    }

    const addNewPatron = () =>
    {
        setPagenum(3);
        setAddingNewPatron(true);
    }

    
    
    const pvdoCss = "option";
    const [pmnStyles, setPmnStyles] = useState([pvdoCss + "--selected", pvdoCss, pvdoCss, pvdoCss, pvdoCss, pvdoCss])

    useEffect(() => {
        let pmnStylesArray = [pvdoCss, pvdoCss, pvdoCss, pvdoCss, pvdoCss, pvdoCss];
        pmnStylesArray[pagenum] = pvdoCss + "--selected";
        setPmnStyles(pmnStylesArray);
    }, [pagenum]);

    function getActiveWindow(num) {
        switch(num) {
            case(0): return <CheckOutDevice setPagenum={setPagenum} currentPatron={currentPatron} currentDevice={currentDevice} setCurrentDevice={setCurrentDevice} setCurrentPatron={setCurrentPatron} addNewPatron={addNewPatron} userId={userId} setDeviceDidCheckout={setDeviceDidCheckout} />
            case(1): return <CheckInDevice setPagenum={setPagenum} currentDevice={currentDevice} setCurrentDevice={setCurrentDevice} userId={userId} deviceDidCheckin={deviceDidCheckin} setDeviceDidCheckin={setDeviceDidCheckin} />
            case(2): return <DeviceManagement setPagenum={setPagenum} userId={userId} currentDevice={currentDevice} setCurrentDevice={setCurrentDevice} setDeviceDidModify={setDeviceDidModify} />
            case(3): return <ProfileManagement setPagenum={setPagenum} userId={userId} currentPatron={currentPatron} setCurrentPatron={setCurrentPatron} setPatronDidModify={setPatronDidModify} addNewPatron={addNewPatron} addingNewPatron={addingNewPatron}/>
            case(4): return <Help />
            case(5): return <CheckOutDeviceStatus deviceDidCheckout={deviceDidCheckout} setPagenum={setPagenum} setCurrentDevice={setCurrentDevice} setCurrentPatron={setCurrentPatron} />
            case(6): return <CheckInDeviceStatus deviceDidCheckin={deviceDidCheckin} setPagenum={setPagenum} setCurrentDevice={setCurrentDevice} setCurrentPatron={setCurrentPatron} />
            case(7): return <DeviceManagementStatus deviceDidModify={deviceDidModify} setPagenum={setPagenum} setCurrentDevice={setCurrentDevice} setCurrentPatron={setCurrentPatron} />
            case(8): return <ProfileManagementStatus patronDidModify={patronDidModify} setPagenum={setPagenum} setCurrentDevice={setCurrentDevice} setCurrentPatron={setCurrentPatron} /> 
            default: return <CheckOutDevice setPagenum={setPagenum} currentPatron={currentPatron} currentDevice={currentDevice} setCurrentDevice={setCurrentDevice} setCurrentPatron={setCurrentPatron} addNewPatron={addNewPatron} userId={userId} setDeviceDidCheckout={setDeviceDidCheckout} />;
        }
    }

    if (userId) {
        return (  
            <div id="page-container" style={{overflow: "hidden"}}>
                <div id="content-wrap">
                    <Navbar />
                    <div id="home">
                        <div id="nav">    
                            <div id="pmn-checkOut" className={pmnStyles[0]} style={{borderTopLeftRadius: "6px", borderBottomLeftRadius: "6px"}} onClick={() => setPagenum(0)}>
                                <div className={"option-content"}>
                                    Check Out Device 
                                </div>
                            </div>
                            <div id="pmn-checkIn" className={pmnStyles[1]} onClick={() => setPagenum(1)}>
                                <div className={"option-content"}>
                                    Check In Device 
                                </div>
                            </div>
                            <div className={pmnStyles[2]} onClick={() => setPagenum(2)}>
                                <div className={"option-content"}>
                                    Device Management 
                                </div>
                            </div>
                            <div className={pmnStyles[3]} onClick={() => setPagenum(3)}>
                                <div className={"option-content"}>
                                    Patron Management 
                                </div>
                            </div>
                            <div className={pmnStyles[4]} style={{borderTopRightRadius: "6px", borderBottomRightRadius: "6px"}} onClick={() => setPagenum(4)}> 
                                <div className={"option-content"}>
                                    Help
                                </div>
                            </div>
                        </div>
                        <div id="provider-data-container">
                            {getActiveWindow(pagenum)}
                        </div>
                    </div>
                    <Footer />
                </div>
            </div>
        );
    }
}
 
export default ProviderHomepage;
