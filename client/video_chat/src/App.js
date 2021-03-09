import React, {Component} from 'react'
import Vid from "./Video"
import Soc from "./Socket"
import './App.css';

class App extends Component{
  constructor(props) {
    super(props);
    this.state = {
      socket: Soc()
    }
  }


  render(){
    return(
      <div className="App">

      {/* <Vid></Vid> */}

    </div>
    )
  }

}

export default App;
