// hfdfhddfhgsfadfghnhgfd
import React from "react";
import { UserContext } from "../../App";
// import { useCookies } from "react-cookie";

export default function AccountScope() {
    const { appearingAs, userDetails } = React.useContext(UserContext);
    // const [cookies, setCookies] = useCookies(['appearingAs']);
    
    if ((userDetails === null) || (userDetails === undefined)) {
        return "NULL";
    }
    else if (userDetails[0] === 0) {
        if ((appearingAs !== null) && (appearingAs !== undefined)) {
            return appearingAs;
        }
        else {
            return 0;
        }
    }
    else {
        return userDetails[0];
    }
}