export const KeyPress = (button, object) => {
    let shiftHold = false;
    if (object) {
        object.addEventListener('keydown', (event) => {
            if (event.keyCode === 16) {
                shiftHold = true;
            }
    
            if (event.keyCode === 13 && !shiftHold) {
                event.preventDefault();
                button.click();
            }
        });

        object.addEventListener('keyup', (event) => {
            if (event.keyCode === 16) {
                shiftHold = false;
            }
        });

    }
};