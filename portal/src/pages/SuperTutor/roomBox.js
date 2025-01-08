import React, {useContext, useState, useEffect, useRef} from "react";
import { UserContext } from "../../App";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Tooltip from '@mui/material/Tooltip';

import "./roomBox.scss";

const RoomBox = (props) =>{

    const [selectedRoom, setSelectedRoom] = useState([]);

    const {userId} = React.useContext(UserContext);
    const [nowPage, setNowPage] = useState(0);
    const tPp = 3;

    const tutFilt = Object.keys(props.onlineTutors).filter((tutor) => tutor !== props.userId);
    const totPage = Math.ceil(tutFilt / tPp);

    const seenTut = tutFilt.slice(nowPage * tPp, (nowPage+1)* tPp);

    return (

        <div className="room-container">

            {/* <button onClick={() => console.log("Online tutors length: " + props.onlineTutors)}></button> */}

            {seenTut.map((tutor, index) => {
                return (
                    <div key={tutor}>
                        {props.meetingId === undefined ? (
                            <div className="tutor-rooms">
                                <Tooltip className="small-screen-bt" title="Join a meeting to assign a patron">
                                    <button className="bad-button">Assign to Room {index + 1} </button>
                                </Tooltip>
                                T: {props.onlineTutors[tutor][0][1]} {props.onlineTutors[tutor][0][2]}
                            </div>
                        ) : (
                            <div className="tutor-rooms">
                                <button className="good-button" onClick={() => { props.assignPT(props.meetingId, props.onlineTutors[tutor][0][0]), props.setMeetingId(undefined) }}>
                                    Assign to Room {index + 1}
                                </button>
                                | T: {props.onlineTutors[tutor][0][1]} {props.onlineTutors[tutor][0][2]}
                            </div>
                        )}
                    </div>
                );
            })}
            
                <div className={(props.onlineTutors.length >= 3) ? "actBtns" : "disBtns"}>
                    <button onClick={() => setNowPage(prev => Math.max(prev - 1, 0))} disabled={nowPage === 0}>
                        Previous
                    </button>
                    <span>Page {nowPage + 1} of {totPage}</span>
                    <button onClick={() => setNowPage(prev => Math.min(prev + 1, totPage - 1))} disabled={nowPage === totPage - 1}>
                        Next
                    </button>
                </div>

{/* {Object.keys(props.onlineTutors).length === 0 &&(
                <div className="text">There are no tutors online right now...</div>
            )}

            {Object.keys(props.onlineTutors).length !==0 && (
                <div>
                    {Object.keys(props.onlineTutors)
                    .filter((tutors) => {
                        return tutors !== userId;
                    })
                    .map((tutor, index) => {
                        return (
                            // <div className="display-rooms">
                            //     {props.meetingId === undefined &&
                            //         <div className="rooms">
                            //             Room {index+1}
                            //             <br/>
                            //             <b>T:</b>{tutors[1]} {tutors[2]}
                            //             <br/>
                                        
                            //             <b>P:</b>
                            //         </div>
                            //     }
                            //     {props.meetingId !== undefined &&
                            //         <button className="rooms" onClick={() => {props.assignPT(props.meetingId, tutors[0]), props.setMeetingId(undefined)}}>
                            //             Room {index+1}
                            //             <br/>
                            //             <b>T:</b>{tutors[1]} {tutors[2]}
                            //             <br/>
                                        
                            //             <b>P:</b>
                            //         </button>
                            //     }
                            // </div>
                            <div key={tutor}>
                                {props.meetingId === undefined &&
                                    <div className="tutor-rooms">
                                        <Tooltip className="small-screen-bt" title="Join a meeting to assign a patron">
                                            
                                        <button className="bad-button">Assign to Room {index+1} </button>
                                        </Tooltip>
                                        T: {props.onlineTutors[tutor][0][1]} {props.onlineTutors[tutor][0][2]}
                                    </div>
                                }
                                {props.meetingId !== undefined &&
                                    <div className="tutor-rooms">
                                        <button className="good-button" onClick={() => {props.assignPT(props.meetingId, props.onlineTutors[tutor][0][0]), props.setMeetingId(undefined)}}>Assign to Room {index+1}</button>
                                        | T: {props.onlineTutors[tutor][0][1]} {props.onlineTutors[tutor][0][2]}
                                    </div>
                                }
                            </div>
                        )
                    })
                    }
                </div>
            )} */}

        </div>
    );
}

export default RoomBox;