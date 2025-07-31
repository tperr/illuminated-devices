/***** Imports *****/
// React
import React from "react";

// FontAwesome Icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Classes
import { Device } from '../classes/Device';

// Other imports
import Category from './Category';
import DeviceLog from "./DeviceLog";
import { useState, useEffect } from 'react'; // TODO: remove this
import Popup from 'reactjs-popup';

// Material UI Dropdowns
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { createTheme, ThemeProvider } from "@mui/material/styles";

// Material UI Tooltip
import Tooltip from "@mui/material/Tooltip";

function getLocationNameFromId(organizationLocations, accountId) {
    for (let i = 0; i < organizationLocations.length; i++) {
        if (organizationLocations[i].account_id === accountId) {
            return organizationLocations[i].name;
        }
    }
    return "Unknown Location";
}

function getLocationIdFromName(organizationLocations, accountName) {
    // name, phone, email, street_address, city, state, registration_date, bsid, account_id
    for (let i = 0; i < organizationLocations.length; i++) {
        if (organizationLocations[i].name === accountName) {
            console.log("returning: ", organizationLocations[i].account_id);
            return organizationLocations[i].account_id;
        }
    }
    console.log("returning: ", "deadbeef");
    return "deadbeef-dead-beef-beef-deadbeefdead"; // uuid format
}

async function getOrganizationLocations(userId) {
	const fullAddr = "https://illuminated.cs.mtu.edu/ark/u/" + userId;
	const authorization = 'Bearer ' + sessionStorage.getItem("BLIGHT");
    let itemList = [];

	itemList = await fetch(fullAddr + "/organizations", {
		method: 'GET',
		headers: {
			'Authorization': authorization,
			'Content-type': 'application/json',
		},
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
			console.log("error code found in receive account details (Provider.js -> getDevices() -> Ark request -> (then) received_response[\"error\"]");
			// What to do in an error situation?
		}
		else {
            return received_response;
		}
        throw data;
	})
	.catch(error => {
		console.error("error code found in receive account details (App.js -> getUserDetails() -> Ark request -> (catch) received_response[\"error\"] ", error);
	})
	.finally(() => {
		//
	})

	return itemList; 
}

async function updateDeviceInformation(userId, deviceId, newDeviceName, newDeviceBsid, newDeviceHomeLocationId, newDeviceCurrentLocationId, newDeviceNotes, commandNumber) {
	const fullAddr = "https://illuminated.cs.mtu.edu/ark";
	const authorization = 'Bearer ' + sessionStorage.getItem("BLIGHT");
    let status; 
    
    let body = {
        "data": {
            "provider": userId,
            "device": deviceId, 
            "name": newDeviceName,
            "bsid": newDeviceBsid,
            "home_location_id": newDeviceHomeLocationId, 
            "current_location_id": newDeviceCurrentLocationId,
            "command_number": commandNumber,
            "notes": newDeviceNotes
        }
    }

    console.log(body);

	status = await fetch(fullAddr + "/device/update" , {
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
        console.log(data);

		var received_response = data.data;
		if (received_response["error"] === "invalid_token") {
			console.log("error code found in update device information fetch -> then -> then(data)");
			// What to do in an error situation?
		}
		else if (received_response["error"]) {
            console.log("error code found in update device information fetch -> then -> then(data)");
            console.log(received_response["error"]);
        }
        else {
            return received_response;
		}
        console.log("d: ", data); 
        throw data;
	})
	.catch(error => {
		console.error("error code found in receive account details (App.js -> getUserDetails() -> Ark request -> (catch) received_response[\"error\"] ", error);
	})
	.finally(() => {
		//
	})

	return status; 
}


/***** Main Export *****/
const DeviceManagement = (props) => {
    /***** Variables *****/
    const [displayBoxClass, setDisplayBoxClass] = useState("display-box2");
    const [confirmDeviceManagement, setConfirmDeviceManagement] = useState(false);
    const [editDevice, setEditDevice] = useState(false);
    const [organizationLocations, setOrganizationLocations] = useState([]);
    const [organizationLocationsHasBeenSet, setOrganizationLocationsHasBeenSet] = useState(false);
    const [organizationLocationsDoneLoading, setOrganizationLocationsDoneLoading] = useState(false);
    const [showDeviceLog, setShowDeviceLog] = React.useState(false);
    
    /* For field editing
     * It's kind of hard to use a device object for this because you can't just change the attributes of the object
     * since everything has to be a state for it to re-render the field you can't do "props.currentDevice.name = e.target.value" for example
     * it would have to be props.setCurrentDevice(...) but trying to do that when you just change one value is a little annoying
     * there is probably a better solution but this does work
     */
    const [fieldDeviceName, setFieldDeviceName] = useState("");
    const [fieldLocalId, setFieldLocalId] = useState("");
    const [fieldDeviceNotes, setFieldDeviceNotes] = useState("");

    // checkedOutToPatron and scheduledReturnDate should not be modifiable through this just check the device back in and back out please i'm begging you don't make me write that
    // lastCheckout and lastCheckin should not be modifiable
    const [fieldHomeLocation, setFieldHomeLocation] = useState("");
    const [fieldCurrentLocation, setFieldCurrentLocation] = useState("");
    // checkout log...we'll do those later because idk what they even look like at this point lol

    if ((props.currentDevice === null) || (props.currentDevice === undefined)) {
        props.setCurrentDevice(new Device());
    }

    // This is really convoluted but without organizationLocationHasBeenSet this code will repeat infinitely IDK why!!! 
    if (!organizationLocationsHasBeenSet) {
        getOrganizationLocations(props.userId)
            .then((response) => { 
                setOrganizationLocations(response);
                setOrganizationLocationsHasBeenSet(true);
                setOrganizationLocationsDoneLoading(false);
            });
    }

    /***** UseEffects *****/

    /*
     * The argument passed to useState is the initial state much like setting state in constructor for a class component and isn't used to update the state on re-render
     * If you want to update state on prop change, make use of useEffect hook
     */
    useEffect(() => {
        setDisplayBoxClass("display-box2");

        setFieldDeviceName(props.currentDevice.name);
        setFieldLocalId(props.currentDevice.bsid); 
        setFieldDeviceNotes(props.currentDevice.notes); 
        setFieldHomeLocation(getLocationNameFromId(organizationLocations, props.currentDevice.homeLocationId));
        setFieldCurrentLocation(getLocationNameFromId(organizationLocations, props.currentDevice.currentLocationId));
        setOrganizationLocationsDoneLoading(true);
    }, [props.currentDevice, organizationLocations]);

    /***** Element Creators *****/
    // Dropdown assistance with this absolutely horrendous MaterialUI
    const theme = createTheme({
        components: {
            MuiInputLabel: {
                styleOverrides: {
                    root: {
                        "& +.MuiInputBase-root": {
                            marginTop: 0,
                        },
                        "& +.Mui-focused": {
                            backgroundColor: "#8ecae6 !important",
                        },

                    }
                }
            }
        },
        MuiSelect: {
            outlined: {
                '&:focus': {
                    backgroundColor: '#ffffff !important',
                },
            },
        },
	    selectRoot: {
            width: "200px",
            "&:focus": {
                backgroundColor: "#ffffff !important",
		    },
	    },
    });
    
    /***** Returned Page *****/ 
    return (
        <div style={{height: "100%"}}>
            {/* Showing Device Log*/}
            {showDeviceLog && (
                <DeviceLog 
                    userId={props.userId}
                    currentDevice={props.currentDevice}
                    setCurrentDevice={props.setCurrentDevice}
                    setShowDeviceLog={setShowDeviceLog}
                />
            )}

            {!showDeviceLog &&
            <div className={"column-wrapper"}>
                {/* Not Showing Device Log */}
                
                <div className={"column-left2" + props.columnStylingModifier}>
                    <div className="header">
                        <div className="content">
                            Device
                        </div>

                        {(props.currentDevice !== undefined) && (props.currentDevice !== null) && (props.currentDevice.name !== "") && (
                            <div className="selected-item-display">
                                <b>Selected:</b> {props.currentDevice.name}
                                {/* {props.currentDevice.isIpad ? <FontAwesomeIcon icon="fa-solid fa-tablet-screen-button" /> : <FontAwesomeIcon icon="fa-solid fa-computer" />} */}
                            </div>
                        )}

                        {((props.currentDevice === undefined) || (props.currentDevice === null) || (props.currentDevice.name === "")) && (
                            <div className="selected-item-display">
                                <b>Selected:</b> [No Device Selected]
                            </div>
                        )}
                        
                        <div className="divider" />
                    </div>
                    <Category 
                        name="devices" 
                        userId={props.userId} 
                        highlightSelected={props.currentDevice} 
                        getItem={(e) => {
                            props.setCurrentDevice(e); 
                            setEditDevice(false)
                        }}
                        fakeDetailsButton={true}
                        showDetailsButton={true}
                        showDetailsWindow={false}
                        showDeviceStatus={0} 
                        emptyCategorySubtext={"deviceManagement"} 
                    />
                </div>

                {(props.currentDevice.id !== "" || editDevice) && (                
                    <div className={"column-right2" + props.columnStylingModifier}>

                        <div className="header">
                            <div className="content">
                                <div style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr",
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

                                    <div style={{
                                        gridRow: "1",
                                        gridColumn: "2",  
                                        fontSize: "0.5em",
                                        marginTop: "0.7em",
                                    }}>
     
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
                                    // gridTemplateRows: "0.5fr 0.5fr 0.5fr 0.5fr 1.35fr 2fr",
                                    gridTemplateRows: "auto auto auto auto 1fr auto",
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
                                                        {/* {props.currentDevice.isIpad ? <FontAwesomeIcon icon="fa-solid fa-tablet-screen-button" /> : <FontAwesomeIcon icon="fa-solid fa-computer" />} */}

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
                                            
                                            {editDevice && " *Name"}
                                            {!editDevice && " Name"}
                                        </div>

                                        <div className={"attributeTitle2"} style={{gridRow: "1", gridColumn: "3", textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", color: "red"}}> 
                                            {(editDevice && (fieldDeviceName.length > 20)) && (
                                                (32 - fieldDeviceName.length) + " characters remaining")
                                            }
                                        </div>

                                        <input maxLength={"32"} readOnly={!editDevice} value={fieldDeviceName} onChange={e => {setFieldDeviceName(e.target.value);}} className={displayBoxClass} type="text" style={{width:"100%", gridRow: "2", gridColumn: "1 / span 3"}} />
                                    </div>

                                    <div className={"c2"} style={{gridColumn: "3"}}>
                                        <div className={"attributeTitle2"} style={{gridRow: "1", gridColumn: "1",}}>
                                            <Tooltip title={
                                                <React.Fragment>
                                                    <div style={{fontFamily: "Poppins-EB", textTransform: "uppercase"}}>
                                                        Local ID
                                                    </div>
                                                    <div className={"login-divider"} style={{backgroundColor: "white", height: "0.1em"}}/>
                                                    <div>
                                                        <span style={{fontFamily: "Poppins-SB"}}>
                                                            This is the ID for the Device. This can be used to quickly search for a device without knowing the Device name. <br/>
                                                        </span>
                                                        <span style={{fontFamily: "Poppins-EB"}}>
                                                            This ID must be unique among all devices for an organization.
                                                        </span>
                                                    </div>
                                                </React.Fragment>
                                            }>
                                                <span style={{cursor: "pointer"}}> 
                                                    <FontAwesomeIcon icon="circle-info" />
                                                </span>
                                            </Tooltip>

                                            {editDevice && " *Local ID"}
                                            {!editDevice && " Local ID"}
                                        </div>

                                        <div className={"attributeTitle2"} style={{gridRow: "1", gridColumn: "3", textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", color: "red"}}> 
                                            {(editDevice && (fieldLocalId.length > 44)) && (
                                                (64 - fieldLocalId.length) + " characters remaining")
                                            }
                                        </div>

                                        <input maxLength={"64"} readOnly={!editDevice} value={fieldLocalId} onChange={e => {setFieldLocalId(e.target.value);}} className={displayBoxClass} type="text" style={{width:"100%", gridRow: "2", gridColumn: "1 / span 3"}} />
                                    </div>
                                </div>

                                <div className={"r2"} style={{gridColumn: "2"}}>
                                    <div className={"c1"} style={{gridColumn: "1"}}>
                                        <div className={"attributeTitle2"} style={{gridRow: "1", gridColumn: "1",}}>
                                            {"Checked Out to Patron"}
                                        </div>

                                        <div className={"display-box2"} style={{gridRow: "2", gridColumn: "1 / span 3"}}>
                                            {(props.currentDevice.status === "Checked Out") && (props.currentDevice.patron_fname + " " + props.currentDevice.patron_lname)}
                                            {(props.currentDevice.status !== "Checked Out") && ("Device Not Checked Out")}
                                        </div>
                                    </div>
                                
                                    <div className={"c2"} style={{gridColumn: "3"}}>
                                        <div className={"attributeTitle2"} style={{gridRow: "1", gridColumn: "1",}}>
                                            {"Scheduled Return Date"}
                                        </div>

                                        <div className={"display-box2"} style={{gridRow: "2", gridColumn: "1 / span 3"}}>
                                            {(props.currentDevice.status === "Checked Out") && (
                                                props.currentDevice.getDisplayableTime("returnDate")
                                            )}
                                            {(props.currentDevice.status !== "Checked Out") && ("Device Not Checked Out")}
                                        </div>
                                    </div>
                                </div>

                                <div className={"r3"} style={{gridColumn: "2"}}>
                                    <div className={"c1"} style={{gridColumn: "1"}}>
                                        <div className={"attributeTitle2"}>
                                            {"Last Checkout"}
                                        </div>

                                        <div className={"display-box2"}>
                                            {(props.currentDevice.lastCheckout !== "") && (
                                                props.currentDevice.getDisplayableTime("lastCheckout")
                                            )}
                                            {props.currentDevice.lastCheckout === "" && <div>No name set</div>}
                                        </div>
                                    </div>

                                    <div className={"c2"} style={{gridColumn: "3"}}>
                                        <div className={"attributeTitle2"}>
                                            {"Last Checkin"}
                                        </div>

                                        <div className={"display-box2"}>
                                            {(props.currentDevice.lastCheckin !== "") && (
                                                props.currentDevice.getDisplayableTime("lastCheckin")
                                            )}
                                            {props.currentDevice.lastCheckin === "" && <div>Unknown</div>}
                                        </div>
                                    </div>
                                </div>

                                <div className={"r4"} style={{gridColumn: "2"}}>
                                    <div className={"c1"} style={{gridColumn: "1"}}>
                                        <div className={"attributeTitle2"}>
                                            {"Home Location "}

                                            <Tooltip title={
                                                <React.Fragment>
                                                    <div style={{fontFamily: "Poppins-EB", textTransform: "uppercase"}}>
                                                        Home Location
                                                    </div>
                                                    <div className={"login-divider"} style={{backgroundColor: "white", height: "0.1em"}}/>
                                                    <div>
                                                        <span style={{fontFamily: "Poppins-SB"}}>
                                                            The location that typically handles the device. This is the location that a device should be returned to, even if it has been checked into another location. <br/>
                                                        </span>
                                                    </div>
                                                </React.Fragment>
                                            }>
                                                <span style={{cursor: "pointer"}}> 
                                                    <FontAwesomeIcon icon="circle-info" />
                                                </span>
                                            </Tooltip>
                                        </div>

                                        {(!editDevice) && (
                                            <input readOnly={!editDevice} value={fieldHomeLocation} onChange={e => {setFieldHomeLocation(e.target.value);}} className={displayBoxClass} type="text" style={{width:"100%"}} />
                                        )}
                                        {(editDevice) && (
                                            <ThemeProvider theme={theme}>
                                                <Box 
                                                    sx={{padding: "0 0 0 0"}}
                                                > 
                                                    <FormControl fullWidth>
                                                        <InputLabel id="home-location" shrink={false}> </InputLabel>
                                                        
                                                        {(organizationLocationsDoneLoading) && (
                                                            <Select
                                                                labelId="home-location"
                                                                id="home-location"
                                                                value={fieldHomeLocation}
                                                                displayEmpty
                                                                label=""
                                                                className={displayBoxClass}
                                                                onChange={e => {
                                                                    console.log(e);
                                                                    if ((e.target.value !== undefined) && (e.target.value !== null)) {
                                                                        setFieldHomeLocation(e.target.value);
                                                                    }
                                                                    else {
                                                                        setFieldHomeLocation("Demo Provider");
                                                                    }
                                                                }}
                                                                variant={"standard"}
                                                                disableUnderline
                                                                sx={{
                                                                    padding: "0 0 0 0",
                                                                    boxShadow: "none",
                                                                    "MuiInputBaseRoot": {
                                                                        marginTop: "0px",
                                                                    },
                                                                    "MuiInputRoot": {
                                                                        marginTop: "0px",
                                                                    },
                                                                    "MuiSelectRoot": {
                                                                        marginTop: "0px",
                                                                    },
                                                                    "& +.MuiInputBaseRoot": {
                                                                        marginTop: 0
                                                                    },
                                                                    "MuiInputBase": {
                                                                        marginTop: 0
                                                                    },
                                                                    "&:focus": {
                                                                        backgroundColor: "yellow !important"
                                                                    }
                                                                }}
                                                                MenuProps={{
                                                                    sx: {
                                                                        "&& ul": {
                                                                            backgroundColor: "white !important",
                                                                            padding: "0 0 0 0 !important",
                                                                        },
                                                                        "&& li": {
                                                                            fontFamily: "Poppins !important",
                                                                            transition: "all 0.2s ease !important"
                                                                        },
                                                                        "&& li:hover": {
                                                                            backgroundColor: "#023047 !important",
                                                                            color: "white !important"
                                                                        },
                                                                        "&& .Mui-selected": {
                                                                            backgroundColor: "#e3e3e3 !important",
                                                                            color: "black !important"
                                                                        }
                                                                    }
                                                                }}
                                                            >
                                                        
                                                                {(organizationLocations !== undefined) && (organizationLocations.length > 0) && (
                                                                    organizationLocations.map((location) => {
                                                                        return (
                                                                            <MenuItem key={location.accountId+location.bsid} value={location.name}>
                                                                                {location.name}
                                                                            </MenuItem>
                                                                        );
                                                                    })
                                                                )}

                                                            </Select>
                                                        )}
                                                    </FormControl>
                                            </Box>
                                        </ThemeProvider>
                                        )}
                                    </div>

                                    <div className={"c2"} style={{gridColumn: "3"}}>
                                        <div className={"attributeTitle2"}>
                                            {"Current Location "}

                                            <Tooltip title={
                                                <React.Fragment>
                                                    <div style={{fontFamily: "Poppins-EB", textTransform: "uppercase"}}>
                                                        Current Location
                                                    </div>
                                                    <div className={"login-divider"} style={{backgroundColor: "white", height: "0.1em"}}/>
                                                    <div>
                                                        <span style={{fontFamily: "Poppins-SB"}}>
                                                            The location that currently has the device. This is often the same as the Home Location, but may be different if a device was returned to a different location than where it was checked out from. <br/>
                                                        </span>
                                                    </div>
                                                </React.Fragment>
                                            }>
                                                <span style={{cursor: "pointer"}}> 
                                                    <FontAwesomeIcon icon="circle-info" />
                                                </span>
                                            </Tooltip>
                                        </div>

                                        {(!editDevice) && (
                                            <input readOnly={!editDevice} value={fieldCurrentLocation} onChange={e => {setFieldCurrentLocation(e.target.value);}} className={displayBoxClass} type="text" style={{width:"100%"}} />
                                        )}
                                        {(editDevice) && (
                                            <ThemeProvider theme={theme}>
                                                <Box 
                                                    sx={{padding: "0 0 0 0"}}
                                                > 
                                                    <FormControl fullWidth>
                                                        <InputLabel id="current-location" shrink={false}> </InputLabel>
                                                        
                                                        {(organizationLocationsDoneLoading) && (
                                                            <Select
                                                                labelId="current-location"
                                                                id="current-location"
                                                                value={fieldCurrentLocation}
                                                                displayEmpty
                                                                label=""
                                                                className={displayBoxClass}
                                                                onChange={e => {
                                                                    console.log(e);
                                                                    if ((e.target.value !== undefined) && (e.target.value !== null)) {
                                                                        setFieldCurrentLocation(e.target.value);
                                                                    }
                                                                    else {
                                                                        setFieldCurrentLocation("ERRORSETTING");
                                                                    }
                                                                }}
                                                                variant={"standard"}
                                                                disableUnderline
                                                                sx={{
                                                                    padding: "0 0 0 0",
                                                                    boxShadow: "none",
                                                                    "MuiInputBaseRoot": {
                                                                        marginTop: "0px",
                                                                    },
                                                                    "MuiInputRoot": {
                                                                        marginTop: "0px",
                                                                    },
                                                                    "MuiSelectRoot": {
                                                                        marginTop: "0px",
                                                                    },
                                                                    "& +.MuiInputBaseRoot": {
                                                                        marginTop: 0
                                                                    },
                                                                    "MuiInputBase": {
                                                                        marginTop: 0
                                                                    },
                                                                    "&:focus": {
                                                                        backgroundColor: "yellow !important"
                                                                    }
                                                                }}
                                                                MenuProps={{
                                                                    sx: {
                                                                        "&& ul": {
                                                                            backgroundColor: "white !important",
                                                                            padding: "0 0 0 0 !important",
                                                                        },
                                                                        "&& li": {
                                                                            fontFamily: "Poppins !important",
                                                                            transition: "all 0.2s ease !important"
                                                                        },
                                                                        "&& li:hover": {
                                                                            backgroundColor: "#023047 !important",
                                                                            color: "white !important"
                                                                        },
                                                                        "&& .Mui-selected": {
                                                                            backgroundColor: "#e3e3e3 !important",
                                                                            color: "black !important"
                                                                        }
                                                                    }
                                                                }}
                                                            >
                                                        
                                                                {(organizationLocations !== undefined) && (organizationLocations.length > 0) && (
                                                                    organizationLocations.map((location) => {
                                                                        return (
                                                                            <MenuItem key={location.accountId+location.bsid} value={location.name}>
                                                                                {location.name}
                                                                            </MenuItem>
                                                                        );
                                                                    })
                                                                )}

                                                            </Select>
                                                        )}
                                                    </FormControl>
                                                </Box>
                                            </ThemeProvider>
                                        )}

                                    </div>
                                </div>

                                <div className={"r5"} style={{gridColumn: "2"}}>
                                    <div className={"c1"} style={{gridColumn: "1 / span 3", display: "grid", gridTemplateRows: "auto auto 1fr"}}>
                                        <div className={"attributeTitle2"} style={{gridRow: "1", gridColumn: "1",}}> 
                                            {"Notes "}
                                        </div>

                                        <div className={"attributeTitle2"} style={{gridRow: "1", gridColumn: "3", textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", color: "red"}}> 
                                            {(editDevice && (fieldDeviceNotes.length > 108)) && (
                                                (128 - fieldDeviceNotes.length) + " characters remaining")
                                            }
                                        </div>

                                        {(editDevice) && (
                                            <input maxLength={"128"} value={fieldDeviceNotes} onChange={e => {setFieldDeviceNotes(e.target.value);}} className={displayBoxClass} type="text" style={{gridRow: "2", gridColumn: "1 / span 3"}} /> 
                                        )}

                                        {!(editDevice) && (fieldDeviceNotes !== "") && (
                                            <div className={"display-box2"} style={{gridRow: "2", gridColumn: "1 / span 3"}}> 
                                                {props.currentDevice.notes}
                                            </div>
                                        )}

                                        {!(editDevice) && (fieldDeviceNotes === "") && (
                                            <div className={"display-box2"} style={{gridRow: "2", gridColumn: "1 / span 3"}}> 
                                                [No notes]
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {(!editDevice) && (
                                <div className={"r6"} style={{gridColumn: "2"}}>
                                    <div className={"c1"} style={{
                                        gridColumn: "1 / span 3",
                                        marginBottom: "0.5em",
                                    }}>
                                        <button 
                                            className={"button2"} 
                                            onClick={() => {setShowDeviceLog(true);}}
                                            style={{
                                                gridRow: "8",
                                                gridColumn: "1 / span 3",
                                                height: "2em",
                                            }}
                                        >
                                            <FontAwesomeIcon icon="book"/> Show Log
                                        </button>
                                    </div>
                                </div>
                                )}
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
                                    margin: "0.5em 0 0 0",
                                }}>

                                {(!editDevice) && (
                                    <button 
                                        className={"button2"} 
                                        onClick={() => {
                                            setEditDevice(true); 
                                            setDisplayBoxClass("display-box2--editing")
                                        }}
                                        style={{
                                            gridRow: "1",
                                            gridColumn: "1",
                                            marginTop: "0px",
                                            padding: "0px",
                                            height: "2em",
                                        }}
                                    >
                                        <FontAwesomeIcon icon="edit"/> Edit
                                    </button>
                                )}

                            {(editDevice) && (
                                <div
                                    style={{
                                        display: "grid",
                                        gridRow: "3",
                                        gridColumn: "1 / span 3",
                                        gridTemplateColumns: "1fr 0.05fr 1fr",
                                        margin: "0.5em 0 0 0",
                                    }}
                                >
                                    <button className={"button2--cancel"} 
                                        style={{
                                            gridRow: "1",
                                            gridColumn: "1",
                                            marginTop: "0px",
                                            padding: "0px",
                                            height: "2em",
                                        }} 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setEditDevice(false); 
                                            setDisplayBoxClass("display-box2"); 
                                            setFieldDeviceName(props.currentDevice.name); 
                                            setFieldLocalId(props.currentDevice.bsid); 
                                            setFieldHomeLocation(getLocationNameFromId(organizationLocations, props.currentDevice.homeLocationId)); 
                                            setFieldCurrentLocation(getLocationNameFromId(organizationLocations, props.currentDevice.currentLocationId)); 
                                            setFieldDeviceNotes(props.currentDevice.notes);
                                        }}
                                    >
                                        Cancel
                                    </button>

                                    <button className={"button2"} 
                                        style={{
                                            gridRow: "1",
                                            gridColumn: "3",
                                            height: "2em",
                                            marginTop: 0,
                                        }} 
                                        onClick={(e) => {
                                            e.preventDefault(); 
                                            e.stopPropagation(); 
                                            if ((props.currentDevice.name !== fieldDeviceName) || (props.currentDevice.bsid !== fieldLocalId) || ((getLocationNameFromId(organizationLocations, props.currentDevice.homeLocationId) !== fieldHomeLocation)) || ((getLocationNameFromId(organizationLocations, props.currentDevice.currentLocationId) !== fieldCurrentLocation)) || (props.currentDevice.notes !== fieldDeviceNotes)) { 
                                                setConfirmDeviceManagement(true);
                                            }
                                            else {
                                                setEditDevice(false);
                                                setDisplayBoxClass("display-box2");
                                            }
                                        }}
                                    >
                                        Confirm
                                    </button>
                                </div>
                            )}

                            </div>
                        </div>

                        </div>
                    </div>
                )}
            </div>
            }

            <Popup contentStyle={{backgroundColor: "transparent", border: "1px transparent solid"}} open={confirmDeviceManagement} onClose={() => {setConfirmDeviceManagement(false);}} position="center">
                <div className="checkout">
                    <div className="title">
                        <FontAwesomeIcon icon="hand"/> Confirm Device Management
                    </div>
                    
                    <div className="divider"/>

                    {(props.currentDevice.name !== fieldDeviceName) && (
                        <div>
                            <div className="attribute">
                                Device Name
                                {/* {props.currentDevice.isIpad ? <FontAwesomeIcon icon="fa-solid fa-tablet-screen-button" /> : <FontAwesomeIcon icon="fa-solid fa-computer" />} */}
                            </div>
                            
                            <div className="display-flex">
                                <div style={{margin: "auto", width: "45%", paddingRight: "1%"}}>
                                    <div className="display-box2"> 
                                        {(props.currentDevice !== undefined && props.currentDevice !== null) && (props.currentDevice.name)}
                                    </div>
                                </div>

                                <div style={{margin: "auto", width: "5%", paddingRight: "1%", textAlign: "center", marginTop: "auto"}}>
                                    <FontAwesomeIcon icon="fa-angles-right" className="fa-fade fa-xsm" style={{color: "green"}} />
                                </div>

                                <div style={{margin: "auto", width: "45%", paddingRight: "1%"}}>
                                    <div className="display-box2"> 
                                        {fieldDeviceName}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {(props.currentDevice.bsid !== fieldLocalId) && (
                        <div>
                            <div className="attribute">
                                Local Id
                            </div>

                            <div className="display-flex">
                                <div style={{margin: "auto", width: "45%", paddingRight: "1%"}}>
                                    <div className="display-box2"> 
                                        {(props.currentDevice !== undefined && props.currentDevice !== null) && (props.currentDevice.bsid)}
                                    </div>
                                </div>

                                <div style={{margin: "auto", width: "5%", paddingRight: "1%", textAlign: "center", marginTop: "auto"}}>
                                    <FontAwesomeIcon icon="fa-angles-right" className="fa-fade fa-xsm" style={{color: "green"}} />
                                </div>

                                <div style={{margin: "auto", width: "45%", paddingRight: "1%"}}>
                                    <div className="display-box2">
                                        {fieldLocalId}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {(getLocationNameFromId(organizationLocations, props.currentDevice.homeLocationId) !== fieldHomeLocation) && (
                        <div>
                            <div className="attribute">
                                Home Location
                            </div>
                           
                            <div className="display-flex">
                                <div style={{margin: "auto", width: "45%", paddingRight: "1%"}}>
                                    <div className="display-box2"> 
                                        {(props.currentDevice !== undefined && props.currentDevice !== null) && (getLocationNameFromId(organizationLocations, props.currentDevice.homeLocationId))}
                                    </div>
                                </div>

                                <div style={{margin: "auto", width: "5%", paddingRight: "1%", textAlign: "center", marginTop: "auto"}}>
                                    <FontAwesomeIcon icon="fa-angles-right" className="fa-fade fa-xsm" style={{color: "green"}} />
                                </div>

                                <div style={{margin: "auto", width: "45%", paddingRight: "1%"}}>
                                    <div className="display-box2">
                                        {fieldHomeLocation}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {(getLocationNameFromId(organizationLocations, props.currentDevice.currentLocationId) !== fieldCurrentLocation) && (
                        <div>
                            <div className="attribute">
                                Current Location
                            </div>
                            <div className="display-flex">
                                <div style={{margin: "auto", width: "45%", paddingRight: "1%"}}>
                                    <div className="display-box2"> 
                                        {(props.currentDevice !== undefined && props.currentDevice !== null) && (getLocationNameFromId(organizationLocations, props.currentDevice.currentLocationId))}
                                    </div>
                                </div>

                                <div style={{margin: "auto", width: "5%", paddingRight: "1%", textAlign: "center", marginTop: "auto"}}>
                                    <FontAwesomeIcon icon="fa-angles-right" className="fa-fade fa-xsm" style={{color: "green"}} />
                                </div>

                                <div style={{margin: "auto", width: "45%", paddingRight: "1%"}}>
                                    <div className="display-box2">
                                        {fieldCurrentLocation}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {(props.currentDevice.notes !== fieldDeviceNotes) && (
                        <div>
                            <div className="attribute">
                                Notes
                            </div>

                            <div className="display-flex">
                                <div style={{margin: "auto", width: "45%", paddingRight: "1%"}}>
                                    <div className="display-box2"> 
                                        {(props.currentDevice !== undefined && props.currentDevice !== null) && (props.currentDevice.notes !== "") && (props.currentDevice.notes)}
                                        {(props.currentDevice !== undefined && props.currentDevice !== null) && (props.currentDevice.notes === "") && ("[No notes]")}
                                    </div>
                                </div>

                                <div style={{margin: "auto", width: "5%", paddingRight: "1%", textAlign: "center", marginTop: "auto"}}>
                                    <FontAwesomeIcon icon="fa-angles-right" className="fa-fade fa-xsm" style={{color: "green"}} />
                                </div>

                                <div style={{margin: "auto", width: "45%", paddingRight: "1%"}}>
                                    <div className="display-box2">
                                        {(fieldDeviceNotes !== "") && fieldDeviceNotes}
                                        {(fieldDeviceNotes === "") && "[No notes]"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="divider" style={{marginTop: "1em", marginBottom: "1em"}}/>

                    <div className="display-flex">
                            <button className={"button2--cancel"} style={{width: "45%", marginRight: "auto"}} onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setConfirmDeviceManagement(false);
                                }}>
                                Cancel
                            </button>
                        <button className={"button2"} style={{width: "45%"}}
                            onClick={(e) => {
                                e.preventDefault(); 
                                e.stopPropagation(); 
                                setConfirmDeviceManagement(false); 
                                let commandNumber = 0;
                                if (props.currentDevice.name !== fieldDeviceName) {
                                    commandNumber += 16;
                                }
                                if (props.currentDevice.bsid !== fieldLocalId) {
                                    commandNumber += 8;
                                }
                                if (getLocationNameFromId(organizationLocations, props.currentDevice.homeLocationId) !== fieldHomeLocation) {
                                    commandNumber += 4;
                                }
                                if (getLocationNameFromId(organizationLocations, props.currentDevice.currentLocationId) !== fieldCurrentLocation) {
                                    commandNumber += 2;
                                }
                                if (getLocationNameFromId(organizationLocations, props.currentDevice.currentLocationId) !== fieldCurrentLocation) {
                                    commandNumber += 1;
                                }

                                const homeLocationId = getLocationIdFromName(organizationLocations, fieldHomeLocation);
                                const currentLocationId = getLocationIdFromName(organizationLocations, fieldCurrentLocation); 
                                updateDeviceInformation(props.userId, props.currentDevice.id, fieldDeviceName, fieldLocalId, homeLocationId, currentLocationId, fieldDeviceNotes, commandNumber)
                                .then((status) => {
                                    if (status && status[0] && status[0]["device_updated"]) { 
                                        if (status[0]["device_updated"] !== 0) {
                                            props.setDeviceDidModify(2);
                                        }
                                        else { 
                                            props.setDeviceDidModify(status[0]["device_updated"]);
                                        }
                                    }
                                    else {
                                        console.log(status);
                                        props.setDeviceDidModify(-99);
                                    }
                                    props.setPagenum(7);
                                });
                            }
                            }>
                            Confirm
                        </button>
                    </div>
                </div>
            </Popup>

            
        </div>
    );
}

export default DeviceManagement;

