import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons"; // For Eye icon

const Signup = ({ navigation }) => {
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <View style={styles.div1}>
      <Text style={styles.text1}>Create an Account</Text>
      <Text style={styles.text2}>Welcome?</Text>
      <Text style={styles.text3}>Please login or signup to our page</Text>

      <View style={styles.nameform}>
        <TextInput style={styles.fname} placeholder="Firstname" />
        <TextInput style={styles.lname} placeholder="Lastname" />
      </View>

      <TextInput style={styles.email} placeholder="Email" />
      <TextInput style={styles.phno} placeholder="Phone Number" />

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.pwd}
          placeholder="Password"
          secureTextEntry={!passwordVisible}
        />
        <TouchableOpacity
          onPress={() => setPasswordVisible(!passwordVisible)}
          style={styles.eyeIcon}
        >
          <Ionicons
            name={passwordVisible ? "eye" : "eye-off"}
            size={20}
            color="gray"
          />
        </TouchableOpacity>
      </View>

      {/* Wrapped Sign Up button for alignment */}
      <View style={styles.signupContainer}>
        <TouchableOpacity style={styles.btnsignup}>
          <Text style={styles.signuptext}>Sign Up</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.ortext}>Or</Text>

      <TouchableOpacity style={styles.btngooglesignup}>
        <Image
          source={require("../assets/icons8-google-30.png")} // Replace with your Google logo file
          style={styles.googleIcon}
        />
        <Text style={styles.googlesignuptext}>Sign Up with Google</Text>
      </TouchableOpacity>

      <View style={styles.loginContainer}>
        <Text style={styles.already}>Already have an account?</Text>
        <TouchableOpacity
          style={styles.btnlog}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.logintxt}> Log In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  div1: {
    marginTop: 200,
  },
  text1: {
    fontSize: 30,
    marginLeft: 65,
    color: "#009688",
    marginTop: 35,
  },
  text2: {
    fontSize: 28,
    marginLeft: 65,
    marginTop: 8,
    color: "#009688",
  },
  text3: {
    fontSize: 17,
    marginLeft: 65,
    marginTop: 5,
  },
  nameform: {
    flexDirection: "row",
    marginTop: 40,
    marginLeft: 60,
  },
  fname: {
    backgroundColor: "#F8F8FF",
    borderRadius: 15,
    borderStyle: "solid",
    borderWidth: 1,
    width: 100,
    height: 39,
    paddingHorizontal: 10,
  },
  lname: {
    backgroundColor: "#F8F8FF",
    borderRadius: 15,
    marginLeft: 70,
    borderStyle: "solid",
    borderWidth: 1,
    width: 100,
    height: 39,
    paddingHorizontal: 10,
  },
  email: {
    marginLeft: 60,
    borderStyle: "solid",
    borderRadius: 15,
    borderWidth: 1,
    width: 280,
    height: 39,
    marginTop: 10,
    backgroundColor: "#F8F8FF",
    paddingHorizontal: 10,
  },
  phno: {
    marginLeft: 60,
    borderStyle: "solid",
    borderRadius: 15,
    borderWidth: 1,
    width: 280,
    height: 39,
    marginTop: 10,
    backgroundColor: "#F8F8FF",
    paddingHorizontal: 10,
  },
  pwd: {
    flex: 1,
    height: 39,
    backgroundColor: "#F8F8FF",
    borderRadius: 15,
    borderStyle: "solid",
    borderWidth: 1,
    paddingHorizontal: 10,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 60,
    width: 270,
    marginTop: 10,
  },
  eyeIcon: {
    marginLeft: -30,
  },
  signupContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  btnsignup: {
    backgroundColor: "#009688",
    width: 280,
    borderRadius: 15,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  signuptext: {
    color: "white",
    fontWeight: "600",
  },
  ortext: {
    textAlign: "center",
    marginTop: 20,
    fontWeight: "600",
    color: "grey",
  },
  btngooglesignup: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: 280,
    marginLeft: 60,
    marginTop: 24,
    borderStyle: "solid",
    borderWidth: 1,
    borderRadius: 15,
    height: 40,
  },
  googleIcon: {
    marginRight: 10,
  },
  googlesignuptext: {
    fontSize: 16,
    fontWeight: "600",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 28,
    marginRight:27
  },
  already: {
    fontSize: 16,
  },
  logintxt: {
    color: "#009688",
    fontWeight: "bold",
  },
  btnlog: {
    marginLeft: 5,
  },
});

export default Signup;
