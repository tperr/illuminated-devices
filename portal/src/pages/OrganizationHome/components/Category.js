import React, { useEffect, useState, useMemo } from "react";
import Popup from 'reactjs-popup';

// OrganizationHome.js Classes
import { Device } from "./../classes/Device";
import { Patron } from "./../classes/Patron";
import { Tutor } from "./../classes/Tutor";
import { Provider } from "./../classes/Provider";

// FontAwesome Icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// CSS
import "./iteminfo.scss";

/***** API Call *****/
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
			console.error("error code found in (Category.js -> fillData() -> Ark request -> (then) received_response[\"error\"]");
			// What to do in an error situation?
		}
		else {
            return received_response;
		}
        throw data;
	})
	.catch(error => {
		console.error("error code found in (Category.js -> fillData() -> Ark request -> (catch) received_response[\"error\"] ", error);
	})
	return itemList; 
}

/***** Main Export ******/
const Category = props => {
    /***** Variables *****/
    const items = [];

    const availableDevices = [];
    const checkedOutDevices = [];
    const maintenanceDevices = [];

    const [data, setData] = useState([]);
    const [dataLoaded, setDataLoaded] = useState(false)
    const [searchTerm, setSearch] = useState('');
    const [currentItem, setCurrentItem] = useState(null);
    const [showSelectedInfo, setShowSelectedInfo] = useState(false);

    const popupContentStyle = {
        backgroundColor: "red !important", 
        border: "20px purple solid !important",
        height: "90vh !important",
        width: "100% !important",
    };


    /***** UseEffects *****/
    useEffect(() => {
        const validNames = ["devices", "patrons"];
        if ((props.userId !== undefined) && !(validNames.includes("" + props.name) === -1)) {
            fillData(props.userId, props.name).then((response) => {
                setData(response);
                setDataLoaded(true)
            });
        }
    }, [props.userId, props.name]);

    /***** Fill category from database *****/
    if ((data !== null) && (data !== undefined)) {
        let d = data; 
        if (props.name === "devices") {
            console.log(d)
            for (let i = 0; i < d.length; i++) {
                let device = new Device(d[i].device_id, d[i].date_added, d[i].last_checkin, d[i].last_checkout, d[i].name, d[i].patron_id, d[i].provider_id, d[i].return_date, d[i].status, d[i].bsid, d[i].current_location_id, d[i].home_location_id, d[i].fname, d[i].lname, d[i].notes, [], d[i].is_ipad === 1);
                items.push(device);

                if (device.status === "Available") {
                    availableDevices.push(device);
                }
                else if ((device.status === "Checked Out" || device.status === "Overdue")) {
                    checkedOutDevices.push(device);
                }
                else if (device.status === "Maintenance") {
                    maintenanceDevices.push(device);
                }
            }
        }
        else if (props.name === "patrons") {
            for (let i = 0; i < d.length; i++) {
                let patron = new Patron(d[i].patron_id, d[i].fname, d[i].lname, d[i].email, d[i].phone, d[i].street_address, d[i].city, d[i].state, d[i].zip, d[i].registration_date, d[i].birthday, d[i].bsid, null, d[i].notes);
                items.push(patron);
            }
        }
    }

    /***** Helper Functions *****/
    const handleSearch = e => {
        setSearch(e.target.value);
    };

    const selectItem = item => {
        if ((item !== null) && (item !== undefined)) {
            setCurrentItem(item);
            if (props.getItem) {
                props.getItem(item);
            }
        }
    };

    /***** Details Popup *****/
    let showDetailsWindow; 
    if ((props.showDetailsButton) && (props.showDetailsButton === true)) {
        if ((props.showDetailsWindow !== undefined) && (props.showDetailsWindow !== null)) {
            showDetailsWindow = props.showDetailsWindow; 
        }
        else {
            showDetailsWindow = undefined;
        }
    }
    
    /***** Returned Page *****/
    return (    
        <div style={{display: "grid", gridTemplateRows: "0.1fr 1fr", gridColumn: "1"}}>
            {/* */}
            <div className={"category-searchbar-cont2"}>
                <FontAwesomeIcon className="magnifying-glass" icon="magnifying-glass" />
                
                {props.addItem && (
                    <input className="searchbar" placeholder={"Search ..."} value={searchTerm} onChange={handleSearch} />
                )}

                {(props.addItem) && (
                    <button className="clear-button" onClick={() => {props.addItem(); }}>
                        <FontAwesomeIcon icon="square-plus" className={"square-plus"}/>
                    </button>
                )}

                {!props.addItem && 
                    <input className="searchbar" placeholder={"Search ..."} value={searchTerm} onChange={handleSearch} />
                }                
            </div>

            {/* */}
            <div className={"category-list"} style={{overflowY: "auto", backgroundColor: "transparent", gridColumn: "1 / span 2"}}> 
                {
                /* List Filter */
                items
                .filter(item => item.stringify.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(item => { 
                    // filters out items that do not fit the criteria specified in the searchTerm string
                    if ((props.getItem && props.highlightSelected && (props.highlightSelected.stringify === item.stringify)) ) {
                        return item
                                .getInfoBar(
                                    props.showDetailsButton === undefined ? false : props.showDetailsButton, 
                                    "category-item2--selected", 
                                    (props.showDeviceStatus !== undefined && ((props.showDeviceStatus === 0) || (props.showDeviceStatus === 1 && item.status === "Available") || (props.showDeviceStatus === 2 && (item.status === "Checked Out" || item.status === "Overdue")) || (props.showDeviceStatus === 3 && item.status === "Maintenance"))),
                                    () => selectItem(item), () => setShowSelectedInfo(true))
                    }
                    else {
                        return item
                                .getInfoBar(
                                    props.showDetailsButton === undefined ? false : props.showDetailsButton, 
                                    "category-item2",
                                    (props.showDeviceStatus !== undefined && ((props.showDeviceStatus === 0) || (props.showDeviceStatus === 1 && item.status === "Available") || (props.showDeviceStatus === 2 && (item.status === "Checked Out" || item.status === "Overdue")) || (props.showDeviceStatus === 3 && item.status === "Maintenance"))),
                                    () => selectItem(item), () => setShowSelectedInfo(true))
                    }
                })
            }
        
            {/* Display error when list is empty */}
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

            <Popup 
                contentStyle={{
                    background: "rgba(0,0,0,0.3)", 
                    border: "1px transparent solid",
                    height: "100vh",
                    minHeight: "100vh",
                    width: "100vw",
                    display: "flex",
                }}  
                open={showSelectedInfo && !(props.fakeDetailsButton)} 
                onClose={() => setShowSelectedInfo(false)} 
                position="center"
            >
                <div className={"item-info-container" + (props.itemInfoContainerStyle === undefined ? "" : props.itemInfoContainerStyle)}>
                    {showDetailsWindow}
                    <button 
                        className={"button"} 
                        onClick={() => setShowSelectedInfo(false)}
                    >
                            Close
                    </button>
                </div>
            </Popup>

            
            </div>  
        </div>
    );
}

export default Category;
