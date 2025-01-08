// FontAwesome Icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export class Tutor {
    constructor(name="", email="", phone="", experience=0, log=[], notes="")
    {
        this.name = name;
        this.email=email;
        this.phone=phone;
        this.experience=experience;
        this.log = log;
        this.notes=notes;
    }

    typeof() {
        return "tutor";
    }

    get name()
    {
        return this._name;
    }

    set name(n)
    {
        this._name = n;
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

    get experience()
    {
        return this._experience;
    }

    set experience(n)
    {
        this._experience = n;
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

    get stringify()
    {
        return this._email + " " + (this.status === undefined ? "" : (this._experience === 1 ? "Expert" : "Intermediate")) + " " + this._log + " " + this._name + " " + this._notes + " " + this._phone
    }

    get identifier()
    {
        return this.name;
    }

    addToLog(n)
    {
        this.log.push(n);
    }

    getInfoBar(detailsButton=true, classname="category-item", _, click, clickDetails) { // _ is there because it is never used, but is required for annoyance purposes
        return (
            <div className={classname} key={this.identifier} onClick={click}>
                {!detailsButton && 
                    <div>
                           {this.identifier}
                    </div>
                }  

                {detailsButton && 
                    <div style={{display: "flex", flexDirection: "row"}}>
                        <div style={{width: "30%"}}> {this.identifier}</div>
                        <div style={{width: "30%"}}>  </div>
                        <div style={{width: "30%"}}>  </div>
                        <button className="details-button" onClick={clickDetails}> Details</button>
                    </div>
                }

            </div>
        )

    }
}