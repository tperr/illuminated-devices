import {useState, useEffect, useContext} from 'react';

import { UserContext } from '../App.js';
import PageWrapper from './PageWrapper.js';

// import Provider from '../pages/Provider/Provider.js';  //-- Deprecated
import OrganizationHome from '../pages/OrganizationHome/OrganizationHome.js';
import Tutor from './Tutor/Tutor.js';
import Device from './Device/Device.js';
import SuperTutor from './SuperTutor/SuperTutor.js';

const Home = () => {
    const { userId, appearingAs, userDetails } = useContext(UserContext);

    const [accountScope, setAccountScope] = useState(null);

    useEffect(() => {
        if ((userDetails !== null) && (userDetails !== undefined)) {
            setAccountScope(userDetails[0])
        }
    }, [userDetails]);

    
    const DefaultPage = () => {
        if (userId) {
            return(
                <div id="home">
                
                    <p>omg developer quick links</p>
                    <p>you are user: {userId}</p>
                    <p>ur account is {appearingAs} </p>
                    <ol>
                        <li><a href="/">
                            landing page
                        </a></li>
                        <li><a href="/home">
                            home
                        </a></li>
                        <li><a href="/admin">
                            admin
                        </a></li>
                        <li><a href="/login">
                            login (will redirect if you are currently logged in)
                        </a></li>
                        <li><a href="/meetingtest"> Meeting Testing </a> </li>
                        <li><a href="/tutor"> Tutor </a> </li>
                        <li><a href="/supertutor"> Super Tutor </a></li>
                        <li><a href="/ipad"> Patron </a></li>
                    </ol>
                    <br/>
                    {/*<button onClick={() => checkOut(userId, "68aee89d-cda3-11ed-a1ce-0050569fc3a3", "4add003d-16bb-11ed-a1ce-0050569fc3a3", 1680659787, 1680659787)}> clicky</button>*/}
                </div>
            );
        }
    }


    if (((userId !== null) && (userId !== undefined)) && ((accountScope !== null) & (accountScope !== undefined))) {
        switch(accountScope) {
            // Developer Account
            case(0): 
                switch(appearingAs) {
                    case "2": return PageWrapper("tutor-home", Tutor, {appearingAsValue:2})
                    case "3": return PageWrapper("tutor-home", Tutor, {appearingAsValue:3})
                    case "4": return PageWrapper("organization-home", OrganizationHome, {appearingAsValue:4})
                    default: return PageWrapper("default-home", DefaultPage, {appearingAsValue:appearingAs, pageID:0})
                }
            case(1): return PageWrapper("default-home", DefaultPage) // admin
            case(2): return PageWrapper("tutor-home", SuperTutor) // supertutpr
            case(3): return PageWrapper("tutor-home", Tutor) // tutor?
            case(4): // organization
                if (userId === "b275f155-1614-11ed-a1ce-0050569fc3a3") {
                    return PageWrapper("organization-home", OrganizationHome)
                }
                else {
                    return PageWrapper("organization-home", OrganizationHome)
                }
                
            case(5): return PageWrapper("organization-home", OrganizationHome) // location
            case(6): return PageWrapper("device-home", Device)// ipad
            default:
                return (
                <div>
                    If you're seeing this then your account scope is one that the developers forgot to include a case for on this page. <br />
                    If you are one of the developers, shame on you. <br />
                    If you are <i>not</i> one of the developers, please let them know. <br />
                    Thanks! <br />
                    - Kirk
                </div>)
        }
    }
}

export default Home;
