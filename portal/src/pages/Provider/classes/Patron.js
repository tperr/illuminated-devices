// FontAwesome Icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export class Patron {
    constructor(id="", fname="", lname="", email="", phone="", streetAddress="", city="", state="", zip="", registrationDate="",  birthday="", bsid="", log=[], notes="")
    {
        this.id = id;
        this.fname = fname;
        this.lname = lname;
        this.email = email;
        this.phone = phone;
        this.streetAddress = streetAddress;
        this.city=city; 
        this.state=state; 
        this.zip=zip;
        this.registrationDate = registrationDate;
        this.birthday = birthday;

        if (log !== null) {
            this.log = log;
        }
        else {
            this.log = [];
        }

        if (notes !== null) {
            this.notes = notes;
        }
        else {
            this.notes = ""; 
        }

        this.bsid = bsid;
    }

    typeOf() {
        return "patron";
    }

    name()
    {
        return this.fname + " " + this.lname + " " + this.fname + this.lname + this.fname;
    }

    get email()
    {
        return this._email;
    }

    set email(n)
    {
        this._email = n;
    }

    get phone()
    {
        return this._phone;
    }

    set phone(n)
    {
        this._phone = n;
    }

    get streetAddress()
    {
        return this._streetAddress;
    }

    set streetAddress(n)
    {
        this._streetAddress = n;
    }

    get birthday()
    {
        return this._birth;
    }

    set birthday(n)
    {
        this._birth = n;
    }

    get id()
    {
        return this._id;
    }

    set id(n)
    {
        this._id = n;
    }

    get log()
    {
        return this._log;
    }

    set log(n)
    {
        this._log = n;
    }

    get notes()
    {
        return this._notes;
    }

    set notes(n)
    {
        this._notes = n;
    }

    get bsid() {
        return this._bsid; 
    }

    set bsid(n) {
        this._bsid = n;
    }

    get stringify()
    {
        return this.address + " " + this.email + " " + this.phone + " " + this._birth + " " + this._id + " " + this.log + " " + this.name() + " " + this.notes + " " + this.bsid;
    }

    get identifier()
    {
        if (this.fname === "" && this.lname === "")
            return "";
        if (this.fname === "")
            return this.lname;
        if (this.lname === "")
            return this.fname;
        return this.fname + " " + this.lname;
    }

    set identifier(i)
    {
        console.log(i)
        this.fname = i.split(" ")[0];
        this.lname = i.split(" ")[1];
    }

    addToLog(n)
    {
        this._log.push(n);
    }

    #getMonthName(monthNumber) {
        const date = new Date();
        date.setMonth(monthNumber);
        return date.toLocaleString('en-US', { month: 'long' });
    }

    getDisplayableBirthday() {
        let date = new Date(this.birthday * 1000);
        const toString = this.#getMonthName(date.getMonth()) + " " + date.getDate() + " " + date.getFullYear();
        return toString;
    }

    getDisplayableAddress() {
        const addr = this.streetAddress + ", " + this.city + ", " + this.state + ", " + this.zip;
        return addr; 
    }

    getDisplayablePhone() {
        return "(" + this.phone.slice(0, 3) + ") " + this.phone.slice(3, 6) + "-" + this.phone.slice(6)
    }

    getInfoBar(detailsButton=true, classname="category-item", _, click, clickDetails) { // _ is there because it is never used, but there will be a paramater there for device, which is a condition for if it is to be shown
        return (
            <div className={classname} key={this.identifier} onClick={click}>
                {detailsButton && 
                    <div style={{display: "flex", flexDirection: "row"}}>
                        <div style={{width: "30%"}}> <FontAwesomeIcon icon="user"/> {this.identifier}</div>
                        <div style={{width: "30%"}}> <FontAwesomeIcon icon="phone"/> {this.getDisplayablePhone()} </div>
                        <div style={{width: "30%"}}> <FontAwesomeIcon icon="envelope"/> {this.email}</div>
                        <button className="details-button" onClick={clickDetails}> Details</button>
                    </div>
                }   

                {!detailsButton && 
                    <div style={{display: "flex", flexDirection: "row"}}>
                        <div style={{width: "33%"}}> <FontAwesomeIcon icon="user"/> {this.identifier}</div>
                        <div style={{width: "33%"}}> <FontAwesomeIcon icon="phone"/> {this.getDisplayablePhone()} </div>
                        <div style={{width: "33%"}}> <FontAwesomeIcon icon="envelope"/> {this.email}</div>
                    </div>
                }

            </div>
        )
    }
}