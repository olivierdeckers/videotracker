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

    GoogleSignin.configure({
      iosClientId: "616713603335-kt6socrtqslikninkvnej79nl6ifog4i.apps.googleusercontent.com",
      scopes: [
        "https://www.googleapis.com/auth/youtube"
      ]
    })
    .then(() => {
      GoogleSignin.currentUserAsync().then(this.onSignIn.bind(this));
    });

    this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      dataSource: this.ds.cloneWithRows([]),
    };
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
    return this.fetchYoutube("playlists?part=snippet&mine=true")
      .then((response) => {
        console.log(response);
        return response.items[0].id;
      });
  }

  getPlaylistItems(playlistId) {
    console.log(playlistId);
    return this.fetchYoutube("playlistItems?part=snippet&playlistId=" + playlistId)
      .then((response) => { console.log(response); return response; });
  }

  onSignIn(user) {
    this.accessToken = user.accessToken;
    this.getWatchLater()
      .then((watchLaterId) => this.getPlaylistItems(watchLaterId).then((response) => {
        this.setState({
          dataSource: this.ds.cloneWithRows(response.items)
        });
      }));
  }

  signIn() {
    GoogleSignin.signIn()
      .then(this.onSignIn.bind(this))
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
      return <ListView
        dataSource={this.state.dataSource}
        renderRow={this.renderVideo}
        style={styles.videoList}/>;
    }
  }

  renderVideo(item) {
    var thumb = item.snippet.thumbnails ? item.snippet.thumbnails.default : null;
    return (<View key={item.id} style={styles.videoContainer}>
        <Image source={thumb} style={styles.videoThumb} />
        <View style={styles.videoTitleContainer}>
          <Text style={styles.videoTitle}>
            {item.snippet.title}
          </Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  videoList: {
    flexDirection: 'column',
  },
  videoContainer: {
    flex: 1,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#aaaaaa',
  },
  videoThumb: {
    height: 54,
    width: 72,
    marginRight: 10,
  },
  videoTitleContainer: {
    flex: 1,
    flexDirection: 'column',
    // alignItems: 'center',
    // justifyContent: 'space-around',
  },
  videoTitle: {
    fontSize: 20,
  },
});

AppRegistry.registerComponent('VideoTracker', () => VideoTracker);
