import React, {useContext, useState, useEffect, useRef} from "react";
//import { EventEmitter } from "node:events";
import { UserContext } from "../../App.js";
import Navbar from "../../subscript/universal/Navbar.js";
import Footer from '../../subscript/universal/Footer.js';
import MeetingView from "./MeetingView.js";
import TutorChat from "./TutorChat.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NotificationManager } from 'react-notifications';
import RoomBox from "./roomBox.js";

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';

import Popup from 'reactjs-popup';
import { io } from "socket.io-client";

import "./Tutor.scss";
import ServiceBox from "./serviceBox.js";

async function getMeetingInfo(id) {
  const fullAddr = "https://illuminated.cs.mtu.edu/ark/tut/general_get_meeting_info/";
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
      console.error("error code found in (Tutor.js -> getMeetingInfo()", error);
          return error;
    })
    .finally(() => {
      //
    })
  return response;
}

async function logon(id, onoff="on") {
    const fullAddr = "https://illuminated.cs.mtu.edu/ark/tut/log";
  const authorization = 'Bearer ' + sessionStorage.getItem("BLIGHT");
    let response;
    response = await fetch(fullAddr + onoff + "/" + id, {
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
    console.error("error code found in (SuperTutor.js -> logon()", error);
        return error;
  })
  .finally(() => {
    //
  })

  return response;
}

async function getCheckedoutDeviceStatus() {
    const fullAddr = "https://illuminated.cs.mtu.edu/ark/devices/checkedout_devices";
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
    console.error("error code not found in (SuperTutor.js -> getCheckedoutDeviceStatus() -> Ark request -> (catch) received_response[\"error\"] ", error);
  })
  .finally(() => {
    //
  })

  return response; 
}

async function assignPatronToTutor(meetingId, tutorId) {
    const fullAddr = "https://illuminated.cs.mtu.edu/ark/tut/assign_patron_to_tutor/";
  const authorization = 'Bearer ' + sessionStorage.getItem("BLIGHT");
    let response = [];
  response = await fetch(fullAddr + meetingId + "/" + tutorId, {
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
    console.error("error code found in (SuperTutor.js -> assignPatronToTutor()", error);
        return error;
  })
  .finally(() => {
    //
  })

  return response;
}

async function updatePatronNotes(notes) {
  const fullAddr = "https://illuminated.cs.mtu.edu/ark/tut/update_patron_note";
  const authorization = 'Bearer ' + sessionStorage.getItem("BLIGHT");
  let response = [];
  response = await fetch(fullAddr, {
    method: 'POST',
    headers: {
      'Authorization': authorization,
      'Content-type': 'application/json',
    },
    body: JSON.stringify({
        "notes": notes,
    },)
  })
  .then(response => {
    if (response.ok) {
      return response.json()
    }
    throw response;
  })
  .catch(error => {
    console.error("error code found in (Tutor.js -> updatePatronNotes()", error);
        return error;
  })
  .finally(() => {
    //
  })

  return response;
}


async function clearQueue() {
  const fullAddr = "https://illuminated.cs.mtu.edu/ark/tut/clear_queue";
  const authorization = 'Bearer ' + sessionStorage.getItem("BLIGHT");
  let status;


  status = await fetch(fullAddr, {
      method: 'POST',
      headers: {
      'Authorization': authorization,
      'Content-type': 'application/json',
      },
  })
  .then(response => {
      if (response.ok) {
      return response.json();
      }
      throw response;
  })
  .catch(error => {
      console.error("error code found in Tutor (Tutor.js -> clearQueue()", error);
      console.log(error);
      return error;
  })
  .finally(() => {
      //
  })

  return status; 
}

const Tutor = (props) =>
{
    const { userId } = React.useContext(UserContext);

    const [cameras, setCameras] = useState([]);
    const [mics, setMics] = useState([]);
    const [speakers, setSpeakers] = useState([]);

    const [currentCamera, setCurrentCamera] = useState(null);
    const [currentMic, setCurrentMic] = useState(null);
    const [currentSpeaker, setCurrentSpeaker] = useState(null);

    const [settingsOpen, setSettingsOpen] = useState(false);
    const [emphRooms, setEmphRooms] = useState(false)
    
    const [patronQueue, setPatronQueue] = useState([]);

    const [meetingId, setMeetingId] = useState();
    const [meetingTopic, setMeetingTopic] = useState();
    const [inMeeting, setInMeeting] = useState(false);
    const [patron, setPatron] = useState();
    const [patronInRoom, setPatronInRoom] = useState(false);
    const [patronNotes, setPatronNotes] = useState([]);
    const [devices, setDevices] = useState([]);
    const devicesRef = useRef(devices);
    devicesRef.current = devices;

    const [userFocused, setUserFocused] = useState(true);

    const [tutors, setTutors] = useState({});
    const tutorsRef = useRef(tutors);
    tutorsRef.current = tutors;
    const [availTutors, setAvailTutors] = useState([]);
    const [onlineTutors, setOnlineTutors] = useState([]);
    const [selectedTutor, setSelectedTutor] = useState();

    const [expanded, setExpanded] = React.useState('panel1');

    const [socketInstance, setSocketInstance] = useState("");
    const [setServerURL, serverURL] = useState("https://illuminated.cs.mtu.edu/");
    let socketDestroyer = () => {};

    const [noteTaking, setNoteTaking] = useState(false);
    const [fsNoting,  setFsNoting] = useState(false);

    const handleExpansion = (panel) => (event, newExpanded) => {
      setExpanded(newExpanded ? panel : false);
    };


    const updateTutorStuff = (currentTutors) => {
      // console.log(currentTutors["937e12b8-2371-11ef-8f39-d826328918dc"]);
      setTutors(currentTutors);
      var newOnlineTutors = {};
      var newAvailTutors = {};

      for (const [k, v] of Object.entries(currentTutors)) {
        if (v[0][6] === 1) 
        {
          newOnlineTutors[k] = v;
        }
        if (v[0][6] === 1 && v[0][8] === 1)
        {
          newAvailTutors[k] = v;
        }
      }
      setOnlineTutors(newOnlineTutors);
      setAvailTutors(newAvailTutors);

    };

    const assignToTutor = (meeting, tutor) => {
      console.log(tutor);
      assignPatronToTutor(meeting, tutor)
      .then((response) => {
        console.log(response)
        if (response["STATUS"] === "NO SUCCESS")
          console.error("There was an error assigning patron to tutor");
        else
          socketInstance.emit("joined_queue", {"m_id": meeting, "regular_tutor_id": tutor})
          pullAllData();
      })
      .catch((e) => {
          console.error("There was an error assigning a patron to a tutor");
          console.error(e)
      })
    }

    //console.log(userId) // efbdd862-ba62-11ee-8f39-d826328918dc
    const getMediaDevices = async () =>
    {
        try {
            await navigator.mediaDevices.enumerateDevices().then((devices) => {
                //console.log(devices)
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
            })

            
        } catch (error) {
            console.error('Error accessing media devices:', error);
        }
    }

    const doNotification = (msg) => 
    {
        let messageTitle = "Illuminated Notification";
        let notificationTimeout = 5000 // milis

        let notificationOptions = {
            body: msg, 
            //icon: ,
            dir: "ltr",
        };

        if (userFocused)
        {
            NotificationManager.info(msg, messageTitle, notificationTimeout);
        }
        else
        {
            var notification = new Notification(messageTitle, notificationOptions);
            setTimeout(() => notification.close(), notificationTimeout)
        }
            
    }

    const handleEmph = () => {
        setEmphRooms(true);
        setTimeout(() => {
            setEmphRooms(false);
            }, 5000);
    }

    const funny = () => 
    {
      var elements = document.body.getElementsByTagName("*");
      console.log(elements)
      for (let i = 0; i < elements.length; i++)
      {
        console.log(i)
        elements[i].style.backgroundColor = '#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0');
        elements[i].style.left= (Math.random() * 1000) + "px";
        elements[i].style.top= (Math.random() * 600) + "px";
        elements[i].style.transform = 'rotate(' + (Math.random() * 360) + 'deg)';

      }
      setTimeout(funny, 1)
  
    }

    const pushChat = (tutorId, message, toThem=1) => {
      console.log(tutorId);
      let num2day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      let num2month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      let currentTime = new Date(Date.now());
      const currentTutors = tutorsRef.current;
      currentTutors[tutorId][1].push([toThem, message, 
         num2day[currentTime.getDay()] + ", " + currentTime.getDate().toString().padStart(2, "0") + " " + 
         num2month[currentTime.getMonth()] + " " + currentTime.getFullYear() + " " +
         currentTime.getHours() + ":" + currentTime.getMinutes() + ":" + currentTime.getSeconds() + " GMT"]);
      updateTutorStuff(currentTutors);
    }

    const patronJoinedQueue = (id) => 
    {
      pullAllData();
      getMeetingInfo(id)
      .then((response) => {
        response = response["INFO"];
        console.log(response);
        doNotification("Patron " + response[3] + " " + response[4] + " has joined the queue");
      });
    }

    const pullAllData = () => {
      logon(userId)
      .then((response) => {
        console.log(response)
        updateTutorStuff(response["tutors"]);
        setPatronQueue(response["queue"]);
        setDevices(response["devices"]);
      }).catch((e) => {
        console.error("There was an error logging in")
        console.error(e);
      });
    }

    function socketSetup() {
      const connType = (props.isST ? "super" : "") + "tutor";
      const socket = io({
          transports: ["polling", "websocket", "webtransport"],
          //path: "/socket.io/",
          //upgrade: false,
          cors: {
              origin: serverURL,
          },
          query:{
              "uuid":userId,
              "type":connType,
          }
          //autoConnect:false,
          //rejectUnauthorized: false, // big bad do not uncomment
      });
      setSocketInstance(socket);
      socket.on("connect", (data) => {
          const engine = socket.io.engine;
          engine.on("upgrade", () => {
              console.log("upgraded,", engine.transport.name); 
          });

          engine.on("packet", ({ type, data }) => {
              // called for each packet received
          });

          engine.on("packetCreate", ({ type, data }) => {
              // called for each packet sent
          });

          engine.on("drain", () => {
              // called when the write buffer is drained
          });

          engine.on("close", (reason) => {
              // called when the underlying connection is closed
          });

          engine.on("reconnect_error", (error) => {
              console.error(error);
          });

          engine.on("error", (error) => {
              console.error(error);
          });
      });

      socket.on("p_joined", (data) => {
        patronJoinedQueue(data["m_id"]);
        
      });

      socket.on("mq_cleared", () => {
        setPatronQueue([]);
      });

      socket.on("tutor_generic_receive", (data) => {
        if (data["type"] === undefined) {
          return;
        }
        switch (data["type"])
        {
          default:
          console.error("Unknown generic signal:", data["type"]);
        }
      });

      socket.on("device_log_on", (data) => {
        pullAllData();
      });

      socket.on("device_log_off", (data) => {
        pullAllData();
      });

      socket.on("r_p_from_queue", (data) => {
        pullAllData();
        
      });

      socket.on("t_log_on", (data) => {
        // logic to get tutor information and add it to tutors
        pullAllData();
      });

      socket.on("t_log_off", (data) => {
        // logic to get tutor information and add it to tutors
        try {
          const currentTutors = tutorsRef.current;
          currentTutors[data["uuid"]][0][6] = 0;

          updateTutorStuff(currentTutors);

          logon(data["uuid"], "off")
          .catch((e) => {
            throw e
          });
        } catch (e) {
          console.error(e);
        }
        
      });

      socket.on("new_message", (data) => {
        pushChat(data["from_id"], data["message"], 0);
        doNotification("Tutor " + tutorsRef.current[data["from_id"]][0][1]+ " messaged");
      });

      socket.on("tutors_pull_all_data", () => {
        pullAllData();
      });

      socket.on("disconnect", (reason, details) => {
          if (socket.active)
          {
              console.log("Socket disconnected, reconnecting", reason, details ? details.message : "no details");
          }
          else
          {
            console.error("Socket disconnected")
            console.log(reason);
            if (details)
            {
              console.log(details.message);
              console.log(details.description);
              console.log(details.context);
            }
          }
      });

      socket.onAny((eventName, ...args) => {
          console.error(eventName);
          console.error(args);
      })

      socket.on("connect_error", (err) => {
          console.error(err.req);
          console.error(err.code);
          console.error(err.message);
          console.error(err.context);
      });

      return function cleanup() {
          //console.log("did");
          socket.disconnect();
      };
    }

    useEffect(() => {
      socketDestroyer = socketSetup();
      return () => {socketDestroyer()};
    }, [serverURL])

    useEffect(() => {
      //console.log(tutors);
    }, [tutors])

    useEffect(() => 
    {
        getMediaDevices();

        pullAllData();
        

        if (!("Notification" in window)) 
        {
          console.error("Browser doesn't support desktop notifications");
        }
        else
        {
          Notification.requestPermission();
        }
        
        window.addEventListener("focus", () => setUserFocused(true));
        window.addEventListener("blur", () => setUserFocused(false));

        // navigator.mediaDevices.getUserMedia({video: true, audio: true})
        // .then((s) => {
        //     s.getTracks().forEach((t) => {
        //         t.stop();
        //     })
        // })
        // .catch((e) => {
        //     console.error("there was an error requesting camera and microphone permissions");
        //     console.error(e);
        // })
        //setTimeout(() => {}, 2000);
        
    }, []);

    // componentDidMount() {
    //     
    // }

    if (userId) {
        return (  
            
        <div id="body">
            {/* <button className={"settings-button"} onClick={() => setSettingsOpen(true)} disabled={true}>
                Settings <FontAwesomeIcon icon="fa-solid fa-gear" />
            </button> */}
            
            {/*
            <button onClick={() => getPatronQueue().then((response) => {setPatronQueue(response["PATRONS"]); console.log(patronQueue)})}>
                Test endpoint
            </button>
            */}
            <div className="service-row">
              <Accordion defaultExpanded id="service-box" /*className="service-format"*/ className="Accordion" style={{margin: 'auto'}}>
                <AccordionSummary
                  expandIcon={<FontAwesomeIcon icon="fa-solid fa-caret-down"/>}
                  aria-controls="panel1-content"
                  id="panel1-header"
                  className="AccordionSummary"
                >
                  <Typography component={"span"} variant={'body2'}>IDs in Service </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography component={"span"} variant={'body2'}>
                    <button className="notes-update-button" onClick={() => {clearQueue(); socketInstance.emit("clear_patron_queue", {}); clearQueue();}}>Clear Queue</button> 
                    
                    <ServiceBox
                      setDevices={setDevices}
                      devices={devices}
                      patronQueue={patronQueue}
                      clearQueue={() => setPatronQueue([])} 
                      socketInstance={socketInstance} 
                      assignPT={assignToTutor} 
                      selectedTutor={selectedTutor} 
                      setSelectedTutor={setSelectedTutor} 
                      availTutors={availTutors} 
                      queue={patronQueue} 
                      patron={patron}
                      setPatron={setPatron} 
                      setMeetingTopic={setMeetingTopic} 
                      setPatronQueue={setPatronQueue} 
                      meetingId={meetingId} 
                      setMeetingId={setMeetingId} 
                      tutors={tutors}
                      setPatronNotes={setPatronNotes}
                      userId={userId}
                      patronInRoom={patronInRoom}
                    />

                  </Typography>
                </AccordionDetails>
              </Accordion>
            </div>

            <div id="tutor-content">
              <div className="left-half-format">
                <Accordion 
                  defaultExpanded 
                  id="meeting-box"
                  className={meetingId !== undefined ? "customZoomAccordion" : "ZoomAccordion"}
                >
                  <AccordionSummary
                    expandIcon={<FontAwesomeIcon icon="fa-solid fa-caret-down"/>}
                    aria-controls="panel2-content"
                    id="panel2-header"
                    className="AccordionSummary"
                  >
                    <Typography component={"span"} variant={'body2'}>
                      {(meetingId === undefined) &&
                      <div>Illuminated Session</div>
                      }
                      
                      {(meetingId !== undefined) &&
                      <div style={{fontWeight: 'bold'}}>Illuminated Session - In Meeting with {patron[3]} {patron[4]}</div>
                      }
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography component={"span"} variant={'body2'}>
                      <MeetingView 
                        socketInstance={socketInstance} 
                        isST={props.isST} 
                        handle={handleEmph} 
                        emphRooms={emphRooms} 
                        availTutors={availTutors} 
                        patron={patron} 
                        setPatron={setPatron} 
                        meetingId={meetingId} 
                        setMeetingId={setMeetingId} 
                        meetingTopic={meetingTopic} 
                        userId={userId} 
                        inMeeting={inMeeting} 
                        setInMeeting={setInMeeting} 
                        updateNote={() => {updatePatronNotes(patronNotes)}}
                        setNoteTaking={setNoteTaking}
                        noteTaking={noteTaking}
                        setExpanded={setExpanded}
                        handleExpansion={handleExpansion}
                        patronNotes={patronNotes}
                        setPatronNotes={setPatronNotes} 
                        setFsNoting={setFsNoting}
                        fsNoting={fsNoting}
                        setPatronInRoom={setPatronInRoom}
                        pullAllData={pullAllData}
                        patronLeave={() => {doNotification("Patron " + patron[3] + " " + patron[4] + " has left the meeting"); setPatronInRoom(false);}}
                      />
                    </Typography>
                  </AccordionDetails>
                </Accordion>
                
                {props.isST && (
                  <Accordion defaultExpanded id="room-box" className={(emphRooms && inMeeting) ? "customAccordion" : "Accordion"}>
                    <AccordionSummary
                      expandIcon={<FontAwesomeIcon icon="fa-solid fa-caret-down"/>}
                      aria-controls="panel2-content"
                      id="panel2-header"
                      className="AccordionSummary"
                    >
                        <Typography component={"span"} variant={'body2'}><div>Rooms</div></Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography component={"span"} variant={'body2'}>
                        <RoomBox 
                          setMeetingId={setMeetingId} 
                          setSelectedTutor={setSelectedTutor} 
                          tutors={tutors} 
                          patron={patron} 
                          assignPT={assignToTutor} 
                          onlineTutors={onlineTutors} 
                          meetingId={meetingId}/>
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                )}

              </div>
              <div className="right-half-format">
                <Accordion defaultExpanded id="chat-box" className="ChatBoxAccordion" >
                  <AccordionSummary
                    expandIcon={<FontAwesomeIcon icon="fa-solid fa-caret-down"/>}
                    aria-controls="panel4-content"
                    id="panel4-header"
                    className="AccordionSummary"
                  >
                    <Typography component={"span"} variant={'body2'}>Chat</Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ height: "90%" }}>
                    <TutorChat 
                      pushChat={pushChat}
                      meetingId={meetingId} 
                      tutors={onlineTutors}
                      inMeeting={inMeeting} 
                      socketInstance={socketInstance} 
                      patron={patron} 
                      setPatron={setPatron} 
                      patronNotes={patronNotes}
                      setPatronNotes={setPatronNotes}
                      isST={props.isST}
                    />
                  </AccordionDetails>
                </Accordion>
              </div>
            </div>
            <Popup contentStyle={{width:"80%"}} open={settingsOpen} onClose={() => {setSettingsOpen(false)}} position="center">
                Settings <button onClick={getMediaDevices}>Refresh device list</button>
                <br/>
                <div style={{display:"flex", flexDirection:"horizontal", justifyContent: "space-around"}}>
                    <div style={{margin:"auto", marginRight:"5px"}}>
                        Available Cameras:
                        <br/>
                        {cameras.map(camera => {
                            return (<div key={camera.deviceId} onClick={() => setCurrentCamera(camera)} style={{border:"solid black 1px", backgroundColor:(camera.label === currentCamera.label ? "lightgray" : "white")}}> {camera.label} </div>);
                        })}

                    </div>
                    
                    <div style={{margin:"auto", marginRight:"5px"}}>
                        Available Microphones:
                        <br/>
                        {mics.map(mic => {
                            return (<div key={mic.deviceId} onClick={() => setCurrentMic(mic)} style={{border:"solid black 1px", backgroundColor:(mic.label === currentMic.label ? "lightgray" : "white")}}> {mic.label} </div>)
                        }
                        )}

                    </div>
                    <div style={{margin:"auto"}}>
                        Available Speakers:
                        <br/>
                        {speakers.map(speaker => {
                            return (<div key={speaker.deviceId} onClick={() => setCurrentSpeaker(speaker)} style={{border:"solid black 1px", backgroundColor:(speaker.label === currentSpeaker.label ? "lightgray" : "white")}}> {speaker.label} </div>)
                        })}

                    </div>
                </div>
            </Popup>
        </div>

                            
        );
    }
}

export default Tutor;