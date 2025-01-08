import {useState, useEffect} from 'react';
import React from "react";
import Navbar from '../subscript/universal/Navbar.js';
import Footer from '../subscript/universal/Footer.js';
import {PropTypes} from "prop-types";
import CryptoJS from "crypto-js";
import {redirect, useSearchParams} from 'react-router-dom';

async function tradeAccessCodeForToken(accessCode, codeVerifier) {
    // Without this, useEffect() calls this function ~3 times but the first 2 are always before it pulls search params
    if ((typeof(accessCode) === "undefined") || (typeof(codeVerifier) === "undefined")) {
        return null;
    }

    // Trade access code for access token
    // No auth_header for this
    const baseAddr = "https://illuminated.cs.mtu.edu/blacklight/api/token";
    const grant_type = "authorization_code";
    const code = accessCode;
    const redirect_uri = "https://illuminated.cs.mtu.edu/login/auth";
    const clientID = 1;
    const code_verifier = codeVerifier;
    const fullAddr = baseAddr.concat("?grant_type=", grant_type, 
                                    "&code=", code,
                                    "&redirect_uri=", redirect_uri,
                                    "&client_id=", clientID,
                                    "&code_verifier=", code_verifier); 

    var redirect_successfully = false;

    /*
    var client_redirect_uri = null;
    var jwt = null;
    var refresh_token = null;
    */
    var token;
    var session;

    //console.log(fullAddr);
    //console.log("awaiting");
    await fetch(fullAddr, {
        method: 'GET',
        headers: {
            'Content-type': 'application/json',
        },
    })
    .then(response => {
        if (response.ok) {
            return response.json()
        }
        throw response;
    })
    .then(data => {
        //console.log("data follows")
        //console.log(data);
        //console.log(data.data);                  // object: data, key: data (from api)
        token = data.data.jwt;                   // data.data will have jwt and refresh_token until API and App are updated so we just ignore refresh_token here
        session = data.data.session;
        redirect_successfully = true;
    })
    .catch(error => {
        console.error("Error fetching data: ", error);
    })
    .finally(() => {
        // This will actually do something after the redirect
        // Or if no redirect it does it on the same page (obviously)
    })

    var data;
    if (redirect_successfully === true) {
        data = {
            "token": token,
            "session": session,
            "redirect": true
        };
    }
    else {
        data = {
            "token": "null",
            "session": "null",
            "redirect": false
        };
    }
    //console.log("end tradeaccesscodefortoken")
    return data;

    /*
    localStorage.setItem("jwt", jwt);
    localStorage.setItem("refresh_token", refresh_token);
    console.log(localStorage.getItem("jwt"));
    console.log(localStorage.getItem("refresh_token"));
    */
}

export default function Login_Auth({setToken}) {
    // props.setToken
    const [searchParams, setSearchParams] = useSearchParams();
    const [accessCode, setAccessCode] = useState();
    const [codeVerifier, setCodeVerifier] = useState();

    useEffect(() => {
        const handleTrade = async e => {
            //console.log("begin handleTrade")

            setAccessCode(searchParams.get("code"))
            setCodeVerifier(searchParams.get("verifier"))
            const result = await tradeAccessCodeForToken(accessCode, codeVerifier);
            // return;

            if ((result !== null) && (result.redirect === true)) {
                // console.log("result");
                // console.log(result);
                // console.log(result["token"]);
                // console.log(result["session"]);
                setToken("session", "BLIGHT", result["token"]);
                setToken("local", "session", result["session"]);
                console.log(result)
                // return;
                window.location.replace("https://illuminated.cs.mtu.edu/home");
            }
            else {
                console.log("Error occurred in tradeAccessCodeForToken()");
                setToken("session", "BLIGHT", null);
                setToken("local", "session", null);
                return;
            }
        }

        setAccessCode(searchParams.get("code"));
        setToken("sesion", "BLIGHT", true);
        // console.log(searchParams)
        // return;
        handleTrade();
    }, [searchParams, accessCode, codeVerifier, setToken]);

    return (  
        <div>
            Logging you in...
        </div>
    );
}

Login_Auth.propTypes = {
    setToken: PropTypes.func.isRequired
  };