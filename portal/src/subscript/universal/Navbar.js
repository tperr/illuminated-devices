import React, {useEffect, useState, useRef} from 'react';
import { UserContext } from '../../App';
import ImageHover from "./ImageHover";
import DynamicLink from "./DynamicLink";
import hoverImg from "./../../assets/logoGold.png";
import defaultImg from "./../../assets/logoWhite.png";
import { useNavigate } from 'react-router-dom';

function getTokenStatus() {
	const result = localStorage.getItem("session");
    return result;
}

const Navbar = props => {
    const { appearingAs, userDetails, setAppearingAs } = React.useContext(UserContext);
    const authStatus = useRef(null);
    const willMount = useRef(true);
    const navigate = useNavigate();

    const useComponentWillMount = (cb) => {
        if(willMount.current) {
            authStatus.current = cb();
        }
        willMount.current = false;
    }
    useComponentWillMount(getTokenStatus);

    function DeveloperAppearingAs(props) {
        switch(props.appearingAsValue) {
            case("0"): 
                return (<span id="das-firstClick" style={{fontWeight: "800", color:"#ffb703"}}>Developer</span>);
            case("1"): 
                return (<span id="das-firstClick" style={{fontWeight: "800", color:"#ffb703"}}>Admin</span>);
            case("2"): 
                return (<span id="das-firstClick" style={{fontWeight: "800", color:"#ffb703"}}>Tutor</span>);
            case("3"): 
                return (<span id="das-firstClick" style={{fontWeight: "800", color:"#ffb703"}}>Super Tutor</span>);
            case("4"): 
                return (<span id="das-firstClick" style={{fontWeight: "800", color:"#ffb703"}}>Provider</span>);
            default:
                return (<span id="das-firstClick" style={{fontWeight: "800", color:"#ffb703"}}>Developer</span>);
        }
    };

    class AccountTypeSwitcher extends React.Component {
        constructor(props) {
            super(props);
            this.container = React.createRef();
            this.dropDown = React.createRef();
            this.state = {
                open: false,
            };
        }

        // Invoked after component has been mounted
        componentDidMount() {
            document.addEventListener("mousedown", this.handleClickOutside);
        }
    
        // Last function called before component is removed from DOM
        componentWillUnmount() {
            document.removeEventListener("mousedown", this.handleClickOutside);
        }

        // Changes state when clicked
        handleClick = (e) => {
            if (e.target.id === "das-firstClick") {
                this.setState(state => {
                    return {
                        open: !state.open,
                    };
                });
            }
        };

        // Used to close dropdown if it is open and user clicks outside of it
        handleClickOutside = event => {
            if (this.dropDown.current === null) {
                if (this.container.current && !this.container.current.contains(event.target)) {
                    this.setState({
                        open: false,
                    });
                } 
            }
            else {
                if (this.dropDown.current && !this.dropDown.current.contains(event.target)) {
                    this.setState({
                        open: false,
                    });
                }
            }
        };

        render() {
            return (
                <div>
                    <div ref={this.container} onClick={this.handleClick} style={{width: "auto", backgroundColor: "black", padding: "0.5em", borderRadius: "4px", position: "absolute", right: "5em", top: "0.5em", border: "#6082B6 1px solid", fontFamily: "Poppins", color: "white"}}>
                        Appearing As: <DeveloperAppearingAs appearingAsValue={appearingAs} />
                    </div>

                    {/* Displays dropdown only when list is open */}
                    {this.state.open && (
                        <div id="das-secondClick" ref={this.dropDown}>
                            <div className="das-dropdown-toptri"> </div>
                            <div className="das-dropdown">
                                <ul>
                                    <li className="das-li-main-first" onClick={() => setAppearingAs("0")}>
                                        Developer
                                    </li>
                                    <li className="das-li-main" onClick={() => setAppearingAs("1")}>
                                        Admin
                                    </li>
                                    <li className="das-li-main" onClick={() => setAppearingAs("3")}>
                                        Super Tutor
                                    </li>
                                    <li className="das-li-main" onClick={() => setAppearingAs("2")}>
                                        Tutor
                                    </li>
                                    <li className="das-li-last" onClick={() => setAppearingAs("4")}>
                                        Provider
                                    </li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            );
        }
    };

    return (
        <div>
            <button id="headerImageContainer" onClick={(() => {window.location.href = "https://mtu.edu";})}>
                <ImageHover 
                    height={35}
                    default={defaultImg} 
                    hover={hoverImg}
                    className={"headerImage"}
                    altText={"Michigan Technological University"}
                />
            </button>

            <div id="top-banner">
                {((userDetails !== null) && (userDetails !== undefined) && (userDetails[0] === 0)) && (
                    <AccountTypeSwitcher />
                )}

                {authStatus.current !== null && (
                    <DynamicLink pageID={props.pageID} authStatus={authStatus.current} userId={props.userId} />
                )}
            </div>
        </div>
)}

export default Navbar;