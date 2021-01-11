import React from 'react';
import axios from 'axios';
import parser from 'fast-xml-parser';
import he from 'he';

class LoginButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: false
    };
  }

  toggleLoggedIn = () =>
    this.setState(state => {
      return { isLoggedIn: !state.isLoggedIn };
    });

  onSignIn = googleUser => {
    this.toggleLoggedIn();

    let user = googleUser.getBasicProfile();
    let id_token = googleUser.getAuthResponse().id_token;
    let response = googleUser.getAuthResponse();
    let access_token = window.gapi.auth2.getAuthInstance().currentUser.get().Bc.access_token;

    console.log('google user obj', user);
    console.log('google_id_token', id_token);
    console.log('google_auth_response', response);
    console.log('googleUser', access_token);
    // plus any other logic here'

    axios.get(`https://www.google.com/m8/feeds/contacts/${user.tu}/full`, {
      headers: {
        Authorization: response.token_type + ' ' + access_token,
        'GData-Version': '3.0',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).then(({data}) => {
      var options = {
        attributeNamePrefix : "",
        attrNodeName: "attr", //default is 'false'
        textNodeName : "#text",
        ignoreAttributes : false,
        ignoreNameSpace : false,
        allowBooleanAttributes : false,
        parseNodeValue : true,
        parseAttributeValue : true,
        trimValues: true,
        cdataTagName: "__cdata", //default is 'false'
        cdataPositionChar: "\\c",
        parseTrueNumberOnly: false,
        arrayMode: false, //"strict"
        attrValueProcessor: (val, attrName) => he.decode(val, {isAttributeValue: true}),//default is a=>a
        tagValueProcessor : (val, tagName) => he.decode(val), //default is a=>a
        stopNodes: ["parse-me-as-string"]
      };
      
      if( parser.validate(data) === true) { //optional (it'll return an object in case it's not valid)
          var jsonObj = parser.parse(data,options);
          console.log(jsonObj);
      }
    }).catch((error) => {
      console.log(error);
    });
  };

  renderGoogleLoginButton = () => {
    console.log('rendering google signin button');
    window.gapi.signin2.render('my-signin2', {
      scope: 'profile email https://www.googleapis.com/auth/contacts.readonly',
      width: 250,
      height: 40,
      longtitle: true,
      theme: 'light',
      onsuccess: this.onSignIn
    });
  };

  logout = () => {
    console.log('in logout');

    let auth2 = window.gapi && window.gapi.auth2.getAuthInstance();
    if (auth2) {
      auth2
        .signOut()
        .then(() => {
          this.toggleLoggedIn();
          console.log('Logged out successfully');
        })
        .catch(err => {
          console.log('Error while logging out', err);
        });
    } else {
      console.log('error while logging out');
    }
  };

  componentDidMount() {
    window.addEventListener('google-loaded', this.renderGoogleLoginButton);
    window.gapi && this.renderGoogleLoginButton();
  }

  render() {
    // noinspection CheckTagEmptyBody
    return (
      <div>
        <div id="my-signin2"></div>
        <br />
        {this.state.isLoggedIn && (
          <button style={{ width: 200, height: 40, textAlign: 'center' }} onClick={this.logout}>
            Logout
          </button>
        )}
      </div>
    );
  }
}

export default LoginButton;
