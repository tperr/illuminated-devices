// FontAwesome Icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Classes
import { Device } from '../classes/Device';
import { Patron } from '../classes/Patron';

// CSS
import "./checkout.scss"; 

const ProfileManagementStatus = (props) => {
    function getErrorDescription(code) {
        switch(code) {
            case(0): return "Patron either does not exist or does not belong to this organization";
            case(-2): return "Patron local ID already in use";
            case(-4): return "The email specified is already in use";
            case(-5): return "The phone number specified is already in use";
            default: return "Unknown error";
        }
    }

    return (
        <div className="display-flex"> 
        {(props.patronDidModify === 1) && (
        <div className="checkout-status">
            <div className="inner">

                <div className="title">
                    <FontAwesomeIcon icon="square-check" color="#ABC4AA" /> Success
                </div>
                <div className="divider" />

            
                <div className="content">
                    Patron successfully modified.
                </div>

                <div style={{textAlign: "center"}}>
                    <button className="button" onClick={() => {props.setPagenum(3); props.setCurrentDevice(new Device()); props.setCurrentPatron(new Patron());} }>
                        Close
                    </button>
                </div>
            </div>
        </div>
        )}

        {(props.patronDidModify === 2) && (
        <div className="checkout-status">
            <div className="inner">

                <div className="title">
                    <FontAwesomeIcon icon="square-check" color="#ABC4AA" /> Success
                </div>
                <div className="divider" />

            
                <div className="content">
                    Patron successfully added.
                </div>

                <div style={{textAlign: "center"}}>
                    <button className="button" onClick={() => {props.setPagenum(3); props.setCurrentDevice(new Device()); props.setCurrentPatron(new Patron());} }>
                        Close
                    </button>
                </div>
            </div>
        </div>
        )}

        {((props.patronDidModify !== 1) && (props.patronDidModify !== 2)) && (
            <div className="checkout-status">
                <div className="inner">
                    <div className="title">
                        <FontAwesomeIcon icon="xmark-square" style={{color: "#D3756B"}}/> Error
                    </div>
                    <div className="divider" />

                    <div className="content">
                        Failed to modify patron. <br />
                        Error Code: {props.patronDidModify} <br />
                        Error Description: {getErrorDescription(props.patronDidModify)} <br />
                        Please try again. 
                    </div>

                    <div style={{textAlign: "center"}}>
                        <button className="button" onClick={() => {props.setPagenum(3); props.setCurrentDevice(new Device()); props.setCurrentPatron(new Patron());} }>
                            Close
                        </button>
                    </div>
                </div>
            </div>
            )}
        </div>
    );
}

export default ProfileManagementStatus;