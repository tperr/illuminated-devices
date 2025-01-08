import {React, useState, useRef, useEffect} from "react";
import Navbar from '../subscript/universal/Navbar.js';
import Footer from '../subscript/universal/Footer.js';
import { UserContext } from "../App.js";
import ZoomVideo from "@zoom/videosdk";
import KJUR from "jsrsasign";


/**
 * ok so heres how it goes  *** solely for testing purposes, probably should be modified for development ***
 * 
 * Patron:
 * enter your name
 * get put in queue
 *  name goes in db, no meeting id
 * wait until you're put in meeting
 *  (select meetingid from patron where name = name) == null on some interval (.5-1s?) until meetingid is given
 * have meeting
 *  zoom meeting starts embedded in iframe 
 * goodbye
 * 
 * Tutor:
 * enter your name 
 *  name goes in db, no meeting id and you are available
 * see queue of patrons 
 * select a patronn and start meeting
 * have meeting
 * goodbye, next patron
 * 
 * Admin:
 * enter name
 * see tutors and see if they're available or not
 * see patron queue
 * see active meetings, view them in progress?
 */


/** 
 * things to note
 * 720p video (which is currently implemented) requires good internet and low cpu usage
 * the way that I have participant video rendering set up it will only allow for 1 participant to be shown, need to do some semi-fancy math to get working right (will take approx 30m-1h)
 * 
 * could add the following:
 *  virtual background (including blurred background) (15m)
 *  better participant video showing (seemed unneccessary for now as there will only be a tutor and a patron) (2h)
 *  audio for safari (theres like 50 more lines of code to make it work for safari) (2h)
 *  there is a host-ask-unmute listener for participants that is currently unimplemented (5m listener implementation, 45m host asks a participant to unmute)
 *  screen sharing (including via a second camera) (2h)
 *  chats (1h)
 *  cloud recording (requires cloud recording storage plan ($100/month for 1tb of storage, but if we were to do this we could store everything on our server)) (3h)
 *  preview video and audio before joining session (1.5h)
 *  subsessions (breakout rooms) (4h)
 *  command channel (Still unclear as to what that entails) (999999h)
 *  gallery view (highly not recommend, it seems like a lot) (10h)
 *  transcription/translation (1h)
 *  PSTN (Public Switched Telephone Network) (requires audio conferencing plan ($100/month), doesnt look like we could use it)
 *  
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

async function getAPI() {
	const fullAddr = "https://illuminated.cs.mtu.edu/ark/meeting_test/get_api";
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

async function callLogin(name, role) {
	const fullAddr = "https://illuminated.cs.mtu.edu/ark/meeting_test/login";
	const authorization = 'Bearer ' + sessionStorage.getItem("BLIGHT");
    let status;
    let body = {
        "data": {
            "name": name,
            "role": role
        }
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
            console.log("response?");
            console.log(response);
            return response.json()
        }
        throw response;
    })
    .catch(error => {
        console.error("error code found in MeetingTest (MeetingTest.js -> callLogin()", error);
        console.log(error);
    })
    .finally(() => {
        //
    })

    return status; 

}

async function getPatronTutorLists() {
    const fullAddr = "https://illuminated.cs.mtu.edu/ark/meeting_test/get_lists";
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
		console.error("error code found in (MeetingTest.js -> getPatronTutorLists()", error);
	})
	.finally(() => {
		//
	})

	return response;
}

async function clearLists() {
	const fullAddr = "https://illuminated.cs.mtu.edu/ark/meeting_test/delete_tables";
	const authorization = 'Bearer ' + sessionStorage.getItem("BLIGHT");
    let status;

    status = await fetch(fullAddr, {
        method: 'POST',
        headers: {
            'Authorization': authorization,
            'Content-type': 'application/json',
        }
    })
    .then(response => {
        if (response.ok) {
            console.log("response?");
            console.log(response);
            return response.json()
        }
        throw response;
    })
    .catch(error => {
        console.error("error code found in MeetingTest (MeetingTest.js -> clearLists()", error);
        console.log(error);
    })
    .finally(() => {
        //
    })

    return status; 

}

async function getRoomNum(name, role) {
	const fullAddr = "https://illuminated.cs.mtu.edu/ark/meeting_test/check_zoom";
	const authorization = 'Bearer ' + sessionStorage.getItem("BLIGHT");
    let room;
    let body = {
        "data": {
            "name": name,
            "role": role
        }
    }

    room = await fetch(fullAddr, {
        method: 'POST',
        headers: {
            'Authorization': authorization,
            'Content-type': 'application/json',
        },
        body: JSON.stringify(body),
    })
    .then(response => {
        if (response.ok) {
            console.log(response);
            return response.json()
        }
        throw response;
    })
    .catch(error => {
        console.error("error code found in MeetingTest (MeetingTest.js -> getRoomNum()", error);
    })
    .finally(() => {
        //
    })

    return room; 

}

async function assignPatronsToRoom(tutor, names) {
	const fullAddr = "https://illuminated.cs.mtu.edu/ark/meeting_test/assign_patrons_to_room";
	const authorization = 'Bearer ' + sessionStorage.getItem("BLIGHT");
    let status;
    let body = {
        "data": {
            "tutor": tutor,
            "names": names
        }
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
            console.log(response);
            return response.json()
        }
        throw response;
    })
    .catch(error => {
        console.error("error code found in MeetingTest (MeetingTest.js -> assignPatronsToRoom()", error);
    })
    .finally(() => {
        //
    })

    return status; 

}

async function getMeetingInfo(id) {
	const fullAddr = "https://illuminated.cs.mtu.edu/ark/meeting_test/get_meeting_info";
	const authorization = 'Bearer ' + sessionStorage.getItem("BLIGHT");
    let info;
    let body = {
        "data": {
            "id": id,
        }
    }

    info = await fetch(fullAddr, {
        method: 'POST',
        headers: {
            'Authorization': authorization,
            'Content-type': 'application/json',
        },
        body: JSON.stringify(body),
    })
    .then(response => {
        if (response.ok) {
            console.log(response);
            return response.json()
        }
        throw response;
    })
    .catch(error => {
        console.error("error code found in MeetingTest (MeetingTest.js -> getMeetingInfo()", error);
    })
    .finally(() => {
        //
    })

    return info; 

}

const MeetingTesting = props => {
    const [pagenum, setPagenum] = useState(4);

    const [patronName, setPatronName] = useState("");
    const [tutorName, setTutorName] = useState("");

    const [patronLoggedIn, setPatronLogIn] = useState(false);
    const [tutorLoggedIn, setTutorLogIn] = useState(false);

    const [patrons, setPatrons] = useState([]);
    const [tutors, setTutors] = useState([]);

    const [selectedTutors, setSelectedTutors] = useState([]); 
    const [selectedPatrons, setSelectedPatrons] = useState([]); 

    const [apiKey, setApiKey] = useState(null);
    const [apiSecret, setApiSecret] = useState(null);
    const API_WAIT_TIME = 5000; // milisecs

    const [meetingId, setMeetingId] = useState(null);

    const [stream, setStream] = useState();
    const [client, setClient] = useState();

    const [peopleInMeeting, setPeopleInMeeting] = useState([]);

    const [displayVideoHeight, setDisplayVideoHeight] = useState(260);
    const [peopleDisplayingVideo, setPeopleDisplayingVideo] = useState(0);

    const [cameras, setCameras] = useState([]);
    const [mics, setMics] = useState([]);
    const [speakers, setSpeakers] = useState([]);
    
    let meetingInfoTemplate = {
        "topic": "", // required, must match jwt token topic
        "token": "", // jwt token https://developers.zoom.us/docs/video-sdk/auth/
        "userName": "", // name of participant
        "password": "", // optional unless set by host
        "sessionIdleTimeoutMins": "" // optional, how long 1 person can be idle without cloud recording without ending, default is 40 mins
    }
    let payloadInfoTemplate = {
        "app_key": "", // sdk key
        "tpc": "", // meeting topic, must match meeting topic
        "version": 1, // do not ever change this, don't even know why it is required when the only valid option is 1
        "role_type": 0, // 0 participant, 1 host
        "user_identity": "", // optional, allows us to see more on the zoom dashboard
        "session_key": "", // ^^ but for session, if set all participants must have this set to the same thing
        "geo_regions": "US", // locations, we have US as set to be right but could be the following: US, AU, CA, IN, CN, BR, MX, HK, SG, JP, DE, NL
        "iat": 0, // current timestamp, required
        "exp": 0, // jwt expiration date, 1800 seconds to 172,800 seconds (48 hours) 
        "pwd": 0 // optional unless set by host, if set by host must match
    }

    const patronLoginInput = useRef();
    const tutorLoginInput = useRef();
    const tcAddTutorInput = useRef();
    const tcBeTutorInput = useRef();
    const tcAddPatronInput = useRef();
    const tcBePatronInput = useRef();

    

    useEffect(() => 
    {
        getAPI().then((response) => {
            setApiKey(response["key"]);
            setApiSecret(response["secret"]);
            fetchLists();
        });

        setClient(ZoomVideo.createClient());
    }, []);

    useEffect(() => {
        if (client !== undefined)
        {
            console.log(client);
            try {
                client.init("en-US", "CDN", {leavOnPageLUnload: true, stayAwake: true});
                console.log("SDK initted");
            } 
            catch (error) {
                console.error(error);
            }
        }
    }, [client]);

    useEffect(() => {
        if (stream !== undefined)
        {
            setCameras(stream.getCameraList());
            setMics(stream.getMicList());
            setSpeakers(stream.getSpeakerList());
        }
    }, [stream])
    

    const handleSelection = (selectedPeople, setSelectedPeople, person) =>
    {
        const isSelected = selectedPeople.some((selectedPerson) => selectedPerson === person);
    
        if (isSelected) {
            setSelectedPeople(selectedPeople.filter((selectedPerson) => selectedPerson !== person));
        } else {
            setSelectedPeople([...selectedPeople, person]);
        }
    };

    const patronListView = () =>
    {
        return (
            <div>
                <h3> Patron list </h3>
                {patrons.length === 0 && (
                    <div>
                        Currently there are no patrons available
                    </div>
                )}

                <ul>
                    {patrons.map((patron) => (

                        <li key={patron} onClick={() => handleSelection(selectedPatrons, setSelectedPatrons, patron)} style={{backgroundColor: selectedPatrons.some((selectedPatron) => selectedPatron === patron) ? "grey" : "white"}}>
                            {patron}
                        </li>
                    ))}
                </ul>
            </div>
        )
    };

    const tutorListView = () =>
    {
        return (
            <div>
                <h3> Tutor list </h3>
                {tutors.length === 0 && (
                    <div>
                        Currently there are no tutors available
                    </div>
                )}
                <ul>
                    {tutors.map((tutor) => (

                        <li key={tutor} onClick={() => handleSelection(selectedTutors, setSelectedTutors, tutor)} style={{backgroundColor: selectedTutors.some((selectedTutor) => selectedTutor === tutor) ? "grey" : "white"}}>
                            {tutor}
                        </li>
                    ))}
                </ul>
            </div>
        )
    };

    const getActiveWindow = (pagenum) =>
    {
        switch(pagenum)
        {
            case 0: return home();
            case 1: return patron();
            case 2: return tutor();
            case 3: return admin();
            case 4: return testingControls();
            case 5: return ty();
            default: return;
        }
    };
    
    const home = () =>
    {
        return (
            <div>
                Pick one of the views above
            </div>
        )
    };

    const ty = () =>
    {
        setPatronLogIn(false);
        setPatronName("");
        return (
            <div>
                Thank you for your meeting!
            </div>
        )
    }

    const patronLogsIn = () =>
    {
        setPatronName(patronLoginInput.current.value)
        setPatrons([...patrons, patronLoginInput.current.value]);
        setPatronLogIn(true);
        callLogin(patronLoginInput.current.value, 0);
    }

    const tutorLogsIn = () =>
    {
        setTutorName(tutorLoginInput.current.value);
        setTutors([...tutors, tutorLoginInput.current.value]);
        setTutorLogIn(true);
        callLogin(tutorLoginInput.current.value, 1);
    }

    const patron = () =>
    {
        return (
            <div>
                <h1>
                    Patrons view
                </h1>
                {!patronLoggedIn && (
                    <div>
                        <input ref = {patronLoginInput} placeholder="Enter name here..."/>
                        <button onClick={() => {if (!patrons.includes(patronLoginInput.current.value)) patronLogsIn();}}> Enter queue </button>
                    </div>
                )}
                {patronLoggedIn && meetingId === null && (
                    <div>
                        Thank you {patronName}, please wait to be placed in a meeting room.
                        <button onClick={() => checkZoomRoom(patronName, 0)}>Enter room (if available)</button>
                    </div>
                )}

                {meetingId !== null && patronLoggedIn && (
                    <div>
                        This is a zoom meeting
                        <br/>
                        <div hidden={stream === undefined ? "" : "hidden"}> Please wait one moment... </div>
                        <div hidden={stream !== undefined ? "" : "hidden"} style={{display:"flex", flexDirection:"horizontal", margin:"auto"}}>
                            <div>
                                <button onClick={() => showVideo("patron")}>Start video</button>
                                <br/>
                                <button onClick={() => stream.stopVideo()}>Stop video</button>
                                <br/>
                                <button onClick={() => stream.startAudio()}>Start audio</button>
                                <br/>
                                <button onClick={() => stream.stopAudio()}>Stop audio</button>
                                <br/>
                                <button onClick={() => stream.muteAudio()}>Mute audio</button>
                                <br/>
                                <button onClick={() => stream.unmuteAudio()}>Unmute audio</button>
                                <br/>
                            </div>
                            {cameraList()}
                            {speakerList()}
                            {micList()}
                        </div>
                        <div>
                            Your video
                            <br/>
                            <video id="patron-video-box"> </video>
                            <canvas id="patron-canvas-video-box"> </canvas>
                        </div>
                        <div>
                            Participant videos
                            <br/>
                            <canvas id="participant-videos" style={{height:displayVideoHeight}} > </canvas>

                        </div>

                        
                        <button onClick={() => {client.leave(); setPagenum(5)}}>leave meeting and log out</button>
                    </div>
                )}


                
            </div>
        )
    };

    const tutor = () =>
    {
        return (
            <div>
                <h1> Tutors view </h1>
                {!tutorLoggedIn && (
                    <div>
                        <input ref = {tutorLoginInput} placeholder="Enter name here..."/>
                        <button onClick={() => {if (!tutors.includes(tutorLoginInput.current.value)) tutorLogsIn();}}> Log in </button>
                    </div>
                )}
                {tutorLoggedIn && meetingId === null &&
                (
                    <div>
                        Welcome {tutorName}!
                        <br/>
                        <button onClick={fetchLists}>
                            refresh lists
                        </button>
                        {patronListView()} 
                        <button disabled={selectedPatrons.length === 0} onClick={putSelectedPatronsInRoom}> Start meeting with selected patrons </button>
                    </div>
                )}
                {meetingId !== null && tutorLoggedIn && (
                    <div>
                        having a meeting with people
                        <br/>
                        <div hidden={stream === undefined ? "" : "hidden"}> Please wait one moment... </div>
                        <div hidden={stream !== undefined ? "" : "hidden"} style={{display:"flex", flexDirection:"horizontal", margin:"auto"}}>
                            <div>
                                <button onClick={() => showVideo("tutor")}>Start video</button>
                                <br/>
                                <button onClick={() => stream.stopVideo()}>Stop video</button>
                                <br/>
                                <button onClick={() => stream.startAudio()}>Start audio</button>
                                <br/>
                                <button onClick={() => stream.stopAudio()}>Stop audio</button>
                                <br/>
                                <button onClick={() => stream.muteAudio()}>Mute audio</button>
                                <br/>
                                <button onClick={() => stream.unmuteAudio()}>Unmute audio</button>
                                <br/>
                            </div>
                            {cameraList()}
                            {speakerList()}
                            {micList()}
                        </div>
                        <div>

                        </div>
                        <br/>
                        <div>
                            Your video
                            <br/>
                            <video id="tutor-video-box"> </video>
                            <canvas id="tutor-canvas-video-box"> </canvas>
                            <br/>
                        </div>
                        <div>
                            Participant videos
                            <br/>
                            <canvas id="participant-videos" style={{height:displayVideoHeight}} > </canvas>
                        </div>

                        <button onClick={() => {client.leave(true)}}>End meeting</button>
                    </div>
                )}

                
            </div>
        )
    };

    const admin = () =>
    {
        return (
            <div>
                <h1>
                    Admin view
                </h1>
                <div style={{display:"flex"}}>
                    <div style={{margin:"auto"}}>
                        {tutorListView()}
                    </div>
                    <div style={{margin:"auto"}}>
                        {patronListView()}
                    </div>
                </div>
            </div>
        )
    };

    const testingControls = () =>
    {
        return (
            <div>
                <h1>
                    Used for easier testing purposes
                </h1>
                
                <button onClick={fetchLists}>
                    refresh lists
                </button>
                <button onClick={clearLists}>
                    clear lists
                </button>
                <div style={{display:"flex"}}>
                    <div style={{margin:"auto"}}>
                        <h1> Tutor stuff </h1>
                        <div>
                            <input ref={tcAddTutorInput} placeholder="Enter name here..."/>
                            <button onClick={() => { if (!tutors.includes(tcAddTutorInput.current.value)) {callLogin(tcAddTutorInput.current.value, 1); tcAddTutorInput.current.value = ""}}}> add tutor </button>
                        </div>
                        {tutorListView()}

                        <div>
                            <br/>
                            Who would you like to be?
                            <br/>
                            <input ref={tcBeTutorInput} placeholder="Enter tutor name here..."/>
                            <button onClick={() => {if (tutors.includes(tcBeTutorInput.current.value)) {setTutorName(tcBeTutorInput.current.value); setTutorLogIn(true); tcBeTutorInput.current.value = ""}}}> Be them </button>
                        </div>
                        <button onClick={() => {setTutorName(""); setTutorLogIn(false);}}> Be nobody </button>
                    </div>
                    <div style={{margin:"auto"}}>
                        <h1> Patron stuff </h1>
                        <div>
                            
                            <input ref={tcAddPatronInput} placeholder="Enter name here..."/>
                            <button onClick={() => {if (!patrons.includes(tcAddPatronInput.current.value)) {callLogin(tcAddPatronInput.current.value, 0); tcAddPatronInput.current.value = ""}}}> add patron </button>
                        </div>
                        {patronListView()}

                        <div>
                            <br/>
                            Who would you like to be?
                            <br/>
                            <input ref={tcBePatronInput} placeholder="Enter patron name here..."/>
                            <button onClick={() => {if (patrons.includes(tcBePatronInput.current.value)) {setPatronName(tcBePatronInput.current.value); setPatronLogIn(true); tcBePatronInput.current.value = ""}}}> Be them </button>
                        </div>
                        <button onClick={() => {setPatronName(""); setPatronLogIn(false)}}> Be nobody </button>
                    </div>
                </div>
            </div>

        )
    };

    const fetchLists = () =>
    {
        getPatronTutorLists().then((response) => {
            setTutors(response["tutors"]);
            setPatrons(response["patrons"]);
        });
        //setTimeout(fetchLists, 5000);
    };

    const checkZoomRoom = (name, role) =>
    {
        getRoomNum(name, role).then((response) =>
        {
            setMeetingId(response["meeting_id"]);
            joinZoom(response["meeting_id"], role);
        })
    };

    const putSelectedPatronsInRoom = () =>
    {
        assignPatronsToRoom(tutorName, selectedPatrons).then((response) =>
        {
            setSelectedPatrons([]);
            getRoomNum(tutorName, 1).then((response) => {
                setMeetingId(response["meeting_id"]);
                joinZoom(response["meeting_id"], 1);
            });
        });
    }
    
    const joinZoom = (id, role) =>
    {
        getMeetingInfo(id).then((response) => {
            let topic = response["topic"];
            let payload = {
                "app_key": apiKey, 
                "tpc": topic,
                "version": 1, 
                "role_type": role,
                "user_identity": "",
                "session_key": "",
                "geo_regions": "US", 
                "iat": 0, 
                "exp": 0,
                "pwd": 123456
            }

            let token = getJWTToken(payload, apiSecret);
            let username = (role === 1 ? tutorName : patronName);
            console.log(client)
            client.join(topic, token, username).then(() => {
                setStream(client.getMediaStream());

                // this line also doesn't work just yet bc of react.js being absolutely stupid
                //stream.startAudio(); // this works on all browsers but safari (eww safari), and if there is little to no user interaction on the page previously this will fail

                let peoples = []
                client.getAllUser().forEach((user) => {
                    if(user.bVideoOn) {
                        stream.renderVideo(document.querySelector("#" + user.userId + "-video-canvas"), user.userId, 300, 200, 0, 0, 3);
                    }
                    if (patronName !== user.displayName && tutorName !== user.displayName)
                        peoples.push(user.userId);
                });

                setPeopleInMeeting(peoples);
                

                // event listeners
                client.on("user-added", (payload) => {
                    console.log(payload[0].displayName + " approaches");
                    setPeopleInMeeting([...peopleInMeeting, payload[0].userId]);
                });

                client.on("user-removed", (payload) => {
                    console.log(payload[0].displayName + " retreats");
                    setPeopleInMeeting(peopleInMeeting.filter((person) => payload[0].userId !== person));
                });

                client.on("user-updated", (payload) => {
                    console.log(payload[0].userId + " updates");
                });

                client.on("peer-video-state-change", (payload) => {

                    let s = client.getMediaStream(); // idk why but stream gets set to undefined here and here alone, so this is a bad workaround
                    if (payload.action === "Start")
                    {
                        s.renderVideo(document.querySelector("#participant-videos"), payload.userId, 300, 200, 0, 0, 3); 
                        
                    }
                    else if (payload.action === "Stop")
                    {
                        s.stopRenderVideo(document.querySelector("#participant-videos"), payload.userId); 
                        
                    }
                });

                client.on("auto-play-audio-failed", () => {
                    console.log("auto play failed, press start audio");
                });

                client.on("device-change", () => {
                    let s = client.getMediaStream(); // ^^^^^^^^^
                    setCameras(s.getCameraList());
                    setSpeakers(s.getSpeakerList());
                    setMics(s.getMicList());
                });

                client.on("active-speaker", (payload) => {
                    console.log("Speaking:", payload);
                });



            }).catch((error) => {
                console.log("Stream unsuccessful");
                console.error(error);
            })
            

        });
    }

    const showVideo = (role) =>
    {
        if (role === 1)
            role = "tutor";
        if (role === 0)
            role = "patron";
        if (stream.isRenderSelfViewWithVideoElement())
        {
            stream.startVideo({ videoElement: document.querySelector("#" + role + "-video-box"), hd:stream.isSupportHDVideo() });
        }
        else
        {
            stream.startVideo().then(() => {
                stream.renderVideo(document.querySelector("#" + role + "-canvas-box-video"), client.getCurrentUserInfo().userId, 300, 200, 0, 0, 3);
            })
        }
    }

    const cameraList = () =>
    {
        return (
            <div style={{margin:"auto"}}>
                Camera list <br/>
                {cameras.map((camera) =>
                {
                    return (<div> 
                        <button key={camera.deviceId} onClick={() => {stream.switchCamera(camera.deviceId)}}> {camera.label} </button>
                        <br/>
                    </div>);
                })}
            </div>
        );
    };

    const micList = () =>
    {
        return (
            <div style={{margin:"auto"}}>
                Microphone list <br/>
                {mics.map((mic) =>
                {
                    return (<div>
                        <button key={mic.deviceId} onClick={() => {stream.switchMicrophone(mic.deviceId)}}> {mic.label} </button>
                        <br/>
                        </div>);
                })}
            </div>
        );
    };

    const speakerList = () =>
    {
        return (
            <div style={{margin:"auto"}}>
                Speaker list <br/>
                {speakers.map((speaker) =>
                {
                    return (
                    <div>
                        <button key={speaker.deviceId} onClick={() => {stream.switchSpeaker(speaker.deviceId)}}> {speaker.label} </button>
                        <br/>
                    </div>);
                })}
            </div>
        );
    };


    return (    
        <div id="page-container">
            <div id="content-wrap">
                <Navbar />
                <div style={{display:"flex", border:"solid 1px black"}}>
                    <div style={{border:"solid 1px black", margin:"auto", width:"25%", textAlign:"center"}} onClick={() => setPagenum(0)}>
                        Home
                    </div>
                    <div style={{border:"solid 1px black", margin:"auto", width:"25%", textAlign:"center"}} onClick={() => setPagenum(1)}>
                        Patron
                    </div>
                    <div style={{border:"solid 1px black", margin:"auto", width:"25%", textAlign:"center"}} onClick={() => setPagenum(2)}>
                        Tutor
                    </div>
                    <div style={{border:"solid 1px black", margin:"auto", width:"25%", textAlign:"center"}} onClick={() => setPagenum(3)}>
                        Admin
                    </div>
                    <div style={{border:"solid 1px black", margin:"auto", width:"25%", textAlign:"center"}} onClick={() => setPagenum(4)}>
                        Testing Controls
                    </div>
                </div>

                <div id="provider-data-container">
                    {getActiveWindow(pagenum)}
                </div>

                <Footer />
            </div>
        </div>
    );
    
}
 
export default MeetingTesting;