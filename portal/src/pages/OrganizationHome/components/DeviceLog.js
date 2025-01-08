/***** Imports *****/
// React
import React from "react";

// FontAwesome Icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Table
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

// Material UI Tooltip
import Tooltip from "@mui/material/Tooltip";

// Material UI Dropdowns
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { createTheme, ThemeProvider } from "@mui/material/styles";

/***** Main Export *****/
const DeviceLog = (props) => {
    const [keyOrder, setKeyOrder] = React.useState([]);
    const [deviceLogList, setDeviceLogList] = React.useState([]);
    const [deviceLogListHasBeenChanged, setDeviceLogListHasBeenChanged] = React.useState(false);
  
    const [deviceListHasBeenSet, setDeviceListHasBeenSet] = React.useState(false);
    const [deviceListDoneLoading, setDeviceListDoneLoading] = React.useState(false);
    const [deviceList, setDeviceList] = React.useState([]);
    const [currentDeviceId, setCurrentDeviceId] = React.useState("");
    const [currentDeviceName, setCurrentDeviceName] = React.useState("");

    if (!deviceListHasBeenSet) {
        getDevices(props.userId)
        .then((response) => {
            setDeviceList(response);
            setDeviceListHasBeenSet(true);
            setDeviceListDoneLoading(false);
            setCurrentDeviceName(props.currentDevice.name);
        });
    }
    
    /***** Helper Functions *****/
    async function getDeviceLog(userId, deviceId) {
        const fullAddr = "https://illuminated.cs.mtu.edu/ark";
        const authorization = 'Bearer ' + sessionStorage.getItem("BLIGHT");
        let itemList = [];

        let body = {
            "data": {
                "provider": userId,
                "device": deviceId
            }
        }
    
        itemList = await fetch(fullAddr + "/device/log", {
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
                console.log("error code found in device log (DeviceLog.js -> getDeviceLog() -> Ark request -> (then) received_response[\"error\"]");
                // What to do in an error situation?
            }
            else {
                return received_response;
            }
            throw data;
        })
        .catch(error => {
            console.error("error code found in device log (DeviceLog.js -> getDeviceLog() -> Ark request -> (catch) received_response[\"error\"] ", error);
            console.log(error);
        })
        .finally(() => {
            //
        })

        return itemList; 
    }

    /***** API Call *****/
    async function getDevices(userId) {
        const fullAddr = "https://illuminated.cs.mtu.edu/ark/u/" + userId;
        const authorization = 'Bearer ' + sessionStorage.getItem("BLIGHT");
        let itemList = [];

        itemList = await fetch(fullAddr + "/devices", {
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
                console.log("error code found in (DeviceLog.js -> getDevices() -> Ark request -> (then) received_response[\"error\"]");
                // What to do in an error situation?
            }
            else {
                return received_response;
            }
            throw data;
        })
        .catch(error => {
            console.error("error code found in (DeviceLog.js -> getDevices() -> Ark request -> (catch) received_response[\"error\"] ", error);
        })

        return itemList; 
    }

    function getTableFormattedKey(key) {
        if (key === "bsid") {
            return "LOCAL ID";
        }

        let newKey = key.replace("_", " ").toUpperCase();

        return newKey;
    }

    /***** UseEffects *****/
    React.useEffect(() => {
        deviceList.map((device) => {
            if (device.name === currentDeviceName) {
                setCurrentDeviceId(device.device_id);
            }
        });
    }, [currentDeviceName]);

    React.useEffect(() => {
        if (currentDeviceId) {
            setDeviceListDoneLoading(false);

            getDeviceLog(props.userId, currentDeviceId)
                .then((response) => {
                    console.log("r: ", response);
                    let keys = [];

                    // Set key order (used for displaying data in the table)
                    if (response[0] !== undefined && response[0] !== null) {
                        keys = Object.keys(response[0]);

                        // Sort keys [O(n^2)] 
                        let partialOrdering = ["tx_id", "patron_id", "bsid", "fname", "lname", "action", "action_location", "location_id", "date", "notes"]
                        for (let i = 0; i < partialOrdering.length; i++) {
                            for (let j = 0; j < keys.length; j++) {
                                // Swap this partial ordering to the front
                                if ((partialOrdering[i] === keys[j]) && (i !== j)) {
                                    let temp = keys[j];
                                    keys[j] = keys[i];
                                    keys[i] = temp;
                                }
                            }
                        }
                    }
                    else {
                        keys = ["NO LOG"]
                        response = [{"NO LOG":"This device has no recorded transactions."}]
                    }

                    setKeyOrder(keys);
                    setDeviceLogList(response);
                    setDeviceLogListHasBeenChanged(true)
                })
                .then(() => {
                    setDeviceListDoneLoading(true);
                });
            }
    }, [currentDeviceId]);

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

                    },
                },
            },
            MuiFormControl: {
                styleOverrides: {
                    root: {
                        width: "1%",
                    },
                },
            },
            MuiSelect: {
                styleOverrides: {
                    select: {
                        padding: "8px 10px",
                    },
                },
            },
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

    /***** Verify there is a user ID and a device *****/
    if (props.userId === undefined || props.userId === null) {
        return (
            "<No User ID>"
        );
    }

    if (props.currentDevice === undefined || props.currentDevice === null) {
        return (
            "<No Device>"
        );
    }

    /***** Returned Page *****/ 
    return (
        <div>
            {/* Top Information Start */}
            <div style={{
                padding: "1em 1em 0em 1em",
            }}>
                <div className="title">
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "auto auto 1fr",
                    }}>
                        <button className={"button2--left"}
                            onClick={() => { props.setShowDeviceLog(false)} }
                            style={{
                                gridColumn: "1",
                                gridRow: "1",
                                fontSize: "1em",
                            }}
                        >
                            <FontAwesomeIcon icon="arrow-left" />
                            
                        </button>

                        {(deviceListDoneLoading) && (
                            <div
                                style={{
                                    gridColumn: "2",
                                    gridRow: "1",
                                }}
                            >
                                <ThemeProvider 
                                    theme={theme}
                                >
                                    <Box 
                                        sx={{padding: "0 0 0 0"}}
                                    > 
                                        <FormControl fullWidth>
                                            <InputLabel id="device" shrink={false}> </InputLabel>                                
                                                <Select
                                                    labelId="device"
                                                    id="device"
                                                    value={currentDeviceName}
                                                    displayEmpty
                                                    label=""
                                                    className={"button2--right"}
                                                    onChange={e => {
                                                        console.log(e);
                                                        if ((e.target.value !== undefined) && (e.target.value !== null)) {
                                                            setCurrentDeviceName(e.target.value);
                                                        }
                                                        else {
                                                            setCurrentDeviceName("");
                                                        }
                                                    }}
                                                    defaultValue={""}
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
                                                        deviceList.map((device) => {
                                                            return (
                                                                <MenuItem key={device.device_id + device.name} value={device.name}>
                                                                    {device.name}
                                                                </MenuItem>
                                                            );
                                                        })
                                                    )}

                                                </Select>
                                            
                                        </FormControl>
                                    </Box>
                                </ThemeProvider>
                            </div>
                        )}
                    </div>
                </div>

                <div className="divider"
                    style={{
                        margin: "1em 0em 0em 0em"
                    }}/>

                <div className="subtitle"
                    style={{
                        margin: "auto",
                        padding: "1em 0em 0em 0em",
                    }}>
                    Showing Transactions for <span className="organization">{currentDeviceName}</span>
                </div>
            </div>

        {/* Top Information End */}
            {deviceLogListHasBeenChanged && (
                <div className="container"
                style={{
                    border: "none",
                    margin: "0 0 0 0",
                    padding: "0 0 0 0",
                    overflowY: "auto",
                }}>
                    <div className="inner">
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        {keyOrder
                                            .map((key) => {
                                                return (
                                                    <TableCell key={key} className="list-header">
                                                        {getTableFormattedKey(key)}
                                                    </TableCell>           
                                                )})
                                        }
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {deviceLogList
                                        .map((log) => {
                                            return (
                                                <TableRow key={log.tx_id + Math.random()} className="list-element">
                                                    {(keyOrder.map((key) => {
                                                        return (
                                                            <TableCell key={log.tx_id + key} style={{fontFamily: "Poppins"}}>
                                                                {log[key]}
                                                            </TableCell>
                                                        )
                                                    }))}
                                                </TableRow>
                                            );
                                        })
                                    }
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>
                </div>
            )}
        </div>
    );
}


export default DeviceLog;