import react from "react";
import {View, Text, StyleSheet, TouchableOpacity} from "react-native";

export default function Dashboard({navigation}){
    return (
        <>
        <View>
            <View style={styles.header}>
            <TouchableOpacity onPress={()=>navigation.navigate("Login")}><Text>Sign out</Text></TouchableOpacity>
            </View>
        </View>
        </>
    )
}

const styles=StyleSheet.create({
    header:{
        marginTop:55,
        height:40,
        paddingTop:10,
        paddingLeft:15,
        borderWidth:1
    }
})