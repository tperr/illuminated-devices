import React from "react";
import Category from "./Provider/components/Category";


const AdminOption = props => {
    return (
        <div id={"admin-" + props.name} className="admin-options" style={{flexGrow: 0, maxHeight: "80vh"}}>
            <h4 className="admin-title"> {props.name.charAt(0).toUpperCase() + props.name.slice(1)} </h4>
            <Category name={props.name} userId={props.userId}/>

            <div id={"admin-" + props.name + "-add"} className="admin-add">
                <b>+</b>
            </div>
        </div>
    )
}

export default AdminOption;