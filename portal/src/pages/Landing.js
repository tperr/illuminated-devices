import React from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import nsf from './../assets/NSF_Logo.png'

const Hover = props => {
    function over(me) {
        me.currentTarget.className = props.active;
    }
    function out(me) {
        me.currentTarget.className = props.default;
    }

    function handleClick(me) {
        window.location.replace("https://illuminated.cs.mtu.edu/login");
    }

    return (
        <div onMouseOver={over} onMouseOut={out} className={props.default} style={{width: 200, cursor: "pointer", textAlign: "center"}} onClick={handleClick}>
            <div className={props.button}>{props.buttonText}</div>
        </div>
    );
};

const Landing = () => {
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
    let buttonStyle = "lp-button";
    
    if (width < 700) {
        contentClass = "nf-container-mini";
        headerClass = "nf-header-mini";
        containerHClass = "nf-header-container-mini";
        contentContainer = "nf-content-container-mini";
        superContainer = "nf-super-container-mini";
        buttonStyle = "lp-button";
    }

    return (  
        <div id="nf-page">
            <div id={superContainer}>
                <div id={contentContainer}>
                    <div id={containerHClass}>
                    <div className={headerClass}>
                            Illuminated Devices 
                            <br/>
                            <FontAwesomeIcon icon="laptop" />
                            <span> </span>
                            <FontAwesomeIcon icon="arrow-right-arrow-left" />
                            <span> </span>
                            <FontAwesomeIcon icon="mobile-screen" />
                    </div>
                    </div>
                    <div id={contentClass}>
                        <p>
                            Our team is designing a sociotechnical system called <b>Illuminated Devices</b> to supplement and extend <a href="https://www.mtu.edu/unscripted/2017/03/basic-saturdays.html">BASIC (Basic Adult Skills in Computing) <FontAwesomeIcon icon="link" /></a>, a community-based tutoring program. COVID-19 required us to suspend this face-to-face program, leaving community members—especially those who do not have the skills or confidence to seek technology help online—without any assistance. Our current project seeks to provide remote technology training via video calling on a portable device.
                        </p>
                        <p>
                            We're working hard to bring <b>Illuminated Devices</b> online, but we're not quite ready for you yet!
                        </p>

                        <p> See you soon!</p>

                        
                        <div style={{textAlign: "center"}}>
                            <button className={buttonStyle}>
                                <a href="/login">
                                    Developer Login
                                </a>
                            </button>
                        </div>

                        <p style={{textAlign: "center"}}> This work is supported by the National Science Foundation under <a href="https://www.nsf.gov/awardsearch/showAward?AWD_ID=2122034">Grant #BCS-2122034.</a></p>
                        <div style={{textAlign: 'center'}}>
                            <img src={nsf} alt="NSF Logo" style={{width:100}}/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
 
export default Landing;