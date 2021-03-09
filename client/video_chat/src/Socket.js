
const Soc = () => {
    const socket = new WebSocket("ws://127.0.0.1:8000");
    
    socket.onopen = () =>{
        // socket.send("Connected!");
        console.log("sent");
    };

    socket.onmessage = (data) => {
        console.log(data.data);
    }
}




export default Soc;