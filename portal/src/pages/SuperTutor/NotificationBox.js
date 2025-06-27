import React, {useState, useEffect} from "react";
import Popup from 'reactjs-popup';
import {UserContext} from "../../App";
import "./NotificationBox.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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
        console.error("error code found in NotificationBox (NotificationBox.js -> patronJoinQueue()", error);
        console.log(error);
        return error;
    })
    .finally(() => {
        //
    })

    return status; 
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
    console.error("error code found in NotificationBox (NotificationBox.js -> clearQueue()", error);
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


const NotificationBox = (props) =>
{
// ****************** ALSO FOR ACCORDION-ASAGE DO NOT TOUCH THIS IS ROUGH ***********************//
    // const[isActive, setIsActive] = useState(false)

    // const handleAccordionClick = ()=>{
    //     setIsActive(!isActive);
    // }
    //console.log(props.queue)

    const {userId} = React.useContext(UserContext);

    const now = new Date();
    const options = {
        timeZone: 'America/New_York',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    };
    const formatter = new Intl.DateTimeFormat('en-US', options);
    const formattedTime = formatter.format(now);
    const [hours, minutes] = formattedTime.split(':');

    // const whosOnline = () => {
    //     return props.tutors !== 0 ? props.tutors.filter((tut) => {
    //         return (tut[6] === 1 && tut[5] === 0);
    //     }) : [];
    // }

    const [assigning, setAssigning] = useState(false);

    const joinMeeting = (patron) =>
    {
      // remove person from queue call
      patronJoinQueue(patron[0]);
      getPatronNotes(patron[1])
      .then((response) => {

        console.log(response, patron);
        if (response["NOTES"] === "ERROR")
          throw Error("ERROR GETTING NOTES");
        props.setPatronNotes(response["NOTES"])
      })
      .catch(console.error);

      props.socketInstance.emit("patron_join_tutor", {"p_id":patron[1], "m_id":patron[0]})
      props.setMeetingId(patron[0]);
      props.setMeetingTopic(patron[6]);
      props.setPatron(patron);

    }

    const formatTime = (date) => {
      const options = {
        timeZone: 'America/New_York',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      };
      return new Intl.DateTimeFormat('en-US', options).format(date);
    };
    
    return (
      <div className="notifications-box">
        <div className="notifications-content">
          {props.queue !== undefined && props.queue.length === 0 && (
            <div> &nbsp;&nbsp;There are no patrons in the queue </div>
          )}
          {
            props.queue
            .map(patron => {
              return (
                <div key={patron[0]} className="notification-info-container" /* style={{whiteSpace: "nowrap"}} */> 
                  ({hours}:{minutes}) {patron[3]} {patron[4]} has joined the queue from {patron[5]}. 
                  {/* ({formatTime(new Date(patron.joinTime))}) {patron.name} has joined the queue from {patron.location}.  */}
                  {/* <br></br> */}
                  <div className="notification-tutor-buttons">
                    <button className="join-button" onClick={() => joinMeeting(patron)} disabled={props.meetingId !== undefined} >Join Meeting<FontAwesomeIcon style={{marginLeft: '1vh'}} icon="fa-solid fa-people-group"/></button>
                    <button className="assign-patron-button" onClick={() => setAssigning(true)}> Assign to a room </button>
                  </div>
                  <Popup contentStyle={{height: "45.75vh", width:"83.5vh", position:"absolute", right:"3vh", bottom:"7.5vh", borderRadius:"10px"}} open={assigning} onClose={() => {setAssigning(false)}} close={!assigning}>
                    <div>
                      {props.availTutors && Object.keys(props.availTutors).filter((tutors) =>{
                        return tutors !== userId;
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
                  </Popup>
                </div>
              );
            })
          }
        </div>
        <button className="clear-button" onClick={() => {clearQueue(); props.socketInstance.emit("clear_patron_queue", {}); props.clearQueue();}}>Clear Queue</button>
      </div>
    );
}

export default NotificationBox;