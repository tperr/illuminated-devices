/***** Imports *****/
// FontAwesome Icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Classes
import { Device } from '../classes/Device';
import { Patron } from '../classes/Patron';

// CSS
import "./checkout.scss"; 

/***** Main Export *****/
const ModifiedItemStatus = (props) => {
    function getErrorDescription(errorType, errorCode) {
        if(errorType === 2) {
            switch(errorCode) {
                case(0): return "Device either does not exist or does not belong to this organization";
                case(-1): return "Device name already in use";
                case(-2): return "Device local ID already in use";
                case(-3): return "The home location selected is invalid";
                case(-4): return "The current location selected is invalid";
                default: return "Unknown error has occurred.";
            }
        }
        else {
            switch(errorCode) {
                case(0): return "Patron either does not exist or does not belong to this organization";
                case(-2): return "Patron local ID already in use";
                case(-4): return "The email specified is already in use";
                case(-5): return "The phone number specified is already in use";
                default: return "Unknown error has occurred.";
            }
        }
    }

    function getModifiedItemDescription(successStatus, code) {
        if (successStatus) {
            switch(code) {
                case(0): return "Device successfully checked out.";
                case(1): return "Device successfully checked in.";
                case(2): return "Device successfully modified.";
                case(3): return "Patron successfully modified.";
                case(4): return "Patron successfully added.";
                default: return "Unknown error has occurred.";
            }
        }
        else {
            switch(code) {
                case(0): return "Failed to check out device.";
                case(1): return "Failed to check in device.";
                case(2): return "Failed to modify device.";
                case(3): return "Failed to modify patron." ;
                case(4): return "Failed to add patron.";
                default: return "Unknown error has occurred: [successStatus: " + successStatus + "] [Code: " + code + "]";
            }
        }
    }
    return (
        <div className="display-flex"> 
        {(props.itemStatusDidModify >= 1 && props.itemStatusDidModify <= 3) && (
        <div className="checkout-status">
            <div className="inner">

                <div className="title">
                    <FontAwesomeIcon icon="square-check" color="#ABC4AA" /> Success {"isdm: " + props.itemStatusDidModify}
                </div>

                <div className="divider" />
            
                <div className="content">
                    {getModifiedItemDescription(true, props.code)}
                </div>

                <div style={{textAlign: "center"}}>
                    <button className="button" onClick={() => {
                        if (props.itemStatusDidModify !== 1) {
                            props.setPagenum(props.itemStatusDidModify);
                        }
                        else {
                            props.setPagenum(0);
                        }
                        props.setCurrentDevice(new Device()); 
                        props.setCurrentPatron(new Patron());} 
                        }
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
        )}

        {((!props.itemStatusDidModify) || (props.itemStatusDidModify < 1 || props.itemStatusDidModify > 3)) && (
            <div className="checkout-status">
                <div className="inner">
                    <div className="title">
                        <FontAwesomeIcon icon="xmark-square" style={{color: "#D3756B"}}/> Error
                    </div>

                    <div className="divider" />

                    <div className="content">
                        {getModifiedItemDescription(false, props.code)} <br />
                        {((props.code >= 2) || (props.code <= 4)) && (
                            <span>
                                Error Code: {props.itemStatusDidModify} <br />
                                Error Description: {getErrorDescription(props.code, props.itemStatusDidModify)} <br /> 
                            </span>
                        )}
                        Please try again. 
                    </div>

                    <div style={{textAlign: "center"}}>
                        <button className="button" onClick={() => {
                            if (props.code < 4) {
                                props.setPagenum(props.code); 
                            }
                            else {
                                props.setPageNum(3)
                            }
                            props.setCurrentDevice(new Device()); 
                            props.setCurrentPatron(new Patron());} }
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
            )}
        </div>
    );
}

export default ModifiedItemStatus;