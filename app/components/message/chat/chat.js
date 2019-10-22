import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, StatusBar, ListView } from 'react-native';
import { Colors } from '@themes/index';


export default class Chat extends React.Component {

    constructor(props) {
        super(props);
        const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state = {
            dataSource: ds.cloneWithRows([
                'Item1', 'Item2', 'Item3', 'Item4', 'Item5', 'Item6', 'Item7', 'Item8', 
                'Item9', 'Item10'
            ])
        };
    }

    renderLoading() {
        return (
            <View style={styles.container}>
                {/*<Loading loaded={this.state.loaded} />*/}
                <Text>Loading ...</Text>
            </View>
        )
    }

    renderListView() {
        return (
                <ListView
                    contentContainerStyle = {styles.listContainer}
                    dataSource = {this.state.dataSource}
                    renderHeader={this.renderSectionHeader}
                    renderRow = {
                    (rowData) => (
                        <Text style = {styles.listItem}>
                            {rowData}
                        </Text>
                    )
                    }
                />
        )
    }


    render() {
        /*return (    

            // <View style = {styles.container}>
                
                <ListView
                    contentContainerStyle = {styles.listContainer}
                    dataSource = {this.state.dataSource}
                    renderHeader={this.renderSectionHeader}
                    renderRow = {
                    (rowData) => (
                        <Text style = {styles.listItem}>
                            {rowData}
                        </Text>
                    )
                    }
                />

            // </View>
            
        );*/

        if (!this.state.loaded) {
            return (this.renderLoading())
        }

        return (this.renderListView())
        
    }





    

    

}

var styles = StyleSheet.create({

    container: {
        // flex: 1,
        // backgroundColor: 'gray'
    },
    listContainer: {
        // flex: 1,
        // flexDirection: 'row',
        justifyContent: 'space-around',
        // backgroundColor: 'yellow',
        height: 900
        // height: 600
    }

});