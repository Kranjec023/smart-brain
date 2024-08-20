import React, { Component } from 'react';
import ParticlesBg from 'particles-bg';
import './App.css';
import Navigation from './Components/Navigation/Navigation';
import Logo from './Components/Logo/Logo';
import ImageLinkForm from './Components/ImageLinkForm/ImageLinkForm';
import Rank from './Components/Rank/Rank';
import FaceRecognition from './Components/FaceRecognition/FaceRecognition';
import Signin from './Components/Signin/Signin';
import Register from './Components/Register/Register';

/* Clarifai */
const PAT = process.env.CLARIFAI_PAT;
const USER_ID = process.env.U_ID;       
const APP_ID = process.env.A_ID;
const MODEL_ID = process.env.M_ID;

const setupClarifai = (imageUrl) => {
    const raw = JSON.stringify({
        "user_app_id": {
            "user_id": USER_ID,
            "app_id": APP_ID
        },
        "inputs": [
            {
                "data": {
                    "image": {
                        "url": imageUrl
                    }
                }
            }
        ]
    });

    const requestOptions = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Key ' + PAT,
            'Content-Type': 'application/json'
        },
        body: raw
    };

    return fetch(`https://api.clarifai.com/v2/models/${MODEL_ID}/outputs`, requestOptions)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json(); // Parse JSON response
        })
        .then(result => result) // Return the result from the promise
        .catch(error => { throw new Error('error', error) });
}
/* Clarifai */
const initialState = {
    input: '',
    imageUrl: '',
    boxes: {},
    route: 'signin',
    isSignedIn: false,
    user: {
      id: '',
      name: '',
      email: '',
      entries: 0,
      joined: ''
    }
};

class App extends Component {
  constructor() {
    super();
    this.state = initialState;
  }

  loadUser = (data) => {
    this.setState({user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined
    }})
  }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  displayFaceBox = (boxes) => {
    console.log(boxes);
    this.setState({boxes: boxes})
  }

  onInputChange = (event) => {
    this.setState({ input: event.target.value });
  }

  // onPictureSubmit()...
  onButtonSubmit = () => {
    this.setState({ imageUrl: this.state.input });
    setupClarifai(this.state.input)
      .then(response => {
        if (response) {
          fetch('https://smart-brain-api-a2ye.onrender.com/image', {
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                id: this.state.user.id
            })
          })
          .then(response => response.json())
          .then(count => {
            this.setState(Object.assign(this.state.user, { entries: count }))
          })
          .catch(error => console.log('Error:', error));
        }
        this.displayFaceBox(this.calculateFaceLocation(response))
      })
      .catch(error => console.log('Error:', error));
  }

  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState(initialState)
    }else if(route === 'home'){
      this.setState({isSignedIn: true})
    }
    this.setState({route: route});
  }

  render() {
    const { isSignedIn, imageUrl, route, boxes } = this.state;
    return (
      <div className="App">
        <ParticlesBg type="cobweb" bg={true} />
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>
        { route === 'home' 
          ? <div>
              <Logo />
              <Rank 
                name={this.state.user.name} 
                entries={this.state.user.entries}
              />
              <ImageLinkForm 
                onInputChange={this.onInputChange} 
                onButtonSubmit={this.onButtonSubmit} 
              />
              <FaceRecognition imageUrl={imageUrl} boxes={boxes} />
            </div>
          : (
              route === 'signin' 
                ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
                : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} /> 
            )
            
        }
      </div>
    );
  }
}

export default App;
