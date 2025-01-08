import React, {useContext, useState } from "react";
import { UserContext } from "../../App";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./PatronNotes.scss";

const PatronNotes = (props) =>
{   
  const { userId } = useContext(UserContext);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0);

  const addNewNote = () => {
    // each note is [noteId, patronId, note, date]
    // when its a new note set noteId=0, in the db it will add it to table
    // when removing patron notes set patronId=0, db handles deletion based off noteId
    const updatedNotes = [...props.patronNotes, [0, props.patron[1], ""]]; // idx [3] could contain a date that it was updated if wanted, when pushed to server it will auto give timestamp
    props.setPatronNotes(updatedNotes);
    setCurrentNoteIndex(updatedNotes.length - 1);
  };

  const updateNote = (index, value) => {
    const updatedNotes = [...props.patronNotes];
    if (index >= props.patronNotes.length)
    {
      // have to create new note, but cant call addNewNote bc of usestate.setsomething being async
      const updatedNotes = [...props.patronNotes, [0, props.patron[1], value]];
      props.setPatronNotes(updatedNotes);
      setCurrentNoteIndex(index);
    }
    else
    {
      updatedNotes[index][2] = value;
      props.setPatronNotes(updatedNotes);
    }
  };

  const deleteNote = (index) => {
    const updatedNotes = [...props.patronNotes];
    updatedNotes[index][1] = 0;
    props.setPatronNotes(updatedNotes);
  };

  const handleNoteChange = (e) => {
    const value = e.target.value;
    updateNote(currentNoteIndex, value);

  };

  const handlePrevNote = () => {
    if (currentNoteIndex > 0) {
      setCurrentNoteIndex(currentNoteIndex - 1);
    }
  };

  const handleNextNote = () => {
    if (currentNoteIndex < props.patronNotes.length - 1) {
      setCurrentNoteIndex(currentNoteIndex + 1);
    }
  };

  return (
    <>
      {props.inMeeting && (
        <div className="patron-notes-box">
          <div className="notes-content">
            <div className="patron-notes-name">
              Patron Notes for {props.patron[3]} {props.patron[4]}
            </div>
            <div className={props.fsNoting ? "note-item-fs" : "note-item"}>
              <textarea
                className="notes-textbox"
                value={props.patronNotes && props.patronNotes[currentNoteIndex] ? props.patronNotes[currentNoteIndex][2] : ""}
                onChange={handleNoteChange}
              />
            </div>
            <div className={props.fsNoting ?"notes-navigation-fs" : "notes-navigation"}>
              <button
                className="notes-nav-button"
                onClick={handlePrevNote}
                disabled={currentNoteIndex === 0 || props.patronNotes.length === 0}
              >
                <FontAwesomeIcon icon="fa-solid fa-arrow-left" />
              </button>
              <button className="notes-update-button" onClick={addNewNote}>
                Add new note
              </button>
              <button
                className="notes-nav-button"
                onClick={handleNextNote}
                disabled={currentNoteIndex === props.patronNotes.length - 1 || props.patronNotes.length === 0}
              >
                <FontAwesomeIcon icon="fa-solid fa-arrow-right" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PatronNotes;