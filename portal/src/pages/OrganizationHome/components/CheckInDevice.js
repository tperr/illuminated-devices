/***** Imports *****/
// React
import React from "react";

// FontAwesome Icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Classes
import { Device } from '../classes/Device';

// Other imports
import Category from './Category';
import Popup from 'reactjs-popup';

// Material UI Tooltip
import Tooltip from "@mui/material/Tooltip";

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

/***** Main Export *****/
const CheckInDevice = (props) => {
    /***** Variables *****/
    const [confirmCheckIn, setConfirmCheckIn] = React.useState(false);

    if ((props.currentDevice === null) || (props.currentDevice === undefined)) {
        props.setCurrentDevice(new Device());
    }

    /***** Helper Functions *****/
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
    
    /***** UseEffects *****/

    /***** Returned Page *****/
    return (
        <div style={{height: "100%"}}>
            <div className={"column-wrapper"}>
                <div className={"column-left2" + props.columnStylingModifier}>
                    <div className="header">
                        <div className="content">
                            Device
                        </div>

                        {/* props.currentDevice.status === "Checked Out" because this is the Check In Device page */}
                        {(props.currentDevice !== undefined) && (props.currentDevice !== null) && (props.currentDevice.name !== "") && (
                            <div className={"selected-item-display"}>
                                <b>Selected:</b> {props.currentDevice.name} {((props.currentDevice.status !== "Checked Out") && (props.currentDevice.status !== "Overdue")) && "[Unavailable]"}
                            </div>
                        )}

                        {((props.currentDevice === undefined) || (props.currentDevice === null) || (props.currentDevice.name === "")) && (
                            <div className={"selected-item-display"}>
                                <b>Selected:</b> [No Device Selected]
                            </div>
                        )}

                        <div className="divider" />
                    </div>
                    <Category 
                        name="devices" 
                        userId={props.userId}
                        highlightSelected={props.currentDevice} 
                        getItem={props.setCurrentDevice} 
                        fakeDetailsButton={true} 
                        showDetailsButton={true} 
                        showDetailsWindow={false} 
                        showDeviceStatus={2} 
                        setPagenum={props.setPagenum}
                    />
                </div>

            {((props.currentDevice.id !== "") && ((props.currentDevice.status === "Checked Out") || (props.currentDevice.status === "Overdue"))) && (                
                <div 
                    className={"column-right2" + props.columnStylingModifier}
                    style={{
                        // gridTemplateRows: "0.24fr auto",
                    }}
                >
                    <div className={"header"}>

                        <div className={"content"}>

                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                width: "calc(100%)",
                            }}>

                                <div style={{
                                    gridRow: "1",
                                    gridColumn: "1",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    width: "calc(97%)",
                                }}>

                                    <div style={{
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                        width: "calc(97%)",
                                    }}>

                                        {(props.currentDevice.id !== "") && (
                                            props.currentDevice.name
                                        )}
                                    </div>
                                </div>


                            </div>
                        </div>

                        {props.currentDevice.isOverdue() && (
                            <div className={"selected-item-display"} style={{color: "red"}}>
                                <FontAwesomeIcon icon="warning"/> Device Overdue
                            </div>
                        )}

                        {!props.currentDevice.isOverdue() && (
                            <div className={"selected-item-display"}>
                                {/* <FontAwesomeIcon icon="warning"/> Placeholder Text */}
                            </div>
                        )}

                        <div className="divider"/>
                    </div>
                   
                    {/* Right Column Content */}
                    <div style={{display: "grid", gridTemplateRows: "0.1fr auto 0.1fr", gridColumn: "1 / span 2", gridRow: "2"}}>

                        {/* Spacing */}
                        {/*
                        <div
                            className={"category-searchbar-cont2"}
                            style={{
                                backgroundColor: "transparent",
                            }}
                        >
                        </div>
                        */}

                        <div 
                            className="deviceManagementRight"
                            style={{
                                gridColumn: "1 / span 2",
                                gridRow: "2",
                                gridTemplateRows: "auto auto auto 1fr auto",
                                gridTemplateColumns: "0.01fr 1fr 0.01fr",
                            }}
                        >
                            <div className={"r1"} style={{gridColumn: "2"}}>
                                <div className={"c1"} style={{gridColumn: "1"}}>
                                    <div className={"attributeTitle2"} style={{gridRow: "1", gridColumn: "1",}}>
                                        <Tooltip title={
                                            <React.Fragment>
                                                <div style={{fontFamily: "Poppins-EB", textTransform: "uppercase"}}>
                                                    Device Name
                                                </div>
                                                <div className={"login-divider"} style={{backgroundColor: "white", height: "0.1em"}}/>
                                                <div>
                                                    <span style={{fontFamily: "Poppins-SB"}}>
                                                        This is the name that will be displayed in the Device List. <br/>
                                                    </span>
                                                    <span style={{fontFamily: "Poppins-EB"}}>
                                                        This name must be unique among all devices for an organization.
                                                    </span>
                                                </div>
                                            </React.Fragment>
                                        }>
                                            <span style={{cursor: "pointer"}}> 
                                                <FontAwesomeIcon icon="circle-info" />
                                            </span>
                                        </Tooltip>

                                        {" Device Name"}
                                    </div>

                                    <div className={"display-box2"} style={{gridRow: "2", gridColumn: "1 / span 3"}}>
                                        {props.currentDevice.name}
                                        {props.currentDevice.name === "" && <div>[No name]</div>}
                                    </div>
                                </div>

                                <div className={"c2"} style={{gridColumn: "3"}}>
                                    <div className={"attributeTitle2"} style={{gridRow: "1", gridColumn: "1",}}>
                                        {"Checked Out to Patron"}
                                    </div>
                                    <div className={"display-box2"} style={{gridRow: "2", gridColumn: "1 / span 3"}}>
                                        {props.currentDevice.patron_fname + " " + props.currentDevice.patron_lname}
                                    </div>
                                </div>
                            </div>

                            <div className={"r2"} style={{gridColumn: "2"}}>
                                <div className={"c1"} style={{gridColumn: "1"}}>
                                    <div className={"attributeTitle2"}>
                                        {"Last Checkout"}
                                    </div>

                                    <div className={"display-box2"} style={{gridRow: "2", gridColumn: "1 / span 3"}}>
                                        {(props.currentDevice.lastCheckout !== "") && (
                                            props.currentDevice.getDisplayableTime("lastCheckout")
                                        )}
                                        {props.currentDevice.lastCheckout === "" && <div>[Last Checkout Unknown]</div>}
                                    </div>
                                </div>

                                <div className={"c2"} style={{gridColumn: "3"}}>  
                                    <div className={"attributeTitle2"}>
                                        {"Scheduled Return Date"}
                                    </div>
                                    <div className={"display-box2"} style={{gridRow: "2", gridColumn: "1 / span 3"}}>
                                        {(props.currentDevice.returnDate !== "") && (
                                            props.currentDevice.getDisplayableTime("returnDate")
                                        )}
                                        {props.currentDevice.returnDate === "" && (
                                            <div>Device Not Checked Out</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div 
                                className={"r5"}
                                style={{
                                    gridRow: "3",
                                    gridColumn: "2",
                                }}
                            >
                                <div className={"c1"} style={{gridColumn: "1 / span 3"}}>
                                    <div className={"attributeTitle2"}>
                                        {"Notes"}
                                    </div>
                                    
                                    <div className={"display-box2"}>
                                        {props.currentDevice.notes}
                                        {props.currentDevice.notes === "" && (
                                            <div>[No notes]</div>)
                                        }
                                    </div>
                                </div>
                            </div>



                        </div>

                        <div style={{
                                display: "grid",
                                gridRow: "3",
                                gridColumn: "1 / span 2",
                                gridTemplateColumns: "1fr 0.05fr 1fr",
                            }}
                        >
                                
                            <div style={{
                                gridRow: "1",
                                gridColumn: "1 / span 3",  
                                fontSize: "1em",
                                margin: "0em 0 0.5em 0",
                            }}>
                                <button className={"button2"} 
                                    onClick={(e) => {
                                        e.preventDefault(); 
                                        e.stopPropagation(); 
                                        setConfirmCheckIn(true);
                                    }}
                                    style={{
                                        gridRow: "1",
                                        gridColumn: "1",
                                        height: "2em",
                                        
                                    }}
                                >
                                    <FontAwesomeIcon icon="right-to-bracket"/> Check In
                                </button>
                            </div>
                        </div>

                    </div>

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
                                    <div className="display-box2"> 
                                            {(props.currentDevice !== undefined && props.currentDevice !== null) && (props.currentDevice.patron_fname + " " + props.currentDevice.patron_lname)}
                                    </div>
                                </div>

                                <div style={{margin: "auto", width: "50%", paddingRight: "1%"}}>
                                    <div className="attribute">
                                        Device
                                    </div>
                                    <div className="display-box2"> 
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
                                    <div className="display-box2"> 
                                            {(props.currentDevice !== undefined && props.currentDevice !== null) && (props.currentDevice.getDisplayableTime("returndate"))}
                                    </div>
                                </div>

                                <div style={{margin: "auto", width: "50%", paddingRight: "1%"}}>
                                    <div className="attribute">
                                        Time Remaining
                                    </div>
                                    <div className="display-box2">
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
                                <button className={"button2"} 
                                    onClick={(e) => {e.preventDefault(); e.stopPropagation(); checkIn();}}
                                >
                                    <FontAwesomeIcon icon="right-to-bracket"/> Check In
                                </button>
                            </div>
                        </div>
                    </Popup>

                </div>  
            )}
            </div>
        </div>
    );
}

export default CheckInDevice;