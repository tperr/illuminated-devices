import react, {useState, useEffect, useRef} from "react";
import ZoomVideo, { SharePrivilege, VideoQuality } from "@zoom/videosdk";
import KJUR from "jsrsasign";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Popup from 'reactjs-popup';
import Tooltip from '@mui/material/Tooltip';
import PatronNotes from "./PatronNotes.js";
//import { io } from "socket.io-client";

/*

https://socket.io/docs/v4/client-socket-instance/
https://medium.com/@adrianhuber17/how-to-build-a-simple-real-time-application-using-flask-react-and-socket-io-7ec2ce2da977
https://flask-socketio.readthedocs.io/en/latest/deployment.html

*/

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
		console.error("error code not found in (Provider.js -> Category.js -> fillData() -> Ark request -> (catch) received_response[\"error\"] ", error);
	})
	.finally(() => {
		//
	})

	return response; 
}

async function endMeetingCall(meetingId) {
    const fullAddr = "https://illuminated.cs.mtu.edu/ark/tut/end_meeting";
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
        console.error("error code found in MeetingView (MeetingView.js -> endMeetingCall()", error);
        console.error(error);
        return error;
    })
    .finally(() => {
        //
    })

    return status; 
}

const MeetingView = (props) =>
{
    const [apiKey, setApiKey] = useState(null);
    const [apiSecret, setApiSecret] = useState(null);

    const [stream, setStream] = useState();
    const [client, setClient] = useState();

    const [fullScreenMeeting, setFullScreenMeeting] = useState(false);
    const [patronScreenShare, setPatronScreenShare] = useState(false);

    const [isPlayerInPlayer, setIsPlayerInPlayer] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [showVideo, setShowVideo] = useState(false);
    const [useAudio, setUseAudio] = useState(false);
    const [meetingStarted, setMeetingStarted] = useState(false);
    const [smallTutorPic, setSmallTutorPic] = useState(false);

    const [ending, setEnding] = useState(false);
    const [notify, setNotify] = useState(false);
    const [toggle, setToggle] = useState(false);  
    const [pictureToggled, setPictureToggled] = useState(true);  

    const [userInfo, setUserInfo] = useState();
    const [participantList, setParticipantList] = useState([]);
    const [patronInfo, setPatronInfo] = useState();

    const patronVideoRef = useRef(null);
    const patronVideoBoxRef = useRef(null);
    const patronSSRef = useRef(null);
    const tutorVideoRef = useRef(null);
    const tutorSSRef = useRef(null);

    const fsPatronVideoRef = useRef(null);
    const fsPatronSSRef = useRef(null);
    const fsTutorVideoRef = useRef(null);
    const fsTutorSSRef = useRef(null);

    const boxRef = useRef(null);
    const bigBoxRef = useRef(null);

    let pipWindow;

    useEffect(() => 
    {
        getAPI().then((response) => {
            if (response)
            {
                setApiKey(response["key"]);
                setApiSecret(response["secret"]);
            }
            else
            {
                console.error("Failed to get zoom api")
            }
            
        });

        setClient(ZoomVideo.createClient());
        

    }, []);

    useEffect(() => {
        if (client !== undefined)
        {
            try {
                client.init("en-US", "CDN", {leavOnPageLUnload: true, stayAwake: true})
                .then(() => {console.log("client initted")});
            } 
            catch (error) {
                throw Error(error);                
            }
        }
    }, [client]);

    useEffect(() => {
        // initializing relevant eventlisteners
        // https://marketplacefront.zoom.us/sdk/custom/web/modules/VideoClient.html#on

        if (stream !== undefined)
        {
            //console.log(userInfo);
            

            // event listeners, some rely on stream so they should be put here
            client.on("user-added", (payload) => {
                console.log(payload);
                setParticipants();
                setPatronInfo(payload[0]);
                props.setPatronInRoom(true);
                // when someone is added, probably put logic to render videos well
            });

            client.on("user-removed", (payload) => {
                // ^^ but opposite
                //console.log(payload);
                setParticipants();
                props.patronLeave();
            });

            client.on("connection-change", (payload) => {
                // changes in connection
                //console.log("MeetingView Payload: " + payload);
            });

            client.on("video-active-change", (payload) => {
                if (payload["state"] === "Inactive" && payload["userId"] !== userInfo["userId"])
                {
                    //patronDropped(props.meetingId);

                }
                //console.log(payload);
                //console.log(userInfo["userId"]);
            });

            client.on("user-updated", (payload) => {
                //console.log(payload);

                // user updates settings, such as speaker/video/microphone/other stuff
            });

            client.on("peer-video-state-change", (payload) => {
                renderPatronVideos(payload, payload.action === "Start");
                // renderPatronScreenShare(payload, payload.action !== "Start");
            });

            client.on("auto-play-audio-failed", () => {
                // i'm thinking just call stream.startAudio() here but idk
            });

            client.on("device-change", () => {
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

            client.on('passively-stop-share', (payload) => { // stop screen share
                //console.log(payload);
                renderScreenShare(false);
            })
            client.on('active-share-change', (payload) => {
                console.log(payload);
                renderPatronScreenShare(payload, payload.state === "Active");
            })
            stream.setSharePrivilege(SharePrivilege.MultipleShare);

            setMeetingStarted(true);
            props.setInMeeting(true);
        }
    }, [stream])

    useEffect(() => {
        if (stream)
        {
            stream.startAudio() // this works on all browsers but safari (eww safari), and if there is little to no user interaction on the page previously this will fail
            .then(() => {
                if (useAudio)
                    stream.unmuteAudio();
                else
                    stream.muteAudio();
            })
            .catch((e) => {
                console.error("Failed joining audio");
                console.error(e);
            })
            
        }
    }, [useAudio])

    useEffect(() =>{
        if (props.meetingId !== undefined)
        {
            joinZoom(props.meetingId, props.meetingTopic);
        }
        else if (client !== undefined)
        {
            client.leave(true);
            props.updateNote();

            window.location.reload();
            setStream(undefined);
            setMeetingStarted(false);
            setIsScreenSharing(false);
            setIsPlayerInPlayer(false);
            setPatronScreenShare(false);
            setShowVideo(false);
            setUseAudio(false);
            setFullScreenMeeting(false);
            setToggle(false);
            props.socketInstance.emit("basic_tutor_pull_all")
            //props.setInMeeting({"user_id": props.userId, "in_meeting": false});
            props.setInMeeting(false);

            if(document.pictureInPictureElement) {
              document.leavePictureInPicture();
            }
        }
    }, [props.meetingId])

    // useEffect(() => {
    //     console.log(isPlayerInPlayer)
    //     if (stream) 
    //     {
    //         if(document.pictureInPictureElement) 
    //         {
    //             leavePictureInPicture(boxRef.current);
    //         } 
    //         else 
    //         {
    //             console.log("here", pipWindow)
    //             if (isPlayerInPlayer) 
    //             {
    //                 enterPictureInPicture(boxRef.current);
    //             }
    //             else if (pipWindow)
    //             {
    //                 console.log("here")
    //                 leavePictureInPicture(boxRef.current);
    //             }
    //         }
    //     }
    // }, [isPlayerInPlayer, stream]);

    useEffect(() => { 
        if (stream)
        {
            setTimeout(switchVideoContent, 50)
        }    
    }, [fullScreenMeeting]);

    const switchVideoContent = async () => 
    {
        if (fullScreenMeeting)
        {
            const placeholder1 = document.createElement("div");
            placeholder1.id = "video-holders";
            boxRef.current.parentNode?.insertBefore(placeholder1, boxRef.current);
            bigBoxRef.current.appendChild(boxRef.current);

        }
        else
        {
            try {

                let placeholder = document.getElementById("video-holders");
                placeholder.parentNode?.replaceChild(boxRef.current, placeholder);
            }
            catch (e) {
                // im lazy
                console.error(e)
            }
        }
    }

    const enterPictureInPicture = async (videoContainer) => {

        console.log(videoContainer, patronVideoRef)
        if (window.document.pictureInPictureEnabled && "documentPictureInPicture" in window) 
        {
        try {
            pipWindow = await window.documentPictureInPicture.requestWindow({
                width: videoContainer.clientWidth,
                height: videoContainer.clientHeight,
            });
            // Insert a stub after the container has been transferred to the PipWindow.
            const placeholder = document.createElement("div");
            placeholder.textContent = "Please see picture in picture window to see patron";
            placeholder.id = "PiP-placeholder";
            if (videoContainer) {
                // Ensure styles are applied
                Array.from(document.styleSheets).forEach((styleSheet) => {
                    Array.from(styleSheet.cssRules).forEach((rule) => {
                        const style = document.createElement("style");
                        style.textContent = rule.cssText;
                        pipWindow.document.head.appendChild(style);
                    });
                });

                // Move the video container into the PiP window
                videoContainer.parentNode?.insertBefore(placeholder, videoContainer);
                pipWindow.document.body.appendChild(videoContainer);
                //videoContainer.style.height = "100vh"
                pipWindow.onbeforeunload = () => {

                    leavePictureInPicture(boxRef)
                    return null;
                }
                setIsPlayerInPlayer(true);
            }
            else
            {
                throw Error("Videocontainer not given");
            }
        } 
        catch (error) 
        {
            console.error("Failed to enter Picture-in-Picture mode:", error);
            setIsPlayerInPlayer(false);
            if (pipWindow)
            {
                await pipWindow.close();
                pipWindow = undefined;
                console.log("closed")
            }
        }
        } 
        else 
        {
            console.warn("Picture-in-Picture is not supported by your browser.");
            setIsPlayerInPlayer(false);
        }
    };
      
    const leavePictureInPicture = async (videoContainer) => {
        console.log("closing", pipWindow)
        const placeholder = document.getElementById("PiP-placeholder");
        try {
            if (placeholder && videoContainer) {
                placeholder.parentNode?.replaceChild(videoContainer, placeholder);
                //videoContainer.style.height = "100%"
                // for some reason pipwindow is undefined??
                await window.documentPictureInPicture.window.close();
                pipWindow = undefined;
                console.log("pip closed")
            }
            setIsPlayerInPlayer(false);
        } catch (error) {
            console.error("Failed to leave Picture-in-Picture mode:", error);
        }
    };

    const renderTutorVideos = async (video = true) => 
    {
        // console.log(stream, video)
        let tag = (fullScreenMeeting ? "#fs-" : "#") + "tutors-user-video-box";
        console.log(tag)
        if (stream && video)
        {
            stream.startVideo()
            .then(() => {
                stream.attachVideo(userInfo.userId, 3)
                .then((userVideo) => {
                    document.querySelector(tag).appendChild(userVideo);
                })
            }).catch((e) => {
                setShowVideo(false);
                console.error("There was an error starting tutor video");
                console.error(e);
                return;
            })
        }
        else if (stream) {
            
            await stream.stopVideo();
            document.querySelector(tag).innerHTML = "";
        }
        else
        {
            console.error("Stream uninitted: ", stream);
        }
        setShowVideo(video)
    }

    const renderPatronVideos = async (payload, video = true) => 
    {
        let tag = (fullScreenMeeting ? "#fs-" : "#") + "patron-video";
        console.log(tag)
        if (stream && video)
        {
            stream.attachVideo(payload.userId, 3)
            .then((userVideo) => {
                console.log("patron video on");
                document.querySelector(tag).appendChild(userVideo);
            })
        }
        else if (stream)
        {
            console.log("patron video off")
            stream.detachVideo(payload.userId);
            document.querySelector(tag).innerHTML = "";
        }
        else
        {
            console.error("Stream uninitted: ", stream);
            return;
        }
    }

    const renderPatronScreenShare = async (payload, sharing = true) => 
    {
        let tag = (fullScreenMeeting ? "#fs-" : "#") + "screen-share-video";
        console.log(tag)
        if (stream && sharing)
        {
            console.log("patron ss on")
            stream.startShareView(document.querySelector(tag), payload.userId)
        }
        else if (stream)
        {
            console.log("patron ss off")
            await stream.stopShareView()
            // renderPatronVideos(true);
        }
        else
        {
            console.error("Stream uninitted: ", stream);
            return;
        }
        setPatronScreenShare(sharing);
    }

    const renderScreenShare = async (sharing) => 
    {
        console.log(stream, sharing);
        let preTag = (fullScreenMeeting ? "#fs-" : "#");
        if (stream && sharing)
        {
            let notNice = true;
            if(stream.isStartShareScreenWithVideoElement()) // video element
            {
                stream.startShareScreen(document.querySelector(preTag + "tutors-user-video-box-ss")).then(() => {
                    notNice = false;
                }).catch((error) => {
                    console.error("Failed to render tutors screen share nicely", error);
                    notNice = true;
                    setIsScreenSharing(false);
                })
            } 
            else if (notNice)
            {
                stream.startShareScreen(document.querySelector(preTag + "tutors-user-canvas-video-box-ss"))
                .then(() => {
                })
                .catch((error) => {
                    console.error("Failed to render tutors screen share content");
                    console.error(error);
                    setIsScreenSharing(false);
                    return;
                })
            }
        }
        else if (stream)
        {
            await stream.stopShareScreen();
            // renderTutorVideos(showVideo);
        }
        else
        {
            console.error("Stream uninitted: ", stream);
            return;
        }
        setIsScreenSharing(sharing);
    }

    const setParticipants = () => 
    {
        setParticipantList(client.getAllUser().filter((c) => {
            return c["userId"] !== userInfo["userId"];
        }));
    }

    const joinZoom = (id, meetingTopic) =>
    {
        let payload = {
            "app_key": apiKey, 
            "tpc": meetingTopic,
            "version": 1, 
            "role_type": 1,
            "user_identity": "",
            "session_key": id,
            "geo_regions": "US", 
            "iat": 0, 
            "exp": 0,
            "pwd": 123456
        }

        let token = getJWTToken(payload, apiSecret);
        let username = props.userId;
        client.join(meetingTopic, token, username).then(() => {
            setStream(client.getMediaStream());   
            setUserInfo(client.getCurrentUserInfo());
            //props.setInMeeting({"user_id": props.userId, "in_meeting": true});
            props.setInMeeting(true);

        }).catch((error) => {
            console.error("Stream unsuccessful");
            console.error(error);
        });
            
    }
    
    const alertST = () => {
        if (participantList.length > 0)
        {
            setNotify(true);
            setTimeout(() => {
                setNotify(false);
                }, 5000);
        }
        else
        {
            endMeeting(props.meetingId);
            setEnding(false);

        }
    }

    const videoDisplays = () =>
    {
        let fs = fullScreenMeeting ? "fs-" : "";
        return (
            <>
                <div className="max-button">
                    <FontAwesomeIcon icon="fa-solid fa-maximize" onClick={() => setFullScreenMeeting(true)}/>
                </div>
                <div className={fs + "tutors-videos-box"} ref={boxRef}>  
                    {/* tutor screen share box */}
                    <div className={fs + "tutors-participant-video-ss"} ref={tutorSSRef} style={{display: isScreenSharing ? "" : "none" }}> 
                        <video id="tutors-user-video-box-ss" ></video>
                        <canvas id="tutors-user-canvas-video-box-ss"> Your Screen Share </canvas>
                    </div>

                    {/* tutor video */}
                    <div className={fs + "tutors-participant-video"} style={{display: !isScreenSharing ? "" : "none" }} onClick={() => {setSmallTutorPic(!smallTutorPic)}}> 
                        <video-player-container ref={tutorVideoRef} id="tutors-user-video-box" style={smallTutorPic ? {height:"20%", width:"20%"} : {}}></video-player-container>
                        {/* <video id="tutors-user-video-box" ></video>
                        <canvas id="tutors-user-canvas-video-box"> Your video </canvas> */}
                    </div>
                    
                    <div className={fs + "patron-video-box"} ref={patronVideoRef}>
                        <video-player-container ref={patronVideoBoxRef} id="patron-video" style={{display: !patronScreenShare ? "" : "none" }}> </video-player-container>
                        <canvas ref={patronSSRef} id="screen-share-video" style={{display: patronScreenShare ? "" : "none" }}> </canvas>
                    </div>   

                </div>
            </>
        );
    }

    const toolBar = () => 
    {
        return (
            <>
                {(!ending && !notify) && (
                    <div className={(fullScreenMeeting ? "fs-" : "") + "toolbar"}>
                        {meetingStarted && !toggle &&(
                            <Tooltip className="small-screen-bt" title="Allow Patron Extra Button">
                            <button className="toggle-btn-n" onClick={() => {setToggle(true); props.socketInstance.emit("manage_patron_permissions", {"action":"give", "permission":"ss", "p_id":props.patron[1]})}}>
                                <FontAwesomeIcon icon="fa-solid fa-toggle-off"/>
                            </button>
                            </Tooltip>
                        )}
                        {meetingStarted && toggle &&(
                            <Tooltip className="small-screen-bt" title="Disallow Patron Extra Button">
                            <button className="toggle-btn-y" onClick={() => {setToggle(false); props.socketInstance.emit("manage_patron_permissions", {"action":"take", "permission":"ss", "p_id":props.patron[1]})}}>
                                <FontAwesomeIcon icon="fa-solid fa-toggle-on"/>
                            </button>
                            </Tooltip>
                        )}
                        {meetingStarted && !pictureToggled &&(
                            <Tooltip className="small-screen-bt" title="Hide Patrons Self View">
                            <button className="toggle-btn-n" onClick={() => {setPictureToggled(true); props.socketInstance.emit("manage_patron_permissions", {"action":"give", "permission":"picture", "p_id":props.patron[1]})}}>
                                <FontAwesomeIcon icon="fa-solid fa-toggle-off"/>
                            </button>
                            </Tooltip>
                        )}
                        {meetingStarted && pictureToggled &&(
                            <Tooltip className="small-screen-bt" title="Show Patrons Self View">
                            <button className="toggle-btn-y" onClick={() => {setPictureToggled(false); props.socketInstance.emit("manage_patron_permissions", {"action":"take", "permission":"picture", "p_id":props.patron[1]})}}>
                                <FontAwesomeIcon icon="fa-solid fa-toggle-on"/>
                            </button>
                            </Tooltip>
                        )}
                        {meetingStarted && fullScreenMeeting && (
                                <Tooltip className="small-screen-bt" title="Toggle Noting">
                                    <button className="meeting-other-button" onClick={() => {props.setNoteTaking(!props.noteTaking), props.setFsNoting(!props.fsNoting)}}>
                                        <FontAwesomeIcon icon="fa-solid fa-note-sticky" />
                                    </button>
                                </Tooltip>
                            )}
                        <div className="part-one">
                            {showVideo && meetingStarted && (
                                <Tooltip className="small-screen-bt" title="Stop Video">
                                <button className={"meeting-other-button"} onClick={() => renderTutorVideos(false)}>
                                    <FontAwesomeIcon icon="fa-solid fa-video" />
                                </button>
                                </Tooltip>
                            )}
                            {!showVideo && meetingStarted && (
                                <Tooltip className="small-screen-bt" title="Start Video">
                                <button className={"meeting-other-button"} onClick={() => renderTutorVideos(true)}>
                                    <FontAwesomeIcon icon="fa-solid fa-video-slash" />
                                </button>
                                </Tooltip>
                            )}
                            {useAudio && meetingStarted && (
                                <Tooltip className="small-screen-bt" title="Mute Microphone">
                                <button className={"meeting-other-button"} onClick={() => setUseAudio(false)}>
                                    <FontAwesomeIcon icon="fa-solid fa-microphone" />
                                </button>
                                </Tooltip>
                            )}
                            {!useAudio && meetingStarted && (
                                <Tooltip className="small-screen-bt" title="Unmute Microphone">
                                <button className={"meeting-other-button"} onClick={() => setUseAudio(true)}>
                                    <FontAwesomeIcon icon="fa-solid fa-microphone-slash" />
                                </button>
                                </Tooltip>
                            )}
                            {!isScreenSharing && meetingStarted && (
                                <Tooltip className="small-screen-bt" title="Start Screen Sharing">
                                <button className={"share-button"} onClick={() => renderScreenShare(true)} disabled={patronScreenShare}>
                                    <FontAwesomeIcon icon="fa-solid fa-desktop"/>
                                </button>
                                </Tooltip>
                            )}
                            {isScreenSharing && meetingStarted && (
                                <Tooltip className="small-screen-bt" title="Stop Screen Sharing">
                                <button className={"end-button"} onClick={() => renderScreenShare(false)}>
                                    <FontAwesomeIcon icon="fa-solid fa-xmark" />
                                </button>
                                </Tooltip>
                            )}
                            {!isPlayerInPlayer && meetingStarted && (
                                <Tooltip className="small-screen-bt" title="Start Picture-in-Picture mode">
                                <button className={"miniplayer-button"} onClick={() => enterPictureInPicture(fullScreenMeeting ? bigBoxRef.current : boxRef.current)}>
                                    <FontAwesomeIcon icon="fa-solid fa-window-restore" />
                                </button>
                                </Tooltip>
                            )}
                            {isPlayerInPlayer && meetingStarted && (
                                <Tooltip className="small-screen-bt" title="Close Picture-in-Picture mode">
                                <button className={"end-miniplayer-button"} onClick={() => leavePictureInPicture(fullScreenMeeting ? bigBoxRef.current : boxRef.current)}>
                                    <FontAwesomeIcon icon="fa-solid fa-window-maximize" />
                                </button>
                                </Tooltip>
                            )}
                        </div>
                        {meetingStarted  && (
                            <Tooltip className="small-screen-bt" title="End Meeting">
                            <button className={"end-button"} onClick={() => {setEnding(true); setTimeout(() => {props.handle(); alertST();}, 1)}}>
                                <FontAwesomeIcon icon="fa-solid fa-right-from-bracket" />
                            </button>
                            </Tooltip>
                        )}
                    </div>
                )}

                {ending  && (
                    <div className={(fullScreenMeeting ? "fs-" : "") + "toolbar-assigning"}>
                        <button className={"assign-from-button"} 
                            onClick={props.isST ? () => {setEnding(false); setNotify(false)} : () => setEnding(false)}>Return To Meeting</button>
                        <button className="leave-for-good" onClick={() => {endMeeting(props.meetingId); }}>End Session</button>
                    </div>
                )}
            </>
        )
    }

    const endMeeting = (id) => 
    {
        setFullScreenMeeting(false);
        setEnding(false); 
        setNotify(false);
        endMeetingCall(id);
        setTimeout(() => {
            props.setMeetingId(undefined);
            props.setPatronInRoom(false);
        }, 50);
    }

    return (
        <div className="max-height" >
            
            {props.meetingId === undefined && (
                <>
                    Not currently in session...
                </>
            )}
            {props.meetingId !== undefined && (
                <>
                    {(stream === null || stream === undefined) && (
                        <div style={{ color:'white', textAlign: 'center' }}>
                            <b>Initializing session, please wait a moment...</b>
                        </div>
                    )}
                    {(stream !== null && stream !== undefined) && (
                        videoDisplays()
                    )}
                </>
            )}
            
            {notify && (
                <div className="text-pop">
                <p>A Patron is still in this session...<br/> Are you sure you'd like to end the tutor session?</p>
                
                </div>
            )}

            {meetingStarted && toolBar()}

            <Popup className="fullscreen-popout" contentStyle={{height:"97%", width:"97%", backgroundColor:"black"}} open={fullScreenMeeting} onClose={() => setFullScreenMeeting(false)} position="center">
                <FontAwesomeIcon icon="fa-solid fa-minimize" className="max-button" onClick={() => {setFullScreenMeeting(false); console.log("click min")}}/> :
                <div className="fullscreen-tutors-videos-box" ref={bigBoxRef}>
                {props.noteTaking && props.fsNoting && meetingStarted && (
                    <div className="fs-noting">
                        <PatronNotes 
                            isST={props.isST}
                            inMeeting={props.inMeeting}
                            patron={props.patron}
                            setPatron={props.setPatron}
                            setNoteTaking={props.setNoteTaking}
                            patronNotes={props.patronNotes}
                            setPatronNotes={props.setPatronNotes}
                            fsNoting={props.fsNoting}
                        />
                    </div>
                )}
                </div>
                {toolBar()}
            </Popup>
        </div>
    );
}

export default MeetingView;