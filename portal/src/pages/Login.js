import {useState, useEffect, useRef} from 'react';
import React from "react";
import Navbar from '../subscript/universal/Navbar.js';
import Footer from '../subscript/universal/Footer.js';
import {PropTypes} from "prop-types";
import CryptoJS from "crypto-js";
import { UserContext } from '../App.js';

function generateCryptographicallySecureOctets(count) {
    var octets = new Uint8Array(count);
    crypto.getRandomValues(octets);
    return octets;
}

function base64urlEncodeOctets(octets) {
    var hexstring = "";
    for (let i = 0; i < octets.length; i++) {
        let hexnum = octets[i].toString(16);
        hexstring += hexnum;
    }
    return hexstring;
}

function createChallenge(verifier) {
    const sha = CryptoJS.SHA256(verifier);
    //console.log("sha: " + sha);
    const encoded = CryptoJS.enc.Base64url.stringify(sha);
    //console.log("base64URL: " + encoded);
    return encoded;
}

async function sendLoginRequest(creds) {
    const baseAddr = "https://illuminated.cs.mtu.edu/blacklight/api/authenticate_client/";
    const clientID = 1;
    const response_type = "code";
    const redirect_uri = "https://illuminated.cs.mtu.edu/login/auth";
    const code_challenge_method = "S256";

    // Assuming generateCryptographicallySecureOctets, base64urlEncodeOctets, and createChallenge are defined
    const code_challenge = [];
    code_challenge[0] = generateCryptographicallySecureOctets(32);
    code_challenge[1] = base64urlEncodeOctets(code_challenge[0]);
    code_challenge[2] = createChallenge(code_challenge[1]);

    const fullAddr = `${baseAddr}?response_type=${response_type}&redirect_uri=${encodeURIComponent(redirect_uri)}&client_id=${clientID}&code_challenge=${code_challenge[2]}&code_challenge_method=${code_challenge_method}`;
    console.log(fullAddr)
    let auth_grant;

    try {
        const response = await fetch(fullAddr, {
            method: 'GET',
            headers: {
                'Content-type': 'application/json'
            },
        });

        if (response.ok) {
            const data = await response.json();
            auth_grant = data.data.grant;
        } else {
            throw new Error('Network response was not ok');
        }
    } catch (error) {
        console.error("Error fetching data in login request: ", error);
    }

    // With auth_grant, make login request
    // Create Authorization
    const up = CryptoJS.enc.Base64url.stringify(CryptoJS.enc.Utf8.parse(creds.username + ":" + CryptoJS.SHA256(creds.password).toString()));
    const auth_header = "Basic " + up + "==" // Have to add padding because of stupid python do not remove unless you want the api to get mad :)
    const apiLoginAddr = "https://illuminated.cs.mtu.edu/blacklight/api/client_login";
    var return_code = false;
    var client_redirect_uri = null;

    await fetch(apiLoginAddr, {
        method: 'POST',
        redirect: 'follow', // This straight up does nothing I think but it works so I left it
        headers: {
            'Content-type': 'application/json',
            'Authorization':  auth_header
        },
        body: JSON.stringify({
            grant: auth_grant
        })
    })
    .then(response => {
        if (response && response.redirected === true) {
            client_redirect_uri = response.url + "&verifier=" + code_challenge[1]; // add the verifier to the end, we'll need this in the redirect to send back to Blacklight
            return {
                "data":false
            };
        }
        else if (response) {
            if (response.ok) {
                return response.json();
            }
            else {
                throw response;
            }
        }
        else {
            throw response;
        }
    })
    .then(data => {
        if (data.data.error) {
            return_code = data.data;
        }
        else {
            return_code = false;
            if (client_redirect_uri === null) {
                throw data;
            }
        }
    })
    .catch(error => {
        console.error("Error fetching data in login request 2.0: ", error);
    })
    .finally(() => {
        // This will actually do something after the redirect
        // Or if no redirect it does it on the same page (obviously)
    })
    console.log(client_redirect_uri)
    console.log(return_code)
    // return;
    if (return_code === false) {
        window.location.replace(client_redirect_uri)
    }
    return return_code;
}

const Login = props => {
    const { userDetails, setUserDetails } = React.useContext(UserContext);

    const [loginError, setLoginError] = useState();
    const [username, setUsername] = useState();
    const [password, setPassword] = useState();
    const useEffectDidLoad = useRef(false);
    const [showLoginPage, setShowLoginPage] = useState(false);

    const updateWidth = () => {
        setWidth(window.innerWidth);
    };

    // Checks that a client has no tokens already
    useEffect(() => {
        if (useEffectDidLoad.current === false) {
            //console.log("using effect");
            var auth_status = sessionStorage.getItem("BLIGHT");
            //console.log(auth_status);
            if (auth_status !== null) {
                //console.log("client logged in?");
                // Client has already logged in
                // Would probably want to check that the tokens are valid?
                window.location.replace("https://illuminated.cs.mtu.edu/home") // This is where we redirect if a logged-in user goes to /login
                // console.log("token:");
                // console.log(props.token);
            }
            else {
                setShowLoginPage(true);
            }
            useEffectDidLoad.current = true; 
        }
    }, [useEffectDidLoad]);

    // Checks if user has resized window and updates width as necessary
    React.useEffect(() => {
        window.addEventListener("resize", updateWidth);
        return () => window.removeEventListener("resize", updateWidth);
    });

    const pageHasLoaded = () => {
        //console.log("PAGEHASLOADED effect?");
           
        function getData() {
            if(sessionStorage.getItem('BLIGHT') !== null) {
                var user = JSON.parse(sessionStorage.getItem('BLIGHT'));
                //console.log(user);
            }
        }
        

        var auth_status = getData()
        // var auth_status = sessionStorage.getItem("BLIGHT");
        //console.log(auth_status);
        if (auth_status !== null) {
            //console.log("client logged in?");
            // Client has already logged in
            // Would probably want to check that the tokens are valid?
            // window.location.replace("https://illuminated.cs.mtu.edu/")
            // console.log("token:");
            // console.log(props.token);
        }
        useEffectDidLoad.current = true; 
    }

    React.useEffect(() => {
        window.addEventListener("load", pageHasLoaded);
        return () => window.removeEventListener("load", pageHasLoaded); 
    });

    const [width, setWidth] = React.useState(window.innerWidth);

    // Changes based on window width
    let loginClass = "login-container-main";
    if (width < 500) {
        loginClass = "login-container-mini";
    }

    const handleSubmit = async e => {
        e.preventDefault();

        const response = await sendLoginRequest({
            username,
            password
        });

        if (response !== false) {
            if (response.error) {
                document.activeElement.blur();
                document.getElementById("login-form").reset();
                setLoginError(true);
            }
            else {
                console.error("Uncaught error in handleSubmit(): response.error does not exist, but response was not false from sendLoginRequest.")
            }
        }
        else {
            setLoginError(false);
        }
    }

    if (showLoginPage) {
        return (  
            <div>
                <div id="page-container">
                    <div id="content-wrap">
                        <Navbar pageID={10}/>
                        <div id={loginClass}>
                            <div className="login-header-container">
                                <div className="login-header"> Log In</div>
                                <div className="signup-link"> No account? <a href="/signup">Sign up instead.</a></div>
                            </div>
                            
                            {/* Inputs start */}
                            <form id="login-form" className="login-form" onSubmit={handleSubmit}> 
                                
                                <div className="input-field-container">
                                    <input
                                    className="input-field"
                                    type = "Username"
                                    placeholder = "Username"
                                    required
                                    onChange={(e) => setUsername(e.target.value)}
                                    />
                                </div>

                                <div className="login-divider" />

                                <div className="input-field-container">
                                    <input
                                    className="input-field"
                                    type = "password"
                                    placeholder = "Password"
                                    required
                                    onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>

                                <button type="submit" className="login-button">Log in</button>

                                <div className="forgot-password-link">
                                    <a href="/notareallink">Forgot your password?</a>
                                </div>
                                
                                {loginError && (
                                <div id="login-error">
                                    <div className="login-error">
                                        Invalid username or password. 
                                        <br/>
                                        Please try again or click Forgot password to reset it.
                                    </div>
                                </div>
                                )}
                            </form>
                        </div>
                    </div>
                    <Footer />
                </div>
            </div>
        );
    }
}

export default Login;


/*
    fetch(fullAddr, {
        method: 'GET',
        headers: {
            'Content-type': 'application/json'
        }
        //,
        //body: JSON.stringify(creds)
    })
    .then(response => {
        if (response.ok) {
            return response.json()
        }
        throw response;
    })
    .then(data => {
        console.log("here is the data")
        console.log(data)
        console.log("can i get just the response from a known key?")
        console.log(data.ttResponseType)
        console.log("and maybe i can set a variable to this data");
        reactResponseStateType = data.ttResponseType;
    })
    .catch(error => {
        console.error("Error fetching data: ", error);
    })
    .finally(() => {
        console.log("do something here lol")
    })
*/
