/***** Imports *****/
// React
import React from "react";

// FontAwesome Icons
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Context
import { UserContext } from "../../App.js";

// Components
import Navbar from "../../subscript/universal/Navbar.js";
import Footer from '../../subscript/universal/Footer.js';
import CheckInDevice from "./components/CheckInDevice.js";
import CheckOutDevice from "./components/CheckOutDevice.js";
import DeviceManagement from "./components/DeviceManagement.js";
import PatronManagement from "./components/PatronManagement.js";
import Help from "./components/Help.js";
import InnerNavigationDropdown from "./components/InnerNavigationDropdown.tsx";
import ModifiedItemStatus from "./components/ModifiedItemStatus.js";

// Classes
import { Device } from "./classes/Device.js";
import { Patron } from "./classes/Patron.js";

// CSS
import "./OrganizationHomeCSS.scss";
import "./column.scss";

// Other Imports

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

/***** Main Export *****/
const OrganizationHome = () => {
    /***** Variables *****/
    const { userId } = React.useContext(UserContext);                  // UserContext for persisting state variables across pages

    const [currentDevice, setCurrentDevice] = React.useState(new Device());
    const [currentPatron, setCurrentPatron] = React.useState(new Patron());

    const [deviceDidCheckout, setDeviceDidCheckout] = React.useState(false);
    const [deviceDidCheckin, setDeviceDidCheckin] = React.useState(false);
    const [deviceDidModify, setDeviceDidModify] = React.useState(false);
    const [patronDidModify, setPatronDidModify] = React.useState(false);
    const [addingNewPatron, setAddingNewPatron] = React.useState(false);
    const [innerPageContainerStylingModifier, setInnerPageContainerStylingModifier] = React.useState("");

    const [organizationLocations, setOrganizationLocations] = React.useState([]);
    const [organizationLocationsHasBeenSet, setOrganizationLocationsHasBeenSet] = React.useState(false);
    const [organizationLocationsDoneLoading, setOrganizationLocationsDoneLoading] = React.useState(false);

    if (!organizationLocationsHasBeenSet) {
        getOrganizationLocations(userId)
        .then((response) => { 
            setOrganizationLocations(response);
            setOrganizationLocationsHasBeenSet(true);
            setOrganizationLocationsDoneLoading(false);
        });
    }

    // These ifs are needed to stop a weird error where when you would save a 
    // file and it would refresh it wouldn't like the new Patron()/Device() in the usestate
    // no clue why itStop happens but alright
    /*
    if ((currentPatron === undefined) || (currentPatron === null)) {
        setCurrentPatron(new Patron());
    }
    if ((currentDevice === undefined) || (currentDevice === null)) {
        setCurrentDevice(new Device());
    }
    */

    const addNewPatron = () => {
        setInnerPageNumber(3);
        setAddingNewPatron(true);
    }

    // For displaying different "inner pages"
    const [innerPageNumber, setInnerPageNumber] = React.useState(0);   
    const innerPageButtonStylesBaseCss = "option";     
    const [innerPageButtonStylesArray, setInnerPageButtonStylesArray] = React.useState([innerPageButtonStylesBaseCss + "--selected", innerPageButtonStylesBaseCss, innerPageButtonStylesBaseCss, innerPageButtonStylesBaseCss, innerPageButtonStylesBaseCss, innerPageButtonStylesBaseCss])

    // Responsive UI
    const [height, setHeight] = React.useState(window.innerHeight);
    const [width, setWidth] = React.useState(window.innerWidth);
    const [bigOrSmall, setBigOrSmall] = React.useState("-big");
    const [columnStylingModifier, setColumnStylingModifier] = React.useState("");

    /***** Helper Functions *****/

    /*
     *
     */
    function getLocationNameFromId(accountId) {
        for (let i = 0; i < organizationLocations.length; i++) {
            if (organizationLocations[i].account_id === accountId) {
                return organizationLocations[i].name;
            }
        }
        return "Unknown Location";
    }
    
    /* reportWindowSize
     * Updates the height and width variables based on the current height and width of the page and
     * updates the setBigOrSmall value accordingly, affecting CSS layouts on the page.
     */
    function reportWindowSize() {
        setHeight(window.innerHeight);
        setWidth(window.innerWidth);

        // For CSS 
        // ~960 go mobile?
        if (width < 900) {
            setColumnStylingModifier("--mini");
            setBigOrSmall("-small");
        }
        else {
            setColumnStylingModifier("");
            setBigOrSmall("-big");
        }
    }

    /***** UseEffects *****/
    
    // Updates window height/width when changed by user
    React.useEffect(() => {
        window.addEventListener("resize", reportWindowSize);
    });

    React.useEffect(() => {
        const onPageLoad = () => {
            setHeight(window.innerHeight);
            setWidth(window.innerWidth);
    
            // For CSS 
            // ~960 go mobile?
            if (width < 900) {
                setColumnStylingModifier("--mini");
                setBigOrSmall("-small");
            }
            else {
                setColumnStylingModifier("");
                setBigOrSmall("-big");
            }
        };

        if (document.readyState === "complete") {
            onPageLoad();
        }
        else {
            window.addEventListener("load", onPageLoad);
            return () => window.removeEventListener("load", onPageLoad);
        }

    }, [reportWindowSize]);

    // Updates current inner page number and appropriate page button css
    React.useEffect(() => {
        let styles = [innerPageButtonStylesBaseCss, innerPageButtonStylesBaseCss, innerPageButtonStylesBaseCss, innerPageButtonStylesBaseCss, innerPageButtonStylesBaseCss, innerPageButtonStylesBaseCss];
        styles[innerPageNumber] = innerPageButtonStylesBaseCss + "--selected";
        setInnerPageButtonStylesArray(styles);
    }, [innerPageNumber]);

    React.useEffect(() => {
        if (width && width < 900) {
            setInnerPageContainerStylingModifier("--mini");
        }
        else {
            setInnerPageContainerStylingModifier("");
        }
    }, [width]);

    /***** Element Creators *****/

    // Creates the buttons for the inner page navigation bar
    function InnerPageButton(label, pageNumber, borderTopLeftRadius="0px", borderTopRightRadius="0px", borderBottomLeftRadius="0px", borderBottomRightRadius="0px", isDisabled=false) {
	let buttonClassName = innerPageButtonStylesArray[pageNumber];

	if (isDisabled) {
	    buttonClassName = innerPageButtonStylesBaseCss + "--disabled";
	}
	
	return (
		<button className={buttonClassName} style={{borderTopLeftRadius: borderTopLeftRadius, borderTopRightRadius: borderTopRightRadius, borderBottomLeftRadius: borderBottomLeftRadius, borderBottomRightRadius: borderBottomRightRadius}} onClick={() => setInnerPageNumber(pageNumber)} disabled={isDisabled}>
                <span className={"option-content" + bigOrSmall}>
                    {label}
                </span>
            </button>
        );
    }

    // Returns the appropriate inner page based on the currently selected navigation
    function getActiveWindow() {
        switch(innerPageNumber) {
            case(0): return <CheckOutDevice 
                        addNewPatron={addNewPatron}
                        columnStylingModifier={columnStylingModifier}
                        currentDevice={currentDevice}
                        currentPatron={currentPatron}
                        getLocationNameFromId={getLocationNameFromId}
                        setCurrentDevice={setCurrentDevice}
                        setCurrentPatron={setCurrentPatron}
                        setDeviceDidCheckout={setDeviceDidCheckout}
                        setPagenum={setInnerPageNumber}
                        userId={userId}
                        />
            case(1): return <CheckInDevice 
                        columnStylingModifier={columnStylingModifier}
                        currentDevice={currentDevice}
                        deviceDidCheckin={deviceDidCheckin}
                        setCurrentDevice={setCurrentDevice}
                        setDeviceDidCheckin={setDeviceDidCheckin}
                        setPagenum={setInnerPageNumber}
                        userId={userId}
                        />
            case(2): return <DeviceManagement
                        columnStylingModifier={columnStylingModifier}
                        currentDevice={currentDevice} 
                        setCurrentDevice={setCurrentDevice} 
                        setDeviceDidModify={setDeviceDidModify} 
                        setPagenum={setInnerPageNumber}
                        userId={userId} 
                        />
            
            case(3): return <PatronManagement 
                        addNewPatron={addNewPatron} 
                        addingNewPatron={addingNewPatron}
                        columnStylingModifier={columnStylingModifier}
                        currentPatron={currentPatron} 
                        setCurrentPatron={setCurrentPatron} 
                        setPagenum={setInnerPageNumber}                         
                        setPatronDidModify={setPatronDidModify} 
                        userId={userId} 
                    />
            
            case(4): 
                return <Help />
            case(5): 
                return <ModifiedItemStatus
                            code={0} 
                            itemStatusDidModify={deviceDidCheckout} 
                            setPagenum={setInnerPageNumber} 
                            setCurrentDevice={setCurrentDevice} 
                            setCurrentPatron={setCurrentPatron} 
                        />
            
            case(6): 
                return <ModifiedItemStatus
                            code={1} 
                            itemStatusDidModify={deviceDidCheckin} 
                            setPagenum={setInnerPageNumber} 
                            setCurrentDevice={setCurrentDevice} 
                            setCurrentPatron={setCurrentPatron} 
                        />
            case(7): 
                return <ModifiedItemStatus 
                            code={2}
                            itemStatusDidModify={deviceDidModify} 
                            setPagenum={setInnerPageNumber} 
                            setCurrentDevice={setCurrentDevice} 
                            setCurrentPatron={setCurrentPatron} 
                        />
            case(8): 
                return <ModifiedItemStatus
                            code={3} 
                            itemStatusDidModify={patronDidModify} 
                            setPagenum={setInnerPageNumber} 
                            setCurrentDevice={setCurrentDevice} 
                            setCurrentPatron={setCurrentPatron} 
                        />
            case(9): 
                return <ModifiedItemStatus
                            code={4} 
                            itemStatusDidModify={patronDidModify} 
                            setPagenum={setInnerPageNumber} 
                            setCurrentDevice={setCurrentDevice} 
                            setCurrentPatron={setCurrentPatron} 
                        />

            default: 
                return <CheckOutDevice 
                            addNewPatron={addNewPatron}
                            columnStylingModifier={columnStylingModifier}
                            currentDevice={currentDevice}
                            currentPatron={currentPatron}
                            setCurrentDevice={setCurrentDevice}
                            setCurrentPatron={setCurrentPatron}
                            setDeviceDidCheckout={setDeviceDidCheckout}
                            setPagenum={setInnerPageNumber}
                            userId={userId}
                            width={width}
                            getLocationNameFromId={getLocationNameFromId}
                        />       
            }
    }

    /***** Returned Page *****/
    return (
        <div className="wrapper" style={{overflow: "hidden"}}>
            {/* Row 1 */}
            {/* <div className="grid-navbar">
                <Navbar />
            </div> */}

            {/* Row 2 */}
            {(width >= 900) && (
                <div className="inner-page-navbar">
                    {InnerPageButton("Check Out Device", 0, "6px", "0px", "6px", "0px")}
                    {InnerPageButton("Check In Device", 1)}
                    {InnerPageButton("Device Management", 2)}
                    {InnerPageButton("Patron Management", 3)}
                    {InnerPageButton("Help", 4, "0px", "6px", "0px", "6px", true)}
                </div>
            )}

            {(width < 900) && (
                <div className="inner-navigation">
                    <div style={{display: "flex"}}>
                        <div style={{margin: "auto"}}>
                            <InnerNavigationDropdown 
                                innerPageNumber={innerPageNumber} 
                                setInnerPageNumber={setInnerPageNumber} 
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Row 3 */}
            <div className="spacer" />

            {/* Row 4 */}
            <div className={"inner-page-container" + innerPageContainerStylingModifier}>
                {getActiveWindow()}
            </div>

            {/* 
            /* Row 5 *
            <div className="middle">
                Height: {height}
                <br/>
                Width: {width}
                <br/>
                PageNum: {innerPageNumber}
            </div>

            <div className="middletest">
                OrganizationHome.js Test Page
            </div>
            */}

            {/* Row Footer */}
            {/* <div className="grid-footer">
                <Footer />
            </div> */}
        </div> 
    );

}

export default OrganizationHome;
