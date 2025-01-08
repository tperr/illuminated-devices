import React from "react";
import { UserContext } from "../../App";
import {useState, useEffect} from 'react';

// Written link navigation
const Links = props => {
    const { userId, userDetails } = React.useContext(UserContext);

    const [userProfileImage, setUserProfileImage] = useState();
    useEffect(() => {
        if ((userId !== null) && (userId !== undefined)) {
            setUserProfileImage("https://illuminated.cs.mtu.edu/ark/u/" + userId + "/pfp");
        }
    }, [userId]);

    class ProfileDropdown extends React.Component {
        container = React.createRef();
        state = {
            open: false,
        };
    
        // Changes state when button is clicked
        handleButtonClick = () => {
            this.setState(state=> {
                return {
                    open: !state.open,
                };
            });
        };
    
        // Invoked after component has been mounted
        componentDidMount() {
            document.addEventListener("mousedown", this.handleClickOutside);
        }
    
        // Last function called before component is removed from DOM
        componentWillUnmount() {
            document.removeEventListener("mousedown", this.handleClickOutside);
        }
    
        // Used to close navigation if it is open and user clicks outside of it
        handleClickOutside = event => {
            if (this.container.current && !this.container.current.contains(event.target)) {
                this.setState({
                    open: false,
                });
            }
        };
    
        render() {
            let profileDropdownClass = this.state.open ? "dl-profileDropdown-O" : "dl-profileDropdown-C";     // this.state.open -> grid background is gold; !this.state.open -> grid background is transparent
        
            return (
                <div> {/* Have to return everything in a container */}
                    <div className="dl-profileDropdown-cont" ref={this.container}>
                        <button className={"dl-profileDropdownButton"} onClick={this.handleButtonClick}>
                            <div className={profileDropdownClass}>
                                <img src={userProfileImage} className="dl-userProfilePicture" alt="User icon" />
                            </div>
                        </button>
                        
                        {/* Displays dropdown only when list is open */}
                        {this.state.open && (
                            <div>
                                <div className="dl-dropdown-toptri"></div>
                                <div className="dl-dropdown">
                                    <ul>
                                    <li className="dl-li-main-first">
                                        {userDetails[1]} {userDetails[2]} <br/>
                                        @{userDetails[6]} <br/>
                                        <a href="/profile">Manage your account</a>
                                    </li>
                                    <div className="category-div"></div>
                                    <a href="/home"> <li className="dl-li-main"> Home </li> </a>
                                    {(userDetails && (userDetails[0] === 4)) && (<a href="/manage"> <li className="dl-li-main"> Location Management </li> </a>)}
                                    {/*
                                    <a href="/about"> <li className="dl-li-main"> About </li> </a>
                                    <a href="/help"> <li className="dl-li-main"> Help Center</li> </a>
                                    */} 
                                    {this.props.authStatus !== null && (<a href="/logout"> <li className="dl-li-login"> Log out </li> </a>)}
                                    {this.props.authStatus === null && (<a href="/login"> <li className="dl-li-login"> Log in </li> </a>)}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )
        }
    }

    return (
        <div className="linkContainer">
            {/* definitely move this to css or build it into the profiledropdown */}
            <div style={{  
                padding: "5px",
                paddingTop: "10px",
                marginRight: "5px",
                textAlign: "right",
                fontSize: "23px"}}
            >
                <ProfileDropdown authStatus={props.authStatus} />
            </div>
        </div>
    )
}

// Determines whether to use grid-style or written link based on width of screen 
function DynamicLink(props) {
    return <Links pageID={props.pageID} authStatus={props.authStatus} userId={props.userId} />
}

export default DynamicLink;