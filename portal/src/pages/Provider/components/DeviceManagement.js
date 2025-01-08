// FontAwesome Icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Components
import Category from './Category';

// Classes
import { Device } from '../classes/Device';

// Other imports
import React from 'react';
import { useState, useEffect } from 'react';
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

// CSS
import "./../column.scss";

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
	const fullAddr = "https://illuminated.cs.mtu.edu/ark/";
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


const DeviceManagement = (props) => {
    const [displayBoxClass, setDisplayBoxClass] = useState("display-box");
    const [confirmDeviceManagement, setConfirmDeviceManagement] = useState(false);
    const [editDevice, setEditDevice] = useState(false);
    const [organizationLocations, setOrganizationLocations] = useState([]);
    const [organizationLocationsHasBeenSet, setOrganizationLocationsHasBeenSet] = useState(false);
    const [organizationLocationsDoneLoading, setOrganizationLocationsDoneLoading] = useState(false);

    if ((props.currentDevice === null) || (props.currentDevice === undefined)) {
        props.setCurrentDevice(new Device());
    }

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

    // This is really convoluted but without organizationLocationHasBeenSet this code will repeat infinitely IDK why!!! 
    if (!organizationLocationsHasBeenSet) {
        getOrganizationLocations(props.userId)
            .then((response) => { 
                setOrganizationLocations(response);
                setOrganizationLocationsHasBeenSet(true);
                setOrganizationLocationsDoneLoading(false);
            });
    }

    /*
     * The argument passed to useState is the initial state much like setting state in constructor for a class component and isn't used to update the state on re-render
     * If you want to update state on prop change, make use of useEffect hook
     */
        useEffect(() => {
            setDisplayBoxClass("display-box");

            setFieldDeviceName(props.currentDevice.name);
            setFieldLocalId(props.currentDevice.bsid); 
            setFieldDeviceNotes(props.currentDevice.notes); 
    
            // These will need to be changed to a dropdown maybe? definitely cannot stay like this
            // also probably only the organization (not the location) should be able to change these? :thinking:
            // i sure wish someone would tell me the requirements for these pages! 
            setFieldHomeLocation(getLocationNameFromId(organizationLocations, props.currentDevice.homeLocationId));
            setFieldCurrentLocation(getLocationNameFromId(organizationLocations, props.currentDevice.currentLocationId));
            setOrganizationLocationsDoneLoading(true);
        }, [props.currentDevice, organizationLocations]);

    // Dropdown assistance with this absolutely horrendous MaterialUI
    const theme = createTheme({
        components: {
            MuiInputLabel: {
                styleOverrides: {
                    root: {
                        "& +.MuiInputBase-root": {
                            marginTop: 0
                        },
                        "& +.Mui-focused": {
                            backgroundColor: "#8ecae6 !important"
                        },
                    }
                }
            }
        },
        MuiSelect: {
            outlined: {
                '&:focus': {
                    backgroundColor: '#ffffff !important'
                }
            }
        },
	    selectRoot: {
            width: "200px",
            "&:focus": {
                backgroundColor: "#ffffff !important"
		    }
	    },
    });
    
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


    return (
        <div className="display-flex">
            <div className="column-left">
                <div className="header">
                    <div style={{display: "flex"}}>
                        <div className="content">
                            Device
                        </div>

                        {(props.currentDevice !== undefined) && (props.currentDevice !== null) && (props.currentDevice.name !== "") && (
                            <div style={{margin: "auto 0 auto auto", fontFamily: "Poppins"}}>
                                Selected: {props.currentDevice.name}
                            </div>
                        )}
                    </div>
                    <div className="divider" />
                </div>
                <Category name="devices" highlightSelected={props.currentDevice} getItem={(e) => {props.setCurrentDevice(e); setEditDevice(false)}} userId={props.userId} showDetailsButton={true} showDetailsWindow={showDeviceDetails} showDeviceStatus={0} emptyCategorySubtext={"deviceManagement"} />
            </div>

            {(props.currentDevice.id !== "" || editDevice) && (                
                <div className="column-right">

                    <div className="header">
                        <div className="content display-flex">
                            {(editDevice) && (
                                <div>
                                Editing: {(props.currentDevice.id !== "") && (
                                    props.currentDevice.name
                                    )}
                                </div>
                            )}
                            {(!editDevice) && (
                                <div>
                                {(props.currentDevice.id !== "") && (
                                    props.currentDevice.name
                                    )}
                                </div>
                            )}
                            
                            <div style={{marginLeft: "auto"}}> 
                                {props.currentDevice.isOverdue() && (
                                    <div style={{textAlign: "center", color: "red", fontFamily: "Poppins-EB"}}>
                                        <FontAwesomeIcon icon="warning"/> Device Overdue
                                    </div>
                                )}

                                {!props.currentDevice.isOverdue() && (
                                    props.currentDevice.getDeviceManagementStatusLabel()
                                )}
                            </div>
                        </div>
                        <div className="deviceManagementRight"> 
                            <div className="divider"/>
                            
                            <div className="display-flex">
                                <div style={{margin: "auto", width: "50%", paddingRight: "1%"}}>
                                    <div className="attributeTitle">
                                        {"Device Name "}

                                        <Tooltip title={
                                            <React.Fragment>
                                                <div style={{fontFamily: "Poppins-EB", textTransform: "uppercase"}}>
                                                    Device Name
                                                </div>
                                                <div className="login-divider" style={{backgroundColor: "white", height: "0.1em"}}/>
                                                <div>
                                                    <span style={{fontFamily: "Poppins"}}>
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
                                    </div>
                            
                                    <input readOnly={!editDevice} value={fieldDeviceName} onChange={e => {setFieldDeviceName(e.target.value);}} className={displayBoxClass} type="text" style={{width:"100%"}} />
                                </div>

                                <div style={{margin: "auto", width: "50%"}}>
                                    <div className="attributeTitle">
                                        {"Local ID "}

                                        <Tooltip title={
                                            <React.Fragment>
                                                <div style={{fontFamily: "Poppins-EB", textTransform: "uppercase"}}>
                                                    Local ID
                                                </div>
                                                <div className="login-divider" style={{backgroundColor: "white", height: "0.1em"}}/>
                                                <div>
                                                    <span style={{fontFamily: "Poppins"}}>
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
                                    </div>
                                    
                                    <input readOnly={!editDevice} value={fieldLocalId} onChange={e => {setFieldLocalId(e.target.value);}} className={displayBoxClass} type="text" style={{width:"100%"}} />
                                </div>
                            </div>

                            <div className="display-flex">
                                <div style={{margin: "auto", width: "50%", paddingRight: "1%"}}>
                                    <div className="attributeTitle">
                                        Checked Out to Patron
                                    </div>
                                    <div className="display-box">
                                        {(props.currentDevice.status === "Checked Out") && (props.currentDevice.patron_fname + " " + props.currentDevice.patron_lname)}
                                        {(props.currentDevice.status !== "Checked Out") && ("Device Not Checked Out")}
                                    </div>
                                </div>

                                <div style={{margin: "auto", width: "50%", paddingRight: "1%"}}>
                                    <div className="attributeTitle">
                                        Scheduled Return Date
                                    </div>
                                    <div className="display-box">
                                        {(props.currentDevice.status === "Checked Out") && (
                                            props.currentDevice.getDisplayableTime("returnDate")
                                        )}
                                        {(props.currentDevice.status !== "Checked Out") && ("Device Not Checked Out")}
                                    </div>
                                </div>  
                            </div>

                            <div className="divider" style={{marginTop: "1em"}}/>

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

                                <div style={{margin: "auto", width: "50%"}}>
                                    <div className="attributeTitle">
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

                            <div className="display-flex">
                                <div style={{margin: "auto", width: "50%", paddingRight: "1%"}}>
                                <div className="attributeTitle">
                                        {"Home Location "}

                                        <Tooltip title={
                                            <React.Fragment>
                                                <div style={{fontFamily: "Poppins-EB", textTransform: "uppercase"}}>
                                                    Home Location
                                                </div>
                                                <div className="login-divider" style={{backgroundColor: "white", height: "0.1em"}}/>
                                                <div>
                                                    <span style={{fontFamily: "Poppins"}}>
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

                                <div style={{margin: "auto", width: "50%"}}>
                                <div className="attributeTitle">
                                        {"Current Location "}

                                        <Tooltip title={
                                            <React.Fragment>
                                                <div style={{fontFamily: "Poppins-EB", textTransform: "uppercase"}}>
                                                    Current Location
                                                </div>
                                                <div className="login-divider" style={{backgroundColor: "white", height: "0.1em"}}/>
                                                <div>
                                                    <span style={{fontFamily: "Poppins"}}>
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

                            <div className="divider" style={{marginTop: "1em"}}/>

                            <div className="attributeTitle">
                                Notes
                            </div>

                            {(editDevice) && (
                                <input maxLength={"128"} value={fieldDeviceNotes} onChange={e => {setFieldDeviceNotes(e.target.value);}} className={displayBoxClass} type="text" style={{width:"100%"}} />
                            )}

                            {!(editDevice) && (fieldDeviceNotes !== "") && (
                                <div className="display-box"> 
                                    {props.currentDevice.notes}
                                </div>
                            )}

                            {!(editDevice) && (fieldDeviceNotes === "") && (
                                <div className="display-box">
                                    [No notes]
                                </div>
                            )}

                            <div className="attributeTitle">
                                Check Out Log
                            </div>
                            <div className="display-box">
                                {props.currentDevice.log.map((log, i) => {
                                    return <div key={i}>{log}</div>
                                })}
                                {props.currentDevice.log.length === 0 && <div>[No log]</div>}
                            </div>
                        </div>
                    </div>

                    {(!editDevice) && (
                        <button className={"button2"} onClick={() => {setEditDevice(true); setDisplayBoxClass("display-box--editing")}}>
                            <FontAwesomeIcon icon="edit"/> Edit
                        </button>
                    )}

                    {(editDevice) && (
                        <div className="display-flex">
                            <button className={"button2--cancel"} style={{width: "45%", marginRight: "auto"}} onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setEditDevice(false); 
                                setDisplayBoxClass("display-box"); 
                                setFieldDeviceName(props.currentDevice.name); 
                                setFieldLocalId(props.currentDevice.bsid); 
                                setFieldHomeLocation(getLocationNameFromId(organizationLocations, props.currentDevice.homeLocationId)); 
                                setFieldCurrentLocation(getLocationNameFromId(organizationLocations, props.currentDevice.currentLocationId)); 
                                setFieldDeviceNotes(props.currentDevice.notes);
                            }}>
                                Cancel
                            </button>
                            <button className={"button2"} style={{width: "45%"}} onClick={(e) => 
                                {
                                    e.preventDefault(); 
                                    e.stopPropagation(); 
                                    if ((props.currentDevice.name !== fieldDeviceName) || (props.currentDevice.bsid !== fieldLocalId) || ((getLocationNameFromId(organizationLocations, props.currentDevice.homeLocationId) !== fieldHomeLocation)) || ((getLocationNameFromId(organizationLocations, props.currentDevice.currentLocationId) !== fieldCurrentLocation)) || (props.currentDevice.notes !== fieldDeviceNotes)) { 
                                        setConfirmDeviceManagement(true);
                                    }
                                    else {
                                        setEditDevice(false);
                                        setDisplayBoxClass("display-box");
                                    }
                                }}>
                                Confirm
                            </button>
                        </div>
                    )}         
                </div>
            )}

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
                            </div>
                            
                            <div className="display-flex">
                                <div style={{margin: "auto", width: "45%", paddingRight: "1%"}}>
                                    <div className="display-box"> 
                                        {(props.currentDevice !== undefined && props.currentDevice !== null) && (props.currentDevice.name)}
                                    </div>
                                </div>

                                <div style={{margin: "auto", width: "5%", paddingRight: "1%", textAlign: "center", marginTop: "auto"}}>
                                    <FontAwesomeIcon icon="fa-angles-right" className="fa-fade fa-xsm" style={{color: "green"}} />
                                </div>

                                <div style={{margin: "auto", width: "45%", paddingRight: "1%"}}>
                                    <div className="display-box"> 
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
                                    <div className="display-box"> 
                                        {(props.currentDevice !== undefined && props.currentDevice !== null) && (props.currentDevice.bsid)}
                                    </div>
                                </div>

                                <div style={{margin: "auto", width: "5%", paddingRight: "1%", textAlign: "center", marginTop: "auto"}}>
                                    <FontAwesomeIcon icon="fa-angles-right" className="fa-fade fa-xsm" style={{color: "green"}} />
                                </div>

                                <div style={{margin: "auto", width: "45%", paddingRight: "1%"}}>
                                    <div className="display-box">
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
                                    <div className="display-box"> 
                                        {(props.currentDevice !== undefined && props.currentDevice !== null) && (getLocationNameFromId(organizationLocations, props.currentDevice.homeLocationId))}
                                    </div>
                                </div>

                                <div style={{margin: "auto", width: "5%", paddingRight: "1%", textAlign: "center", marginTop: "auto"}}>
                                    <FontAwesomeIcon icon="fa-angles-right" className="fa-fade fa-xsm" style={{color: "green"}} />
                                </div>

                                <div style={{margin: "auto", width: "45%", paddingRight: "1%"}}>
                                    <div className="display-box">
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
                                    <div className="display-box"> 
                                        {(props.currentDevice !== undefined && props.currentDevice !== null) && (getLocationNameFromId(organizationLocations, props.currentDevice.currentLocationId))}
                                    </div>
                                </div>

                                <div style={{margin: "auto", width: "5%", paddingRight: "1%", textAlign: "center", marginTop: "auto"}}>
                                    <FontAwesomeIcon icon="fa-angles-right" className="fa-fade fa-xsm" style={{color: "green"}} />
                                </div>

                                <div style={{margin: "auto", width: "45%", paddingRight: "1%"}}>
                                    <div className="display-box">
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
                                    <div className="display-box"> 
                                        {(props.currentDevice !== undefined && props.currentDevice !== null) && (props.currentDevice.notes !== "") && (props.currentDevice.notes)}
                                        {(props.currentDevice !== undefined && props.currentDevice !== null) && (props.currentDevice.notes === "") && ("[No notes]")}
                                    </div>
                                </div>

                                <div style={{margin: "auto", width: "5%", paddingRight: "1%", textAlign: "center", marginTop: "auto"}}>
                                    <FontAwesomeIcon icon="fa-angles-right" className="fa-fade fa-xsm" style={{color: "green"}} />
                                </div>

                                <div style={{margin: "auto", width: "45%", paddingRight: "1%"}}>
                                    <div className="display-box">
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
                                        props.setDeviceDidModify(status[0]["device_updated"]);
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


/*
    <div style={{margin: "auto", width: "50%"}}>
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
*/

export default DeviceManagement;

