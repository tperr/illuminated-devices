import {useState, useEffect, useContext, useCallback} from 'react';
import React from "react";

// Image cropper
import 'reactjs-popup/dist/index.css';
import "./Provider/column.scss";

// FontAwesome Icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const SplitPageTest = () => {
    return (
        
        <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            height: "100vh",
        }}
        >
            {/* Left */}
            <div style={{
                gridRow: "1",
                gridColumn: "1",
                textTransform: "uppercase",
                backgroundImage: "url('https://suncoastdiesel.com/files/images/splash-pg/sp-background-diesel.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center", 
                fontFamily: "Poppins-EB",
                color: "white",
                fontSize: "5em",
            }}
            >
                <div
                    style={{
                        backgroundColor: "transparent", 
                        display: "grid",
                        gridTemplateRows: "1fr auto 1fr",
                        gridTemplateColumns: "1fr auto 1fr",
                        height: "94vh",
                        width: "48vw",
                        marginTop: "2vh",
                        marginLeft: "2vw",
                        marginBottom: "2vh",
                        borderLeft: "1vh solid white",
                        borderTop: "1vh solid white",
                        borderBottom: "1vh solid white",
                    }}
                >
                    <div style={{
                        gridRow: "2",
                        gridColumn: "2",
                    }}
                    >
                        <a 
                            href="https://google.com"
                            className="test-link-hover"
                        >
                            Diesel
                        </a>
                    </div>

                    <div style={{
                        display: "grid",
                        gridTemplateRows: "1fr auto",
                        gridRow: "3",
                        gridColumn: "2",
                        textAlign: "center",
                    }}
                    >
                        <div style={{
                            gridRow: "2",
                        }}>
                            <img 
                                src="https://suncoastdiesel.com/files/images/splash-pg/sp-logo.png" 
                                style={{
                                    width: "10vw",
                                    minWidth: "1.5em",
                                    opacity: "0.5",
                                }}
                            />
                        </div>
                    </div>
                </div>

            </div>

            {/* Right */}
            <div style={{
                gridRow: "1",
                gridColumn: "2",
                textTransform: "uppercase",
                backgroundImage: "url('https://suncoastdiesel.com/files/images/splash-pg/sp-background-gas.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center", 
                fontFamily: "Poppins-EB",
                color: "white",
                fontSize: "5em",
            }}
            >

                <div style={{
                        backgroundColor: "transparent", 
                        display: "grid",
                        gridTemplateRows: "1fr auto 1fr",
                        gridTemplateColumns: "1fr auto 1fr",
                        height: "94vh",
                        width: "48vw",
                        marginTop: "2vh",
                        marginRight: "2vh",
                        marginBottom: "2vh",
                        borderRight: "1vh solid white",
                        borderTop: "1vh solid white",
                        borderBottom: "1vh solid white",
                }}>
                    <div style={{
                        gridRow: "2",
                        gridColumn: "2",
                    }}
                    >
                        <a 
                            href="https://google.com"
                            className="test-link-hover"
                        >
                            Gas
                        </a>
                    </div>
                    
                    <div style={{
                        display: "grid",
                        gridTemplateRows: "1fr auto",
                        gridRow: "3",
                        gridColumn: "2",

                        textAlign: "center",

                    }}
                    >
                        <div style={{
                            gridRow: "2",
                        }}>
                            <img 
                                src="https://suncoastdiesel.com/files/images/splash-pg/sp-logo.png" 
                                style={{
                                    width: "10vw",
                                    minWidth: "1.5em",
                                    opacity: "0.5",
                                }}
                            />
                        </div>
                    </div>

                </div>

               
            </div>   

            {/* Middle */}
            <div style={{
                position: "absolute",
                display: "flex",
                width: "100%",
                height: "100%",
                pointerEvents: "none",
            }}
            >
                <img src="https://suncoastdiesel.com/files/images/splash-pg/sp-logo-emblem.png"
                    style={{
                        margin: "auto",
                        width: "5vw",
                    }}
                />
            </div>
        </div>
    );
}

export default SplitPageTest;

