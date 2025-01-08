import {useState, useEffect, useRef} from 'react';
import React from "react";
import Navbar from '../subscript/universal/Navbar.js';
import Footer from '../subscript/universal/Footer.js';
import {PropTypes} from "prop-types";
import CryptoJS from "crypto-js";
import {redirect, useSearchParams} from 'react-router-dom';

async function sendLogoutRequest() {
    const apiLogoutAddr = "https://illuminated.cs.mtu.edu/blacklight/api/token/logout";
    var return_code;

    await fetch(apiLogoutAddr, {
        method: 'GET',
        headers: {
            'Content-type': 'application/json',
        }
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        else {
            //console.log("response is");
            //console.log(response);
            throw response;
        }
    })
    .then(data => {
        if (data.data.error) {
            return_code = data.data;
        }
        else {
            //console.log("data.data is");
            //console.log(data.data);
            // throw data;
        }
    })
    .catch(error => {
        console.error("Error fetching data in logout?: ", error);
    })
    .finally(() => {
        // This will actually do something after the redirect
        // Or if no redirect it does it on the same page (obviously)
    })

    return return_code;
}

export default function Logout({setToken}) {
    function logout() {
        async function logout() {
            const result = await sendLogoutRequest();
            return result;
        }
        logout().then((response) => {
        //console.log("response?" + response);
        setToken("session", "BLIGHT", null);
        setToken("local", "session", null);
        window.location.replace("https://illuminated.cs.mtu.edu/login")
        });
    }

    logout();

    return (  
        <div>
            Logging you out...
        </div>
    );
}