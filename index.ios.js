/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  ListView,
  Image
} from 'react-native';
import {GoogleSignin, GoogleSigninButton} from 'react-native-google-signin';

class VideoTracker extends Component {

  constructor() {
    super();
    this.items = [];
    GoogleSignin.configure({
      iosClientId: "616713603335-kt6socrtqslikninkvnej79nl6ifog4i.apps.googleusercontent.com",
      scopes: [
        "https://www.googleapis.com/auth/youtube"
      ]
    })
    .then(() => {
      // you can now call currentUserAsync()
    });
  }

  fetchYoutube(suffix) {
    return fetch("https://www.googleapis.com/youtube/v3/" + suffix, {
      'headers': {
        "Authorization": "Bearer " + this.accessToken
      }
    })
    .then((response) => response.json())
    .catch((err) => console.error(err));
  }

  getWatchLater() {
    return this.fetchYoutube("channels?part=contentDetails&mine=true")
      .then((response) => response.items[0].contentDetails.relatedPlaylists.watchLater);
  }

  getPlaylistItems(playlistId) {
    return this.fetchYoutube("playlistItems?part=snippet&playlistId=" + playlistId)
      .then((response) => { console.log(response); return response; });
  }

  signIn() {
    GoogleSignin.signIn()
      .then((user) => {
        // console.log(user);

        this.accessToken = user.accessToken;
        this.getWatchLater()
          .then((watchLaterId) => this.getPlaylistItems(watchLaterId).then((response) => {this.items = response.items; this.forceUpdate();}));
      })
      .catch((err) => {
        console.error(err);
      })
      .done();
  }



  render() {
    if (!this.accessToken) {
      return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000'}}>
          <GoogleSigninButton
            style={{width: 312, height: 48}}
            size={GoogleSigninButton.Size.Wide}
            color={GoogleSigninButton.Color.Light}
            onPress={this.signIn.bind(this)}/>
        </View>
      );
    } else {
      return (<View>
          {this.items.map((item) => {
            var thumb = item.snippet.thumbnails ? item.snippet.thumbnails.default : null;
            console.log(item);
            return (<View key={item.id}>
                <Image source={thumb} />
                <Text>{item.snippet.title}</Text>
              </View>);
          })}
        </View>);
    }
  }
}

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#F5FCFF',
//   },
//   welcome: {
//     fontSize: 20,
//     textAlign: 'center',
//     margin: 10,
//   },
//   instructions: {
//     textAlign: 'center',
//     color: '#333333',
//     marginBottom: 5,
//   },
// });

AppRegistry.registerComponent('VideoTracker', () => VideoTracker);
