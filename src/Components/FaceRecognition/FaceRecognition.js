import React from "react";
import './FaceRecognition.css';

const FaceRecognition = ({ imageUrl, boxes }) => {
    return (
        <div className="center ma">
            <div className="absolute mt2">
                <img id="inputimage" alt="" src={imageUrl} width='500px' height='auto'/>
                <div className="bounding-box" style={{top: boxes.topRow, right: boxes.rightCol, bottom: boxes.bottomRow, left: boxes.leftCol}}></div>
            </div>
        </div>
    );
}

export default FaceRecognition;