import React, {useState, useEffect, useRef} from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Popup from 'reactjs-popup';

import "./roomBox.scss";
import Tooltip from '@mui/material/Tooltip';
import { hover } from "@testing-library/user-event/dist/hover";


async function updateDeviceNote(id, note) {
    const fullAddr = "https://illuminated.cs.mtu.edu/ark/tut/update_device_note";
	const authorization = 'Bearer ' + sessionStorage.getItem("BLIGHT");
    let response = await fetch(fullAddr, {
		method: 'POST',
		headers: {
			'Authorization': authorization,
			'Content-type': 'application/json',
		},
        body: JSON.stringify({
            "id": id,
            "notes": note,
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

async function patronJoinQueue(meetingId) {
    const fullAddr = "https://illuminated.cs.mtu.edu/ark/tut/patron_join_meeting";
    const authorization = 'Bearer ' + sessionStorage.getItem("BLIGHT");
    let status;
    let body = {
        "id": meetingId
    }

    status = await fetch(fullAddr, {
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
    .catch(error => {
        console.error("error code found in serviceBox (serviceBox.js -> patronJoinQueue()", error);
        console.log(error);
        return error;
    })
    .finally(() => {
        //
    })

    return status; 
}

async function getPatronNotes(id) {
    const fullAddr = "https://illuminated.cs.mtu.edu/ark/tut/get_patron_notes/";
    const authorization = 'Bearer ' + sessionStorage.getItem("BLIGHT");
    let response = [];
    response = await fetch(fullAddr + id + "/", {
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
        console.error("error code found in (Tutor.js -> getPatronNotes()", error);
            return error;
        })
        .finally(() => {
        //
        })
    return response;
}

const ServiceBox = (props) =>
{
    const [selectedDevice, setSelectedDevice] = useState();
    const [notes, setNotes] = useState("");
    const [selectPatron, setSelectPatron] = useState(null);
    const patronRef = useRef(null);
    const [assigning, setAssigning] = useState(false);
    const [devNoting, setDevNoting] = useState(false);
    //console.log(props.devices);
    const handleNoteChange = (e) => {
        const value = e.target.value;
        setNotes(value);
    };

    const handlePatronClick = (patronId) => {
        setSelectPatron(selectPatron === patronId ? null: patronId);
    }

    const handleClose = (option) => {
        setSelectPatron(null);
    }

    const joinMeeting = (patron) =>
        {
          // remove person from queue call
          patronJoinQueue(patron[0]);
          getPatronNotes(patron[1])
          .then((response) => {
    
            //console.log(response, patron);
            if (response["NOTES"] === "ERROR")
              throw Error("ERROR GETTING NOTES");
            props.setPatronNotes(response["NOTES"])
          })
          .catch(console.error);
    
          props.socketInstance.emit("patron_join_tutor", {"p_id":patron[1], "m_id":patron[0]});
          props.setMeetingId(patron[0]);
          props.setMeetingTopic(patron[6]);
          props.setPatron(patron);
    
        }

    const updateNote = () => {
        let curDevice = [... selectedDevice]
        let curDevices = [... props.devices]

        curDevice[3] = notes;
        setSelectedDevice(curDevice);

        curDevices = curDevices.map((d) => d[0] === curDevice[0] ? curDevice : d);
        props.setDevices(curDevices);

        updateDeviceNote(curDevice[0], notes);
        setSelectedDevice();
        setNotes("");

    }
    //console.log(props.devices)

    return (
        <div id="service-box">
            {props.devices.length === 0 && props.patronQueue.length === 0 && (
                <>
                    There are no devices checked out :)
                </>
            )}

            {(props.devices.length !== 0 || props.patronQueue.length !== 0) && (
                <>
                    <div className="q-container">
                        <p>{props.patronQueue.length} Devices in portal</p>
                            <div id="devices-in-portal">

                                {props.patronQueue.length === 0 && (
                                    <>There are no patrons who need help :)</>
                                )}
                                {props.patronQueue.length !== 0 && (
                                    props.patronQueue.map((patron) => {
                                        return (
                                            <div className="patron-in-queue" key={patron[0]} ref={patronRef} style={props.patronInRoom ? {cursor:"not-allowed"} : {cursor: ""}} onClick={props.patronInRoom ? () => console.log("no clicky") : () => handlePatronClick(patron[0])}>
                                                {patron[10] === 0 ? 
                                                    <FontAwesomeIcon icon={"fa-solid fa-circle-pause"} style={{color:"#BF9005"}}/> :
                                                    (patron[0] === props.meetingId ? 
                                                        (props.patronInRoom ? 
                                                            <FontAwesomeIcon icon={"fa-solid fa-star"} style={{color:"#2A78E4"}}/> : 
                                                            (patron[11] === 1 ? 
                                                                <FontAwesomeIcon icon="fa-solid fa-right-to-bracket" style={{color: "#B197FC",}} /> :
                                                                <FontAwesomeIcon icon="fa-solid fa-hourglass-start" style={{color: "#FFD43B"}}/>
                                                            )
                                                            // <FontAwesomeIcon icon="fa-solid fa-check" style={{color: "#63E6BE"}}/>
                                                        ) :
                                                        (<FontAwesomeIcon icon={"fa-solid fa-square-phone"} style={{color:"#009E11"}}/>)
                                                    )
                                                }
                                                
                                                {patron[3]} {patron[4]}
                                                
                                                <Popup contentStyle={{height:"fit-content", width:"fit-content", position: 'absolute', top: patronRef.current ? patronRef.current.getBoundingClientRect().bottom : 0, left: patronRef.current ? patronRef.current.getBoundingClientRect().left : 0}} open={selectPatron === patron[0]} onClose={() => setSelectPatron(null)}>
                                                    <div className="patron-opt-item">
                                                            <button className="patron-opt-buttons" onClick={() => {joinMeeting(patron); setAssigning(false); setSelectPatron(null); setDevNoting(false)}}>Join Session</button>
                                                            <button className="patron-opt-buttons" onClick={() => {setAssigning(true); setDevNoting(false); console.log(assigning)}}>Assign To Room</button>
                                                            <button className="patron-opt-buttons" onClick={() => {setAssigning(false); setDevNoting(true)}}>Device Notes</button>
                                                    </div>

                                                        <div className="add-on-container">
                                                            {/* PUT DEVICE NOTES TEXT STUFF HERE */}
                                                                {assigning && (
                                                                    <div>
                                                                    {props.availTutors && Object.keys(props.availTutors).filter((tutors) =>{
                                                                        return tutors !== props.userId;
                                                                    })
                                                                    .map((tutor, index) => {
                                                                        return (
                                                                        // <div className="display-rooms">
                                                                        //     <button className="rooms" onClick={() => {props.setSelectedTutor(tutors), props.assignPT(patron[0], tutors[0]), console.log("Sending this stupid patron to roger doger")}}>
                                                                        //             Room {index+1}
                                                                        //             <br/>
                                                                        //             <b>T:</b>{tutors[1]} {tutors[2]}
                                                                        //             <br/>
                                                                        //     </button>
                                                                        // </div>
                                                                        <div style={{border: "1px solid black", borderRadius:"4px"}}>
                                                                            <button className="good-button" onClick={() => (props.setSelectedTutor(props.availTutors[tutor][0]), props.assignPT(patron[0], props.availTutors[tutor][0][0]))}>Assign to Room {index+1}</button>
                                                                            | T: {props.availTutors[tutor][0][1]} {props.availTutors[tutor][0][2]}
                                                                        </div>
                                                                        )
                                                                    })}
                                                                    {!props.availTutors && (
                                                                        <div>
                                                                        There are no available tutors
                                                                        </div>
                                                                    )}
                                                                    </div>
                                                                )}

                                                                {/* {devNoting && (
                                                                    
                                                                )} */}
                                                        </div>

                                                    <div className="close-row">
                                                        <button className="patron-opt-buttons" style={{backgroundColor: '#D21404', width:"100%"}} onClick={() => setSelectPatron(null)}>Close</button>
                                                    </div>
                                                </Popup>
                                            </div>
                                        )
                                    })
                                )}
                                
                            </div>
                    </div>
                    {props.devices.length} Additional devices checked out
                    <div id="devices-checked-out">
                        
                        {props.devices.map((device) => {
                            //console.log(device)
                            return (
                                <div className="checked-out-devices" key={device[0]}>

                                    {device[6] === 1 ? 
                                        (<FontAwesomeIcon icon={"fa-solid fa-circle"} style={{color:"#FF9900"}}/>) : 
                                        (<FontAwesomeIcon icon={"fa-regular fa-circle"} style={{color:"#d0302d"}}/>)}
                                        
                                    {device[4]} {device[5]}
                                </div>
                            )
                        })}
                    </div>
                </>
            )}

            {selectedDevice && (
                <>
                    <textarea
                        className="notes-textbox"
                        value={notes}
                        placeholder="No notes ..."
                        onChange={handleNoteChange}
                    />
                    <button onClick={updateNote}>Update notes</button> <button onClick={() => {setSelectedDevice(); setNotes("");}}> Close note </button>
                </>
            )}


        </div>
    );
}

export default ServiceBox;
