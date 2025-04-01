import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

const Signup = ({ navigation }) => {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [phonenumber, setPhonenumber] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);

  // Error states
  const [errors, setErrors] = useState({});

  // Function to validate fields
  const validateFields = () => {
    let newErrors = {};

    if (!firstname.trim()) newErrors.firstname = "First name is required";
    if (!lastname.trim()) newErrors.lastname = "Last name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Invalid email format";

    if (!phonenumber.trim()) newErrors.phonenumber = "Phone number is required";
    else if (!/^\d{10}$/.test(phonenumber)) newErrors.phonenumber = "Invalid phone number";

    if (!password.trim()) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";
    else if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(password))
      newErrors.password = "Password must be alphanumeric";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Function to handle signup
  const handleSignup = async () => {
    if (!validateFields()) return; // Stop if validation fails

    try {
      const response = await fetch("https://4e68-89-19-67-95.ngrok-free.app/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstname,
          lastname,
          email,
          phonenumber,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Signup Successful!");
        navigation.navigate("Dashboard");
      } else {
        if (data.message === "Email already exists") {
          setErrors((prev) => ({ ...prev, email: "Email already exists" }));
        } else {
          Alert.alert("Error", "Signup Failed! Please try again.");
        }
      }
    } catch (error) {
      console.error("Signup Error:", error);
      Alert.alert("Error", "Error connecting to the server");
    }
  };

  return (
    <View style={styles.div1}>
      <Text style={styles.text1}>Create an Account</Text>
      <Text style={styles.text2}>Welcome!</Text>
      <Text style={styles.text3}>Please login or signup to continue</Text>

      <View style={styles.nameform}>
        <View>
          <TextInput
            style={styles.fname}
            placeholder="Firstname"
            value={firstname}
            onChangeText={setFirstname}
          />
          {errors.firstname && <Text style={styles.errorText1}>{errors.firstname}</Text>}
        </View>

        <View>
          <TextInput
            style={styles.lname}
            placeholder="Lastname"
            value={lastname}
            onChangeText={setLastname}
          />
          {errors.lastname && <Text style={styles.errorText2}>{errors.lastname}</Text>}
        </View>
      </View>

      <TextInput
        style={styles.email}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

      <TextInput
        style={styles.phno}
        placeholder="Phone Number"
        value={phonenumber}
        onChangeText={setPhonenumber}
        keyboardType="phone-pad"
      />
      {errors.phonenumber && <Text style={styles.errorText}>{errors.phonenumber}</Text>}

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.pwd}
          placeholder="Password"
          secureTextEntry={!passwordVisible}
          value={password}
          onChangeText={setPassword}
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
      {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

      <View style={styles.signupContainer}>
        <TouchableOpacity style={styles.btnsignup} onPress={handleSignup}>
          <Text style={styles.signuptext}>Sign Up</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.ortext}>Or</Text>

      <TouchableOpacity style={styles.btngooglesignup}>
        <Image
          source={require("../assets/icons8-google-30.png")}
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
    marginTop: 160,
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
    marginTop: 40,
    marginLeft: 60,
  },
  fname: {
    backgroundColor: "#F8F8FF",
    borderRadius: 15,
    borderStyle: "solid",
    borderWidth: 1,
    width: 280,
    height: 39,
    paddingHorizontal: 10,
  },
  lname: {
    backgroundColor: "#F8F8FF",
    marginTop:10,
    borderRadius: 15,
    borderStyle: "solid",
    borderWidth: 1,
    width: 280,
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
    marginRight:26
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
  errorText1: {
    color: "red",
    fontSize: 12,
    marginTop: 3,
    marginLeft:5
  },
  errorText2: {
    color: "red",
    fontSize: 12,
    marginTop: 3,
    marginLeft:5
  },
  errorText:{
    color: "red",
    fontSize: 12,
    marginLeft: 65,
    marginTop: 3,
  }
});

export default Signup;
