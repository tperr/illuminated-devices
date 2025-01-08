// FontAwesome Icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Components
import Category from './Category';

// Classes
import { Device } from '../classes/Device';

// Other imports
import { useState } from 'react';
import Popup from 'reactjs-popup';

// CSS
import "./../column.scss";

async function performCheckIn(userId, deviceId, patronId) {
    const fullAddr = "https://illuminated.cs.mtu.edu/ark/checkin";
    const authorization = 'Bearer ' + sessionStorage.getItem("BLIGHT");
    let status;

    let body = {
        "data": {
            "provider": userId,
            "device": deviceId, 
            "patron": patronId
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
            return response.json()
        }
        throw response;
    })
    .then(data => {
        var received_response = data.data;
        if (received_response["error"] === "invalid_token") {
            console.log("error code found in performCheckIn (CheckInDevice.js -> performCheckIn() -> Ark request -> (then) received_response[\"error\"]");
            // What to do in an error situation?
        }
        else {
            return received_response[0]["checked_in"];
        }
        throw data;
    })
    .catch(error => {
        console.error("error code found in performCheckIn (CheckInDevice.js -> performCheckIn() -> Ark request -> (catch) received_response[\"error\"] ", error);
        console.log(error);
    })
    .finally(() => {
        //
    })

    return status; 
}

const CheckInDevice = (props) => {
    const [confirmCheckIn, setConfirmCheckIn] = useState(false);

    if ((props.currentDevice === null) || (props.currentDevice === undefined)) {
        props.setCurrentDevice(new Device());
    }

    const checkIn = () => {
        let userId = props.userId;
        let deviceId = props.currentDevice.id; 
        let patronId = props.currentDevice.patronId; 

        let status = performCheckIn(userId, deviceId, patronId)
                    .then((response) => {
                        console.log("status is: " + response);
                        props.setDeviceDidCheckin(response); 
                        props.setPagenum(6);
                    });
    }

    return (
        <div className="display-flex">
            <div className="column-left">
                <div className="header">
                    <div style={{display: "flex"}}>
                        <div className="content">
                            Device
                        </div>

                        {/* props.currentDevice.status === "Checked Out" because this is the Check In Device page*/}
                        {(props.currentDevice !== undefined) && (props.currentDevice !== null) && (props.currentDevice.name !== "") && (props.currentDevice.status === "Checked Out") && (
                            <div style={{margin: "auto 0 auto auto", fontFamily: "Poppins"}}>
                                Selected: {props.currentDevice.name}
                            </div>
                        )}
                    </div>
                    <div className="divider" />
                </div>
                <Category name="devices" highlightSelected={props.currentDevice} getItem={props.setCurrentDevice} userId={props.userId} showDetailsWindow={false} showDeviceStatus={2} setPagenum={props.setPagenum}/>
            </div>

            {((props.currentDevice.id !== "") && (props.currentDevice.status === "Checked Out")) && (                
                <div className="column-right">
                    <div className="header">
                        <div className="content display-flex">

                            <div>
                            {(props.currentDevice.id !== "") && (
                                props.currentDevice.name
                                )}
                            </div>

                            <div style={{marginLeft: "auto"}}>
                                {props.currentDevice.isOverdue() && (
                                    <div style={{textAlign: "center", color: "red", fontFamily: "Poppins-EB"}}>
                                        <FontAwesomeIcon icon="warning"/> Device Overdue
                                    </div>
                                )}
                            </div>

                        </div>
                        <div className="deviceManagementRight"> 
                            <div className="divider"/>
                                
                            <div className="display-flex">
                                <div style={{margin: "auto", width: "50%", paddingRight: "1%"}}>
                                    <div className="attributeTitle">
                                        Device Name
                                    </div>
                                    <div className="display-box">
                                        {props.currentDevice.name}
                                        {props.currentDevice.name === "" && <div>No name set</div>}
                                    </div>
                                </div>

                                <div style={{margin: "auto", width: "50%"}}>
                                    <div className="attributeTitle">
                                        Checked Out to Patron
                                    </div>
                                    <div className="display-box">
                                        {props.currentDevice.patron_fname + " " + props.currentDevice.patron_lname}
                                    </div>
                                </div>
                            </div>

                            <div className="display-flex">
                                <div style={{margin: "auto", width: "50%", paddingRight: "1%"}}>
                                    <div className="attributeTitle">
                                        Last Checkout
                                    </div>
                                    <div className="display-box">
                                        {(props.currentDevice.lastCheckout !== "") && (
                                            props.currentDevice.getDisplayableTime("lastCheckout")
                                        )}
                                        {props.currentDevice.lastCheckout === "" && <div>No name set</div>}
                                    </div>
                                </div>

                                <div style={{margin: "auto", width: "50%", paddingRight: "1%"}}>
                                    <div className="attributeTitle">
                                        Scheduled Return Date
                                    </div>
                                    <div className="display-box">
                                        {(props.currentDevice.returnDate !== "") && (
                                            props.currentDevice.getDisplayableTime("returnDate")
                                        )}
                                        {props.currentDevice.returnDate === "" && <div>Device Not Checked Out</div>}
                                    </div>
                                </div>

                            </div>

                            <div>
                                <div className="attributeTitle">
                                    Notes
                                </div>
                                <div className="display-box">
                                    {props.currentDevice.notes}
                                    {props.currentDevice.notes === "" && <div>No notes</div>}
                                </div>
                            </div>

                            <div>
                                <div className="attributeTitle">
                                    Check Out Log
                                </div>
                                <div className="display-box">
                                    {props.currentDevice.log.map((log, i) => {
                                        return <div key={i}>{log}</div>
                                    })}
                                    {props.currentDevice.log.length === 0 && <div>No log entries</div>}
                                </div>
                            </div>

                            <div>
                                <div style={{margin: "auto", width: "100%"}}>
                                    <div className="attributeTitle">
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

                        </div>
                    </div>

                    <button className={"button"} onClick={(e) => {e.preventDefault(); e.stopPropagation(); setConfirmCheckIn(true);}}>
                        <FontAwesomeIcon icon="right-to-bracket"/> Check In
                    </button>

                    <Popup contentStyle={{backgroundColor: "transparent", border: "1px transparent solid"}} open={confirmCheckIn} onClose={() => {setConfirmCheckIn(false)}} position="center">
                        <div className="checkout">
                            <div className="title">
                                <FontAwesomeIcon icon="hand"/> Confirm Check In
                            </div>
                            
                            <div className="divider"/>

                            <div className="display-flex">

                                <div style={{margin: "auto", width: "50%", paddingRight: "1%"}}>
                                    <div className="attribute">
                                        Patron
                                    </div>
                                    <div className="display-box"> 
                                            {(props.currentDevice !== undefined && props.currentDevice !== null) && (props.currentDevice.patron_fname + " " + props.currentDevice.patron_lname)}
                                    </div>
                                </div>

                                <div style={{margin: "auto", width: "50%", paddingRight: "1%"}}>
                                    <div className="attribute">
                                        Device
                                    </div>
                                    <div className="display-box"> 
                                            {(props.currentDevice !== undefined && props.currentDevice !== null) && (props.currentDevice.name)}
                                    </div>
                                </div>

                            </div>

                            <br />


                            <div className="display-flex">

                                <div style={{margin: "auto", width: "50%", paddingRight: "1%"}}>
                                    <div className="attribute">
                                        Due Date
                                    </div>
                                    <div className="display-box"> 
                                            {(props.currentDevice !== undefined && props.currentDevice !== null) && (props.currentDevice.getDisplayableTime("returndate"))}
                                    </div>
                                </div>

                                <div style={{margin: "auto", width: "50%", paddingRight: "1%"}}>
                                    <div className="attribute">
                                        Time Remaining
                                    </div>
                                    <div className="display-box">
                                            {/* v There is DEFINITELY a better way to write this v */}

                                            {/* Not Overdue */}
                                            {(props.currentDevice !== undefined && props.currentDevice !== null && (props.currentDevice.timeToDue() >= 0)) && (
                                                props.currentDevice.getDisplayableTime("timetodue")
                                            )}

                                            {/* Overdue */}
                                            {(props.currentDevice !== undefined && props.currentDevice !== null && (props.currentDevice.timeToDue() < 0)) && 
                                                (<FontAwesomeIcon icon="warning" style={{paddingRight: "1em"}}/>)
                                            }

                                            {(props.currentDevice !== undefined && props.currentDevice !== null && (props.currentDevice.timeToDue() < 0)) && 
                                                (props.currentDevice.getDisplayableTime("timetodue"))
                                            }

                                            {(props.currentDevice !== undefined && props.currentDevice !== null && (props.currentDevice.timeToDue() < 0)) && 
                                                (" overdue")
                                            }
                                    </div>
                                </div>

                            </div>

                            <div className="divider" style={{marginTop: "1em", marginBottom: "1em"}}/>

                            <div className="display-flex">
                                <button className={"button"} onClick={(e) => {e.preventDefault(); e.stopPropagation(); checkIn();}}>
                                    <FontAwesomeIcon icon="right-to-bracket"/> Check In
                                </button>
                            </div>
                        </div>
                    </Popup>

                </div>
                
            )}
        </div>
    );
}

export default CheckInDevice;