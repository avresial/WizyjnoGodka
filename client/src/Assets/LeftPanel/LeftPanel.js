import React from 'react'
import User from './User/User'
import classes from './LeftPanel.module.css'

const LeftPanel = (props) => {
    const style = `${classes.LeftPanel} col-md-3`
    return (
        <div className={style}>
            {
                props.connections.map((currentElement, index) => {
                    return(
                        <User sendRequest={() => props.sendRequest(index)} 
                            key={currentElement.sid} 
                            name={`${currentElement.name}(${currentElement.sid})`} 
                            status={true}>
                        </User>
                    );
                })
            }
        </div>
    );
};

export default LeftPanel;