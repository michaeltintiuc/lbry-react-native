import React from 'react';
import { Lbry, buildURI, normalizeURI } from 'lbry-redux';
import { ActivityIndicator, Button, FlatList, NativeModules, Text, TextInput, View, ScrollView } from 'react-native';
import { navigateToUri, uriFromFileInfo } from 'utils/helper';
import Colors from 'styles/colors';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import PageHeader from 'component/pageHeader';
import FileListItem from 'component/fileListItem';
import FloatingWalletBalance from 'component/floatingWalletBalance';
import StorageStatsCard from 'component/storageStatsCard';
import UriBar from 'component/uriBar';
import downloadsStyle from 'styles/downloads';
import fileListStyle from 'styles/fileList';

class DownloadsPage extends React.PureComponent {
  static navigationOptions = {
    title: 'Downloads',
  };

  didFocusListener;

  componentWillMount() {
    const { navigation } = this.props;
    // this.didFocusListener = navigation.addListener('didFocus', this.onComponentFocused);
  }

  componentWillUnmount() {
    if (this.didFocusListener) {
      this.didFocusListener.remove();
    }
  }

  onComponentFocused = () => {
    const { fetchMyClaims, fileList, pushDrawerStack, setPlayerVisible } = this.props;
    pushDrawerStack();
    setPlayerVisible();
    NativeModules.Firebase.setCurrentScreen('Library');

    fetchMyClaims();
    fileList();
  };

  componentDidMount() {
    this.onComponentFocused();
  }

  componentWillReceiveProps(nextProps) {
    const { currentRoute } = nextProps;
    const { currentRoute: prevRoute } = this.props;
    if (Constants.DRAWER_ROUTE_MY_LBRY === currentRoute && currentRoute !== prevRoute) {
      this.onComponentFocused();
    }
  }

  getFilteredUris = () => {
    const { claims, downloadedUris } = this.props;
    const claimUris = claims.map(claim => normalizeURI(`${claim.name}#${claim.claim_id}`));
    return downloadedUris.filter(uri => !claimUris.includes(uri));
  };

  render() {
    const { fetching, claims, downloadedUris, fileInfos, navigation } = this.props;
    const filteredUris = this.getFilteredUris();
    const hasDownloads = filteredUris && filteredUris.length > 0;

    return (
      <View style={downloadsStyle.container}>
        <UriBar navigation={navigation} />
        {!fetching && !hasDownloads && (
          <View style={downloadsStyle.busyContainer}>
            <Text style={downloadsStyle.noDownloadsText}>
              You have not watched or downloaded any content from LBRY yet.
            </Text>
          </View>
        )}
        {fetching && (
          <View style={downloadsStyle.busyContainer}>
            <ActivityIndicator size="large" color={Colors.NextLbryGreen} style={downloadsStyle.loading} />
          </View>
        )}
        {!fetching && hasDownloads && (
          <View style={downloadsStyle.subContainer}>
            <StorageStatsCard fileInfos={fileInfos} />
            <FlatList
              style={downloadsStyle.scrollContainer}
              contentContainerStyle={downloadsStyle.scrollPadding}
              renderItem={({ item }) => (
                <FileListItem style={fileListStyle.item} uri={item} navigation={navigation} autoplay />
              )}
              data={downloadedUris}
              keyExtractor={(item, index) => item}
            />
          </View>
        )}
        <FloatingWalletBalance navigation={navigation} />
      </View>
    );
  }
}

export default DownloadsPage;
