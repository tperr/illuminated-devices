import react, {useState, useEffect} from "react";
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
    const [streamPayload, setStreamPayload] = useState();
    const [patronPayload, setPatronPayload] = useState();

    const [isPlayerInPlayer, setIsPlayerInPlayer] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [showVideo, setShowVideo] = useState(false);
    const [useAudio, setUseAudio] = useState(false);
    const [meetingStarted, setMeetingStarted] = useState(false);
    const [patronCameraOn, setPatronCameraOn] = useState(false);
    const [noteTaking, setNoteTaking] = useState(false);

    const [ending, setEnding] = useState(false);
    const [notify, setNotify] = useState(false);
    const [toggle, setToggle] = useState(false);

    const [patron, setPatron] = useState();
    

    const [userInfo, setUserInfo] = useState();
    const [participantList, setParticipantList] = useState([]);

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
                //console.log(payload);
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
            setStream(undefined);
            setMeetingStarted(false);
            setIsScreenSharing(false);
            setIsPlayerInPlayer(false);
            setPatronScreenShare(false);
            setShowVideo(false);
            setUseAudio(false);
            setFullScreenMeeting(false);
            setToggle(false);
            props.updateNote();
            props.socketInstance.emit("basic_tutor_pull_all")
            //props.setInMeeting({"user_id": props.userId, "in_meeting": false});
            props.setInMeeting(false);

            if(document.pictureInPictureElement) {
              document.exitPictureInPicture();
            }
        }
    }, [props.meetingId])

    useEffect(() => {
      if (stream) 
      {
        if(document.pictureInPictureElement) 
        {
          document.exitPictureInPicture();
          setIsPlayerInPlayer(false);
        } 
        else 
        {
          if (isPlayerInPlayer) 
          {
            if (document.pictureInPictureEnabled) 
            {
              /**** BEGIN GRABBING TUTOR'S VIDEO FUNCTIONALITY ****/
              /* const videoElement = document.querySelector("#tutors-user-video-box");

              videoElement.requestPictureInPicture()
              .catch((error) => {
                console.error(error);
                setIsPlayerInPlayer(false);
              });

              videoElement.addEventListener("leavepictureinpicture", () => {
                setIsPlayerInPlayer(false);
              }, false) */
              /**** END GRABBING TUTOR'S VIDEO FUNCTIONALITY ****/

              /**** BEGIN GRABBING PATRON'S VIDEO FUNCTIONALITY ****/
              const patronCanvas = document.getElementById('patron-video');
              const patronStream = patronCanvas.captureStream();
              const videoElement = document.createElement('video');
              videoElement.width = 640;
              videoElement.height = 480;
              videoElement.autoplay = true;
              videoElement.srcObject = patronStream;

              videoElement.addEventListener('loadedmetadata', async () => {
                await videoElement.requestPictureInPicture()
                .then(() => {
                  console.log(videoElement.getVideoPlaybackQuality());
                })
                .catch((error) => {
                  console.error(error);
                  setIsPlayerInPlayer(false);
                });
              })

              videoElement.addEventListener("leavepictureinpicture", () => {
                setIsPlayerInPlayer(false);
              }, false)
              /**** END GRABBING PATRON'S VIDEO FUNCTIONALITY ****/
            }
          }
          else 
          {
            setIsPlayerInPlayer(false);
          }
        }
      }
    }, [isPlayerInPlayer, stream]);

    useEffect(() => { 
        if (stream)
        {
            return;
            (async () => {
                
                let oldVals = await closeAllStreams();

                renderTutorVideos(oldVals[0]);
                if (patronPayload)
                    renderPatronVideos(patronPayload, oldVals[1]);
                if (streamPayload)
                    renderPatronScreenShare(streamPayload, oldVals[2]);
                renderScreenShare(oldVals[3]);
            }
            )()
        }    
    }, [fullScreenMeeting]);

    const closeAllStreams = async () => 
    {
        let oldVals = [showVideo, patronCameraOn, patronScreenShare, isScreenSharing]
        await renderTutorVideos(false);
        if (patronPayload)
            await renderPatronVideos(patronPayload, false);
        if (streamPayload)
            await renderPatronScreenShare(streamPayload, false);
        await renderScreenShare(false);
        return oldVals
    }

    const renderTutorVideos = async (video = true) => 
    {
        // console.log(stream, video)
        let tag = (fullScreenMeeting ? "#fs-" : "#") + "tutors-user-video-box"
        if (stream && video)
        {
            stream.startVideo()
            .then(() => {
                stream.attachVideo(client.getCurrentUserInfo().userId, 3)
                .then((userVideo) => {
                    document.querySelector(tag).appendChild(userVideo);
                })
            }).catch((e) => {
                console.error("There was an error starting tutor video");
                console.error(e);
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
        let preTag = (fullScreenMeeting ? "#fs-" : "#");
        if (stream && video)
        {
            stream.attachVideo(payload.userId, 3)
            .then((userVideo) => {
                console.log("stuff", patronScreenShare);
                document.querySelector(preTag + "patron-video").appendChild(userVideo);
            })
        }
        
        else if (stream)
            stream.detachVideo(payload.userId);
        else
        {
            console.error("Stream uninitted: ", stream);
            return;
        }
        setPatronPayload(payload);
        setPatronCameraOn(video);
    }

    const renderPatronScreenShare = async (payload, sharing = true) => 
    {
        let preTag = (fullScreenMeeting ? "#fs-" : "#");
        if (stream && sharing)
        {
            stream.startShareView(document.querySelector(preTag + "screen-share-video"), payload.userId)
        }
        else if (stream)
        {
            await stream.stopShareView()
        }
        else
        {
            console.error("Stream uninitted: ", stream);
            return;
        }
        setStreamPayload(payload);
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

    const fsVideoDisplays = () => 
    {
        return (
            <div className="fullscreen-tutors-videos-box">
                <FontAwesomeIcon icon="fa-solid fa-minimize" className="max-button" onClick={() => setFullScreenMeeting(false)}/>
                
                {/* full screen tutor video */}
                <div className="fs-tutors-participant-video" style={{display: !isScreenSharing ? "" : "none" }}> 
                    {/* <video id="fs-tutors-user-video-box" ></video>
                    <canvas id="fs-tutors-user-canvas-video-box"> Your video </canvas> */}
                    <video-player-container id="fs-tutors-user-video-box"></video-player-container>
                </div>
                {/* full screen tutor screen share */}
                <div className="fs-tutors-participant-video-ss" style={{display: isScreenSharing ? "" : "none" }}> 
                    <video id="fs-tutors-user-video-box-ss" ></video>
                    <canvas id="fs-tutors-user-canvas-video-box-ss"> Your video </canvas>
                </div>
                {/* TODO patron stuff */}
                {/* change this to allow space for notes when toggled */}
                <div className={props.noteTaking ? "fs-patron-video-box-noting" : "fs-patron-video-box"}>
                    <video-player-container id="fs-patron-video"></video-player-container>
                    <canvas id="fs-screen-share-video" hidden={!patronScreenShare}> </canvas>
                </div>
                {notify && (
                    <div className="text-pop">
                        <p>A Patron is still in this session...<br/> Are you sure you'd like to end the tutor session?</p>
                    </div>
                )}   
                {props.noteTaking && props.fsNoting && meetingStarted && (
                    <div className="fs-noting">
                        <PatronNotes 
                            inMeeting={props.inMeeting}
                            patron={props.patron}
                            setPatron={props.setPatron}
                            updateNote={() => {console.log("THIS SHOULD NOT BE HAPPENING")}}
                            setNoteTaking={props.setNoteTaking}
                            patronNotes={props.patronNotes}
                            setPatronNotes={props.setPatronNotes}
                            fsNoting={props.fsNoting}
                        />
                    </div>
                )} 
                {(!ending && !notify) &&(
                    <div className="fs-toolbar">
                        {meetingStarted && !toggle &&(
                            <Tooltip className="small-screen-bt" title="Allow Patron Screen Sharing">
                            <button className="toggle-btn-n" onClick={() => {setToggle(true); props.socketInstance.emit("manage_patron_permissions", {"action":"give", "permission":"ss", "p_id":props.patron[1]})}}>
                                <FontAwesomeIcon icon="fa-solid fa-toggle-off"/>
                            </button>
                            </Tooltip>
                        )}
                        {meetingStarted && toggle &&(
                            <Tooltip className="small-screen-bt" title="Disallow Patron Screen Sharing">
                            <button className="toggle-btn-y" onClick={() => {setToggle(false); props.socketInstance.emit("manage_patron_permissions", {"action":"take", "permission":"ss", "p_id":props.patron[1]})}}>
                                <FontAwesomeIcon icon="fa-solid fa-toggle-on"/>
                            </button>
                            </Tooltip>
                        )}
                        {meetingStarted && (
                            <Tooltip className="small-screen-bt" title="Toggle Noting">
                                <button className="meeting-other-button" onClick={() => {console.log("Note taking is " + props.noteTaking), console.log("fsNoting is " + props.fsNoting), props.setNoteTaking(!props.noteTaking), props.setFsNoting(!props.fsNoting), console.log("Note taking is " + props.noteTaking), console.log("fsNoting is " + props.fsNoting)}}>
                                    <FontAwesomeIcon icon="fa-solid fa-note-sticky" />
                                </button>
                            </Tooltip>
                        )}
                        <div className="center-part">
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
                                <button className={"miniplayer-button"} onClick={() => setIsPlayerInPlayer(true)}>
                                    <FontAwesomeIcon icon="fa-solid fa-window-restore" />
                                </button>
                                </Tooltip>
                            )}
                            {isPlayerInPlayer && meetingStarted && (
                                <Tooltip className="small-screen-bt" title="Close Picture-in-Picture mode">
                                <button className={"end-miniplayer-button"} onClick={() => setIsPlayerInPlayer(false)}>
                                    <FontAwesomeIcon icon="fa-solid fa-window-maximize" />
                                </button>
                                </Tooltip>
                            )}
                            {/* {meetingStarted && (
                                <Tooltip className="small-screen-bt" title="Patron Notes">
                                <button className={"meeting-other-button"} onClick={() => props.setNoteTaking(true)}>
                                    <FontAwesomeIcon icon="fa-solid fa-note-sticky" />
                                </button>
                                </Tooltip>
                            )} */}
                        </div>
                        {meetingStarted && (
                            <Tooltip className="small-screen-bt" title="End Meeting">
                            <button className={"end-button"} onClick={() => {setEnding(true); setTimeout(() => {props.handle(); alertST();}, 1)}}>
                                <FontAwesomeIcon icon="fa-solid fa-right-from-bracket" />
                            </button>
                            </Tooltip>
                        )}
                    </div>
                )}
                {ending && props.isST &&(
                <div className="toolbar-assigning-fs">
                    {/* vvvvvvvv this leaves the assigning tool bar and replaces it with the default one */}
                    <button className={"assign-from-button"} onClick={() => {setEnding(false); setNotify(false)}}>Return To Session</button>
                    {/* vvvvvvvv this highlights room box*/}
                    {/* <button className="assign-from-button" onClick={() => {setEnding(false); setTimeout(() => {props.handle(); alertST();}, 1);}}> Assign patron </button> */}
                    {/* vvvvvvvv this ends the meeting */}
                    <button className="leave-for-good" onClick={() => {setEnding(false); endMeeting(props.meetingId); setNotify(false)}}>End Session</button>
                </div>
            )}
            </div>
        );
    }

    const videoDisplays = () =>
    {
        return (
            <div className="tutors-videos-box">
                <div className="max-button"><FontAwesomeIcon icon="fa-solid fa-maximize" onClick={() => setFullScreenMeeting(true)}/></div>
                
                {/* tutor screen share box */}
                <div className="tutors-participant-video-ss" style={{display: isScreenSharing ? "" : "none" }}> 
                    <video id="tutors-user-video-box-ss" ></video>
                    <canvas id="tutors-user-canvas-video-box-ss"> Your video </canvas>
                </div>

                {/* tutor video */}
                <div className="tutors-participant-video" style={{display: !isScreenSharing ? "" : "none" }}> 
                    <video-player-container id="tutors-user-video-box"></video-player-container>
                    {/* <video id="tutors-user-video-box" ></video>
                    <canvas id="tutors-user-canvas-video-box"> Your video </canvas> */}
                </div>
                
                <div className="patron-video-box">
                    <video-player-container id="patron-video" style={{display: !patronScreenShare ? "" : "none" }}> </video-player-container>
                    <canvas id="screen-share-video" style={{display: patronScreenShare ? "" : "none" }}> </canvas>
                </div>   

            </div>
        );
    }

    const endMeeting = (id) => 
    {
        props.setMeetingId(undefined);
        endMeetingCall(id);
    }

    return (
        <div className="max-height">
            
            {props.meetingId === undefined && (
                <div>
                    Not currently in meeting...
                </div>
            )}
            {props.meetingId !== undefined && (
                <div>

                    {(stream === null || stream === undefined) && (
                        <div style={{ color:'white', textAlign: 'center' }}>
                            <b>Initializing meeting, please wait a moment...</b>
                        </div>
                    )}

                    {(stream !== null && stream !== undefined) && (
                        videoDisplays()
                    )}

                </div>
            )}
            
            {notify && (
                <div className="text-pop">
                <p>A Patron is still in this session...<br/> Are you sure you'd like to end the tutor session?</p>
                
                </div>
            )}

            {(!ending && !notify) && !props.isST &&(
            <div className="toolbar">
                {meetingStarted && !toggle &&(
                    <Tooltip className="small-screen-bt" title="Allow Patron Screen Sharing">
                    <button className="toggle-btn-n" onClick={() => {setToggle(true); props.socketInstance.emit("manage_patron_permissions", {"action":"give", "permission":"ss", "p_id":props.patron[1]})}}>
                        <FontAwesomeIcon icon="fa-solid fa-toggle-off"/>
                    </button>
                    </Tooltip>
                )}
                {meetingStarted && toggle &&(
                    <Tooltip className="small-screen-bt" title="Disallow Patron Screen Sharing">
                    <button className="toggle-btn-y" onClick={() => {setToggle(false); props.socketInstance.emit("manage_patron_permissions", {"action":"take", "permission":"ss", "p_id":props.patron[1]})}}>
                        <FontAwesomeIcon icon="fa-solid fa-toggle-on"/>
                    </button>
                    </Tooltip>
                )}
                <div className="center-part">
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
                        <button className={"miniplayer-button"} onClick={() => setIsPlayerInPlayer(true)}>
                            <FontAwesomeIcon icon="fa-solid fa-window-restore" />
                        </button>
                        </Tooltip>
                    )}
                    {isPlayerInPlayer && meetingStarted && (
                        <Tooltip className="small-screen-bt" title="Close Picture-in-Picture mode">
                        <button className={"end-miniplayer-button"} onClick={() => setIsPlayerInPlayer(false)}>
                            <FontAwesomeIcon icon="fa-solid fa-window-maximize" />
                        </button>
                        </Tooltip>
                    )}
                </div>
                {meetingStarted && (
                    <Tooltip className="small-screen-bt" title="End Meeting">
                    <button className={"end-button"} onClick={() => {setEnding(true); setTimeout(() => {props.handle(); alertST();}, 1)}}>
                        <FontAwesomeIcon icon="fa-solid fa-right-from-bracket" />
                    </button>
                    </Tooltip>
                )}
            </div>
            )}

            {(!ending && !notify) && props.isST &&(
            <div className="toolbar">
                {meetingStarted && !toggle &&(
                    <Tooltip className="small-screen-bt" title="Allow Patron Screen Sharing">
                    <button className="toggle-btn-n" onClick={() => {setToggle(true); props.socketInstance.emit("manage_patron_permissions", {"action":"give", "permission":"ss", "p_id":props.patron[1]})}}>
                        <FontAwesomeIcon icon="fa-solid fa-toggle-off"/>
                    </button>
                    </Tooltip>
                )}
                {meetingStarted && toggle &&(
                    <Tooltip className="small-screen-bt" title="Disallow Patron Screen Sharing">
                    <button className="toggle-btn-y" onClick={() => {setToggle(false); props.socketInstance.emit("manage_patron_permissions", {"action":"take", "permission":"ss", "p_id":props.patron[1]})}}>
                        <FontAwesomeIcon icon="fa-solid fa-toggle-on"/>
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
                        <button className={"miniplayer-button"} onClick={() => setIsPlayerInPlayer(true)}>
                            <FontAwesomeIcon icon="fa-solid fa-window-restore" />
                        </button>
                        </Tooltip>
                    )}
                    {isPlayerInPlayer && meetingStarted && (
                        <Tooltip className="small-screen-bt" title="Close Picture-in-Picture mode">
                        <button className={"end-miniplayer-button"} onClick={() => setIsPlayerInPlayer(false)}>
                            <FontAwesomeIcon icon="fa-solid fa-window-maximize" />
                        </button>
                        </Tooltip>
                    )}
                    {/* 
                    {meetingStarted && (
                        <Tooltip className="small-screen-bt" title="Patron Notes">
                        <button className={"meeting-other-button"} onClick={() => setNoteTaking(true)}>
                            <FontAwesomeIcon icon="fa-solid fa-note-sticky" />
                        </button>
                        </Tooltip>
                    )}
                    */}
                </div>
                {meetingStarted && (
                    <Tooltip className="small-screen-bt" title="End Meeting">
                    <button className={"end-button"} onClick={() => {setEnding(true); setTimeout(() => {props.handle(); alertST();}, 1)}}>
                        <FontAwesomeIcon icon="fa-solid fa-right-from-bracket" />
                    </button>
                    </Tooltip>
                )}
    </div>
            )}

            {ending && props.isST &&(
                <div className="toolbar-assigning">
                    {/* vvvvvvvv this leaves the assigning tool bar and replaces it with the default one */}
                    <button className={"assign-from-button"} onClick={() => {setEnding(false); setNotify(false)}}>Return To Meeting</button>
                    {/* vvvvvvvv this highlights room box*/}
                    {/* <button className="assign-from-button" onClick={() => {setEnding(false);}}> Assign patron </button> */}
                    {/* vvvvvvvv this ends the meeting */}
                    <button className="leave-for-good" onClick={() => {setEnding(false); endMeeting(props.meetingId); setNotify(false)}}>End Session</button>
                </div>
            )}

            {ending && !props.isST &&(
                <div className="toolbar-assigning">
                    {/* vvvvvvvv this leaves the assigning tool bar and replaces it with the default one */}
                    <button className={"assign-from-button"} onClick={() => setEnding(false)}>Return To Meeting</button>
                    
                    <button className="leave-for-good" onClick={() => {setEnding(false); endMeeting(props.meetingId); setNotify(false)}}>End Session</button>
                </div>
            )}

            {/* <Popup contentStyle={{position: "absolute", height:"88%", width: "45%", top: "9.4%", right: "2%", borderRadius: "6px"}} open={noteTaking} close={!noteTaking} onClose={() => {setNoteTaking(false); }}>
                <PatronNotes patron={props.patron} setPatron={props.setPatron} setNoteTaking={setNoteTaking}/>
            </Popup> */}
            <Popup className="fullscreen-popout" contentStyle={{height:"97%", width:"97%", backgroundColor:"black"}} open={fullScreenMeeting} onClose={() => setFullScreenMeeting(false)} position="center">
                {fsVideoDisplays()}
            </Popup>
            {/* <Popup className="ending-popup" contentStyle={{width: '45vh', position: 'absolute', top: '65vh', left: '12vh', borderRadius: '10px'}} open={ending} onClose={() => setEnding(false)} close={!ending}>
                
                <button className="assign-from-button" onClick={() => {props.handle(), setEnding(false)}}> Assign patron </button>
                
                <button className="leave-for-good" onClick={() => {endMeeting(props.meetingId), setEnding(false)}}>Leave</button>
            </Popup> */}
        </div>
    );
}

export default MeetingView;