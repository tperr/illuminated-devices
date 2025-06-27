import {useState, useEffect, useContext, useCallback} from 'react';
import React from "react";
import Navbar from '../subscript/universal/Navbar.js';
import Footer from '../subscript/universal/Footer.js';

// Image cropper
import EasyCrop from "../subscript/profile/Easy-Crop.js";
import { UserContext } from '../App.js';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';

// Material UI Tooltip
import Tooltip from "@mui/material/Tooltip";

// FontAwesome Icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Can this be combined with the identical function in DeviceManagement.js and LocationManagement.js ?
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

const Profile = () => {
    const { userId, userDetails } = React.useContext(UserContext);

    // Current details from userDetails
    const [userProfileImage, setUserProfileImage] = useState();
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [registrationDate, setRegistrationDate] = useState("");
    const [username, setUsername] = useState("");
    const [accountType, setAccountType] = useState("");

    // To upload new profile image
    const [selectedImage, setSelectedImage] = useState();
    const [isFilePicked, setIsFilePicked] = useState();
    const [imageFinishedUploading, setImageFinishedUploading] = useState(false);

    // Will be changed later haha
    let loginError = false;

    // For Locations to identify their Organizations
    const [organizationLocationList, setOrganiationLocationList] = useState([]);

    useEffect(() => {
        return;
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
                setOrganiationLocationList(response);
            }); 
    }, [userId]);

    // Pull account details for display
    useEffect(() => {
        if ((userDetails !== null) && (userDetails !== undefined)) {
            if ((userDetails[0] !== null) && (userDetails[0] !== undefined)) {
                switch(userDetails[0]) {
                    case(0):
                        setAccountType("Developer");
                        break;
                    case(1):
                        setAccountType("Admin");
                        break;
                    case(2):
                        setAccountType("Tutor");
                        break;
                    case(3):
                        setAccountType("Super Tutor");
                        break;
                    case(4):
                        setAccountType("Organization");
                        break;
                    case(5):
                        setAccountType("Location");
                        break;
                    default:
                        setAccountType("");
                }
            }
            if ((userDetails[1] !== null) && (userDetails[1] !== undefined)) {
                if ((userDetails[2] !== null) && (userDetails[2] !== undefined)) {
                    setName(userDetails[1] + " " + userDetails[2]);
                }
                else {
                    setName(userDetails[1]);
                }
            }
            else {
                setName("NULL");
            }
            if ((userDetails[3] !== null) && (userDetails[3] !== undefined)) {
                setPhone(userDetails[3]);
            }
            else {
                setPhone("NULL");
            }
            if ((userDetails[4] !== null) && (userDetails[4] !== undefined)) {
                setEmail(userDetails[4]);
            }
            else {
                setEmail("NULL");
            }
            if ((userDetails[5] !== null) && (userDetails[5] !== undefined)) {
                const dateObj = new Date(userDetails[5] * 1000);
                let monthStr;
                switch(dateObj.getMonth()) {
                    case(0): 
                        monthStr = "January";
                        break;
                    case(1):
                        monthStr = "February";
                        break;
                    case(2):
                        monthStr = "March";
                        break;
                    case(3):
                        monthStr = "April";
                        break;
                    case(4):
                        monthStr = "May";
                        break;
                    case(5):
                        monthStr = "June";
                        break;
                    case(6):
                        monthStr = "July";
                        break;
                    case(7):
                        monthStr = "August";
                        break;
                    case(8):
                        monthStr = "September";
                        break;
                    case(9):
                        monthStr = "October";
                        break;
                    case(10):
                        monthStr = "November";
                        break;
                    default: 
                        monthStr = "December";
                }
                const dateStr = monthStr + " " + dateObj.getFullYear() + ".";
                setRegistrationDate(dateStr);
            }
            else {
                setRegistrationDate("NULL");
            }
            if ((userDetails[6] !== null) && (userDetails[6] !== undefined)) {
                setUsername(userDetails[6]);
            }
            else {
                setUsername("NULL");
            }
        }
    }, [userDetails]);

    // Pull user profile image
    useEffect(() => {
        if ((userId !== null) && (userId !== undefined)) {
            setUserProfileImage("https://illuminated.cs.mtu.edu/ark/u/" + userId + "/pfp");
        }
    }, [userId]);

    // Profile image functions start
    const changeHandler = (e) => {
        setSelectedImage(URL.createObjectURL(e.target.files[0]));
        setIsFilePicked(true);
    };

    const handleSubmission = async e => {
        e.preventDefault();
        document.getElementById('pfpUploadInput').click();
    };

    const handlePfpUploadPopupClose = async e => {
        e.preventDefault();
        setIsFilePicked(false);
        setSelectedImage(null);
    }
    // Profile image functions end

    if (userId) {
        return(
            <div id="home">
                <div id="page-container">
                    <div id="content-wrap">
                        <Navbar /> 
                        <div id="pf-pageCont">
                            <div id="pf-userDetails">
                                <div className="display-flex">
                                    <div className="category">
                                        Profile
                                    </div>
                                    {(userDetails !== undefined) && (userDetails !== null) && (userDetails[0] === 5) && (organizationLocationList.length > 0) && (organizationLocationList[0].name !== undefined) && (
                                        <div className="managed-by">
                                                MANAGED BY <span style={{fontFamily: "Poppins-EB"}}>{organizationLocationList[0].name + " "}</span> 

                                                <Tooltip title={
                                                    <React.Fragment>
                                                        <div style={{fontFamily: "Poppins-EB", textTransform: "uppercase"}}>
                                                            This account is managed
                                                        </div>
                                                        <div className="login-divider" style={{backgroundColor: "white", height: "0.1em"}}/>
                                                        <div>
                                                            <span style={{fontFamily: "Poppins"}}>
                                                                Your account is managed by the organization:
                                                            </span>
                                                            <span style={{fontFamily: "Poppins-SB"}}>
                                                                <br />
                                                                {organizationLocationList[0].name}
                                                                <br />
                                                                {organizationLocationList[0].phone}
                                                                <br />
                                                                {organizationLocationList[0].email}
                                                                <br />
                                                                {organizationLocationList[0].street_address}, {organizationLocationList[0].city}, {organizationLocationList[0].state}, {organizationLocationList[0].zip}
                                                            </span>
                                                        </div>
                                                    </React.Fragment>
                                                }>
                                                    <span style={{cursor: "pointer"}}> 
                                                        <FontAwesomeIcon icon="circle-info" />
                                                    </span>
                                                </Tooltip>
                                        </div>
                                    )}
                                </div>
                                <div className="category-div"></div>
                                
                                <div id="flexCont">
                                    <div id="pfpCont">
                                        <img src={userProfileImage} alt="" className="pfp"></img> <br/>
                                        <input id="pfpUploadInput" type="file" name="file" onChange={changeHandler} accept="img/png, img/jpeg, img/jpg" hidden />
                                        <button type="file" className="pf-button" onClick={handleSubmission}>
                                            <FontAwesomeIcon icon="pen-to-square"/> 
                                            {" Update Image"}
                                        </button>

                                        {!imageFinishedUploading && (
                                        <Popup id="pfpUploadPopup" contentStyle={{backgroundColor: "transparent", border: "1px transparent solid"}} open={isFilePicked} position="center" onClose={handlePfpUploadPopupClose}>
                                            <div className="monokuma">
                                                <EasyCrop image={selectedImage} userId={userId} imageFinishedUploading={imageFinishedUploading} setImageFinishedUploading={setImageFinishedUploading} />
                                            </div>
                                        </Popup>
                                        )}

                                    </div>

                                    <div id="detailElement">
                                        {/* Account Type */}
                                        <span className="title">{accountType}</span> 
                                        <br />
                                        {/* Username */}
                                        <span className="title">@{username}</span>

                                        <div className="login-divider" />

                                        <form id="login-form" className="login-form" > {/* onSubmit={handleSubmit}> */}
                                            {/* Name */}
                                            <span className="title">Display Name</span>
                                            <div className="input-field-container">
                                                <input
                                                className="input-field"
                                                type = "text"
                                                placeholder = ""
                                                defaultValue={name}
                                                required
                                                disabled={true}
                                                // onChange={(e) => setName(e.target.value)}
                                                />
                                            </div>

                                            <div className="login-divider" />

                                            {/* Phone */}
                                            <span className="title">Phone</span>
                                            <div className="input-field-container">
                                                <input
                                                className="input-field"
                                                type = "text"
                                                placeholder = ""
                                                defaultValue={phone}
                                                required
                                                disabled={true}
                                                // onChange={(e) => setPassword(e.target.value)}
                                                />
                                            </div>

                                            <div className="login-divider" />

                                            {/* Email */}
                                            <span className="title">Email</span>
                                            <div className="input-field-container">
                                                <input
                                                className="input-field"
                                                type = "text"
                                                placeholder = ""
                                                defaultValue={email}
                                                required
                                                disabled={true}
                                                // onChange={(e) => setName(e.target.value)}
                                                />
                                            </div>

                                            {/* Registration Date */}
                                            <span className="title">Member since {registrationDate}</span>

                                            <div className="login-divider" />

                                            <button disabled={true} type="submit" className="button" style={{color: "white", backgroundColor: "gray", cursor: "not-allowed"}}>Profile Editing Not Currently Available</button>
                                    
                                            {loginError && (
                                            <div id="login-error">
                                                <div className="login-error">
                                                    Invalid username or password. 
                                                    <br/>
                                                    Please try again or click Forgot password to reset it.
                                                </div>
                                            </div>
                                            )}
                                        </form>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Footer />
                </div>
            </div>
        );
    }
}

export default Profile;


/*
<div className="cropper">
    
    
    <Cropper
    image={selectedFile}
    aspect={CROP_AREA_ASPECT}
    crop={crop}
    zoom={zoom}
    onCropChange={setCrop}
    onZoomChange={setZoom}
    zoomWithScroll={false}
    onCropAreaChange={(croppedArea) => {
        setCroppedArea(croppedArea);
    }}
    />

</div>

<div className="controls">
    {/*
    <Slider
    value={zoom}
    min={1}
    max={3}
    step={0.1}
    aria-labelledby="Zoom"
    onChange={(e, zoom) => setZoom(zoom)}
    classes={{ container: 'slider' }}
    />
    
</div>
*/

/*
<div className="viewer">
    <div style={{position: "absolute"}}>{croppedArea && <Output croppedArea={croppedArea} />}</div>
</div>
*/

/* Only for viewer
const Output = ({ croppedArea }) => {
  const scale = 100 / croppedArea.width;
  const transform = {
    x: `${-croppedArea.x * scale}%`,
    y: `${-croppedArea.y * scale}%`,
    scale,
    width: "calc(100% + 0.5px)",
    height: "auto"
  };

  const imageStyle = {
    transform: `translate3d(${transform.x}, ${transform.y}, 0) scale3d(${transform.scale},${transform.scale},1)`,
    width: transform.width,
    height: transform.height
  };

  return (
    <div
      className="output"
      style={{ paddingBottom: `${100 / CROP_AREA_ASPECT}%` }}
    >
      <img src="https://illuminated.cs.mtu.edu/ark/u/aa1ac49b-1614-11ed-a1ce-0050569fc3a3/pfp" alt="" style={imageStyle} />
    </div>
  );
};
*/