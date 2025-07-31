import React, {useContext, useState, useEffect} from "react";
import { UserContext } from "../../App.js";
import ZoomVideo from "@zoom/videosdk";
import KJUR from "jsrsasign";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faL } from "@fortawesome/free-solid-svg-icons";
import { render } from "react-dom";
import Popup from 'reactjs-popup';

window.onerror = function (message, source, lineno, colno, error) {
    if (error)
        console.error("Error occurred: ", message, "\nat ", source, ":", lineno, ":", colno, "\n", error);
};

function getJWTToken(payload, sdkSecret) {
    const oHeader = { alg: 'HS256', typ: 'JWT' };
    const iat = Math.round(new Date().getTime() / 1000);
    const exp = iat + 60 * 60 * 2;

    payload.iat = iat;
    payload.exp = exp;

    const sHeader = JSON.stringify(oHeader);
    const sPayload = JSON.stringify(payload);
    const sdkJWT = KJUR.jws.JWS.sign('HS256', sHeader, sPayload, sdkSecret);
    return sdkJWT;
}

// change meeting_test to new endpoint for not the test
async function getAPI() {
    const fullAddr = "https://illuminated.cs.mtu.edu/ark/zoom/get_api";
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
		console.error("error code not found in (Patron.js -> fillData() -> Ark request -> (catch) received_response[\"error\"] ", error);
	})
	.finally(() => {
		//
	})

	return response; 
}

// TODO make it so the queue table takes an id instead of a name and make a script for that
async function joinWaitingQueue(id, topic, pwd) {
    const fullAddr = "https://illuminated.cs.mtu.edu/ark/patron/join_waiting_queue";
	const authorization = 'Bearer ' + sessionStorage.getItem("BLIGHT");
    //console.log(id, topic, pwd);
	
    let response = await fetch(fullAddr, {
		method: 'POST',
		headers: {
			'Authorization': authorization,
			'Content-type': 'application/json',
		},
        body: JSON.stringify({
            "id": id,
            "topic": topic,
            "pwd": pwd,
        },)
	})
	.then(response => {
		if (response.ok) {
			return response.json()
		}
		throw response;
	})
	.catch(error => {
		console.error("error code found in (Patron.js -> joinWaitingQueue()\n", error);
        return "error";
	})
	.finally(() => {
		//
	})

	return response;
}


async function patronDropped(meetingId) {
    const fullAddr = "https://illuminated.cs.mtu.edu/ark/tut/patron_dropped";
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
        console.error("error code found in NotificationBox (NotificationBox.js -> patronDropped()", error);
        console.error(error);
        return error;
    })
    .finally(() => {
        //
    })

    return status; 
}

async function checkIfReassigned(meetingId) {
    const fullAddr = "https://illuminated.cs.mtu.edu/ark/patron/check_reassigned/" + meetingId;
	const authorization = 'Bearer ' + sessionStorage.getItem("BLIGHT");
    let status;

    status = await fetch(fullAddr, {
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
        console.error("error code found in Desktop.js (Desktop.js -> checkIfReassigned()", error);
        console.error(error);
        return error;
    })
    .finally(() => {
        //
    })

    return status; 
}

const Desktop = (props) =>
{
    const { userDetails } = React.useContext(UserContext);
    
    const [cameras, setCameras] = useState([]);
    const [mics, setMics] = useState([]);
    const [speakers, setSpeakers] = useState([]);

    const [currentCamera, setCurrentCamera] = useState(null);
    const [currentMic, setCurrentMic] = useState(null);
    const [currentSpeaker, setCurrentSpeaker] = useState(null);

    const [apiKey, setApiKey] = useState(null);
    const [apiSecret, setApiSecret] = useState(null);
    const patronJoinMeetingDelay = 7750;

    const [stream, setStream] = useState();
    const [client, setClient] = useState();

    const [pressedButton, setPressedButton] = useState(false);
    const [inMeeting, setInMeeting] = useState(false);
    const [patronSharingScreen, setpatronSharingScreen] = useState(false);
    const [leaving, setLeaving] = useState(false);
    const [left, setLeft] = useState(false);

    const [flipped, setFlipped] = useState(false);

    const [sharingScreen, setSharingScreen] = useState(false);
    const [streamPayload, setStreamPayload] = useState();
    const [forceTog, setForceTog] = useState(false);

    const [patronID, setPatronID] = useState();

    const getMediaDevices = async () =>
    {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const micList = devices.filter((device) => device.kind === 'audioinput');
            const cameraList = devices.filter((device) => device.kind === 'videoinput');
            const speakerList = devices.filter((device) => device.kind === 'audiooutput');

            if (micList.length > 0 && currentMic === null)
                setCurrentMic(micList[0]);
            if (cameraList.length > 0 && currentCamera === null)
                setCurrentCamera(cameraList[0]);
            if (speakerList.length > 0 && currentSpeaker === null)
                setCurrentSpeaker(speakerList[0]);

            setMics(micList);
            setCameras(cameraList);
            setSpeakers(speakerList);

            
        } catch (error) {
            console.error('Error accessing media devices:', error);
        }
    }

    useEffect(() => {
        if (props.joiningMeeting) {
            setTimeout(() => {setInMeeting(true); props.setJoinMeeting(false)}, patronJoinMeetingDelay);
            // console.log("Here");
        }
    }, [props.joiningMeeting])

    useEffect(() => 
    {
        getMediaDevices();

        getAPI().then((response) => {
            setApiKey(response["key"]);
            setApiSecret(response["secret"]);
        });

        setClient(ZoomVideo.createClient());

        try {
            // camera and microphone permissions
            navigator.mediaDevices.getUserMedia({video: true, audio: true})
            .then((s) => {
                s.getTracks().forEach((t) => {
                    t.stop();
                })
            })
            .catch((e) => {
                console.error("there was an error requesting camera and microphone permissions");
                console.error(e);
            })
        }
        catch (e)
        {
            console.error("error: ", e);
        }
        // navigator.permissions.query({name: "camera"})
        // .then((status) => {
        //     switch (status.state)
        //     {
        //         case "granted":
        //             break;
        //         case "denied":
        //             console.error("Camera permissions denied");
        //             break;
        //         case "prompt":
        //             break;
        //         default:
        //             console.error("Oh no! this should not have happened")
        //     }
        // })
    }, []);

    useEffect(() => {
        if (client !== undefined)
        {
            try {
                client.init("en-US", "CDN", {leavOnPageLUnload: true, stayAwake: true});
                //console.log("SDK initted");
            } 
            catch (error) {
                console.error(error);
            }
        }
    }, [client]);

    useEffect(() => {
        if (inMeeting)
        {
            let topic = props.patronId;
            // console.error("ee");
            let payload = {
                "app_key": apiKey, 
                "tpc": topic,
                "version": 1, 
                "role_type": 0,
                "user_identity": "",
                "session_key": "",
                "geo_regions": "US", 
                "iat": 0, 
                "exp": 0,
                "pwd": 123456
            }
            
            let token = getJWTToken(payload, apiSecret);
            let username = "Patron";
            client.join(topic, token, username).then(() => {
                setStream(client.getMediaStream());              
    
            }).catch((error) => {
                console.error("Stream unsuccessful");
                console.error(error);
            });
        }
    }, [inMeeting])

    useEffect(() => {
        // initializing relevant eventlisteners
        // https://marketplacefront.zoom.us/sdk/custom/web/modules/VideoClient.html#on

        if (stream !== undefined)
        {
            //console.log(client.getAllUser());
            client.getAllUser().forEach(user => {
                console.log(user);
                if (user.sharerOn)
                {
                    setSharingScreen(true);
                    stream.startShareView(
                        document.querySelector("#screen-share-video"),
                        user.userId
                    )
                }
                if (user.bVideoOn)
                {
                    stream.attachVideo(user.userId, 3)
                    .then((userVideo) => {
                        document.querySelector("#tutor-camera").appendChild(userVideo);
                    })
                }
                
            });  

            stream.startAudio(); // this works on all browsers but safari (eww safari), and if there is little to no user interaction on the page previously this will fail
                
            // event listeners, some rely on stream so they should be put here
            client.on("user-added", (payload) => {
                // when someone is added, probably put logic to render videos well
            });

            client.on("connection-change", (payload) => {
                // change of connection thing
                if (payload.state === "Closed")
                {
                    setLeft(true);
                    // setStream(undefined);
                    //props.setMeetingId(undefined);
                    // setInMeeting(false);
                    //setLeft(true);
                    // props.setWaitingForMeeting(true);
                    // setPressedButton(false);
                }
                if (payload.state === "Connected")
                {
                    renderVideos();
                }

            });

            client.on("user-removed", (payload) => {
                // ^^ but opposite
            });

            client.on("user-updated", (payload) => {
                // user updates settings, such as speaker/video/microphone/other stuff
            });

            client.on('passively-stop-share', (payload) => { // stop screen share
                console.log(payload);
                setpatronSharingScreen(false);
            });

            client.on("peer-video-state-change", (payload) => {
                // this or other renderer logic
                console.log(payload);
                if (payload.action === "Start")
                {
                    //console.log("Speaking:", payload);
                    stream.attachVideo(payload.userId, 3)
                    .then((userVideo) => {
                        try {
                            document.querySelector("#tutor-camera").appendChild(userVideo);
                        }
                        catch (e) {
                            console.error("There was an error showing tutor video");
                            console.error(e);
                        }
                    })
                    // stream.renderVideo(document.querySelector("#tutor-camera"), payload.userId, 300, 200, 0, 0, 3)
                    // .catch((e) => {
                    //     console.error("Failed to render tutor video");
                    //     console.error(e);
                    // }); 
                    
                }
                else if (payload.action === "Stop")
                {
                    stream.detachVideo(payload.userId);
                    document.querySelector("#tutor-camera").innerHTML = "";
                }
            });

            client.on("auto-play-audio-failed", () => {
                // i'm thinking just call stream.startAudio() here but idk
            });

            client.on("change", () => {
                // when there is a change to the camersa/speakers/microphones that the system detects
                /*
                setCameras(s.getCameraList());
                setSpeakers(s.getSpeakerList());
                setMics(s.getMicList());
                */
            });

            client.on("active-speaker", (payload) => {
                // could put a border or something around said person
            });

            client.on('active-share-change', (payload) => {
                console.log(payload);
                setStreamPayload(payload);
                if (payload.state === "Active") {
                    setSharingScreen(true);
                } else if (payload.state === "Inactive") {
                    setSharingScreen(false);
                }
            })

            renderVideos();
        }

    }, [stream])

    useEffect(() => {
        console.log(left);
        if (left)
        {
            setLeft(false);
            setLeaving(false);
            setStream(undefined);
            setInMeeting(false);
            setpatronSharingScreen(false);
            setSharingScreen(false);
            client.leave(false);
            props.setWaitingForMeeting(true);
            props.resetPermissions();
            setPressedButton(false);
            if (props.meetingId && !leaving)
            {
                checkIfReassigned(props.meetingId)
                .then((response) => {
                    // response = null; // dont want reassigned right now
                    //console.log(response)
                    if (response === null || response["data"] === null)
                        props.setMeetingId(undefined);
                    else
                    {
                        setPressedButton(true);
                        //props.socketInstance.emit("joined_queue")
                    }
                })
                .catch((e) => {
                    console.error("There was an error checking if patron goes to rt");
                    console.error(e);
                })
            }
            setLeaving(false);

        }
    }, [left])

    useEffect(() => {
        if (stream)
        {
            startScreenShare();
        }
    }, [patronSharingScreen])

    useEffect(() => {
        if (stream)
        {
            console.log(sharingScreen);
            if (sharingScreen)
            {
                stream.startShareView(
                    document.querySelector('#screen-share-video'),
                    streamPayload.userId
                )
                .then()
                .catch((e) => {
                    console.error("Failed to render tutor screen share");
                    console.error(e);
                })
            }
            else
            {
                stream.stopShareView();
            }
        }
    }, [sharingScreen])
    useEffect(() => {
        console.log("Meeting ID: ", props.meetingId);
    }, [props.meetingId])

    useEffect(() => {
        if (props.permissions["ss"] === false && patronSharingScreen === true)
        {
            setpatronSharingScreen(false);
        }

    }, [props.permissions])


    const joinQueue = () => {
        //props.setMeetingId(-1);
        setLeft(false);
        setPressedButton(true);
        props.setWaitingForMeeting(true);
        joinWaitingQueue(props.patronId, props.patronId, 123456).then((response) => {
            if (response !== "error" && response !== undefined /*&& response["data"] !== null*/)
            {
                // console.log(response["data"][0]);
                props.socketInstance.emit("joined_queue", {"m_id":response["data"][0]});
                props.setUpSocket();
                props.setMeetingId(response["data"][0]);

            }
            else
            {
                props.setMeetingId(undefined);
                console.error("Patron could not join meeting");
                console.error(response)
            }

        });
    }

    const renderVideos = () => {
        stream.startVideo()
        .then(() => {
            stream.attachVideo(client.getCurrentUserInfo().userId)
            .then((userVideo) => {
                document.querySelector("#patrons-user-video-box").appendChild(userVideo)
            })
        })
        .catch((e) => {
            console.error("Failed to start patron video");
            console.error(e);
        })
    }

    const login = () =>
    {
        return (
            <div className="login-content">
                <h1>Hi {props.patronName}, welcome to the Illuminated Devices Tutor Program </h1>
                <h3>{props.isIpad === 1 ? "Tap" : "Click"} the "Begin Call" button below to begin speaking to a technology tutor.</h3>
                <div className="patron-start-div">
                <button className="begin-call-button-styling" onClick={joinQueue}>{props.isIpad === 1 ? "Tap" : "Click"} to Begin Call</button>
                </div>
            </div>
        )
    }

    const startScreenShare = () => {
        
        if (patronSharingScreen)
        {
            if(stream.isStartShareScreenWithVideoElement()) {
                stream.startShareScreen(
                    document.querySelector("#patrons-user-video-box-ss"), 
                    {
                        controls: {
                            surfaceSwitching: "include"
                        },
                        displaySurface: "monitor"
                    }
                ).then(() => {
                    //document.querySelector("#tutor-share-screen-canvas").style.display = "block"
                }).catch((error) => {
                    console.error(error);
                    setpatronSharingScreen(false);
                })
            } else {
                stream.startShareScreen(
                    document.querySelector("#patrons-user-canvas-box-ss"),
                    {
                        displaySurface: "monitor"
                    }
                ).then(() => {
                    // show HTML Canvas element in DOM
                    // document.querySelector("#screen-share-video").style.display = "block"
                }).catch((error) => {
                    console.error(error);
                    setpatronSharingScreen(false);
                })
            }
        }
        else
        {
            stream.stopShareScreen();
        }
    }

    const call = () =>
    {
        return (
            <div className="patron-content">
                {(inMeeting === false && props.waitingForMeeting === true) && (
                <div className="login-content">
                    <h1>Waiting to be put in meeting...</h1>
                </div>
                )}
                {(inMeeting === false && props.waitingForMeeting === false) && (
                    <div className="login-content">
                        <h1>Joining meeting - please wait...</h1>
                    </div>
                )}
                {(inMeeting === true && stream !== undefined) && (
                    <div className="meeting-view">
                        
                        {/* <div className="pss-view"> 
                            <video id="patron-share-screen-video" style={{display:"none"}}> </video>
                            <canvas id="patron-share-screen-canvas" style={{display:"none"}}> </canvas> 
                        </div> */}
                        <div className="patron-button patron-button-box">
                            {props.isIpad === 0 && (
                                <>
                                    {/* <button onClick={startScreenShare}> {patronSharingScreen ? <div className="end-button">Stop Sharing Screen <FontAwesomeIcon icon="fa-solid fa-xmark" /></div> : <div className="share-button"> Start Sharing Screen <FontAwesomeIcon icon="fa-solid fa-desktop"/></div>} </button> */}
                                    {!patronSharingScreen &&(
                                        <button className={props.permissions["ss"] ? "patron-share-button" : "not-allowed"} onClick={props.permissions["ss"] ? () => setpatronSharingScreen(true) : () => {}} disabled={!props.permissions["ss"]}> Start Sharing Screen <FontAwesomeIcon icon="fa-solid fa-desktop"/></button>
                                    )}
                                    {patronSharingScreen &&(
                                        <button className={"patron-end-button"} onClick={() => setpatronSharingScreen(false)}> Stop Sharing Screen <FontAwesomeIcon icon="fa-solid fa-xmark" /></button>
                                    )}
                                </>
                            )}
                                {props.isIpad === 1 && (
                                    <button className={props.permissions["ss"] ? "patron-share-button" : "not-allowed"} onClick={flipCamera} /*disabled={props.permissions["ss"]}*/> Flip Camera <FontAwesomeIcon icon="fa-solid fa-desktop"/></button>
                            )}
                        </div>

                        <div className="patron-button patron-end-button-box">
                            <button className={"patron-end-button"} onClick={() => setLeaving(true)}> Leave Session <FontAwesomeIcon icon="fa-solid fa-right-from-bracket" /></button>
                        </div>

                        <div className="patrons-participant-video" style={{display: !patronSharingScreen && props.permissions["picture"] ? "" : "none" }}>  
                            <video-player-container id="patrons-user-video-box"></video-player-container>
                            {/* <video id="patrons-user-video-box"> </video>
                            <canvas id="patrons-user-canvas-box"> </canvas> */}
                        </div>
                    
                        <div className="patrons-participant-video-ss" style={{display: patronSharingScreen && props.permissions["picture"] ? "" : "none" }}>  
                            <video id="patrons-user-video-box-ss"> </video>
                            <canvas id="patrons-user-canvas-box-ss"> </canvas>
                        </div>
                       

                        <div className="tutor-video-view">
                            <video-player-container id="tutor-camera" style={{display: !sharingScreen ? "" : "none" }}> </video-player-container>
                            <canvas id="screen-share-video" style={{display: sharingScreen ? "" : "none" }}> </canvas>
                        </div>
                        <Popup contentStyle={{height:"75%", width:"75%", display:"flex", flexDirection:"column", alignContent:"center", justifyContent:"center", borderRadius:"10px"}} open={leaving} onClose={() => setLeaving(false)} close={!leaving} position="center">
                            <h1>This tutor session is still in progress, are you sure you would like to leave this session</h1>
                            <div className="leaving-button-flex">
                                <button className="patron-stay-button" onClick={() => setLeaving(false)}>Stay <FontAwesomeIcon icon="fa-solid fa-phone" /></button>
                                <button className="patron-leave-button" onClick={()=> setLeft(true)}> Leave <FontAwesomeIcon icon="fa-solid fa-right-from-bracket" /></button>
                            </div>
                        </Popup>
                    </div>
                )}
            </div>
        )
    }

    async function flipCamera () {
        
        let newCamera = flipped ? "user" : "environment";
        setCurrentCamera(newCamera);
        console.log("Switching camera to: ", newCamera);
        await stream.switchCamera(newCamera)
        .then(() => {
            console.log("Camera switched successfully");
            setFlipped(!flipped);
        })
        .catch((error) => {
            console.error("Failed to switch camera");
            console.error(error);
        }
        );
    }
    
    if (props.patronId && userDetails) {
        return (  
            <div id="container-inner">
                {pressedButton && (
                    call()
                )}
                {!pressedButton === true && (
                    login()
                )}
            </div>
        );
    }
}

export default Desktop;