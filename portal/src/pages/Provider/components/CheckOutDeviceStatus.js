// FontAwesome Icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Classes
import { Device } from '../classes/Device';
import { Patron } from '../classes/Patron';

// CSS
import "./checkout.scss"; 

const CheckOutDeviceStatus = (props) => {
    return (
        <div className="display-flex"> 
        {(props.deviceDidCheckout === 1) && (
        <div className="checkout-status">
            <div className="inner">

                <div className="title">
                    <FontAwesomeIcon icon="square-check" color="#ABC4AA" /> Success
                </div>
                <div className="divider" />

            
                <div className="content">
                    Device successfully checked out. 
                </div>

                <div style={{textAlign: "center"}}>
                    <button className="button" onClick={() => {props.setPagenum(0); props.setCurrentDevice(new Device()); props.setCurrentPatron(new Patron());} }>
                            Close
                    </button>
                </div>
            </div>
        </div>
        )}

        {(!props.deviceDidCheckout) && (
            <div className="checkout-status">
                <div className="inner">
                    <div className="title">
                        <FontAwesomeIcon icon="xmark-square" style={{color: "#D3756B"}}/> Error
                    </div>
                    <div className="divider" />

                    <div className="content">
                        Failed to check out device. <br />
                        Please try again. 
                    </div>

                    <div style={{textAlign: "center"}}>
                        <button className="button" onClick={() => {props.setPagenum(0); props.setCurrentDevice(new Device()); props.setCurrentPatron(new Patron());} }>
                            Close
                        </button>
                    </div>
                </div>
            </div>
            )}
        </div>
    );
}

export default CheckOutDeviceStatus;