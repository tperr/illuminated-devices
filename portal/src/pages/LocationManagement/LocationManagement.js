// Components
import Navbar from '../../subscript/universal/Navbar.js';
import Footer from '../../subscript/universal/Footer.js';

// Other imports
import { UserContext } from "../../App.js";
import React from "react";
import { useNavigate } from 'react-router-dom';

// Table
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

// CSS
import "./locationmanagement.scss"; 

// Can this be combined with the identical function in DeviceManagement.js and Profile.js ?
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
			console.error("error code found in receive account details (Provider.js -> getDevices() -> Ark request -> (then) received_response[\"error\"]");
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

const LocationManagement = props => {
    const { userId, userDetails } = React.useContext(UserContext);
    const [keyOrder, setKeyOrder] = React.useState([]);
    const navigate = useNavigate();

    // For Locations to identify their Organizations
    const [organizationLocationList, setOrganiationLocationList] = React.useState([]);

    React.useEffect(() => {
        getOrganizationLocations(userId)
            .then((response) => { 
                // Move Organization account to 0th index [O(n)]
                for (let i = 0; i < response.length; i++) {
                    if (response[i].account_id === response[i].organization_id) {
                        let temp = response[0]; 
                        response[0] = response[i];
                        response[i] = temp;
                    }
                }

                let keys = [];
                // Set key order (used for displaying data in the table)
                if (response[0] !== undefined && response[0] !== null) {
                    keys = Object.keys(response[0]); 
                    
                    // Remove "organization_id" and "account_id" keys [O(n)]
                    for (let i = 0; i < keys.length; i++) {
                        if ((keys[i] === "organization_id") || (keys[i] === "account_id")) {
                            for (let j = i; j < keys.length - 1; j++) {
                                keys[j] = keys[j + 1];
                            }
                            keys.pop();
                            i--; 
                        }
                    }

                    // Sort keys [O(n^2)] 
                    let partialOrdering = ["bsid", "name", "phone", "email", "street_address", "city", "state", "zip", "registration_date"]
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

                setKeyOrder(keys);
                setOrganiationLocationList(response);
            }); 
    }, [userId]);

    function getTableFormattedKey(key) {
        if (key === "bsid") {
            return "LOCAL ID";
        }

        let newKey = key.replace("_", " ").toUpperCase();

        return newKey;
    }

    if ((userId) && (userDetails) && (userDetails[0] !== 4)) {
        navigate('/home')
    }

    if ((userId) && (userDetails) && (userDetails[0] === 4) && (organizationLocationList !== undefined) && (organizationLocationList.length > 0) && (organizationLocationList[0].account_id !== "")) {
        return (    
            <div id="page-container">
                <div id="content-wrap">
                    <Navbar />

                    {/* Page Content Start */}
                    <div id="home">
                        <div className="container">

                            {/* Top Information Start */}
                            <div className="title">
                                Location Management
                            </div>

                            <div className="divider"/>

                            <div className="subtitle">
                                Locations For <span className="organization">{organizationLocationList[0].name}</span>
                            </div>

                            <div className="subtext">
                                To manage your own account, please visit your <span className="link" onClick={(() => {navigate('/profile')})}>Profile</span>.
                            </div>
                            {/* Top Information End */}

                            {/* Location Listings Start */}
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
                                                {organizationLocationList
                                                    .map((location) => {
                                                        return (
                                                            <TableRow key={location.account_id} className="list-element">
                                                                {(keyOrder.map((key) => {
                                                                    return (
                                                                        <TableCell key={location.account_id + key} style={{fontFamily: "Poppins"}}>
                                                                            {location[key]}
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
                            {/* Location Listings End */}

                        </div>
                    </div>
                    {/* Page Content End */}

                    <Footer />
                </div>
            </div>
        );
    }
    
}
 
export default LocationManagement;

/*
                            <div className="inner">
                                    <div>
                                    </div>
                                    {organizationLocationList
                                        .map(location => {
                                            return (
                                                <div key={location.account_id} className="list-element">
                                                    <div>
                                                        {location.name}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    }
                            </div>
*/