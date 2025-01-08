import logo from './logo.svg';
import './App.css';
import React, {useEffect, useState, useRef, createContext} from 'react';
import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import jwt_decode from 'jwt-decode';
import { useCookies } from "react-cookie";

// Pages
import NotFound from './pages/NotFound';
import Home from './pages/Home';
import Login from './pages/Login';
import LoginAuth from './pages/Login_Auth';
import Logout from './pages/Logout';
import AdminHomepage from './pages/AdminHomepage';
import Landing from './pages/Landing';
import Profile from './pages/Profile';
// import ProviderHomepage from './pages/Provider/Provider';
import MeetingTesting from './pages/MeetingTest.js';
import LocationManagement from './pages/LocationManagement/LocationManagement.js'; 
import OrganizationHome from './pages/OrganizationHome/OrganizationHome.js';
import Tutor from './pages/Tutor/Tutor.js';
import SuperTutor from './pages/SuperTutor/SuperTutor.js';
import IPad from './pages/Device/iPad/iPad.js';
import SplitPageTest from './pages/SplitPageTest';
import Provider from './pages/Provider/Provider.js';

//


// FontAwesome Icons
import { library } from '@fortawesome/fontawesome-svg-core';
import { 
	faToggleOn, 
	faToggleOff, 
	faExclamationTriangle, 
	faMobile, 
	faLaptop, 
	faLink, 
	faUser, 
	faUsers, 
	faPenToSquare, 
	faMobileScreen, 
	faArrowRightArrowLeft, 
	faMagnifyingGlass, 
	faCalendar, 
	faNoteSticky, 
	faSquarePlus, 
	faHand, 
	faXmarkSquare, 
	faSquareCheck, 
	faPhone, 
	faEnvelope, 
	faCircleExclamation, 
	faTabletScreenButton, 
	faCircle, 
	faRightToBracket, 
	faAnglesRight, 
	faArrowRight, 
	faArrowLeft, 
	faCircleQuestion, 
	faCircleInfo, 
	faCircleXmark, 
	faCircleCheck, 
	faScrewdriverWrench, 
	faHeart, 
	faBook, 
	faMaximize, 
	faMinimize, 
	faGear, 
	faMicrophone, 
	faMicrophoneSlash, 
	faVideo, 
	faVideoSlash, 
	faDesktop, 
	faXmark, 
	faPeopleGroup, 
	faRightFromBracket, 
	faChevronDown, 
	faWindowMaximize, 
	faWindowMinimize, 
	faWindowRestore, 
	faCaretDown, 
	faCaretUp, 
	faComments, 
	faMessage,
	faCirclePause,
	faSquarePhone,
	faStar
} from '@fortawesome/free-solid-svg-icons';
import { 
	faCircle as faRegCircle, 
	faClipboard
} from '@fortawesome/free-regular-svg-icons';
import { 
	faClipboard as faSolidClipboard, 
	faArrowsRotate 
} from '@fortawesome/free-solid-svg-icons';
library.add(
	faStar,
	faSquarePhone,
	faCirclePause,
	faArrowsRotate, 
	faToggleOn, 
	faToggleOff, 
	faExclamationTriangle, 
	faMobile, 
	faLaptop, 
	faLink, 
	faUser, 
	faUsers, 
	faPenToSquare, 
	faMobileScreen, 
	faArrowRightArrowLeft, 
	faMagnifyingGlass, 
	faCalendar, 
	faNoteSticky, 
	faSquarePlus, 
	faHand, 
	faXmarkSquare, 
	faSquareCheck, 
	faPhone, 
	faEnvelope, 
	faCircleExclamation, 
	faTabletScreenButton, 
	faCircle, 
	faRegCircle, 
	faRightToBracket, 
	faAnglesRight, 
	faArrowRight, 
	faArrowLeft, 
	faCircleQuestion, 
	faCircleInfo, 
	faCircleXmark, 
	faCircleCheck, 
	faScrewdriverWrench, 
	faHeart, 
	faBook, 
	faMaximize, 
	faMinimize, 
	faGear, 
	faMicrophone, 
	faMicrophoneSlash, 
	faVideo, 
	faVideoSlash, 
	faDesktop, 
	faXmark, 
	faPeopleGroup, 
	faRightFromBracket, 
	faChevronDown, 
	faWindowMaximize, 
	faWindowMinimize, 
	faWindowRestore, 
	faCaretDown, 
	faCaretUp, 
	faComments, 
	faMessage, 
	faClipboard, 
	faSolidClipboard
);

import 'react-notifications/lib/notifications.css';
import { NotificationContainer } from 'react-notifications';

function setStorage(type, id, key) {
	if (type === "local") {
		if (key === null) {
			localStorage.removeItem(id);
		}
		else {
			localStorage.setItem(id, key);
		}
	}
	else {
		if (key === null) {
			sessionStorage.removeItem(id);
		}
		else {
			sessionStorage.setItem(id, key);
		}
	}
}

async function getToken() {
	// React/JS has no knowledge of whether or not the httpOnly refresh_token cookie exists
	// So, React asks Blacklight to refresh its access_token and it listens to Blacklight's response to determine what to do
    const fullAddr = "https://illuminated.cs.mtu.edu/blacklight/api/token/refresh";
    var token;
	var session;

    await fetch(fullAddr, {
        method: 'GET',
        headers: {
            'Content-type': 'application/json',
        },
    })
    .then(response => {
		// console.log(response)
        if (response.ok) {
            return response.json()
        }
        throw response;
    })
    .then(data => {
        var received_response = data.data; // object: data, key: data (from api)
		if (received_response["error"] === "invalid_token") {
			token = null;
			session = null;
		}
		else if (received_response["jwt"]) {
			token = received_response["jwt"]
			session = received_response["session"]
		}
		else {
			throw received_response;
		}
    })
    .catch(error => {
        console.error("Error fetching data in App.handleRefreshToken(): ", error);
		token = null;
		session = null;
    })
    .finally(() => {
		//
    })

	return {"token": token,
			"session": session};
}

async function getUserDetails(userId) {
	const fullArkAddr = "https://illuminated.cs.mtu.edu/ark/u/" + userId + "/details";
	const fullBlacklightAddr = "https://illuminated.cs.mtu.edu/blacklight/u/" + userId + "/name";
	const authorization = 'Bearer ' + sessionStorage.getItem("BLIGHT");
	let accountDetails = [];

	await fetch(fullArkAddr, {
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
		var received_response = data.data[0];
		if (received_response["error"] === "invalid_token") {
			console.error("error code found in receive account details (App.js -> getUserDetails() -> Ark request -> (then) received_response[\"error\"]");
			// What to do in an error situation?
		}
		else if (received_response["account_scope"] >= 0) {
			accountDetails[0] = received_response["account_scope"];
			if (received_response["account_scope"] == 6)
			{
				accountDetails[1] = received_response["isIpad"];
			}
			else
			{
				if ((received_response["account_scope"] === 4) || (received_response["account_scope"] === 5)) {
					accountDetails[1] = received_response["name"];
				}
				else {
				accountDetails[1] = received_response["fname"];
				accountDetails[2] = received_response["lname"];
				}
				accountDetails[3] = received_response["phone"];
				accountDetails[4] = received_response["email"];
				accountDetails[5] = received_response["registration_date"];
			}
		}
		else {
			throw received_response;
		}
	})
	.catch(error => {
		console.error("error code found in receive account details (App.js -> getUserDetails() -> Ark request -> (catch) received_response[\"error\"] ", error);
	})
	.finally(() => {
		//
	})

	await fetch(fullBlacklightAddr, {
		method: 'GET',
		headers: {
			// Could put authorization here, might be worth considering
			// Would just use the same JWT probably but I don't think I wrote any way for Blacklight to validate it yet
			// (Could just copy from Ark)
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
			console.error("error code found in receive account details (App.js -> getUserDetails() -> Blacklight request -> received_response[\"error\"]");
			// What to do in an error situation?
		}
		else if (received_response["username"]) {
			accountDetails[6] = received_response["username"];
		}
		else {
			throw received_response;
		}
	})
	.catch(error => {
		console.error("Error fetching data in App.getUserDetails: ", error);
	})
	.finally(() => {
		//
	})

	return accountDetails;
}

export const UserContext = React.createContext(null);

function App() {
    const [token, setToken] = useState();
	const useEffectDidLoad = useRef(false);
	const handleTokenStatusDidLoad = useRef(false);

	// Account details
	const [userId, setUserId] = useState(null);
	const [userDetails, setUserDetails] = useState(null);

	// Developer accounts can appear as other account types
	const [cookies, setCookies] = useCookies(['appearingAs']);
	const [appearingAs, setAppearingAs] = useState(cookies.appearingAs);
	
	useEffect(() => {
		if((appearingAs !== null) && (appearingAs !== undefined)) {
			setCookies('appearingAs', appearingAs, { path: '/' , sameSite: true, secure: true});
		}
	}, [appearingAs, setCookies]
	);

	useEffect(() => {
		const handleRefreshToken = async e => {
			const result = await getToken();

			if ((result["token"] !== null) && (result["token"] !== undefined)) {
				// Try to combine these ideally
				// setToken(result);
				setStorage("session", "BLIGHT", result["token"]);
				setStorage("local", "session", result["session"]);
				setStorage("session", "unauth", null);

				const decodedJwt = jwt_decode(result["token"]);
				let id = decodedJwt["sub"]
				return id;
			}
			else {
				// Try to combine these ideally
				// setToken(null);
				setStorage("session", "BLIGHT", null);
				setStorage("local", "session", null);
				setStorage("session", "unauth", true); 
				return null;
			}
		}

		if (useEffectDidLoad.current === false) {
			useEffectDidLoad.current = true; 
			handleRefreshToken()
			.then((response) => {
				if (handleTokenStatusDidLoad.current === false) {
					handleTokenStatusDidLoad.current = true;
					if (response !== userId) {
						setUserId(response)
					}
					handleTokenStatus(response);
				}
			});
		}
	}, [userId]);

	useEffect(() => {
		const handleAccountDetails = async e => {
			const details = await getUserDetails(userId);
			return details;
		}

		if ((userId !== null) && (userId !== undefined)) {
			handleAccountDetails()
			.then((response) => {
				if (response !== null) {
					setUserDetails(response);
				}
			});
		}
	}, [userId]);

	const handleTokenStatus = (response) => {
		if (response !== null) {
			// This questionably might not do anything but it doesn't hurt
			if (window.location.pathname === "/login") {
				window.location.replace("https://illuminated.cs.mtu.edu/home");
			}
		}
		else {
			// Redirect unauthorized users to login
			if ((window.location.pathname !== "/login") && (window.location.pathname !== "/login/auth" && (window.location.pathname !== "/"))) {
				// Just for testing
				if (window.location.pathname !== "/kirktest") {
					window.location.replace("https://illuminated.cs.mtu.edu/login");
				}
			}
		}
	}

	return (
		<BrowserRouter>
			<UserContext.Provider value={{ userId: userId, userDetails: userDetails, appearingAs: appearingAs, setUserId: setUserId, setUserDetails: setUserDetails, setToken: setStorage, setAppearingAs: setAppearingAs }}>
				<Routes>
					{/* Authentication Check/Login Routes */}
					<Route path="/login" element={<Login />}/>
					<Route path="/login/auth" element={<LoginAuth setToken={setStorage} />} />
					<Route path="/logout" element={<Logout setToken={setStorage} />} />

					{/* Other Routes */}
					<Route path="/admin" element= {<AdminHomepage />}/>
					<Route path="/home" element={<Home />} />
					<Route path="/profile" element={<Profile />} />
					<Route path="/meetingtest" element={<MeetingTesting/>}/>
					<Route path="/manage" element={<LocationManagement/>}/>
					<Route path="/tutor" element={<Tutor/>}/>
					<Route path="/supertutor" element={<SuperTutor/>}/>
					<Route path="/ipad" element={<IPad/>}/>
					<Route path="/desktop" element={<IPad/>}/>
					

					{/* Not Found */}
					<Route path="/kirktest" element={<Provider />}/>
					<Route path="/" element={<Landing />} />
					<Route path="*" element={<Navigate to="/" /> } />
				</Routes>
			</UserContext.Provider>
			
			<NotificationContainer />
		</BrowserRouter>
	);
}

export default App;