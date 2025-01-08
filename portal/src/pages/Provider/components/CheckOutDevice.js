// FontAwesome icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

//
import { Patron } from '../classes/Patron';
import { Device } from '../classes/Device';

// Other imports
import { useEffect, useState } from "react";
import Category from './Category';
import Popup from 'reactjs-popup';
import DatePicker from "react-datepicker";

// CSS
import "../../../react-datepicker.css";
import "./../column.scss";
import "./checkout.scss";

async function performCheckOut(userId, deviceId, patronId, lastCheckout, returnDate) {
    const fullAddr = "https://illuminated.cs.mtu.edu/ark/checkout";
    const authorization = 'Bearer ' + sessionStorage.getItem("BLIGHT");
    let status;

    console.log(userId, " - ",  deviceId, " - ", patronId, " - ", lastCheckout, " - ", returnDate);

    let body = {
        "data": {
            "provider": userId,
            "device": deviceId, 
            "patron": patronId, 
            "last_checkout": lastCheckout, 
            "return_date": returnDate
        }
    }

    status = await fetch(fullAddr, {
        method: 'POST',
        headers: {
            'Authorization': authorization,
            'Content-type': 'application/json',
        },
        body: JSON.stringify(body),
    })
    .then(response => {
        if (response.ok) {
            console.log("response?");
            console.log(response);
            return response.json()
        }
        throw response;
    })
    .then(data => {
        console.log("data: ")
        console.log(data);
        var received_response = data.data;
        if (received_response["error"] === "invalid_token") {
            console.log("error code found in checkOut (Provider.js -> checkOut() -> Ark request -> (then) received_response[\"error\"]");
            // What to do in an error situation?
        }
        else {
            return received_response[0]["checked_out"];
        }
        throw data;
    })
    .catch(error => {
        console.error("error code found in checkOut (Provider.js -> checkOut() -> Ark request -> (catch) received_response[\"error\"] ", error);
        console.log(error);
    })
    .finally(() => {
        //
    })

    return status; 
}

const CheckOutDevice = props => {
    let defaultCheckOutDays = 7;
    let defaultReturnHour = 12;
    let defaultCheckOutDate = new Date();
    let defaultReturnDate = new Date(new Date(new Date(Date.now() + (defaultCheckOutDays * 60 * 60 * 24 * 1000)).setHours(defaultReturnHour)).setMinutes(0));
    const [checkOutDate, setCheckOutDate] = useState(defaultCheckOutDate);
    const [returnDate, setReturnDate] = useState(defaultReturnDate);
    const [checkoutError, setCheckoutError] = useState(true);
    const [confirmCheckOut, setConfirmCheckOut] = useState(false);
    const [popupDidLoad, setPopupDidLoad] = useState(false);

    if ((props.currentPatron === null) || (props.currentPatron === undefined)) {
        props.setCurrentPatron(new Patron());
    }

    if ((props.currentDevice === null) || (props.currentDevice === undefined)) {
        props.setCurrentDevice(new Device());
    }

    useEffect(() => {
        if (props.currentPatron.id === "" || props.currentDevice.id === "" || props.currentDevice.status !== "Available") {
            setCheckoutError(true)
        }
        else {
            setCheckoutError(false);
        }  

    }, [props.currentPatron, props.currentDevice]);


    const checkOut = (lastCheckout, returnDate) =>
    {   
        let userId = props.userId; 
        let deviceId = props.currentDevice.id;
        let patronId = props.currentPatron.id; 

        let status = performCheckOut(userId, deviceId, patronId, Math.floor(lastCheckout.valueOf() / 1000), Math.floor(returnDate.valueOf() / 1000))
                    .then((response) => { 
                        console.log("status is: " + response);
                        props.setDeviceDidCheckout(response);
                        props.setPagenum(5); 
                        });
    

        // setConfirmCheckOut(false); // Closes checkout prompt
    }

    const showDeviceDetails = () =>
    {
        return ( 
            <div> 
                <div className={"display-flex"}>
                    <div className="title">Device Information</div>
                    {props.currentDevice.isOverdue() && (
                        <div className="title" style={{textAlign: "right", color: "red", fontFamily: "Poppins-EB"}}>
                            <FontAwesomeIcon icon="warning"/> Device Overdue
                        </div>
                        )}
                </div>
                <div className="divider"/>
                
                <div style={{display: "flex"}}>
                    <div style={{margin: "auto", width: "50%", paddingRight: "1%"}}>
                        <div className="attribute">
                            Device Name
                        </div>
                        <div className="display-box">
                            {props.currentDevice.name}
                            {props.currentDevice.name === "" && <div>No name set</div>}
                        </div>
                    </div>

                    <div style={{margin: "auto", width: "50%"}}>
                        <div className="attribute">
                            Date Added
                        </div>
                        <div className="display-box">
                            {(props.currentDevice.dateAdded !== "") && (
                                props.currentDevice.getDisplayableTime("dateAdded")
                            )}
                            {props.currentDevice.dateAdded === "" && <div>Unknown</div>}
                        </div>
                    </div>
                </div>

                <div style={{display: "flex"}}>
                    <div style={{margin: "auto", width: "50%", paddingRight: "1%"}}>
                        <div className="attribute">
                            Last Checkout
                        </div>
                        <div className="display-box">
                            {(props.currentDevice.lastCheckout !== "") && (
                                props.currentDevice.getDisplayableTime("lastCheckout")
                            )}
                            {props.currentDevice.lastCheckout === "" && <div>No name set</div>}
                        </div>
                    </div>

                    <div style={{margin: "auto", width: "50%"}}>
                        <div className="attribute">
                            Last Checkin
                        </div>
                        <div className="display-box">
                            {(props.currentDevice.lastCheckin !== "") && (
                                props.currentDevice.getDisplayableTime("lastCheckin")
                            )}
                            {props.currentDevice.lastCheckin === "" && <div>Unknown</div>}
                        </div>
                    </div>
                </div>

                <div>
                    <div className="attribute">
                        Scheduled Return Date
                    </div>
                    <div className="display-box">
                        {(props.currentDevice.returnDate !== "") && (
                            props.currentDevice.getDisplayableTime("returnDate")
                        )}
                        {props.currentDevice.returnDate === "" && <div>Device Not Checked Out</div>}
                    </div>
                </div>

                <div className="attribute">
                    Notes
                </div>
                <div className="display-box">
                    {props.currentDevice.notes}
                    {props.currentDevice.notes === "" && <div>No notes</div>}
                </div>

                <div className="attribute">
                    Check Out Log
                </div>
                <div className="display-box">
                    {props.currentDevice.log.map((log, i) => {
                        return <div key={i}>{log}</div>
                    })}
                    {props.currentDevice.log.length === 0 && (<div>No log entries</div>)}
                </div>

                <div className="attribute">
                    ID
                </div>
                <div className="display-box">
                    {props.currentDevice.bsid}
                    {props.currentDevice.bsid === "" && <div>No ID</div>}
                </div>

            </div>
        );
    }

    const showPatronDetails = () =>
    {

        return (
            <div> 
                <div className="title">Patron Information</div>
                <div className="divider"/>

                <div style={{display: "flex"}}>
                    <div style={{margin: "auto", width: "50%", paddingRight: "1%"}}>
                        <div className="attribute">
                            Name
                        </div>
                        <div className="display-box"> 
                            {props.currentPatron.identifier}
                            {props.currentPatron.identifier === "" && <div>No name set</div>}
                        </div>
                    </div>

                    <div style={{margin: "auto", width: "50%", paddingRight: "1%"}}>
                        <div className="attribute">
                            Birthday
                        </div>
                        <div className="display-box"> 
                            {(props.currentPatron.birthday !== 0) && (
                                props.currentPatron.getDisplayableBirthday()
                            )}
                            {props.currentPatron.birthday === 0 && <div>No birthday set</div>}
                        </div>
                    </div>
                </div>

                <div style={{display: "flex"}}>
                    <div style={{margin: "auto", width: "50%", paddingRight: "1%"}}>
                        <div className="attribute">
                            Email
                        </div>
                        <div className="display-box"> 
                            {props.currentPatron.email}
                            {props.currentPatron.email === "" && <div>No email set</div>}
                        </div>
                    </div>

                    <div style={{margin: "auto", width: "50%", paddingRight: "1%"}}>
                        <div className="attribute">
                            Phone
                        </div>
                        <div className="display-box"> 
                            {"(" + props.currentPatron.phone.slice(0, 3) + ") " + props.currentPatron.phone.slice(3, 6) + "-" + props.currentPatron.phone.slice(6)}
                            {props.currentPatron.phone === "" && <div>No phone set</div>}
                        </div>
                    </div>
                </div>

                <div className="attribute">Address</div>
                <div className="display-box"> 
                    {(props.currentPatron.streetAddress !== "") && props.currentPatron.getDisplayableAddress()}
                    {props.currentPatron.streetAddress === "" && <div>No address set</div>}
                </div>

                <div className="attribute">ID</div>
                <div className="display-box"> 
                    {props.currentPatron.bsid}
                    {props.currentPatron.bsid === "" && <div>No ID</div>}
                </div>

                {/* <button>Edit</button> */}
            </div>
        );
    }

    return (
        <div className="display-flex">

            <div className="column-left">
                <div className="header">
                    <div style={{display: "flex"}}>
                        <div className="content">
                            Device
                        </div>

                        {/* props.currentDevice.status === "Available" because this is the Check Out Device page*/}
                        {(props.currentDevice !== undefined) && (props.currentDevice !== null) && (props.currentDevice.name !== "") && (props.currentDevice.status === "Available") && (
                            <div style={{margin: "auto 0 auto auto", fontFamily: "Poppins"}}>
                                Selected: {props.currentDevice.name}
                            </div>
                        )}
                    </div>
                    <div className="divider" />
                </div>
                <Category name="devices" showDetailsButton={true} highlightSelected={props.currentDevice} getItem={props.setCurrentDevice} userId={props.userId} showDetailsWindow={showDeviceDetails} showDeviceStatus={1} />
            </div>

            <div className="column-right">
                <div className="header">
                    <div style={{display: "flex"}}>
                        <div className="content">
                            Patron
                        </div>

                        {(props.currentPatron !== undefined) && (props.currentPatron !== null) && (props.currentPatron.fname !== "") && (
                            <div style={{margin: "auto 0 auto auto", fontFamily: "Poppins"}}>
                                Selected: {props.currentPatron.identifier}
                            </div>
                        )}
                    </div>

                    <div className="divider"></div>
                </div>

                <Category name="patrons" showDetailsButton={true} highlightSelected={props.currentPatron} getItem={props.setCurrentPatron} userId={props.userId} addItem={() => {props.addNewPatron(); props.setCurrentPatron(new Patron())}} showDetailsWindow={showPatronDetails} />
            
                <button className={"button"} onClick={(e) => {e.preventDefault(); e.stopPropagation(); setConfirmCheckOut(true);}} disabled={checkoutError} style={checkoutError ? {color: "white", backgroundColor: "gray", cursor: "not-allowed", marginBottom: "10px"} : {marginBottom: "10px"} }>
                    Check Out
                </button>
            </div>
            
            <Popup contentStyle={{backgroundColor: "transparent", border: "1px transparent solid"}} open={confirmCheckOut} onOpen={() => {setPopupDidLoad(true);}} onClose={() => {setConfirmCheckOut(false); setPopupDidLoad(false);}} position="center">
                <div className="checkout">
                    <div className="title">
                        <FontAwesomeIcon icon="hand"/> Confirm Check Out
                    </div>
                    <div className="divider"/>


                    <div className="display-flex">
                        <div style={{margin: "auto", width: "50%", paddingRight: "1%"}}>
                            <div className="attribute">
                                Patron
                            </div>
                            <div className="display-box"> 
                                {props.currentPatron.identifier}
                                {props.currentPatron.identifier === "" && <div>???</div>}
                            </div>
                        </div>

                        <div style={{margin: "auto", width: "50%", paddingRight: "1%"}}>
                            <div className="attribute">
                                Device
                            </div>
                            <div className="display-box"> 
                                {(props.currentDevice.name !== "") && (
                                    props.currentDevice.name
                                )}
                               {props.currentPatron.name === "" && <div>???</div>}
                            </div>
                        </div>
                    </div>
                    
                    {(popupDidLoad) && (
                    <div>
                        <div className="display-flex">
                            <div style={{display: "flex", margin: "auto", textAlign: "center"}}>
                                <div className="datepicker-labels">
                                    <label htmlFor="checkout-date">
                                        <div className="desc">
                                            <span>
                                            <FontAwesomeIcon icon="calendar" style={{color: "#3A3845", cursor: "not-allowed"}}/> Check Out Date
                                            </span>
                                        </div>
                                    </label> 
                                    <DatePicker 
                                        dateFormat="MM-dd-yyyy hh:mm a"
                                        selected={checkOutDate}  
                                        onChange={((newDate) => {setCheckOutDate(newDate)})} 
                                        showTimeSelect
                                        timeFormat="hh:mm a"
                                        timeIntervals={60}
                                        className="illuminated-picker" // is this even used
                                        preventOpenOnFocus={true}
                                        onKeyDown={(e) => {
                                            e.preventDefault();
                                         }}
                                        />
                                </div>
                            </div>

                            <div style={{display: "flex", margin: "auto", textAlign: "center"}}>
                                <div className="datepicker-labels">
                                    <label htmlFor="return-date">
                                        <div className="desc">
                                        <span>
                                            <FontAwesomeIcon icon="calendar" style={{color: "#3A3845", cursor: "not-allowed"}}/> Return Date
                                        </span>
                                        </div>
                                    </label>
                                    <DatePicker 
                                        dateFormat="MM-dd-yyyy hh:mm a"
                                        selected={returnDate} 
                                        onChange={((newDate) => {setReturnDate(newDate)})} 
                                        showTimeSelect
                                        timeFormat="hh:mm a"
                                        timeIntervals={60}
                                        className="illuminated-picker"
                                        preventOpenOnFocus={true}
                                        onKeyDown={(e) => {
                                            e.preventDefault();
                                         }}
                                        />
                                </div>
                            </div>
                        </div>

                        <div className="divider"/>

                        <div style={{display: "flex", marginTop: "1em"}}>
                            <button className="button--cancel"
                                onClick={() => {
                                    setConfirmCheckOut(false)
                                }}
                            >
                                    Cancel
                            </button>

                            <button 
                                className="button" 
                                onClick={() => {
                                    checkOut(checkOutDate, returnDate)
                                }}
                            >
                                Confirm
                            </button> 
                        </div>
                    </div>
                    )}

                </div>
            </Popup>
        </div>
    );
};

export default CheckOutDevice;