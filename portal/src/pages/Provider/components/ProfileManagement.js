// FontAwesome Icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Components
import Category from "./Category";
import { Patron } from "../classes/Patron";

// Other imports
import { useState, useEffect } from "react";
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

    console.log(body);

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

const ProfileManagement = (props) => {
    const [addingNewPatron, setAddingNewPatron] = useState(props.addingNewPatron);
    const [confirmAddingNewPatron, setConfirmAddingNewPatron] = useState(false);

    if ((props.currentPatron === null) || (props.currentPatron === undefined)) {
        props.setCurrentPatron(new Patron());
    }

    /* For field editing
     * see DeviceManagement.js it works the same way
     */
    const displayBox = "display-box";
    const [fieldStyles, setFieldStyles] = useState([displayBox, displayBox, displayBox, displayBox, displayBox, displayBox, displayBox, displayBox, displayBox, displayBox])
    const [fieldStylesChange, setFieldStylesChange] = useState(-1);

    const [confirmPatronManagement, setConfirmPatronManagement] = useState(false);
    const [editPatron, setEditPatron] = useState(false);
    const [fieldPatronName, setFieldPatronName] = useState("");
    const [fieldPatronUnixBirthday, setFieldPatronUnixBirthday] = useState("");
    const [fieldPatronEmail, setFieldPatronEmail] = useState("");
    const [fieldPatronPhone, setFieldPatronPhone] = useState("");
    const [fieldPatronStreet, setFieldPatronStreet] = useState("");
    const [fieldPatronCity, setFieldPatronCity] = useState("");
    const [fieldPatronState, setFieldPatronState] = useState("");
    const [fieldPatronZip, setFieldPatronZip] = useState("");
    const [fieldPatronNotes, setFieldPatronNotes] = useState("");
    const [fieldLocalId, setFieldLocalId] = useState("");


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

    useEffect(() => {
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

    useEffect(() => {
        if((props.currentPatron === undefined) || (props.currentPatron === null) || addingNewPatron) {
            setFieldPatronName("");
            setFieldPatronUnixBirthday(0);
            setFieldPatronEmail("");
            setFieldPatronPhone("");
            setFieldPatronStreet("");
            setFieldPatronCity("");
            setFieldPatronState("");
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
    }, [addingNewPatron]);

    /* Write a note for this
     *
     */
    useEffect(() => {
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

    return (
        <div className={"display-flex"}>
            <div className="column-left">
                <div className="header">
                    <div className="content">
                        Patrons
                    </div>
                    <div className="divider" />
                </div>
                    
                <Category name="patrons" getItem={(e) => {props.setCurrentPatron(e); setAddingNewPatron(false); setEditPatron(false);}} userId={props.userId} addItem={() => {setEditPatron(false); setAddingNewPatron(true);}} page="profile-management" showDetailsWindow={false} highlightSelected={addingNewPatron || props.currentPatron} emptyCategorySubtext={"patronManagement"} />
            </div> 

            {((props.currentPatron.id !== "") || (addingNewPatron)) && (
                <div className="column-right">
                    <div className="header">
                        <div className="content" style={{display: "flex"}}>
                            {(addingNewPatron) && (
                                <div>
                                    Add New Patron
                                </div>
                            )}
                            {(editPatron && !addingNewPatron) && (
                                <div>
                                    Editing: {(props.currentPatron.id !== "") && (!addingNewPatron) &&(
                                props.currentPatron.identifier
                                )}
                                </div>
                            )}
                            {(!editPatron && !addingNewPatron) && (
                                <div>
                                    {(props.currentPatron.id !== "") && (!addingNewPatron) &&(
                                props.currentPatron.identifier
                                )}
                                </div>
                            )}
                        </div>

                        <div> 
                            <div className="divider"/>
                                
                            <div className="display-flex">
                                <div style={{margin: "auto", width: "50%", paddingRight: "1%"}}>
                                    <div className="attributeTitle">
                                        {addingNewPatron && ("*")}Patron Name {(addingNewPatron || editPatron) && ("(" + fieldPatronName.length + "/128)")}
                                    </div>
                                    <input maxLength={"128"} readOnly={!(editPatron || addingNewPatron)} value={fieldPatronName} onChange={(e) => {setFieldPatronName(e.target.value);}} className={fieldStyles[0]} type="text" style={{width:"100%"}} />
                                </div>

                                <div style={{margin: "auto", width: "50%"}}>
                                    <div className="attributeTitle">
                                        {addingNewPatron && ("*")}Birthday {(addingNewPatron || editPatron) && ("(MM/DD/YYYY)")}
                                    </div>
                                    {(!addingNewPatron) && (!editPatron) && (
                                        <div className={"display-box"}>
                                        {(props.currentPatron.birthday !== "") && (getDisplayableDate(fieldPatronUnixBirthday))}
                                        {(props.currentPatron.birthday === "") && (<div>Unknown</div>)}
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
                                            )}
                                            dateFormat="MM-dd-yyyy"
                                            selected={(fieldPatronUnixBirthday * 1000)}  
                                            onChange={(birth) => {console.log(birth); setFieldPatronUnixBirthday(birth.valueOf() / 1000)}}
                                            className={fieldStyles[1] + "--patronManagementWide"}
                                            calendarClassName={"react-datepicker2"}
                                            placeholder={"MM-dd-yyyy"}
                                            onKeyDown={(e) => {
                                                e.preventDefault();
                                             }}
                                            />
                                        </span>
                                    
                                    
                                    )}

                                </div>
                            </div>

                            <div className="display-flex">
                                <div style={{margin: "auto", width: "50%", paddingRight: "1%"}}>
                                    <div className="attributeTitle">
                                        {addingNewPatron && ("*")}Email {(addingNewPatron || editPatron) && ("(" + fieldPatronEmail.length + "/255)")}
                                    </div>
                                    <input maxLength={"255"} readOnly={!(editPatron || addingNewPatron)} value={fieldPatronEmail} onChange={(e) => {setFieldPatronEmail(e.target.value);}} className={fieldStyles[2]} type="text" style={{width:"100%"}} />
                                </div>

                                <div style={{margin: "auto", width: "50%"}}>
                                    <div className="attributeTitle">
                                        {addingNewPatron && ("*")}Phone {(addingNewPatron || editPatron) && ("(" + validatePhoneNumber(fieldPatronPhone).length + "/10)")}
                                    </div>
                                    <input maxLength={"14"} readOnly={!(editPatron || addingNewPatron)} value={formatPhoneNumber(fieldPatronPhone)} onChange={(e) => {setFieldPatronPhone(e.target.value);}} className={fieldStyles[3]} type="text" style={{width:"100%"}} />
                                </div>
                            </div>
                            
                            {(editPatron || addingNewPatron) && (
                                <div>
                                    <div className="attributeTitle">
                                        {addingNewPatron && ("*")}Street Address {(addingNewPatron || editPatron) && ("(" + fieldPatronStreet.length + "/64)")}
                                    </div>
                                    <input maxLength={"64"} readOnly={!(editPatron || addingNewPatron)} value={fieldPatronStreet} onChange={(e) => {setFieldPatronStreet(e.target.value);}} className={fieldStyles[4]} type="text" style={{width:"100%"}} />


                                    <div className="display-flex">
                                        <div style={{width: "50%"}}>
                                            <div className="attributeTitle">
                                                {addingNewPatron && ("*")}City {(addingNewPatron || editPatron) && ("(" + fieldPatronCity.length + "/32)")}
                                            </div>
                                            <input maxLength={"32"} readOnly={!(editPatron || addingNewPatron)} value={fieldPatronCity} onChange={(e) => {setFieldPatronCity(e.target.value);}} className={fieldStyles[5]} type="text" style={{width:"100%"}} />
                                        </div>
                                        <div style={{margin: "auto", width: "10%"}}>
                                            <div className="attributeTitle">
                                                {addingNewPatron && ("*")}State
                                            </div>
                                            {!(editPatron || addingNewPatron) && (
                                                <input maxLength={"2"} readOnly={!(editPatron || addingNewPatron)} value={fieldPatronState} onChange={(e) => {setFieldPatronState(e.target.value);}} className={fieldStyles[6] + "--patronManagementWide"} type="text" style={{width:"100%"}} />
                                            )}
                                            {(editPatron || addingNewPatron) && (
                                                <ThemeProvider theme={theme}>
                                                <Box 
                                                    sx={{padding: "0 0 0 0"}}
                                                > 
                                                    <FormControl fullWidth>
                                                        <InputLabel id="state-dropdown" shrink={false}> </InputLabel>
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
                                        <div style={{width: "30%"}}>
                                            <div className="attributeTitle">
                                                {addingNewPatron && ("*")}Zip {(addingNewPatron || editPatron) && ("(" + fieldPatronZip.length + "/10)")}
                                            </div>
                                            <input maxLength={"10"} readOnly={!(editPatron || addingNewPatron)} value={fieldPatronZip} onChange={(e) => {setFieldPatronZip(e.target.value);}} className={fieldStyles[7] + "--patronManagementWide"} type="text" style={{width:"100%"}} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!(editPatron || addingNewPatron) && (
                                <div>
                                    <div className="attributeTitle">
                                        Address
                                    </div>
                                    <div className="display-box">
                                        {props.currentPatron.getDisplayableAddress()}
                                    </div>
                                </div>
                            )}

                            <div className="attributeTitle">
                                Notes {(addingNewPatron || editPatron) && ("(" + fieldPatronNotes.length + "/128)")}
                            </div>
                            {(editPatron || addingNewPatron) && (
                                <input maxLength={"128"} value={fieldPatronNotes} onChange={(e) => {setFieldPatronNotes(e.target.value);}} className={fieldStyles[9] + "--patronManagementWide"} type="text" style={{width:"100%"}} />
                            )}
                            {!(editPatron || addingNewPatron) && (fieldPatronNotes !== "") && (
                                <div className="display-box"> 
                                    {props.currentPatron.notes}
                                </div>
                            )}
                            {!(editPatron || addingNewPatron) && (fieldPatronNotes === "") && (
                                <div className="display-box"> 
                                    [No notes]
                                </div>
                            )}


                            {!(editPatron || addingNewPatron) && (
                                <div>
                                    <div className="attributeTitle">
                                        Log
                                    </div>
                                    <div className="display-box">
                                        {(props.currentPatron.log.length === 0) && (
                                            "[No log]"
                                        )}
                                        {(props.currentPatron.log.length !== 0) && (
                                            props.currentPatron.log
                                        )}
                                    </div>
                                </div>
                            )}
                            <div className="attributeTitle">
                                {addingNewPatron && ("*")}Local ID {/* BSID */}
                            </div>
                            <input readOnly={!(editPatron || addingNewPatron)} value={fieldLocalId} onChange={(e) => {setFieldLocalId(e.target.value);}} className={fieldStyles[8]} type="text" style={{width:"100%"}} />

                            {addingNewPatron && (
                                <div className="addingNewPatronSubtext">
                                    * Indicates a required field
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {!(editPatron || addingNewPatron) && (
                        <button className={"button"} onClick={() => {setEditPatron(true); setFieldStylesChange(0); }}>
                            <FontAwesomeIcon icon="edit"/> Edit
                        </button>
                    )}

                    {(editPatron || addingNewPatron) && (
                        <div className="display-flex">
                            <button className={"button--cancel"} style={{width: "45%", marginRight: "auto"}} onClick={(e) => {
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
                                }}>
                                Cancel
                            </button>
                            <button className={"button"} style={{width: "45%"}} onClick={(e) => {
                                e.preventDefault(); 
                                e.stopPropagation(); 
                                if(editPatron) {
                                    if ((props.currentPatron.identifier !== fieldPatronName) || (props.currentPatron.bsid !== fieldLocalId) || (props.currentPatron.birthday !== fieldPatronUnixBirthday) || (props.currentPatron.email !== fieldPatronEmail) || (props.currentPatron.phone !== fieldPatronPhone) || (props.currentPatron.getDisplayableAddress() !== (fieldPatronStreet + ", " + fieldPatronCity + ", " + fieldPatronState + ", " + fieldPatronZip) || (props.currentPatron.notes !== fieldPatronNotes))) {
                                        setConfirmPatronManagement(true);
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
                                    if (fieldPatronEmail === "") {
                                        errorNumber += 64;
                                    }
                                    if (fieldPatronPhone === "") {
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
                                    if (fieldPatronState === "") {
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
                            }}>
                                Confirm
                            </button>
                        </div>
                    )}
                </div>
                )}
            
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
                                    <div className="display-box"> 
                                        {(props.currentPatron !== undefined && props.currentPatron !== null) && (props.currentPatron.identifier)}
                                    </div>
                                </div>

                                <div style={{margin: "auto", width: "5%", paddingRight: "1%", textAlign: "center", marginTop: "auto"}}>
                                    <FontAwesomeIcon icon="fa-angles-right" className="fa-fade fa-xsm" style={{color: "green"}} />
                                </div>

                                <div style={{margin: "auto", width: "45%", paddingRight: "1%"}}>
                                    <div className="display-box"> 
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
                                    <div className="display-box"> 
                                        {(props.currentPatron !== undefined && props.currentPatron !== null) && (getDisplayableDate(props.currentPatron.birthday))}
                                    </div>
                                </div>

                                <div style={{margin: "auto", width: "5%", paddingRight: "1%", textAlign: "center", marginTop: "auto"}}>
                                    <FontAwesomeIcon icon="fa-angles-right" className="fa-fade fa-xsm" style={{color: "green"}} />
                                </div>

                                <div style={{margin: "auto", width: "45%", paddingRight: "1%"}}>
                                    <div className="display-box">
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
                                    <div className="display-box"> 
                                        {(props.currentPatron !== undefined && props.currentPatron !== null) && (props.currentPatron.email)}
                                    </div>
                                </div>

                                <div style={{margin: "auto", width: "5%", paddingRight: "1%", textAlign: "center", marginTop: "auto"}}>
                                    <FontAwesomeIcon icon="fa-angles-right" className="fa-fade fa-xsm" style={{color: "green"}} />
                                </div>

                                <div style={{margin: "auto", width: "45%", paddingRight: "1%"}}>
                                    <div className="display-box">
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
                                    <div className="display-box"> 
                                        {(props.currentPatron !== undefined && props.currentPatron !== null) && (formatPhoneNumber(props.currentPatron.phone))}
                                    </div>
                                </div>

                                <div style={{margin: "auto", width: "5%", paddingRight: "1%", textAlign: "center", marginTop: "auto"}}>
                                    <FontAwesomeIcon icon="fa-angles-right" className="fa-fade fa-xsm" style={{color: "green"}} />
                                </div>

                                <div style={{margin: "auto", width: "45%", paddingRight: "1%"}}>
                                    <div className="display-box">
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
                                    <div className="display-box"> 
                                        {(props.currentPatron !== undefined && props.currentPatron !== null) && (props.currentPatron.getDisplayableAddress())}
                                    </div>
                                </div>

                                <div style={{margin: "auto", width: "5%", paddingRight: "1%", textAlign: "center", marginTop: "auto"}}>
                                    <FontAwesomeIcon icon="fa-angles-right" className="fa-fade fa-xsm" style={{color: "green"}} />
                                </div>

                                <div style={{margin: "auto", width: "45%", paddingRight: "1%"}}>
                                    <div className="display-box">
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
                                    <div className="display-box"> 
                                        {(props.currentPatron !== undefined && props.currentPatron !== null) && (props.currentPatron.notes !== "") && (props.currentPatron.notes)}
                                        {(props.currentPatron !== undefined && props.currentPatron !== null) && (props.currentPatron.notes === "") && ("[No notes]")}
                                    </div>
                                </div>

                                <div style={{margin: "auto", width: "5%", paddingRight: "1%", textAlign: "center", marginTop: "auto"}}>
                                    <FontAwesomeIcon icon="fa-angles-right" className="fa-fade fa-xsm" style={{color: "green"}} />
                                </div>

                                <div style={{margin: "auto", width: "45%", paddingRight: "1%"}}>
                                    <div className="display-box">
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
                                    <div className="display-box"> 
                                        {(props.currentPatron !== undefined && props.currentPatron !== null) && (props.currentPatron.bsid)}
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


                    <div className="divider" style={{marginTop: "1em", marginBottom: "1em"}}/>

                    <div className="display-flex">
                        <button className={"button--cancel"} onClick={(e) => 
                            {
                                e.preventDefault(); 
                                e.stopPropagation(); 
                                setConfirmPatronManagement(false); 
                            }}> 
                            Cancel
                        </button>
                        
                        <button className={"button"} 
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
                                        props.setPatronDidModify(status[0]["patron_updated"]);
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
                            <div className="display-box"> 
                                {fieldPatronName}
                            </div>
                        </div>

                        <div style={{margin: "auto", width: "50%", paddingRight: "1%"}}>
                            <div className="attribute">
                                Birthday
                            </div>
                            <div className="display-box"> 
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
                            <div className="display-box"> 
                                {fieldPatronEmail}
                            </div>
                        </div>

                        <div style={{margin: "auto", width: "50%", paddingRight: "1%"}}>
                            <div className="attribute">
                                Phone
                            </div>
                            <div className="display-box"> 
                                {fieldPatronPhone}
                            </div>
                        </div>
                    </div>

                    <div className="attribute">Address</div>
                    <div className="display-box"> 
                        {fieldPatronStreet + ", " + fieldPatronCity + ", " + fieldPatronState}
                    </div>

                    {(fieldPatronNotes !== "") && (
                        <div>
                            <div className="attribute">Notes</div>
                            <div className="display-box"> 
                                {fieldPatronNotes}
                            </div>
                        </div>
                    )}

                    <div className="attribute">Local ID</div>
                    <div className="display-box"> 
                        {fieldLocalId}
                    </div>

                    <div className="divider" style={{marginTop: "1em", marginBottom: "1em"}}/>

                    <div className="display-flex">
                        <button className={"button--cancel"} onClick={(e) => 
                            {
                                e.preventDefault(); 
                                e.stopPropagation(); 
                                setConfirmAddingNewPatron(false); 
                            }}> 
                            Cancel
                        </button>
                        
                        <button className={"button"} 
                            onClick={(e) => {
                                e.preventDefault(); 
                                e.stopPropagation(); 
                                setConfirmAddingNewPatron(false); 

                                addNewPatron(props.userId, fieldPatronName, fieldLocalId, fieldPatronUnixBirthday, fieldPatronEmail, validatePhoneNumber(fieldPatronPhone), fieldPatronStreet, fieldPatronCity, fieldPatronState, fieldPatronZip, fieldPatronNotes)
                                .then((status) => {
                                    if (status && status[0] && status[0]["patron_added"]) { 
                                        props.setPatronDidModify(status[0]["patron_added"]);
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

    </div>

    );
}

export default ProfileManagement;