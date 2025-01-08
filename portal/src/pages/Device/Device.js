import React, {useContext, useState, useEffect} from "react";
import { io } from "socket.io-client";
import { UserContext } from "../../App.js";
import IPad from "./iPad/iPad.js";
import Desktop from "./Desktop/Desktop.js";
import Patron from "./iPad/Patron/Patron.js";

import Category from "../OrganizationHome/components/Category.js";

import "./Device.scss";
import "./../OrganizationHome/components/iteminfo.scss";
import CreateDevice from "./CreateDevice.js";

async function getDeviceInfo(id) {
    const fullAddr = "https://illuminated.cs.mtu.edu/ark/devices/" + id + "/info";
	const authorization = 'Bearer ' + sessionStorage.getItem("BLIGHT");
    let response = [];
	response = await fetch(fullAddr, {
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
	.catch(error => {
		console.error("error code not found in (Device.js -> getDeviceInfo() -> Ark request -> (catch) received_response[\"error\"] ", error);
	})
	.finally(() => {
		//
	})

	return response; 
}

async function joinMeeting(id) {
    const fullAddr = "https://illuminated.cs.mtu.edu/ark/patron/get_meeting_info";
	const authorization = 'Bearer ' + sessionStorage.getItem("BLIGHT");
    let response = await fetch(fullAddr, {
		method: 'POST',
		headers: {
			'Authorization': authorization,
			'Content-type': 'application/json',
		},
        body: JSON.stringify({
            "id": id
        },)
	})
	.then(response => {
		if (response.ok) {
			return response.json()
		}
		throw response;
	})
	.catch(error => {
		console.error("error code found in (Patron.js -> joinMeeting()\n", error);
        return "error";
	})
	.finally(() => {
		//
	})

	return response;
}

const Device = () =>
{
    const { userId } = React.useContext(UserContext);
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [patronId, setPatronID] = useState();
    const [isIpad, setIsIpad] = useState();
    const [deviceId, setDeviceID] = useState("id");

    const [joiningMeeting, setJoiningMeeting] = useState(false);
    const [waitingForMeeting, setWaitingForMeeting] = useState(true);

    const [meetingId, setMeetingId] = useState();

    const [socketInstance, setSocketInstance] = useState();
    const [setServerURL, serverURL] = useState("https://illuminated.cs.mtu.edu/");
    let socketDestroyer = () => {};

    const [permissions, setPermissions] = useState({
        "ss":false, // screen share
    });

    const states = Object.freeze({
        GetDeviceInfo: 0,
        SelectCreateDevice: 1,
        CreateDevice: 2,
        SelectDevice: 8,
        CheckCheckedOut: 3,
        PatronlessSocket: 4,
        PatronedSocket: 5,
        NotCheckedOut:6,
        CheckedOut:7
    });

    const [currentState, setCurrentState] = useState(0);

    useEffect(() => {
        //socketDestroyer = socketSetup();
        return () => {socketDestroyer()};
    }, [serverURL])
	
    useEffect(() => {
	    if (currentState === states.GetDeviceInfo || currentState === states.NotCheckedOut)
            setCurrentState(states.CheckCheckedOut);

    }, [patronId]);



    function socketSetup(pId) {
        const socket = io({
            transports: ["polling", "websocket", "webtransport"],
            cors: {
                origin: serverURL,
            },
            query:{
                "uuid":pId,
                "type":"patron",
            }
        });
        setSocketInstance(socket);
  
        socket.on("connect", (data) => {
            const engine = socket.io.engine;
  
            engine.on("upgrade", () => {
                //console.log("upgraded,", engine.transport.name); 
            });
  
            engine.on("reconnect_error", (error) => {
                console.error(error);
            });
  
            engine.on("error", (error) => {
                console.error(error);
            });
        });
  
        socket.on("disconnect", (reason, details) => {
            if (socket.active)
            {
                //console.log("Socket disconnected, reconnecting", reason, details ? details.message : "no details");
            }
            else
            {
                console.error("Socket disconnected")
                console.error(reason);
                if (details)
                {
                    console.error(details.message);
                    console.error(details.description);
                    console.error(details.context);
                }
            }
        });

        socket.on("patron_join_tutor", (data) => {
            joinMeeting(meetingId).then((response) =>{
                //console.log("jonied meeting",)
                setJoiningMeeting(true);
                setWaitingForMeeting(false);

            });
        });


        socket.on("mq_cleared", (data) => {
            // what happens to a patron in the queue here??
        });

        socket.on("checked_out", (data) => {
            setCurrentState(states.getDeviceInfo);
        });

        socket.on("device_checkout", (data) => {
            setCheckedOut(data["status"]==="checked out");
        });

        socket.on("patron_permissions", (data) => {
            // true if give false if take
            let perm = data["permission"]
            let op = (data["action"] === "give" ? true : 
                      data["action"] === "take" ? false : 
                      data["action"]);
            let updated = {}
            updated[perm] = op;

            setPermissions(permissions => ({
                ...permissions,
                ...updated
            }));
        });
  
  
        socket.onAny((eventName, ...args) => {
            console.log(eventName);
            console.log(args)
        })
  
        socket.on("connect_error", (err) => {
            console.error(err.req);
            console.error(err.code);
            console.error(err.message);
            console.error(err.context);
        });
  
        return function cleanup() {
            socket.disconnect();
        };
    }

    const updateSelectedDevice = (device) => 
    {
        //console.log(device.id)
        setSelectedDevice(device);
        setPatronID(device.patronId);
        setDeviceID(device.id);
        localStorage.setItem(JSON.stringify(userId), JSON.stringify(device.id))
    }

    if (userId) {
        //console.log(currentState, patronId);
        switch (currentState)
        {
        case states.GetDeviceInfo: // 0
            //console.log(patronId)
            const dId = JSON.parse(localStorage.getItem(JSON.stringify(userId)));
            if (dId) {
            //console.log("e")
                // this account is associated with this device with id storageItems
                setDeviceID(dId);
                getDeviceInfo(dId)
                .then((response) => {
                    //console.log(response[0]);
                    setIsIpad(response[0][4]);
                    setPatronID(response[0][1]); // if null/undefined not checked out
                   
                })
                .catch((e) => {
                    console.error("there was an error getting device info");
                    console.error(e);
                })
                setCurrentState(states.CheckCheckedOut);
            }
            else
                setCurrentState(states.SelectCreateDevice);
            return;
        case states.SelectCreateDevice: // 1
            return (
                <div className="assign-page">
                    <h2>This device has not been assigned to a patron... <br></br> Please choose an option below:</h2>
                    <div className="assign-button-horiz">
                        <button className="assign-button" onClick={() => setCurrentState(states.SelectDevice)}>Assign to existing device</button>
                        <button className="assign-button-green" onClick={() => {setCurrentState(states.CreateDevice)}}>Assign to new device</button>
                    </div>
                </div>
            );
            
        case states.CreateDevice: // 2
            return (
                <CreateDevice
                    forward={(device) => {setCurrentState(states.CheckCheckedOut); updateSelectedDevice(device)}}
                    backward={() => setCurrentState(states.GetDeviceInfo)}
                    userId={userId}
                />
            );
        case states.CheckCheckedOut: // 3
            //console.log(patronId)
            if (patronId) // not null/undefined
                setCurrentState(states.PatronedSocket);
            else
                setCurrentState(states.PatronlessSocket);
            break;
        case states.PatronlessSocket: // 4
            //console.log(socketInstance, socketInstance === undefined)
            if (socketInstance) // check if socket is currently initted
                socketInstance.emit("update_id", {"p_id": deviceId});
            else
                socketDestroyer = socketSetup(deviceId);
            setCurrentState(states.NotCheckedOut);
            break;
        case states.PatronedSocket: // 5
            if (socketInstance) // check if socket is currently initted
                socketInstance.emit("update_id", {"p_id": patronId});
            else
                socketDestroyer = socketSetup(patronId);
            setCurrentState(states.CheckedOut);
            break;
        case states.NotCheckedOut: // 6
            return (
                <div>
                    <button onClick={() => {localStorage.removeItem(JSON.stringify(userId)); setCurrentState(states.SelectCreateDevice)}}> Unassign device <b>REMOVE THIS WHEN DONE</b> </button>
                    <h1>Looks like this device has not been checked out...</h1>
                    <h2>Please alert a librarian to get assistance in checking out this device.</h2>
                </div>
            );
        case states.CheckedOut: // 7
            if (isIpad === 1)
            {
                return (<Patron
                    patronId={patronId} 
                    meetingId={meetingId} 
                    setMeetingId={setMeetingId}
                    joiningMeeting={joiningMeeting}
                    setJoinMeeting={setJoiningMeeting}
                    socketInstance={socketInstance}
                    />)
            }
            else
            {
                return (
                <Desktop
                    permissions={permissions} 
                    accountId={userId}
                    patronId={patronId} 
                    meetingId={meetingId} 
                    setMeetingId={setMeetingId}
                    joiningMeeting={joiningMeeting}
                    setJoinMeeting={setJoiningMeeting}
                    waitingForMeeting={waitingForMeeting}
                    setWaitingForMeeting={setWaitingForMeeting}
                    socketInstance={socketInstance}
                    />)
            }
            break;
        case states.SelectDevice: // 8
            return (
                <div className="display-box2">
                    Assign to an Existing Device
                    <Category
                        name="devices" 
                        highlightSelected={selectedDevice} 
                        userId={null}
                        getItem={updateSelectedDevice}
                        showDetailsButton={true}
                        showDeviceStatus={0}
                    /> 
                    <button className={selectedDevice == null ? "confirm-btn-gray" : "confirm-assign-btn"} onClick={() => {selectedDevice && setCurrentState(states.CheckCheckedOut)}}>Choose selected device</button>
                
                </div>
            );
        default:
            console.error("Bad state: ", currentState);
        }
        
    }
}

export default Device;
