import React from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import husky from './../assets/pngeggHS.png'

const Hover = props => {
    function over(me) {
        me.currentTarget.className = props.active;
    }
    function out(me) {
        me.currentTarget.className = props.default;
    }

    return (
        <div onMouseOver={over} onMouseOut={out} className={props.default} >
            <div className={props.button}>Refresh</div>
        </div>
    );
};

const NotFound = () => {
    const updateWidth = () => {
        setWidth(window.innerWidth);
    };

    // Checks if user has resized window and updates width as necessary
    React.useEffect(() => {
        window.addEventListener("resize", updateWidth);
        return () => window.removeEventListener("resize", updateWidth);
    });

    const [width, setWidth] = React.useState(window.innerWidth);

    // Changes based on window width
    let contentClass = "nf-container-main";
    let headerClass = "nf-header";
    let containerHClass = "nf-header-container";
    let contentContainer = "nf-content-container";
    let superContainer = "nf-super-container";
    let buttonContainerD = "nf-button-container";
    let buttonContainerA = "nf-button-container--active";
    let buttonStyle = "nf-button";
    let huskies = "dneHimg";
    
    if (width < 700) {
        contentClass = "nf-container-mini";
        headerClass = "nf-header-mini";
        containerHClass = "nf-header-container-mini";
        contentContainer = "nf-content-container-mini";
        superContainer = "nf-super-container-mini";
        buttonContainerD = "nf-button-container-mini"
        buttonContainerA = "nf-button-container--active-mini";
        buttonStyle = "nf-button-mini";
        huskies = "dneHimg-mini";
    }

    return (  
        <div id="nf-page">
            <div id={superContainer}>
                <div id={contentContainer}>
                    <div id={containerHClass}>
                    <div className={headerClass}>
                            404: Page Not Found <FontAwesomeIcon icon="exclamation-triangle" />
                    </div>
                    </div>
                    <div id={contentClass}>
                        <p>
                            Well, this is embarrassing. Who let the dogs out?
                        </p>
                        <p>
                            We're working hard to bring <b>Illuminated Devices</b> online, but we're not quite ready for you yet!
                        </p>

                        <p> See you soon!</p>

                        <a href="/"> <Hover default={buttonContainerD} active={buttonContainerA} button={buttonStyle} /> </a>
                    </div>
                    <img src={husky} alt="Husky" className={huskies} />
                </div>
            </div>
        </div>
    );
}
 
export default NotFound;