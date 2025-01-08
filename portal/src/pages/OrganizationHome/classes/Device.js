// FontAwesome Icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Material UI Tooltip
import Tooltip from "@mui/material/Tooltip";

export class Device {    
    constructor(id="", dateAdded="", lastCheckin="", lastCheckout="", name="", patronId="", providerId="", returnDate="", status="", bsid="", currentLocationId="", homeLocationId="", patron_fname="", patron_lname="", notes="", log=[]) {
        switch(status) {
            case("Available"): 
                this.colorCode = "#ABC4AA";
                break;
        case("Maintenance"): 
                this.colorCode = "#FFD966";
                break;
        default: 
                this.colorCode = "#B790D4";
        }
        
        this.id = id;
        this.dateAdded = dateAdded;
        this.lastCheckin = lastCheckin;
        this.lastCheckout = lastCheckout;
        this.name = name; 
        this.patronId = patronId;
        this.providerId = providerId;

        // Is the device overdue?
        this.returnDate = returnDate;
        this.status = status;
        const nowUnix = Math.floor(new Date().valueOf() / 1000);
        if (status === "Checked Out" && (nowUnix > this.returnDate)) {
            this.status = "Overdue";
            this.colorCode = "#D3756B";
        }

        this.bsid = bsid;
        this.currentLocationId = currentLocationId;
        this.homeLocationId = homeLocationId; 
        this.patron_fname = patron_fname;
        this.patron_lname = patron_lname;

        if (notes !== null) {
            this.notes = notes;
        }
        else {
            this.notes = ""; 
        }

        if (log !== null) {
            this.log = log;
        }
        else {
            this.log = [];
        }
    }

    typeOf() {
        return "device";
    }
    
    get id() {
        return this._id;
    }

    set id(i) {
        this._id = i;
    }

    get location() {
        return this._location;
    }

    set location(l) {
        this._location = l;
    }

    get status() {
        return this._status;
    }

    set status(s) {
        this._status = s;
    }

    get name() {
        return this._name;
    }

    set name(n) {
        this._name = n;
    }

    get notes() {
        return this._notes;
    }

    set notes(n) {
        this._notes = n;
    }

    get log() {
        return this._log;
    }

    set log(l) {
        this._log = l;
    }

    get bsid() {
        return this._bsid;
    }

    set bsid(n) {
        this._bsid = n;
    }

    get patron_fname() {
        return this._patron_fname;
    }

    set patron_fname(n) {
        this._patron_fname = n;
    }

    get patron_lname() {
        return this._patron_lname;
    }

    set patron_lname(n) {
        this._patron_lname = n;
    }
    
    // functional getter, not variable specific
    get stringify() { // all searchable variables put together
        return this.id + " " + this.location + " " + (this.status === 0 ? "Out of service" : (this.status === 1 ? "Available" : "")) + " " + this.notes + " " + this.log + " " + this.bsid;
    }

    get identifier() {
        // return this.id;
        const identifier = this.name;
        return identifier;
    }

    deviceStatusIcon() {
        let statusIcon;
        switch(this.status) {
            case("Available"):
                statusIcon = <FontAwesomeIcon icon="circle-check" />
                break;
            case("Maintenance"):
                statusIcon = <FontAwesomeIcon icon="screwdriver-wrench" />
                break;
            case("Overdue"):
                statusIcon = <FontAwesomeIcon icon="circle-exclamation" />
                break;
            default:
                statusIcon = <FontAwesomeIcon icon="right-to-bracket" />
                break;
        }

        return (
            <div style={{backgroundColor: this.colorCode}} className={"device-status-icon"}>
                {statusIcon}
            </div>
        )
    }

    getDeviceManagementStatusLabel() {
        return (
                <div style={{color: this.colorCode}}>
                    {this.status}
                </div>
                );
    }

    addToLog(n)
    {
        this.log.push(n);
    }

    #getMonthName(monthNumber) {
        const date = new Date();
        date.setMonth(monthNumber);
        return date.toLocaleString('en-US', { month: 'long' });
      }

    getDisplayableTime(type) {
        let date;
        switch(type.toLowerCase()) {
            case("lastcheckout"):
                date = new Date(this.lastCheckout * 1000);
                break;
            case("lastcheckin"):
                date = new Date(this.lastCheckin * 1000);
                break;
            case("returndate"):
                date = new Date(this.returnDate * 1000);
                break;
            case("timetodue"):
                date = this.timeToDue();
                var overdue = false;
                if (date < 0) {
                    overdue = true;
                    date = Math.abs(date);
                }

                var d = Math.floor(date / (3600*24));
                var h = Math.floor(date % (3600*24) / 3600);
                var m = Math.floor(date % 3600 / 60);
                var s = Math.floor(date % 60);

                var dDisplay = d > 0 ? d + (d === 1 ? " day, " : " days, ") : "";
                var hDisplay = h > 0 ? h + (h === 1 ? " hour, " : " hours, ") : "";
                var mDisplay = m > 0 ? m + (m === 1 ? " minute, " : " minutes, ") : "";
                var sDisplay = s > 0 ? s + (s === 1 ? " second" : " seconds") : "";
                return (dDisplay + hDisplay + mDisplay + sDisplay).replace(/,\s*$/, "");

            case("dateadded"):
                date = new Date(this.dateAdded * 1000);
                const toString = this.#getMonthName(date.getMonth()) + " " + date.getDate() + " " + date.getFullYear();
                return toString;
            default:
                return "NaN";
        }

        const toString = this.#getMonthName(date.getMonth()) + " " + date.getDate() + " " + date.getFullYear() + " at " + date.toLocaleTimeString().replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, "$1$3") + " (Eastern)";
        return toString;
    }

    isOverdue() {
        return (this.status === "Overdue");

        /*
        if (this.id === "" || this.status !== "Checked Out") {
            return false;
        }
        const nowUnix = Math.floor(new Date().valueOf() / 1000);
        return (nowUnix > this.returnDate);
        */
    }

    timeToDue() {
        if (this.id === "") {
            return 0;
        }
        const nowUnix = Math.floor(new Date().valueOf() / 1000);
        return (this.returnDate - nowUnix);
    }

    getInfoBar(detailsButton=true, classname="category-item", condition=true, click, clickDetails, width=960, listItemGridClass="category-item-grid-container") {
        if (condition) {
            if (width >= 960) {
                return (
                    <button className={classname} key={this.identifier} onClick={click} tabIndex={0} name={"category-item--" + this.id}>
                        {!detailsButton && 
                            <div className={"category-item-grid-container"}> 
                                <div className="identifier--device">
                                    {this.identifier}
                                </div>

                                <div className={"details-section-container"}>
                                    {
                                        <Tooltip 
                                            title={<span style={{fontFamily: "Poppins-EB", textTransform: "uppercase"}}>{this.status}</span>}
                                            tabIndex={0}
                                            enterTouchDelay={0}
                                        >
                                            {this.deviceStatusIcon()}
                                        </Tooltip>
                                    }
                                </div>
                            </div>
                        }  

                        {detailsButton && 
                            <div className={"category-item-grid-container"}>
                                <div className="identifier--device">
                                    {this.identifier}
                                </div>

                                <div className={"details-section-container"}>
                                    {
                                        <Tooltip 
                                            title={<span style={{fontFamily: "Poppins-EB", textTransform: "uppercase"}}>{this.status}</span>}
                                            tabIndex={0}
                                            enterTouchDelay={0}
                                        >
                                            {this.deviceStatusIcon()}
                                        </Tooltip>
                                    }

                                    <button className="details-button--device" onClick={clickDetails}>
                                        Details
                                    </button>
                                </div>
                            </div>
                        }
                    </button>
                )
            }
        }

        return (
            <div key={this.identifier}></div>
        )
    }
}