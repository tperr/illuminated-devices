// FontAwesome Icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Classes
import { Device } from '../classes/Device';
import { Patron } from '../classes/Patron';

// CSS
import "./checkout.scss"; 

const DeviceManagementStatus = (props) => {
    function getErrorDescription(code) {
        switch(code) {
            case(0): return "Device either does not exist or does not belong to this organization";
            case(-1): return "Device name already in use";
            case(-2): return "Device local ID already in use";
            case(-3): return "The home location selected is invalid";
            case(-4): return "The current location selected is invalid";
            default: return "Unknown error";
        }
    }

    return (
        <div className="display-flex"> 
        {(props.deviceDidModify === 1) && (
        <div className="checkout-status">
            <div className="inner">

                <div className="title">
                    <FontAwesomeIcon icon="square-check" color="#ABC4AA" /> Success
                </div>
                <div className="divider" />

            
                <div className="content">
                    Device successfully modified.
                </div>

                <div style={{textAlign: "center"}}>
                    <button className="button" onClick={() => {props.setPagenum(2); props.setCurrentDevice(new Device()); props.setCurrentPatron(new Patron());} }>
                        Close
                    </button>
                </div>
            </div>
        </div>
        )}

        {(props.deviceDidModify !== 1) && (
            <div className="checkout-status">
                <div className="inner">
                    <div className="title">
                        <FontAwesomeIcon icon="xmark-square" style={{color: "#D3756B"}}/> Error
                    </div>
                    <div className="divider" />

                    <div className="content">
                        Failed to modify device. <br />
                        Error Code: {props.deviceDidModify} <br />
                        Error Description: {getErrorDescription(props.deviceDidModify)} <br />
                        Please try again. 
                    </div>

                    <div style={{textAlign: "center"}}>
                        <button className="button" onClick={() => {props.setPagenum(2); props.setCurrentDevice(new Device()); props.setCurrentPatron(new Patron());} }>
                            Close
                        </button>
                    </div>
                </div>
            </div>
            )}
        </div>
    );
}

export default DeviceManagementStatus;