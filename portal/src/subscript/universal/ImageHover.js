import React from "react";
import { createRoot } from 'react-dom/client';

const Hover = props => {
    function over(me) {
        me.currentTarget.src = props.hover;
    }
    function out(me) {
        me.currentTarget.src = props.default;
    }
    return <img src={props.default} onMouseOver={over} onMouseOut={out} alt={props.altText} className={props.className} height={props.height} />
};

function ImageHover(props) {
    // Specific height
    if(props.height > 0) {
        return ( <Hover height={props.height} default={props.default} hover={props.hover} className={props.className} altText={props.altText} /> )
    } 
    // Does not specify a height
    else {
        return ( <Hover default={props.default} hover={props.hover} className={props.className} altText={props.altText} /> )
    }

}

// const container = document.getElementById('root');
// const root = createRoot(container);
// root.render(<ImageHover />); 
export default ImageHover;