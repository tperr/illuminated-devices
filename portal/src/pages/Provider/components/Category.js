import React, { useEffect, useState, useMemo } from "react";
import Popup from 'reactjs-popup';

// Provider.js Classes
import { Device } from "./../classes/Device";
import { Patron } from "./../classes/Patron";
import { Tutor } from "./../classes/Tutor";
import { Provider } from "./../classes/Provider";

// FontAwesome Icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// CSS
import "./iteminfo.scss";
import "./../column.scss"

async function fillData(userId, name) {
	const fullAddr = "https://illuminated.cs.mtu.edu/ark/u/" + userId;
	const authorization = 'Bearer ' + sessionStorage.getItem("BLIGHT");
    let itemList = [];

	itemList = await fetch(fullAddr + "/" + name, {
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
			console.log("error code found in (Provider.js -> Category.js -> fillData() -> Ark request -> (then) received_response[\"error\"]");
			// What to do in an error situation?
		}
		else {
            return received_response;
		}
        console.log("d: ", data); 
        throw data;
	})
	.catch(error => {
		console.error("error code found in (Provider.js -> Category.js -> fillData() -> Ark request -> (catch) received_response[\"error\"] ", error);
	})
	.finally(() => {
		//
	})

	return itemList; 
}

const Category = props => {
    // const items = useMemo(() => [], []);
    const items = [];

    const availableDevices = [];
    const checkedOutDevices = [];
    const maintenanceDevices = [];

    const [data, setData] = useState([]);
    const [dataLoaded, setDataLoaded] = useState(false)

    const [height, setHeight] = useState(window.innerHeight);
    const [searchTerm, setSearch] = useState('');
    const [currentItem, setCurrentItem] = useState(null);
    const [showSelectedInfo, setShowSelectedInfo] = useState(false);

    const validNames = ["devices", "patrons", "tutors", "providers"];
    

    useEffect(() => {
        //console.log(props.userId);
        if ((props.userId !== undefined) && !(validNames.includes("" + props.name) === -1)) {
            fillData(props.userId, props.name)
            .then((response) => {
                setData(response);
                setDataLoaded(true)
            })
            .catch((e) => {
                console.error("Error loading devices");
                console.error(e);
            });
            //console.log("loaded");
        }
    }, [props.userId]);

    if (validNames.includes("" + props.name) === -1) // why is this how it has to be????
    {
        return (<div>Invalid category name: {props.name}</div>)
    }

    const handleSearch = e =>
    {
        setSearch(e.target.value);
    }

    const selectItem = item =>
    {
        if ((item !== null) && (item !== undefined)) {
            setCurrentItem(item);
            if (props.getItem) {
                props.getItem(item);
            }
        }
    }

    var showDetailsWindow = () =>
    { 
        return (
            <div>
            {((currentItem !== null) && (currentItem !== undefined) && (props.name === "devices")) &&  
                (<div className="item-info-container"> 
                    <div>Device Name: {currentItem.name}</div>
                    {/*<div>Location: {currentItem.location}</div>*/}
                    <div>Notes: {currentItem.notes}</div>
                    <div>Check Out Log: </div>
                    <div>
                        {currentItem.log.map((log, i) => {
                            return <div key={i}>{log}</div>
                        })}
                    </div>
                </div>)}

                {props.name === "tutors" && 
                (<div> 
                    not yet implemented
                </div>)}

                {props.name === "patrons" && 
                (<div> 
                    not yet implemented
                </div>)}

                {props.name === "providers" && 
                (<div> 
                    not yet implemented
                </div>)}
            </div>
        );
    }

    // logic to pull name from database
    if (props.name === "devices")
    {
        if ((data !== null) && (data !== undefined)) {
            let d = data; 
            for (let i = 0; i < d.length; i++) {
                let device = new Device(d[i].device_id, d[i].date_added, d[i].last_checkin, d[i].last_checkout, d[i].name, d[i].patron_id, d[i].provider_id, d[i].return_date, d[i].status, d[i].bsid, d[i].current_location_id, d[i].home_location_id, d[i].fname, d[i].lname, d[i].notes);
                items.push(device);
                if (device.status === "Available") {
                    availableDevices.push(device);
                }
                else if (device.status === "Checked Out") {
                    checkedOutDevices.push(device);
                }
                else if (device.status === "Maintenance") {
                    maintenanceDevices.push(device);
                }
            }
        }
    }

    if (props.name === "patrons")
    {
        if ((data !== null) && (data !== undefined)) {
            let d = data; 
            for (let i = 0; i < d.length; i++) {
                let patron = new Patron(d[i].patron_id, d[i].fname, d[i].lname, d[i].email, d[i].phone, d[i].street_address, d[i].city, d[i].state, d[i].zip, d[i].registration_date, d[i].birthday, d[i].bsid, null, d[i].notes);
                items.push(patron);
            }
        }
    }

    if (props.name === "tutors")
    {
        items.push(new Tutor("Briana Bettin", "bettin@mtu.edu", "906-444-4444", 1, [], "Briana"));
        items.push(new Tutor("Leo Ureel", "ureel@mtu.edu", "906-444-4476", 0, [], "Leo"));
        items.push(new Tutor("Kelly Steelman", "steelman@mtu.edu", "906-444-4428", 1, [], "Kelly"));
        items.push(new Tutor("Chuck Wallace", "wallace@mtu.edu", "906-123-4444", 0, [], "Chuck"));
        for (let i = 0; i < 500; i++) {
            items.push(new Tutor(i, i+"@yahoo.edu", "", i%2, [], ""))
            
        }

    }

    if (props.name === "providers")
    {
        items.push(new Provider("PLDL", ["4578 something St."], "?? what goes here"));
        items.push(new Provider("MiWorks", ["4578 street Ave."], "?? what goes here"));
        items.push(new Provider("MTU", ["1400 Townsend Dr.", "1401 Townsend Dr."], "?? what goes here"));
    }
    
    if (props.showDetailsWindow)
    {
        showDetailsWindow = props.showDetailsWindow; 
    }
    return (    
        <div>
            <div className={"category-searchbar-cont"}>
                <FontAwesomeIcon style={{position: "absolute", padding: "10px", marginTop: "0.2em"}} icon="magnifying-glass" />
                
                {props.addItem && (
                    <div style={{width: "94%"}}>
                        <input className="searchbar" placeholder={"Search ..."} value={searchTerm} onChange={handleSearch} />
                    </div>
                )}

                {(props.addItem) && (
                    <div>
                        <FontAwesomeIcon icon="square-plus" style={{width: "4%", fontSize: "2em", marginTop: "-1.2em", float: "right", color: "#ffb703", cursor: "pointer"}} onClick={() => {props.addItem(); }}/>
                    </div>
                )}

                {!props.addItem && 
                <div>
                    <input className="searchbar" placeholder={"Search ..."} value={searchTerm} onChange={handleSearch} />
                </div>
                }                
            </div>
            <div className={"category-list"} style={{maxHeight: "65vh", overflowY: "scroll"}}> 
                {
                items.filter(item => item.stringify.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(item => { // filters out items that do not fit the criteria specified in the searchTerm string
                    if ((props.getItem && props.highlightSelected && (props.highlightSelected.id === item.id)) ) {
                        return item.getInfoBar(props.showDetailsButton === undefined ? false : true, "category-item--selected", (props.showDeviceStatus !== undefined && ((props.showDeviceStatus === 0) || (props.showDeviceStatus === 1 && item.status === "Available") || (props.showDeviceStatus === 2 && item.status === "Checked Out") || (props.showDeviceStatus === 3 && item.status === "Maintenance"))), () => selectItem(item), () => setShowSelectedInfo(true))
                    }
                    else {
                        return item.getInfoBar(props.showDetailsButton === undefined ? false : true, "category-item", (props.showDeviceStatus !== undefined && ((props.showDeviceStatus === 0) || (props.showDeviceStatus === 1 && item.status === "Available") || (props.showDeviceStatus === 2 && item.status === "Checked Out") || (props.showDeviceStatus === 3 && item.status === "Maintenance"))), () => selectItem(item), () => setShowSelectedInfo(true))
                    }
                })
            }
        

            {( (props.name === "devices") && ( (props.showDeviceStatus === 0 && items.length <= 0) || (props.showDeviceStatus === 1 && availableDevices.length <= 0) || (props.showDeviceStatus === 2 && checkedOutDevices.length <= 0)  )) && dataLoaded && (
                <div className="no-devices-available">
                    <FontAwesomeIcon icon="circle-exclamation"/> No devices available

                    {(!props.emptyCategorySubtext) && (
                    <div className="subtext">
                        Please see <span style={{fontFamily: "Poppins-EB", cursor: "pointer"}} onClick={(() => {props.setPagenum(2);})}>Device Management</span> to review the devices assigned to your account. 
                    </div>
                    )}

                    {(props.emptyCategorySubtext === "deviceManagement") && (
                    <div className="subtext">
                        There are no devices currently assigned to your account. 
                    </div>
                    )}
                </div>   
            )}

            { ((props.name === "patrons") && (items.length <= 0)) && dataLoaded && (
                <div className="no-devices-available">
                    <FontAwesomeIcon icon="circle-exclamation"/> No patrons available

                    {(!props.emptyCategorySubtext) && (
                    <div className="subtext">
                        Please see <span style={{fontFamily: "Poppins-EB", cursor: "pointer"}} onClick={(() => {props.setPagenum(3);})}>Patron Management</span> to review the patrons assigned to your account. 
                    </div>
                    )}

                    {(props.emptyCategorySubtext === "patronManagement") && (
                    <div className="subtext">
                        There are no patrons currently assigned to your account. 
                    </div>
                    )}

                </div>   
            )}

            <Popup contentStyle={{backgroundColor: "transparent", border: "1px transparent solid"}}  open={showSelectedInfo} onClose={() => setShowSelectedInfo(false)} position="center">
                <div className="item-info-container">
                    {showDetailsWindow()}
                    <button className="button" onClick={() => setShowSelectedInfo(false)}>Close</button>
                </div>
            </Popup>
            
            </div>  
        </div>
    );
}

export default Category;
