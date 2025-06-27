import React, {useContext, useState, useEffect, useRef, useCallback} from "react";
import TextField from '@mui/material/TextField'
import { UserContext } from "../../App";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import "./TutorChat.scss";
import PatronNotes from "./PatronNotes";

async function sendMessage(from, to, msg) {
  const fullAddr = "https://illuminated.cs.mtu.edu/ark/tut/send_chat";
	const authorization = 'Bearer ' + sessionStorage.getItem("BLIGHT");
  let response = [];
	response = await fetch(fullAddr, {
		method: 'POST',
		headers: {
			'Authorization': authorization,
			'Content-type': 'application/json',
		},
      body: JSON.stringify({
        "from": from,
        "to": to,
        "msg": msg,
      },)
	})
	.then(response => {
		if (response.ok) {
			return response.json()
		}
		throw response;
	})
	.catch(error => {
		console.error("error code found in (Tutor.js -> apiCall()", error);
    return error;
	})
	.finally(() => {
		//
	})

	return response;
}

const TutorChat = (props) =>
{   
    const { userId } = React.useContext(UserContext);

    const [selectedTutor, setSelectedTutor] = useState(undefined);
    const [openChats, setOpenChats] = useState([]);
    const [noting, setNoting] = useState(false);
    const chatbox = useRef();
    const scrollLocation = useRef();

    /*
    props.tutors are saved like so:
    props.tutors[tutor_id] = [[tutor_id, fname, lname, phone, email, 
    is_supertutor, is_online, last_online, is_available], [messages]]
    
    messages are saved like so:
    props.tutors[tutor_id][1] = [tothem?, message, time]

    selectedTutor and selectedChat are now saved as so:
    props.tutors[tutor_id][0]
    this is because the data is now being sent as a hashmap/dictionary
    type object, and js absolutely LOVES them, so when iterating
    through it I can only do the keys or the values and not both
    simultaneously, but props.tutors can only be accessed by key.
    There probably is an easier way to go about it, but I could not
    think of one. 
    */

    const sendChat = () => {
      //console.log(chatbox.current.value);
      if (chatbox.current.value !== "") {
        props.socketInstance.emit("t_message_t", {"t_id":selectedTutor[0],"from_id":userId, "message": chatbox.current.value});
        props.pushChat(selectedTutor[0], chatbox.current.value);
        sendMessage(userId, selectedTutor[0], chatbox.current.value)
        .then(() => {
          chatbox.current.value = "";
        })
        .catch(() => {
          // for if a message fails to send
        });
      }
    }

    const handleKeypress = (e) => {
      if (e.keyCode === 13) {
        sendChat();
      }
    }

    const openChat = (tutor) => {
      let tutorTabExists = undefined;
      for (const tutors of openChats.values()) {
        if (tutors[0] === tutor[0])
        {
          tutorTabExists = tutors;
        }
      }

      if (!tutorTabExists) {
        setOpenChats([...openChats, tutor]);
        setSelectedTutor(tutor);
      } else {
        setSelectedTutor(tutorTabExists);
      }
      setNoting(false);
      //chatbox.current.focus();
    }

    const closeChat = (tutor) => {
      const indexOfTutor = openChats.indexOf(tutor);
      const filteredOpenChats = openChats.filter((tutors) => tutors[0] !== tutor[0]);
      setOpenChats([...filteredOpenChats]);
      
      setSelectedTutor(
        filteredOpenChats.length > 0 && indexOfTutor !== 0 ? filteredOpenChats[indexOfTutor-1]
        : filteredOpenChats.length > 0 ?  filteredOpenChats[0]
        : undefined
      );
    }

    useEffect(() => {
      scrollLocation.current?.scrollIntoView({behavior: "smooth", block: "end"});
    }, [selectedTutor, sendChat])

    useEffect(() => {
      if (selectedTutor !== undefined && props.tutors[selectedTutor[0]] === undefined)
      {
        setSelectedTutor(undefined);
      }
    }, [props.tutors])

    useEffect(() => {
      if (!props.meetingId)
        setNoting(false);
      else if (props.meetingId && !noting) {
        setNoting(true);
        setSelectedTutor(undefined);
      }
    }, [props.meetingId])

    return ( 
      <div style={{height: '45vh'}}>

        <div className="chat-section">
          <div className="chat-box-content">
            <div className="tabs-list">
              <ul className="tabs">
                { openChats.length === 0 && !props.meetingId && (
                  <li className="chat-tab active-tab">
                    <div style={{ paddingLeft: "100px" }}>&nbsp;</div>
                  </li>
                )}

                { props.meetingId && (
                    <li key={"PN"} className={noting ? "active-tab" : "inactive-tab"} onClick={() => {setNoting(true); setSelectedTutor(undefined);}}>
                      <FontAwesomeIcon icon="fa-solid fa-comments" />
                      <div style={{ paddingLeft: "100px" }}>Notes</div>
                    </li>
                  )}
                {/* { openChats.length !== 0 && (
                  <li className="chat-tab active-tab">
                    <div style={{ paddingLeft: "100px" }}>&nbsp;</div>
                    <button className="close-chat" onClick={() => {setSelectedTutor(undefined); setOpenChats([]); setNoting(false)}}><FontAwesomeIcon icon="fa-solid fa-xmark" /></button>
                  </li>
                )} */}
                {openChats.length !== 0 && openChats.map((tutor) => {
                  console.log(tutor, props.tutors, selectedTutor);
                  console.log(props.tutors[tutor[0]]);
                    return (
                      <li
                        key={tutor[0]}
                        className={selectedTutor && tutor[0] === selectedTutor[0] ? "active-tab" : "inactive-tab"}
                        onClick={() => openChat(props.tutors[tutor[0]][0])}
                      >
                        <button className="close-chat" onClick={(e) => { e.stopPropagation(); closeChat(props.tutors[tutor[0]][0])}}><FontAwesomeIcon icon="fa-solid fa-xmark" /></button>
                        {tutor[1]} {tutor[2]}
                      </li>
                    );
                })}
              </ul>
            </div>
            { noting && (
              <div className="chat-box-wrapper">
                <PatronNotes
                  inMeeting={true}
                  patron={props.patron}
                  setPatron={props.setPatron}
                  patronNotes={props.patronNotes}
                  setPatronNotes={props.setPatronNotes}
                />
              </div>
            )}
            {selectedTutor === undefined && !noting && (
              <div className="chat-box-wrapper">
                <div className="messagebox" />
                <div className="chat-flex"> 
                  <TextField disabled inputRef={chatbox} className="yapper text-field-disabled" onKeyDown={handleKeypress} label="Select a tutor from the list before chatting..." variant="outlined"></TextField>
                  <button disabled className="send-button-disabled" onClick={sendChat}>send</button>
                </div>
              </div>
            )}
            { selectedTutor !== undefined && !noting && (
              <div className="chat-box-wrapper">
                {/***** MESSAGES WITH SELECTED TUTOR *****/}
                {props.tutors[selectedTutor[0]] !== undefined &&
                props.tutors[selectedTutor[0]][1] !== undefined && props.tutors[selectedTutor[0]][1].length !== 0 && (
                  <div className="messagebox">
                    
                    
                    
                    {props.tutors[selectedTutor[0]][1].reverse().map((message) => {
                      if (message[0] === 0) {
                        return (
                          <div className="name-and-message">
                            <div>{props.tutors[selectedTutor[0]][0][1]}</div>
                            <div className="other-user-message test-message"  key={message[2]}> 
                              <h6 className="other-message"> {message[2]} </h6>
                              <div className="other-message">{message[1]}</div> 
                            </div>
                          </div>
                        );
                      }
                      
                      return (
                        <div className="name-and-message">
                          <div style={{textAlign: "right"}}>You</div>
                          <div className="current-user-message test-message" key={message[2]}> 
                            <h6 className="me-message"> {message[2]} </h6>
                            <div className="me-message">{message[1]}</div> 
                          </div>
                        </div>
                      );
                    })}
                    <div id="dummydiv" ref={scrollLocation}></div>
                  </div>
                )}

                {/***** NO MESSAGES WITH SELECTED TUTOR *****/}
                {props.tutors[selectedTutor[0]] !== undefined && 
                (props.tutors[selectedTutor[0]][1] === undefined || props.tutors[selectedTutor[0]][1].length === 0) && (
                  <div className="messagebox"> 
                    You have no messages with {props.tutors[selectedTutor[0]][0][1]}
                  </div>
                )}

                <div className="chat-flex"> 
                  <TextField noValidate inputRef={chatbox} /*InputLabelProps={{ shrink: false }}*/ className="yapper" onKeyDown={handleKeypress} label="Chat here..." variant="outlined" ></TextField>
                  <button className="send-button" onClick={sendChat}>send</button>
                </div>
              </div>
            )}
          </div>

          <div className="chat-tutor-list">
              {/* {props.meetingId !== undefined &&
                <div className="chat-tutor" onClick={()=> {setNoting(true); }}>
                  <FontAwesomeIcon icon="fa-solid fa-comments" />
                  <div className="chat-tutor-name" >Notes</div>
                </div>
              } */}

              {Object.keys(props.tutors).filter((tutor) => {
                return tutor !== userId;
              })
              .map((tutor) => {
                return (
                  <div className="chat-tutor" key={props.tutors[tutor][0]} onClick={() => openChat(props.tutors[tutor][0])}>
                    
                    {/* {props.availTutors.includes(tutor) && (
                      <FontAwesomeIcon icon="fa-solid fa-comments" />
                    )}
                    {!props.availTutors.includes(tutor) && (
                      <FontAwesomeIcon icon="fa-solid fa-message" />
                    )} */}
                    
                    
                    {/* {props.tutors[tutor][8] && (
                      <FontAwesomeIcon icon="fa-solid fa-comments" />
                    )}
                    {!props.tutors[tutor][8] && (
                      <FontAwesomeIcon icon="fa-solid fa-message" />
                    )} */}

                    {/* {props.tutors[tutor][0][8] && (
                      <FontAwesomeIcon icon="fa-solid fa-comments" />
                    )}
                    {!props.tutors[tutor][0][8] && (
                      <FontAwesomeIcon icon="fa-solid fa-message" />
                    )} */}
                    

                    <FontAwesomeIcon icon="fa-solid fa-message" />
                    
                    <div className="chat-tutor-name">{props.tutors[tutor][0][1]} {props.tutors[tutor][0][2]}</div>
                  </div>
                );
              })}
              
          </div>            
        </div>
      </div>
    );
}

export default TutorChat;