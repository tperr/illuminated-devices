/***** Imports *****/
// React
import React from "react";

// FontAwesome Icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Classes

// Other imports
import Category from "./Category";
import PatronLog from "./PatronLog";
import { Patron } from "../classes/Patron";
import DatePicker from "react-datepicker";
import { getYear, getMonth } from "date-fns";
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

async function updatePatronInformation(userId, patronId, newPatronName, newPatronBsid, newPatronUnixBirthday, newPatronEmail, newPatronPhone, newPatronStreet, newPatronCity, newPatronState, newPatronZip, newPatronNotes, commandNumber) {
    const fullAddr = "https://illuminated.cs.mtu.edu/ark/";
	const authorization = 'Bearer ' + sessionStorage.getItem("BLIGHT");
    let status; 

    // Split name into fname and lname
    let list = newPatronName.split(" ");
    let newPatronLname = list.pop();
    let newPatronFname = list.join(" ");

    // If birthday is January 1st 1970 (by chance) then add "1" so as not to confuse our defaults
    // This is necessary because we use "0" as a default birthday but with Unix timestamp that is actually January 1 1970 0:00:00
    // So by making these January 1st 1970 birthdays "1" we make them January 1 1970 0:00:01 which is enough to not confuse our other logic
    if (newPatronUnixBirthday === 0) {
        newPatronUnixBirthday += 1;
    }
    
    let body = {
        "data": {
            "provider": userId,
            "patron_id": patronId, 
            "fname": newPatronFname,
            "lname": newPatronLname,
            "bsid": newPatronBsid,
            "birthday": newPatronUnixBirthday,
            "email": newPatronEmail,
            "phone": newPatronPhone,
            "street_address": newPatronStreet, 
            "city": newPatronCity,
            "state": newPatronState,
            "zip": newPatronZip,
            "notes": newPatronNotes,
            "command_number": commandNumber
        }
    }

	status = await fetch(fullAddr + "/patron/update" , {
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

async function addNewPatron(userId, newPatronName, newPatronBsid, newPatronUnixBirthday, newPatronEmail, newPatronPhone, newPatronStreet, newPatronCity, newPatronState, newPatronZip, newPatronNotes) {
    const endpoint = "https://illuminated.cs.mtu.edu/ark/patron/add";
	const authorization = 'Bearer ' + sessionStorage.getItem("BLIGHT");
    let status; 

    // Split name into fname and lname
    let list = newPatronName.split(" ");
    let newPatronLname = list.pop();
    let newPatronFname = list.join(" ");
    
    let body = {
        "data": {
            "provider": userId,
            "fname": newPatronFname,
            "lname": newPatronLname,
            "bsid": newPatronBsid,
            "birthday": newPatronUnixBirthday,
            "email": newPatronEmail,
            "phone": newPatronPhone,
            "street_address": newPatronStreet, 
            "city": newPatronCity,
            "state": newPatronState,
            "zip": newPatronZip, 
            "notes": newPatronNotes
        }
    }

    console.log(body);

	status = await fetch(endpoint, {
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
			console.log("invalid_token error code found in ProfileManagement -> addNewPatron -> Ark request -> then -> then(data)");
		}
		else if (received_response["error"]) {
            console.log("error code found in ProfileManagement -> addNewPatron -> Ark request -> then -> then(data)");
            console.log(received_response["error"]);
        }
        else {
            return received_response;
		}
        throw data;
	})
	.catch(error => {
		console.error("error code found in receive account details (ProfileManagement -> addNewPatron -> Ark request -> (catch) received_response[\"error\"] ", error);
	})

	return status; 
}

function getDisplayableDate(date) {
    function getMonthName(monthNumber) {
        const date = new Date();
        date.setMonth(monthNumber);
        return date.toLocaleString('en-US', { month: 'long' });
    }

    let newDate = new Date(date * 1000);
    const toString = getMonthName(newDate.getMonth()) + " " + newDate.getDate() + " " + newDate.getFullYear();
    return toString;
}

function formatPhoneNumber(number) {
    if (!number) {
        return number;
    }

    // only allows 0-9 inputs
    const currentValue = number.replace(/[^\d]/g, '');
    const cvLength = currentValue.length; 

    // returns: "x", "xx", "xxx"
    if (cvLength < 4) {
        return currentValue; 
    }

    // returns: "(xxx)", "(xxx) x", "(xxx) xx", "(xxx) xxx",
    if (cvLength < 7) {
        return `(${currentValue.slice(0, 3)}) ${currentValue.slice(3)}`;
    }

    // returns: "(xxx) xxx-", (xxx) xxx-x", "(xxx) xxx-xx", "(xxx) xxx-xxx", "(xxx) xxx-xxxx"
    return `(${currentValue.slice(0, 3)}) ${currentValue.slice(3, 6)}-${currentValue.slice(6, 10)}`; 

}

function validatePhoneNumber(number) {
    if (!number) {
        return number;
    }

    // only allows 0-9 inputs
    return number.replace(/[^\d]/g, '');
}

/***** Main Export *****/
const PatronManagement = (props) => {
    /***** Variables *****/
    const [addingNewPatron, setAddingNewPatron] = React.useState(props.addingNewPatron);
    const [confirmAddingNewPatron, setConfirmAddingNewPatron] = React.useState(false);

    /* For field editing
     * see DeviceManagement.js it works the same way
     */
    const displayBox = "display-box2";
    const [fieldStyles, setFieldStyles] = React.useState([displayBox, displayBox, displayBox, displayBox, displayBox, displayBox, displayBox, displayBox, displayBox, displayBox])
    const [fieldStylesChange, setFieldStylesChange] = React.useState(-1);

    const [confirmPatronManagement, setConfirmPatronManagement] = React.useState(false);
    const [editPatron, setEditPatron] = React.useState(false);
    const [fieldPatronName, setFieldPatronName] = React.useState("");
    const [fieldPatronUnixBirthday, setFieldPatronUnixBirthday] = React.useState(1);
    const [fieldPatronEmail, setFieldPatronEmail] = React.useState("");
    const [fieldPatronPhone, setFieldPatronPhone] = React.useState("");
    const [fieldPatronStreet, setFieldPatronStreet] = React.useState("");
    const [fieldPatronCity, setFieldPatronCity] = React.useState("");
    const [fieldPatronState, setFieldPatronState] = React.useState("");
    const [fieldPatronZip, setFieldPatronZip] = React.useState("");
    const [fieldPatronNotes, setFieldPatronNotes] = React.useState("");
    const [fieldLocalId, setFieldLocalId] = React.useState("");

    const [showPatronLog, setShowPatronLog] = React.useState(false);

    /* For calendar
     *
     */
    const range = (start, end) => {
        return new Array(end - start).fill().map((d, i) => i + start);
      };
    const years = range(1900, getYear(new Date()));
    const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
    ];
    const datePickerRef = React.useRef();

    /***** Helper Functions *****/
    // Allows calendar to be tabbed past
    // Without this (AKA just using default datePicker) it's impossible to use the forms without a mouse
    // There's some weird bug with the package where they actually broke this functionality like 2 years ago and never fixed it
    const handleOnKeyDown = event => {
        if (datePickerRef?.current && !datePickerRef.current.state.open) {
            if (event?.keyCode === 13 || event?.which === 13) {
                event.preventDefault();
                datePickerRef.current?.setOpen(true);
            }
        }
    };

    if ((props.currentPatron === null) || (props.currentPatron === undefined)) {
        props.setCurrentPatron(new Patron());
    }

    const validateZip = () => {
        const zipRegex = /^\d{5}(?:[-\s]\d{4})?$/;
        return zipRegex.test(fieldPatronZip); 
    };

    const validateEmail = () => {
        const emailRegex = /@/;
        return (fieldPatronEmail.match(emailRegex).length > 0); 
    };

    /***** UseEffects *****/
    /* This was merged with below by adding props.currentPatron to its dependency
    Keep an eye on it and if it seems fine then this can be removed 
    React.useEffect(() => {
        setFieldStylesChange(-1);
        setFieldPatronName(props.currentPatron.identifier);
        setFieldPatronUnixBirthday(props.currentPatron.birthday);
        setFieldPatronEmail(props.currentPatron.email);
        setFieldPatronPhone(props.currentPatron.phone);
        setFieldPatronStreet(props.currentPatron.streetAddress);
        setFieldPatronCity(props.currentPatron.city);
        setFieldPatronState(props.currentPatron.state);
        setFieldPatronZip(props.currentPatron.zip);
        setFieldPatronNotes(props.currentPatron.notes);
        setFieldLocalId(props.currentPatron.bsid); 
    }, [props.currentPatron]);
    */

    React.useEffect(() => {
        if((props.currentPatron === undefined) || (props.currentPatron === null) || addingNewPatron) {
            setFieldPatronName("");
            setFieldPatronUnixBirthday(1);
            setFieldPatronEmail("");
            setFieldPatronPhone("");
            setFieldPatronStreet("");
            setFieldPatronCity("");
            setFieldPatronState("MI");
            setFieldPatronZip("");
            setFieldPatronNotes("");
            setFieldLocalId("");
            setFieldStylesChange(0);
        }
        else {
            setFieldPatronName(props.currentPatron.identifier);
            setFieldPatronUnixBirthday(props.currentPatron.birthday);
            setFieldPatronEmail(props.currentPatron.email);
            setFieldPatronPhone(props.currentPatron.phone);
            setFieldPatronStreet(props.currentPatron.streetAddress);
            setFieldPatronCity(props.currentPatron.city);
            setFieldPatronState(props.currentPatron.state);
            setFieldPatronZip(props.currentPatron.zip);
            setFieldPatronNotes(props.currentPatron.notes);
            setFieldLocalId(props.currentPatron.bsid); 
            setFieldStylesChange(-1);
        }
    }, [addingNewPatron, props.currentPatron]);

    /* Write a note for this
     *
     */
    React.useEffect(() => {
        let x = fieldStylesChange; 
        let displayBoxEditing = displayBox + "--editing";
        let newStyles = [displayBoxEditing, displayBoxEditing, displayBoxEditing, displayBoxEditing, displayBoxEditing, displayBoxEditing, displayBoxEditing, displayBoxEditing, displayBoxEditing, displayBoxEditing];
        if ((x - 256) >= 0) {
            newStyles[0] = displayBox + "--error";
            x -= 256;
        }
        if ((x - 128) >= 0) {
            newStyles[1] = displayBox + "--error";
            x -= 128;
        }
        if ((x - 64) >= 0) {
            newStyles[2] = displayBox + "--error";
            x -= 64;
        }
        if ((x - 32) >= 0) {
            newStyles[3] = displayBox + "--error";
            x -= 32;
        }
        if ((x - 16) >= 0) {
            newStyles[4] = displayBox + "--error";
            x -= 16;
        }
        if ((x - 8) >= 0) {
            newStyles[5] = displayBox + "--error";
            x -= 8;
        }
        if ((x - 4) >= 0) {
            newStyles[6] = displayBox + "--error";
            x -= 4;
        }
        if ((x - 2) >= 0) {
            newStyles[7] = displayBox + "--error";
            x -= 2;
        }
        if ((x - 1) >= 0) {
            newStyles[8] = displayBox + "--error";
            x -= 1;
        }
        // fieldStyles[9] is Notes but its not required 

        if (x >= 0) {
            setFieldStyles(newStyles);
        }
        else {
            setFieldStyles([displayBox, displayBox, displayBox, displayBox, displayBox, displayBox, displayBox, displayBox, displayBox, displayBox]);
        }
    }, [fieldStylesChange]);

    // Dropdown assistance with this absolutely horrendous MaterialUI
    let stateArrayListing = [{"name":"Alabama","abbreviation":"AL"},{"name":"Alaska","abbreviation":"AK"},{"name":"Arizona","abbreviation":"AZ"},{"name":"Arkansas","abbreviation":"AR"},{"name":"California","abbreviation":"CA"},{"name":"Colorado","abbreviation":"CO"},{"name":"Connecticut","abbreviation":"CT"},{"name":"Washington D.C.", "abbreviation":"DC"},{"name":"Delaware","abbreviation":"DE"},{"name":"Florida","abbreviation":"FL"},{"name":"Georgia","abbreviation":"GA"},{"name":"Hawaii","abbreviation":"HI"},{"name":"Idaho","abbreviation":"ID"},{"name":"Illinois","abbreviation":"IL"},{"name":"Indiana","abbreviation":"IN"},{"name":"Iowa","abbreviation":"IA"},{"name":"Kansas","abbreviation":"KS"},{"name":"Kentucky","abbreviation":"KY"},{"name":"Louisiana","abbreviation":"LA"},{"name":"Maine","abbreviation":"ME"},{"name":"Maryland","abbreviation":"MD"},{"name":"Massachusetts","abbreviation":"MA"},{"name":"Michigan","abbreviation":"MI"},{"name":"Minnesota","abbreviation":"MN"},{"name":"Mississippi","abbreviation":"MS"},{"name":"Missouri","abbreviation":"MO"},{"name":"Montana","abbreviation":"MT"},{"name":"Nebraska","abbreviation":"NE"},{"name":"Nevada","abbreviation":"NV"},{"name":"New Hampshire","abbreviation":"NH"},{"name":"New Jersey","abbreviation":"NJ"},{"name":"New Mexico","abbreviation":"NM"},{"name":"New York","abbreviation":"NY"},{"name":"North Carolina","abbreviation":"NC"},{"name":"North Dakota","abbreviation":"ND"},{"name":"Ohio","abbreviation":"OH"},{"name":"Oklahoma","abbreviation":"OK"},{"name":"Oregon","abbreviation":"OR"},{"name":"Pennsylvania","abbreviation":"PA"},{"name":"Rhode Island","abbreviation":"RI"},{"name":"South Carolina","abbreviation":"SC"},{"name":"South Dakota","abbreviation":"SD"},{"name":"Tennessee","abbreviation":"TN"},{"name":"Texas","abbreviation":"TX"},{"name":"Utah","abbreviation":"UT"},{"name":"Vermont","abbreviation":"VT"},{"name":"Virginia","abbreviation":"VA"},{"name":"Washington","abbreviation":"WA"},{"name":"West Virginia","abbreviation":"WV"},{"name":"Wisconsin","abbreviation":"WI"},{"name":"Wyoming","abbreviation":"WY"}];
    const theme = createTheme({
        components: {
            MuiInputLabel: {
                styleOverrides: {
                    root: {
                        "& +.MuiInputBase-root": {
                            marginTop: 0,
                            padding: "0.25em 0 0.25em 0.35em",
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
                },
            },
            select: {
                
            },
        },
        selectRoot: {
            width: "200px",
            "&:focus": {
                backgroundColor: "#ffffff !important"
            }
        },
    });

    /***** Returned Page *****/
    return (
        <div style={{height: "100%"}}>
            {/* Showing Patron Log*/}
            {showPatronLog && (
                <PatronLog 
                    userId={props.userId}
                    currentPatron={props.currentPatron}
                    setCurrentPatron={props.setCurrentPatron}
                    setShowPatronLog={setShowPatronLog}
                />
            )}

            {!showPatronLog &&
            <div className={"column-wrapper"}>
                <div className={"column-left2" + props.columnStylingModifier}>
                    <div className="header">
                        <div className="content">
                            Patron
                        </div>

                        {(props.currentPatron !== undefined) && (props.currentPatron !== null) && (props.currentPatron.fname !== "") && (
                            <div className="selected-item-display">
                                <b>Selected:</b> {props.currentPatron.identifier}
                            </div>
                        )}

                        {((props.currentPatron === undefined) || (props.currentPatron === null) || (props.currentPatron.fname === "")) && (
                            <div className="selected-item-display">
                                <b>Selected:</b> [No Patron Selected]
                            </div>
                        )}

                        <div className="divider" />
                    </div>
                        
                    <Category 
                        name="patrons"
                        getItem={(e) => {
                            props.setCurrentPatron(e); 
                            setAddingNewPatron(false); 
                            setEditPatron(false);
                        }} 
                        userId={props.userId} 
                        addItem={() => {
                            setEditPatron(false); 
                            setAddingNewPatron(true);
                        }} 
                        showDetailsButton={true}
                        fakeDetailsButton={true}
                        showDetailsWindow={false} 
                        highlightSelected={addingNewPatron || props.currentPatron} 
                        emptyCategorySubtext={"patronManagement"} 
                    />
                </div> 

                {((props.currentPatron.id !== "") || (addingNewPatron)) && (
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

                                        {(addingNewPatron) && (
                                            "Add New Patron"
                                        )}

                                        {(editPatron && !addingNewPatron) && (
                                            "Editing: "
                                        )}

                                        {(editPatron && !addingNewPatron && props.currentPatron.id !== "") && (
                                            props.currentPatron.identifier
                                        )}

                                        {(!editPatron && !addingNewPatron && props.currentPatron.id !== "") && (
                                            props.currentPatron.identifier
                                        )}

                                    </div>
                                </div>
                            </div>


                            <div className={"selected-item-display"}>
                                {/* <FontAwesomeIcon icon="warning"/> Placeholder Text */}
                            </div>

                            <div className="divider"/>
                        </div>

                        {/* Right Column Content */}
                        <div style={{
                            display: "grid", 
                            gridTemplateRows: "0.1fr auto 0.1fr", 
                            gridColumn: "1 / span 2", 
                            gridRow: "2"}}>

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
                                className={"deviceManagementRight"}
                                style={{
                                    gridRow: "2",
                                    gridTemplateRows: "auto auto auto auto auto 1fr auto",
                                    gridTemplateColumns: "0.01fr 1fr 0.01fr",
                                    marginTop: "0.35em",
                                }}
                            >  

                                <div className={"r1"} style={{gridColumn: "2"}}>
                                    <div className={"c1"} style={{gridColumn: "1"}}>
                                        <div className={"attributeTitle2"} style={{gridRow: "1", gridColumn: "1",}}>
                                            <Tooltip title={
                                                <React.Fragment>
                                                    <div style={{fontFamily: "Poppins-EB", textTransform: "uppercase"}}>
                                                        Patron Name
                                                    </div>
                                                    <div className={"login-divider"} style={{backgroundColor: "white", height: "0.1em"}}/>
                                                    <div>
                                                        <span style={{fontFamily: "Poppins-SB"}}>
                                                            This is the preferred name of the Patron and it is how Patrons are displayed in the Patron List. <br/>
                                                        </span>
                                                    </div>
                                                </React.Fragment>
                                            }>
                                                <span style={{cursor: "pointer"}}> 
                                                    <FontAwesomeIcon icon="circle-info" />
                                                </span>
                                            </Tooltip>

                                            {(addingNewPatron || editPatron) && (" *Name")}
                                            {!(addingNewPatron || editPatron) && (" Name")}
                                        </div>

                                        <div className={"attributeTitle2"} style={{gridRow: "1", gridColumn: "3", textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", color: "red"}}> 
                                            {((addingNewPatron || editPatron) && (fieldPatronName.length > 110)) && (
                                                (128 - fieldPatronName.length) + " characters remaining")
                                            }
                                        </div>

                                        <input maxLength={"128"} readOnly={!(editPatron || addingNewPatron)} value={fieldPatronName} onChange={(e) => {setFieldPatronName(e.target.value);}} className={fieldStyles[0]} type="text" style={{width:"100%", gridRow: "2", gridColumn: "1 / span 3"}} />
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
                                                            This is the ID for the Patron. This can be used to quickly search for a Patron. <br/>
                                                        </span>
                                                        <span style={{fontFamily: "Poppins-EB"}}>
                                                            This ID must be unique among all Patrons for an organization.
                                                        </span>
                                                    </div>
                                                </React.Fragment>
                                            }>
                                                <span style={{cursor: "pointer"}}> 
                                                    <FontAwesomeIcon icon="circle-info" />
                                                </span>
                                            </Tooltip>

                                            {(addingNewPatron || editPatron) && (" *Local ID")}
                                            {!(addingNewPatron || editPatron) && (" Local ID")}
                                        </div>

                                        <div className={"attributeTitle2"} style={{gridRow: "1", gridColumn: "3", textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", color: "red"}}> 
                                            {((addingNewPatron || editPatron) && (fieldLocalId.length > 44)) && (
                                                (64 - fieldLocalId.length) + " characters remaining")
                                            }
                                        </div>

                                        <input maxLength={"64"} readOnly={!(editPatron || addingNewPatron)} value={fieldLocalId} onChange={(e) => {setFieldLocalId(e.target.value);}} className={fieldStyles[8]} type="text" style={{width:"100%", gridRow: "2", gridColumn: "1 / span 3"}} />
                                    </div>
                                </div>

                                <div className={"r2"} style={{gridColumn: "2"}}>
                                    <div className={"c1"} style={{gridColumn: "1"}}>
                                        <div className={"attributeTitle2"} style={{gridRow: "1", gridColumn: "1",}}>
                                            <Tooltip title={
                                                <React.Fragment>
                                                    <div style={{fontFamily: "Poppins-EB", textTransform: "uppercase"}}>
                                                        PLACEHOLDER
                                                    </div>
                                                    <div className={"login-divider"} style={{backgroundColor: "white", height: "0.1em"}}/>
                                                    <div>
                                                        <span style={{fontFamily: "Poppins-SB"}}>
                                                           LOREM IPSUM DOLOR SIT AMET
                                                        </span>
                                                        <br />
                                                        <span style={{fontFamily: "Poppins-EB"}}>                                                
                                                            This email must be unique among all Patrons for an organization.
                                                        </span>
                                                    </div>
                                                </React.Fragment>
                                            }>
                                                <span style={{cursor: "pointer"}}> 
                                                    <FontAwesomeIcon icon="circle-info" />
                                                </span>
                                            </Tooltip>

                                            {(addingNewPatron || editPatron) && (" *Email")}
                                            {!(addingNewPatron || editPatron) && (" Email")}
                                        </div>

                                        <div className={"attributeTitle2"} style={{gridRow: "1", gridColumn: "3", textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", color: "red"}}> 
                                            {((addingNewPatron || editPatron) && (fieldPatronEmail.length > 234)) && (
                                                (255 - fieldPatronEmail.length) + " characters remaining")
                                            }
                                        </div>

                                        <input maxLength={"255"} readOnly={!(editPatron || addingNewPatron)} value={fieldPatronEmail} onChange={(e) => {setFieldPatronEmail(e.target.value);}} className={fieldStyles[2]} type="text" style={{width:"100%", gridRow: "2", gridColumn: "1 / span 3"}} />
                                    </div>

                                    <div className={"c2"} style={{gridColumn: "3"}}>
                                        <div className={"attributeTitle2"} style={{gridRow: "1", gridColumn: "1",}}>
                                            <Tooltip title={
                                                <React.Fragment>
                                                    <div style={{fontFamily: "Poppins-EB", textTransform: "uppercase"}}>
                                                        Phone
                                                    </div>
                                                    <div className={"login-divider"} style={{backgroundColor: "white", height: "0.1em"}}/>
                                                    <div>
                                                        <span style={{fontFamily: "Poppins-SB"}}>
                                                            This field will automatically format numbers for you (e.g., "5551112222" will become "(555) 111-2222") <br />
                                                            Omit the country code when entering a phone number (i.e., do not enter the "+1" used for United States phone numbers). 
                                                        </span>
                                                        <br />
                                                        <span style={{fontFamily: "Poppins-EB"}}>                                                
                                                            This Phone number must be unique among all Patrons for an organization.
                                                        </span>
                                                    </div>
                                                </React.Fragment>
                                            }>
                                                <span style={{cursor: "pointer"}}> 
                                                    <FontAwesomeIcon icon="circle-info" />
                                                </span>
                                            </Tooltip>

                                            {(addingNewPatron || editPatron) && (" *Phone")}
                                            {!(addingNewPatron || editPatron) && (" Phone")}
                                        </div>

                                        <input maxLength={"14"} readOnly={!(editPatron || addingNewPatron)} value={formatPhoneNumber(fieldPatronPhone)} onChange={(e) => {setFieldPatronPhone(e.target.value);}} className={fieldStyles[3]} type="text" style={{width:"100%", gridRow: "2", gridColumn: "1 / span 3"}} />
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
                                        <div className={"attributeTitle2"} style={{gridRow: "1", gridColumn: "1",}}>
                                            <Tooltip title={
                                                <React.Fragment>
                                                    <div style={{fontFamily: "Poppins-EB", textTransform: "uppercase"}}>
                                                        PLACEHOLDER
                                                    </div>
                                                    <div className={"login-divider"} style={{backgroundColor: "white", height: "0.1em"}}/>
                                                    <div>
                                                        <span style={{fontFamily: "Poppins-SB"}}>
                                                           LOREM IPSUM DOLOR SIT AMET
                                                        </span>
                                                    </div>
                                                </React.Fragment>
                                            }>
                                                <span style={{cursor: "pointer"}}> 
                                                    <FontAwesomeIcon icon="circle-info" />
                                                </span>
                                            </Tooltip>

                                            {(addingNewPatron || editPatron) && (" *Birthday")}
                                            {!(addingNewPatron || editPatron) && (" Birthday")}
                                        </div>

                                        {(!addingNewPatron) && (!editPatron) && (
                                            <div className={"display-box2"}>
                                                {(props.currentPatron.birthday !== "") && (getDisplayableDate(fieldPatronUnixBirthday))}
                                                {(props.currentPatron.birthday === "") && (<div>[No birthday]</div>)}
                                            </div>
                                        )}

                                        {(addingNewPatron || editPatron) && (
                                            <span style={{width: "100%"}}>
                                                <DatePicker 
                                                    renderCustomHeader={({
                                                        date,
                                                        changeYear,
                                                        changeMonth,
                                                        decreaseMonth,
                                                        increaseMonth,
                                                        prevMonthButtonDisabled,
                                                        nextMonthButtonDisabled
                                                    }) => (
                                                        <div style={{margin: 10, display: "flex", justifyContent: "center"}}>
                                                            <button onClick={decreaseMonth} disabled={prevMonthButtonDisabled} className="selectArrowStyle">
                                                                {<FontAwesomeIcon icon="arrow-left"/>}
                                                            </button>
                                                                
                                                            <select value={getYear(date)} onChange={({ target: { value } }) => changeYear(value)} className="selectDropdownStyle">
                                                                {years.map(option => (
                                                                    <option key={option} value={option}>
                                                                        {option}
                                                                    </option>
                                                                ))}
                                                            </select>

                                                            <select value={months[getMonth(date)]} onChange={({target: {value}}) => changeMonth(months.indexOf(value))} className="selectDropdownStyle">
                                                                {months.map(option => (
                                                                    <option key={option} value={option}>
                                                                        {option}
                                                                    </option>
                                                                ))}
                                                            </select>

                                                            <button onClick={increaseMonth} disabled={nextMonthButtonDisabled} className="selectArrowStyle">
                                                                {<FontAwesomeIcon icon="arrow-right"/>}
                                                            </button>
                                                        </div> 
                                                        )
                                                    }
                                                    dateFormat="MM-dd-yyyy"
                                                    selected={(fieldPatronUnixBirthday * 1000)}  
                                                    onChange={(birth) => {console.log(birth); setFieldPatronUnixBirthday((birth ? birth.valueOf() : 0) / 1000)}}
                                                    className={fieldStyles[1] + "--patronManagementWide"}
                                                    calendarClassName={"react-datepicker2"}
                                                    placeholder={"MM-dd-yyyy"}
                                                    preventOpenOnFocus={true}
                                                    ref={datePickerRef}
                                                    onKeyDown={handleOnKeyDown}
                                                />
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Row 4 (Row 6, 7 styling) */}
                                {/* Street Address (Row 6 styling) */}
                                <div 
                                    className={"r6"}
                                    style={{
                                        gridRow: "4",
                                        gridColumn: "2",
                                    }}
                                >
                                    <div className={"c1"} style={{gridColumn: "1 / span 3", display: "grid", gridTemplateRows: "1fr 1fr", gridTemplateColumns: "1fr 0.05fr 1fr", whiteSpace: "nowrap",}}>
                                        <div className={"attributeTitle2"} style={{gridRow: "1", gridColumn: "1",}}>
                                            <Tooltip title={
                                                <React.Fragment>
                                                    <div style={{fontFamily: "Poppins-EB", textTransform: "uppercase"}}>
                                                        PLACEHOLDER
                                                    </div>
                                                    <div className={"login-divider"} style={{backgroundColor: "white", height: "0.1em"}}/>
                                                    <div>
                                                        <span style={{fontFamily: "Poppins-SB"}}>
                                                           LOREM IPSUM DOLOR SIT AMET
                                                        </span>
                                                    </div>
                                                </React.Fragment>
                                            }>
                                                <span style={{cursor: "pointer"}}> 
                                                    <FontAwesomeIcon icon="circle-info" />
                                                </span>
                                            </Tooltip>

                                            {(addingNewPatron || editPatron) && (" *Street Address")}
                                            {!(addingNewPatron || editPatron) && (" Street Address")}
                                        </div>

                                        <div className={"attributeTitle2"} style={{gridRow: "1", gridColumn: "3", textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", color: "red"}}> 
                                            {((addingNewPatron || editPatron) && (fieldPatronStreet.length > 44)) && (
                                                (64 - fieldPatronStreet.length) + " characters remaining")
                                            }
                                        </div>

                                        <input maxLength={"64"} readOnly={!(editPatron || addingNewPatron)} value={fieldPatronStreet} onChange={(e) => {setFieldPatronStreet(e.target.value);}} className={fieldStyles[4]} type="text" style={{width:"100%", gridRow: "2", gridColumn: "1 / span 3"}} />
                                    </div>
                                </div>

                                {/* City, State, Zip (Row 7 styling) */}
                                <div 
                                    className={"r7"}
                                    style={{
                                        gridRow: "5",
                                        gridColumn: "2",
                                        gridTemplateColumns: "1fr 0.05fr 0.4fr 0.05fr 0.6fr"
                                    }}
                                >
                                    <div className={"c1"} style={{display: "grid", gridTemplateRows: "1fr 1fr", gridTemplateColumns: "1fr 0.05fr 1fr", whiteSpace: "nowrap",}}>
                                        <div className={"attributeTitle2"} style={{gridRow: "1", gridColumn: "1",}}>
                                            <Tooltip title={
                                                <React.Fragment>
                                                    <div style={{fontFamily: "Poppins-EB", textTransform: "uppercase"}}>
                                                        PLACEHOLDER
                                                    </div>
                                                    <div className={"login-divider"} style={{backgroundColor: "white", height: "0.1em"}}/>
                                                    <div>
                                                        <span style={{fontFamily: "Poppins-SB"}}>
                                                            LOREM IPSUM DOLOR SIT AMET
                                                        </span>
                                                    </div>
                                                </React.Fragment>
                                            }>
                                                <span style={{cursor: "pointer"}}> 
                                                    <FontAwesomeIcon icon="circle-info" />
                                                </span>
                                            </Tooltip>

                                            {(addingNewPatron || editPatron) && (" *City")}
                                            {!(addingNewPatron || editPatron) && (" City")}
                                        </div>

                                        <div className={"attributeTitle2"} style={{gridRow: "1", gridColumn: "3", textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", color: "red"}}> 
                                            {((addingNewPatron || editPatron) && (fieldPatronCity.length > 16)) && (
                                                (32 - fieldPatronCity.length) + " characters remaining")
                                            }
                                        </div>

                                        <input maxLength={"32"} readOnly={!(editPatron || addingNewPatron)} value={fieldPatronCity} onChange={(e) => {setFieldPatronCity(e.target.value);}} className={fieldStyles[5]} type="text" style={{width:"100%", gridRow: "2", gridColumn: "1 / span 3"}} />
                                    </div>

                                    <div className={"c2"}>
                                        <div className={"attributeTitle2"}>
                                            <Tooltip title={
                                                <React.Fragment>
                                                    <div style={{fontFamily: "Poppins-EB", textTransform: "uppercase"}}>
                                                        PLACEHOLDER
                                                    </div>
                                                    <div className={"login-divider"} style={{backgroundColor: "white", height: "0.1em"}}/>
                                                    <div>
                                                        <span style={{fontFamily: "Poppins-SB"}}>
                                                            LOREM IPSUM DOLOR SIT AMET
                                                        </span>
                                                    </div>
                                                </React.Fragment>
                                            }>
                                                <span style={{cursor: "pointer"}}> 
                                                    <FontAwesomeIcon icon="circle-info" />
                                                </span>
                                            </Tooltip>

                                            {(addingNewPatron || editPatron) && (" *State")}
                                            {!(addingNewPatron || editPatron) && (" State")}
                                        </div>

                                        {(!(editPatron || addingNewPatron)) && (
                                            <div className={fieldStyles[6]}>
                                                {fieldPatronState}
                                            </div>
                                        )}

                                        {(editPatron || addingNewPatron) && (
                                            <ThemeProvider theme={theme}>
                                                <Box>
                                                    <FormControl fullWidth>
                                                        <InputLabel id="state-dropdown" shrink={false}> 
                                                        </InputLabel>
                                                            <Select
                                                                labelId="state-dropdown"
                                                                id="state-dropdown"
                                                                value={fieldPatronState}
                                                                displayEmpty
                                                                label=""
                                                                className={fieldStyles[6] + "--patronManagementWide"}
                                                                onChange={e => {
                                                                    console.log(e);
                                                                    if ((e.target.value !== undefined) && (e.target.value !== null)) {
                                                                        console.log("value: ", e.target.value);
                                                                        setFieldPatronState(e.target.value);
                                                                    }
                                                                    else {
                                                                        fieldPatronState("??");
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
                                                                {(
                                                                    stateArrayListing.map((state) => {
                                                                        return (
                                                                            <MenuItem key={state.name} value={state.abbreviation}>
                                                                                {state.abbreviation}
                                                                            </MenuItem>
                                                                        );
                                                                    })
                                                                )}
                                                            </Select>
                                                    </FormControl>
                                                </Box>
                                            </ThemeProvider>
                                        )}
                                    </div>

                                    <div className={"c3"}>
                                        <div className={"attributeTitle2"}>
                                            <Tooltip title={
                                                <React.Fragment>
                                                    <div style={{fontFamily: "Poppins-EB", textTransform: "uppercase"}}>
                                                        Zip
                                                    </div>
                                                    <div className={"login-divider"} style={{backgroundColor: "white", height: "0.1em"}}/>
                                                    <div>
                                                        <span style={{fontFamily: "Poppins-SB"}}>
                                                            This is the 5-digit (Zip) or 9-digit (Zip+4) code for the Patron's address.<br/>
                                                            <span style={{fontFamily: "Poppins-EB"}}>
                                                                {"Example Zip: "}
                                                            </span>
                                                            10118 <br/>
                                                            <span style={{fontFamily: "Poppins-EB"}}>
                                                                {"Example Zip+4: "}
                                                            </span>
                                                            10118-9998
                                                        </span>
                                                    </div>
                                                </React.Fragment>
                                            }>
                                                <span style={{cursor: "pointer"}}> 
                                                    <FontAwesomeIcon icon="circle-info" />
                                                </span>
                                            </Tooltip>

                                            {(addingNewPatron || editPatron) && (" *Zip")}
                                            {!(addingNewPatron || editPatron) && (" Zip")}
                                        </div>

                                        <input maxLength={"10"} readOnly={!(editPatron || addingNewPatron)} value={fieldPatronZip} onChange={(e) => {setFieldPatronZip(e.target.value);}} className={fieldStyles[7] + "--patronManagementWide"} type="text" style={{width:"100%"}} />
                                    </div>
                                </div>

                                {/* Row 5 (Row 8 styling) */}
                                <div 
                                    className={"r8"}
                                    style={{
                                        gridRow: "6",
                                        gridColumn: "2",
                                    }}
                                >
                                    <div className={"c1"} style={{gridColumn: "1 / span 3", display: "grid", gridTemplateRows: "1fr 1fr 1fr", gridTemplateColumns: "1fr 0.05fr 1fr"}}>
                                        <div className={"attributeTitle2"} style={{gridRow: "1", gridColumn: "1",}}>
                                            <Tooltip title={
                                                <React.Fragment>
                                                    <div style={{fontFamily: "Poppins-EB", textTransform: "uppercase"}}>
                                                        PLACEHOLDER
                                                    </div>
                                                    <div className={"login-divider"} style={{backgroundColor: "white", height: "0.1em"}}/>
                                                    <div>
                                                        <span style={{fontFamily: "Poppins-SB"}}>
                                                           LOREM IPSUM DOLOR SIT AMET
                                                        </span>
                                                    </div>
                                                </React.Fragment>
                                            }>
                                                <span style={{cursor: "pointer"}}> 
                                                    <FontAwesomeIcon icon="circle-info" />
                                                </span>
                                            </Tooltip>

                                            {" Notes"}
                                        </div>

                                        <div className={"attributeTitle2"} style={{gridRow: "1", gridColumn: "3", textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", color: "red"}}> 
                                            {((addingNewPatron || editPatron) && (fieldPatronNotes.length > 108)) && (
                                                (128 - fieldPatronNotes.length) + " characters remaining")
                                            }
                                        </div>

                                        {(editPatron || addingNewPatron) && (
                                            <input maxLength={"128"} value={fieldPatronNotes} onChange={(e) => {setFieldPatronNotes(e.target.value);}} className={fieldStyles[9] + "--patronManagementWide"} type="text" style={{width:"100%", gridRow: "2", gridColumn: "1 / span 3"}} />
                                        )}
                                        {!(editPatron || addingNewPatron) && (fieldPatronNotes !== "") && (
                                            <div className={"display-box2"} style={{gridRow: "2", gridColumn: "1 / span 3"}}> 
                                                {props.currentPatron.notes}
                                            </div>
                                        )}
                                        {!(editPatron || addingNewPatron) && (fieldPatronNotes === "") && (
                                            <div className={"display-box2"} style={{gridRow: "2", gridColumn: "1 / span 3"}}> 
                                                [No notes]
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Row 6 (Row 9 styling) */}
                                <div 
                                    className={"r9"}
                                    style={{
                                        gridRow: "7",
                                        gridColumn: "2",
                                    }}
                                >
                                    <div className={"c1"} style={{gridColumn: "1 / span 3"}}>
                                        {(!editPatron && !addingNewPatron) && (
                                        <div className={"r6"} style={{gridColumn: "2"}}>
                                            <div className={"c1"} style={{
                                                gridColumn: "1 / span 3",
                                                marginBottom: "0.5em",
                                            }}>
                                                <button 
                                                    className={"button2"} 
                                                    onClick={() => {setShowPatronLog(true);}}
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
                                </div>
                            </div>


                        <div style={{
                            display: "grid",
                            gridRow: "3",
                            gridColumn: "1 / 2",
                            gridTemplateColumns: "1fr 0.05fr 1fr",
                        }}
                        >
                            {/* Button */}
                            {!(editPatron || addingNewPatron) && (
                                <button 
                                    className={"button2"}
                                    onClick={() => {setEditPatron(true); setFieldStylesChange(0); }}
                                    style={{
                                        gridRow: "9",
                                        gridColumn: "1 / span 3",
                                        height: "2em",
                                    }}
                                >
                                    <FontAwesomeIcon icon="edit"/> Edit
                                </button>
                            )}


                            {(editPatron || addingNewPatron) && (
                                <div
                                    style={{
                                        display: "grid",
                                        gridRow: "3",
                                        gridColumn: "1 / span 3",
                                        gridTemplateColumns: "1fr 0.05fr 1fr",
                                        margin: "0.5em 0 0 0",
                                    }}
                                >
                                    <button 
                                        className={"button2--cancel"} 
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
                                            setEditPatron(false); 
                                            setAddingNewPatron(false);

                                            setFieldStylesChange(-1);

                                            setFieldPatronName(props.currentPatron.identifier); 
                                            setFieldPatronUnixBirthday(props.currentPatron.birthday); 
                                            setFieldPatronEmail(props.currentPatron.email); 
                                            setFieldPatronPhone(props.currentPatron.phone); 
                                            setFieldPatronStreet(props.currentPatron.streetAddress); 
                                            setFieldPatronCity(props.currentPatron.city); 
                                            setFieldPatronState(props.currentPatron.state); 
                                            setFieldPatronZip(props.currentPatron.zip);
                                            setFieldPatronNotes(props.currentPatron.notes); 
                                            setFieldLocalId(props.currentPatron.bsid); 
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        className={"button2"} 
                                        style={{
                                            gridRow: "1",
                                            gridColumn: "3",
                                            height: "2em",
                                            marginTop: 0,
                                        }} 
                                        onClick={(e) => {
                                            e.preventDefault(); 
                                            e.stopPropagation(); 
                                            if(editPatron) {
                                                if ((props.currentPatron.identifier !== fieldPatronName) || (props.currentPatron.bsid !== fieldLocalId) || (props.currentPatron.birthday !== fieldPatronUnixBirthday) || (props.currentPatron.email !== fieldPatronEmail) || (props.currentPatron.phone !== fieldPatronPhone) || (props.currentPatron.getDisplayableAddress() !== (fieldPatronStreet + ", " + fieldPatronCity + ", " + fieldPatronState + ", " + fieldPatronZip) || (props.currentPatron.notes !== fieldPatronNotes))) {
                                                    setConfirmPatronManagement(true);
                                                    /*
                                                    * Need to put frontend sanity checks here just like in adding patron but one step at a time
                                                    */
                                                } 
                                                else {
                                                    setEditPatron(false); 
                                                    setFieldStylesChange(-1);
                                                } 
                                            }
                                            // Else: adding new patron
                                            else {
                                                let errorNumber = 0;
                                                if (fieldPatronName === "") {
                                                    errorNumber += 256;
                                                }
                                                if ((fieldPatronUnixBirthday === "") || (fieldPatronUnixBirthday === 0)) {
                                                    errorNumber += 128;
                                                }
                                                if (fieldPatronEmail === "" || !validateEmail()) {
                                                    errorNumber += 64;
                                                }
                                                if (fieldPatronPhone === "" || validatePhoneNumber(fieldPatronPhone).length !== 10) {
                                                    errorNumber += 32;
                                                }
                                                if (fieldPatronStreet === "") {
                                                    errorNumber += 16;
                                                }
                                                if (fieldPatronCity === "") {
                                                    errorNumber += 8;
                                                }
                                                if (fieldPatronState === "") {
                                                    errorNumber += 4;
                                                }
                                                if (fieldPatronZip === "" || !validateZip()) {
                                                    errorNumber += 2;
                                                }
                                                // It's ok for notes to be empty so we skip it
                                                if (fieldLocalId === "") {
                                                    errorNumber += 1;
                                                }
                                                if (errorNumber > 0) {
                                                    setFieldStylesChange(errorNumber);
                                                }
                                                else {
                                                    setFieldStylesChange(0);
                                                    setConfirmAddingNewPatron(true);
                                                }
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
                    )}
            </div>
            }
            
            {/* Edit Patron Popup */}
            <Popup contentStyle={{backgroundColor: "transparent", border: "1px transparent solid"}} open={confirmPatronManagement} onOpen={() => {console.log("patron management opened")}} onClose={() => {setConfirmPatronManagement(false); }} position="center">
                <div className="checkout">
                    <div className="title">
                        <FontAwesomeIcon icon="hand"/> Confirm Patron Management
                    </div>
                    
                    <div className="divider"/>

                    {(props.currentPatron.identifier !== fieldPatronName) && (
                        <div>
                            <div className="attribute">
                                Patron Name
                            </div>
                            <div className="display-flex">
                                <div style={{margin: "auto", width: "45%", paddingRight: "1%"}}>
                                    <div className="display-box2"> 
                                        {(props.currentPatron !== undefined && props.currentPatron !== null) && (props.currentPatron.identifier)}
                                    </div>
                                </div>

                                <div style={{margin: "auto", width: "5%", paddingRight: "1%", textAlign: "center", marginTop: "auto"}}>
                                    <FontAwesomeIcon icon="fa-angles-right" className="fa-fade fa-xsm" style={{color: "green"}} />
                                </div>

                                <div style={{margin: "auto", width: "45%", paddingRight: "1%"}}>
                                    <div className="display-box2"> 
                                        {fieldPatronName}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {(props.currentPatron.birthday !== fieldPatronUnixBirthday) && (
                        <div>
                            <div className="attribute">
                                Birthday
                            </div>
                            <div className="display-flex">
                                <div style={{margin: "auto", width: "45%", paddingRight: "1%"}}>
                                    <div className="display-box2"> 
                                        {(props.currentPatron !== undefined && props.currentPatron !== null) && (getDisplayableDate(props.currentPatron.birthday))}
                                    </div>
                                </div>

                                <div style={{margin: "auto", width: "5%", paddingRight: "1%", textAlign: "center", marginTop: "auto"}}>
                                    <FontAwesomeIcon icon="fa-angles-right" className="fa-fade fa-xsm" style={{color: "green"}} />
                                </div>

                                <div style={{margin: "auto", width: "45%", paddingRight: "1%"}}>
                                    <div className="display-box2">
                                        {getDisplayableDate(fieldPatronUnixBirthday)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {(props.currentPatron.email !== fieldPatronEmail) && (
                        <div>
                            <div className="attribute">
                                Email
                            </div>
                            <div className="display-flex">
                                <div style={{margin: "auto", width: "45%", paddingRight: "1%"}}>
                                    <div className="display-box2"> 
                                        {(props.currentPatron !== undefined && props.currentPatron !== null) && (props.currentPatron.email)}
                                    </div>
                                </div>

                                <div style={{margin: "auto", width: "5%", paddingRight: "1%", textAlign: "center", marginTop: "auto"}}>
                                    <FontAwesomeIcon icon="fa-angles-right" className="fa-fade fa-xsm" style={{color: "green"}} />
                                </div>

                                <div style={{margin: "auto", width: "45%", paddingRight: "1%"}}>
                                    <div className="display-box2">
                                        {fieldPatronEmail}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {(props.currentPatron.phone !== fieldPatronPhone) && (
                        <div>
                            <div className="attribute">
                                Phone
                            </div>
                            <div className="display-flex">
                                <div style={{margin: "auto", width: "45%", paddingRight: "1%"}}>
                                    <div className="display-box2"> 
                                        {(props.currentPatron !== undefined && props.currentPatron !== null) && (formatPhoneNumber(props.currentPatron.phone))}
                                    </div>
                                </div>

                                <div style={{margin: "auto", width: "5%", paddingRight: "1%", textAlign: "center", marginTop: "auto"}}>
                                    <FontAwesomeIcon icon="fa-angles-right" className="fa-fade fa-xsm" style={{color: "green"}} />
                                </div>

                                <div style={{margin: "auto", width: "45%", paddingRight: "1%"}}>
                                    <div className="display-box2">
                                        {fieldPatronPhone}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {(props.currentPatron.getDisplayableAddress() !== (fieldPatronStreet + ", " + fieldPatronCity + ", " + fieldPatronState + ", " + fieldPatronZip) ) && (
                        <div>
                            <div className="attribute">
                                Address
                            </div>
                            <div className="display-flex">
                                <div style={{margin: "auto", width: "45%", paddingRight: "1%"}}>
                                    <div className="display-box2"> 
                                        {(props.currentPatron !== undefined && props.currentPatron !== null) && (props.currentPatron.getDisplayableAddress())}
                                    </div>
                                </div>

                                <div style={{margin: "auto", width: "5%", paddingRight: "1%", textAlign: "center", marginTop: "auto"}}>
                                    <FontAwesomeIcon icon="fa-angles-right" className="fa-fade fa-xsm" style={{color: "green"}} />
                                </div>

                                <div style={{margin: "auto", width: "45%", paddingRight: "1%"}}>
                                    <div className="display-box2">
                                        {(fieldPatronStreet + ", " + fieldPatronCity + ", " + fieldPatronState + ", " + fieldPatronZip)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {(props.currentPatron.notes !== fieldPatronNotes) && (
                        <div>
                            <div className="attribute">
                                Notes
                            </div>
                            <div className="display-flex">
                                <div style={{margin: "auto", width: "45%", paddingRight: "1%"}}>
                                    <div className="display-box2"> 
                                        {(props.currentPatron !== undefined && props.currentPatron !== null) && (props.currentPatron.notes !== "") && (props.currentPatron.notes)}
                                        {(props.currentPatron !== undefined && props.currentPatron !== null) && (props.currentPatron.notes === "") && ("[No notes]")}
                                    </div>
                                </div>

                                <div style={{margin: "auto", width: "5%", paddingRight: "1%", textAlign: "center", marginTop: "auto"}}>
                                    <FontAwesomeIcon icon="fa-angles-right" className="fa-fade fa-xsm" style={{color: "green"}} />
                                </div>

                                <div style={{margin: "auto", width: "45%", paddingRight: "1%"}}>
                                    <div className="display-box2">
                                        {(fieldPatronNotes !== "") && fieldPatronNotes}
                                        {(fieldPatronNotes === "") && "[No notes]"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {(props.currentPatron.bsid !== fieldLocalId) && (
                        <div>
                            <div className="attribute">
                                Local ID
                            </div>
                            <div className="display-flex">
                                <div style={{margin: "auto", width: "45%", paddingRight: "1%"}}>
                                    <div className="display-box2"> 
                                        {(props.currentPatron !== undefined && props.currentPatron !== null) && (props.currentPatron.bsid)}
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


                    <div className="divider" style={{marginTop: "1em", marginBottom: "1em"}}/>

                    <div className="display-flex">
                        <button className={"button2--cancel"} onClick={(e) => 
                            {
                                e.preventDefault(); 
                                e.stopPropagation(); 
                                setConfirmPatronManagement(false); 
                            }}> 
                            Cancel
                        </button>
                        
                        <button className={"button2"} 
                            onClick={(e) => {
                                e.preventDefault(); 
                                e.stopPropagation(); 
                                setConfirmPatronManagement(false); 
                                let commandNumber = 0;
                                if (props.currentPatron.identifier !== fieldPatronName) {
                                    commandNumber += 64;
                                }
                                if (props.currentPatron.bsid !== fieldLocalId) {
                                    commandNumber += 32;
                                }
                                if (props.currentPatron.birthday !== fieldPatronUnixBirthday) {
                                    commandNumber += 16;
                                }
                                if (props.currentPatron.email !== fieldPatronEmail) {
                                    commandNumber += 8;
                                }
                                if (props.currentPatron.phone !== fieldPatronPhone) {
                                    commandNumber += 4;
                                }
                                if (props.currentPatron.getDisplayableAddress() !== (fieldPatronStreet + ", " + fieldPatronCity + ", " + fieldPatronState + ", " + fieldPatronZip) ) {
                                    commandNumber += 2;
                                }
                                if (props.currentPatron.notes !== fieldPatronNotes) {
                                    commandNumber += 1;
                                }

                                updatePatronInformation(props.userId, props.currentPatron.id, fieldPatronName, fieldLocalId, fieldPatronUnixBirthday, fieldPatronEmail, validatePhoneNumber(fieldPatronPhone), fieldPatronStreet, fieldPatronCity, fieldPatronState, fieldPatronZip, fieldPatronNotes, commandNumber)
                                .then((status) => {
                                    if (status && status[0] && status[0]["patron_updated"]) { 
                                        if (status[0]["patron_updated"] !== 0) {
                                            props.setPatronDidModify(3);
                                        }
                                        else {
                                            props.setPatronDidModify(status[0]["patron_updated"]);
                                        }
                                    }
                                    else {
                                        console.log(status);
                                        props.setPatronDidModify(-99);
                                    }
                                    props.setPagenum(8);
                                });
                            }
                            }>
                            Confirm
                        </button>
                    </div>
                </div>
            </Popup>


            {/* Add New Patron Popup */}
            <Popup contentStyle={{backgroundColor: "transparent", border: "1px transparent solid"}} open={confirmAddingNewPatron} onOpen={() => {console.log("add new patron popup opened")}} onClose={() => {setConfirmAddingNewPatron(false); }} position="center">
                <div className="checkout">
                    <div className="title">
                        <FontAwesomeIcon icon="hand"/> Confirm New Patron
                    </div>
        
                    <div className="divider"/>

                    <div style={{display: "flex"}}>
                        <div style={{margin: "auto", width: "50%", paddingRight: "1%"}}>
                            <div className="attribute">
                                Name
                            </div>
                            <div className="display-box2"> 
                                {fieldPatronName}
                            </div>
                        </div>

                        <div style={{margin: "auto", width: "50%", paddingRight: "1%"}}>
                            <div className="attribute">
                                Birthday
                            </div>
                            <div className="display-box2"> 
                                {(props.currentPatron.birthday !== 0) && (
                                    getDisplayableDate(fieldPatronUnixBirthday)
                                )}
                            </div>
                        </div>
                    </div>

                    <div style={{display: "flex"}}>
                        <div style={{margin: "auto", width: "50%", paddingRight: "1%"}}>
                            <div className="attribute">
                                Email
                            </div>
                            <div className="display-box2"> 
                                {fieldPatronEmail}
                            </div>
                        </div>

                        <div style={{margin: "auto", width: "50%", paddingRight: "1%"}}>
                            <div className="attribute">
                                Phone
                            </div>
                            <div className="display-box2"> 
                                {fieldPatronPhone}
                            </div>
                        </div>
                    </div>

                    <div className="attribute">Address</div>
                    <div className="display-box2"> 
                        {fieldPatronStreet + ", " + fieldPatronCity + ", " + fieldPatronState}
                    </div>

                    {(fieldPatronNotes !== "") && (
                        <div>
                            <div className="attribute">Notes</div>
                            <div className="display-box2"> 
                                {fieldPatronNotes}
                            </div>
                        </div>
                    )}

                    <div className="attribute">Local ID</div>
                    <div className="display-box2"> 
                        {fieldLocalId}
                    </div>

                    <div className="divider" style={{marginTop: "1em", marginBottom: "1em"}}/>

                    <div className="display-flex">
                        <button className={"button2--cancel"} onClick={(e) => 
                            {
                                e.preventDefault(); 
                                e.stopPropagation(); 
                                setConfirmAddingNewPatron(false); 
                            }}> 
                            Cancel
                        </button>
                        
                        <button className={"button2"} 
                            onClick={(e) => {
                                e.preventDefault(); 
                                e.stopPropagation(); 
                                setConfirmAddingNewPatron(false); 

                                addNewPatron(props.userId, fieldPatronName, fieldLocalId, fieldPatronUnixBirthday, fieldPatronEmail, validatePhoneNumber(fieldPatronPhone), fieldPatronStreet, fieldPatronCity, fieldPatronState, fieldPatronZip, fieldPatronNotes)
                                .then((status) => {
                                    if (status && status[0] && status[0]["patron_added"]) { 
                                        if (status[0]["patron_added"] !== 0) {
                                            props.setPatronDidModify(3);
                                        }
                                        else {
                                            props.setPatronDidModify(status[0]["patron_added"]);
                                        }
                                    }
                                    else {
                                        console.log(status);
                                        props.setPatronDidModify(-99);
                                    }
                                    props.setPagenum(9);
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

export default PatronManagement;