import React from "react";
import { createRoot } from 'react-dom/client';
import image from "./../../assets/gridGnb.png";

// FontAwesome Icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Footer = props => {
    return (
        <footer id="footer"
            style={{
                textAlign: "center",
                display: "flex",
                position: "fixed",
                bottom: "0",
                left: "0",
                width: "100%",
            }}
        >
            <span 
                style={{
                    fontFamily: "Poppins",
                    color: "white",
                    fontSize: "0.8em",
                    margin: "auto",
                }}
            >
                Made with <FontAwesomeIcon icon="heart" style={{color: "#E41B17"}} /> in Houghton, MI
            </span>
        </footer>
    )
}

// const rootElement = document.getElementById("root");
// ReactDOM.render(<Footer />, rootElement);
export default Footer;