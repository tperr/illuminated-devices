import { Select, MenuItem } from "@mui/material";
import React, {useState, useEffect, useRef} from "react";
import { UserContext, userDetails } from "../../App.js";

import "./CreateDevice.scss"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


async function create(name, userid, notes, ipad) {
    const fullAddr = "https://illuminated.cs.mtu.edu/ark/devices/add";
	const authorization = 'Bearer ' + sessionStorage.getItem("BLIGHT");
    let response = [];
	response = await fetch(fullAddr, {
		method: 'POST',
		headers: {
			'Authorization': authorization,
			'Content-type': 'application/json',
		},
        body: JSON.stringify({
            "id": userid,
            "name": name,
            "notes": notes,
            "ipad": ipad,
        }),
	})
	.then(response => {
		if (response.ok) {
			return response.json()
		}
		throw response;
	})
	.catch(error => {
		console.error("error code not found in (CreateDevice.js -> create() -> Ark request -> (catch) received_response[\"error\"] ", error);
	})
	.finally(() => {
		//
	})

	return response; 
}

const firstWordInName = [
    'zany', 'crazy', 'wild', 'funky', 'happy', 'spicy', 'bright', 'cheerful', 'brave',
    'clever', 'calm', 'dizzy', 'eager', 'fierce', 'gentle', 'jolly', 'lazy', 'mighty',
    'quick', 'quiet', 'shiny', 'smart', 'silly', 'timid', 'witty', 'whimsical', 'quirky',
    'smooth', 'dusty', 'fuzzy', 'bold', 'fragile', 'lively', 'melodic', 'noisy', 'shy',
    'rough', 'icy', 'breezy', 'charming', 'grumpy', 'fearless', 'glowing', 'gloomy',
    'rusty', 'silky', 'stormy', 'fluffy', 'slimy', 'sharp', 'tiny', 'giant', 'magical',
    'mysterious', 'playful', 'glorious', 'dreamy', 'silent', 'adventurous', 'radiant',
    'whispering', 'vivid', 'smooth', 'frozen', 'blazing', 'twinkling', 'humble', 'sparkling',
    'running', 'jumping', 'skipping', 'dancing', 'singing', 'leaping', 'crawling', 'swimming', 
    'flying', 'sprinting', 'climbing', 'soaring', 'dashing', 'gliding', 'marching', 'drifting', 
    'twirling', 'spinning', 'swaying', 'whirling', 'bouncing', 'diving', 'racing', 'zooming', 
    'sliding', 'tumbling', 'floating', 'skating', 'stomping', 'buzzing', 'shuffling', 'whistling',
    'clapping', 'flickering', 'slithering', 'creeping', 'tiptoeing', 'paddling', 'hiking', 
    'galloping', 'storming', 'trotting', 'surging', 'gushing', 'crawling', 'whizzing', 'hopping',
    'wiggling', 'fluttering', 'crashing', 'snapping', 'blasting', 'sizzling', 'pouncing', 
    'juggling', 'splashing'
]

const secondWord = [
    'tree', 'mountain', 'ocean', 'river', 'cloud', 'sky', 'flower', 'lion', 'tiger',
    'bear', 'eagle', 'shark', 'whale', 'fox', 'deer', 'butterfly', 'dragon', 'fairy', 
    'storm', 'rock', 'wave', 'breeze', 'star', 'moon', 'sun', 'planet', 'comet', 'volcano',
    'forest', 'lake', 'island', 'desert', 'canyon', 'prairie', 'glacier', 'waterfall', 
    'flame', 'shadow', 'light', 'wind', 'fire', 'ice', 'storm', 'hill', 'forest', 'meadow',
    'path', 'bridge', 'castle', 'tower', 'portal', 'dragonfly', 'phoenix', 'griffin', 
    'pegasus', 'unicorn', 'meteor', 'rainbow', 'thunder', 'lightning', 'sparrow', 'raven',
    'owl', 'wolf', 'squirrel', 'pebble', 'mirror', 'crystal', 'fern', 'thunderstorm'
]

const genRandName = () => {
    const rIdx1 = Math.floor(Math.random() * firstWordInName.length);
    const rIdx2 = Math.floor(Math.random() * secondWord.length);
    return firstWordInName[rIdx1] + " " + secondWord[rIdx2];
}

const CreateDevice = (props) =>
{
    const { userId } = React.useContext(UserContext);

    const [randName, setRandName] = useState(genRandName());
    const [deviceName, setDeviceName] = useState("");
    

    const [note, setNote] = useState("");

    const [nameError, setNameError] = useState("");
    const [ipadChecked, setIpadChecked] = useState(false);
    const handleKeyPress = (e) => {
        setDeviceName(e.target.value);
    }
    console.log(userId)
    const handleNoteChange = (e) => {
        setNote(e.target.value);
    }

    const handleSubmit = () => {
        if (deviceName === "")
        {
            setDeviceName(randName);
        }
        
        
        create((deviceName === "" ? randName : deviceName), userId, note, +ipadChecked)
        .then((response) => {
            if (response["data"] === -1)
                setNameError((deviceName === "" ? randName : deviceName) + " is already in use");
            else
            {
                props.forward({"id":response["data"], "patronId":undefined});
                console.log(response)
            }
        })
        .catch((e) => {console.error("There was an error creating device", e)});
        
    }

    const regenNames = () => {
        setDeviceName(genRandName());
        setRandName(genRandName());
    }
    return (

        <>
            <div className={"name-box" + (nameError === "" ? "" : "--error")}>
                Device name:
                {nameError !== "" && (
                    <div style={{color:"red"}}> {nameError} </div>
                )}
                <br/>
                <input placeholder={randName} value={deviceName} onChange={handleKeyPress}/> 
                <button onClick={regenNames}><FontAwesomeIcon icon="fa-solid fa-arrows-rotate" /></button>
                
            </div>
            <div>
                Notes:
                <br/>
                <textarea
                    className="notes-textbox"
                    value={note}
                    placeholder="No notes ..."
                    onChange={handleNoteChange}
                />
            </div>
            <div>
                Is this device an ipad? <input type="checkbox" name="ipad" checked={ipadChecked} onChange={() => setIpadChecked(!ipadChecked)}/>
            </div>
            <button onClick={handleSubmit}>Submit</button> 
            <button onClick={() => {props.backward()}}>back</button>
        </>
    )    
}

export default CreateDevice;
