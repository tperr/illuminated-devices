// FontAwesome Icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export class Provider {

	constructor(name="", addresses = [], contact="") {
        this.name = name;
        this.addresses = addresses;
        this.contact = contact;
	}

    get name()
    {
        return this._name;
    }
    
    set name(n)
    {
        this._name = n;
    }

    get addresses()
    {
        return this._addresses;
    }

    set addresses(n)
    {
        this._addresses = n;
    }

    get contact()
    {
        return this._contact;
    }

    set contact(n)
    {
        this._contact = n;
    }

    get stringify()
    {
        return this.name + " " + this.addresses + " " + this.contact;
    }

    get identifier()
    {
        return this._name;
    }

    addToAddress(n)
    {
        this._addresses.push(n);
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