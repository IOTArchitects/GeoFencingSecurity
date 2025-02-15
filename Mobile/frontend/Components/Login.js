import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, TextInput, Alert } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons"; // For Eye icon

const Login = ({ navigation }) => {
  const [username, setUsername] = useState(""); // Can be email or phone
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errors, setErrors] = useState({});

  // Function to validate input fields
  const validateFields = () => {
    let newErrors = {};

    if (!username.trim()) {
      newErrors.username = "Email or Phone Number is required";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Function to handle login request
  const handleLogin = async () => {
    if (!validateFields()) return;

    try {
      const response = await fetch("http://10.6.54.224:4000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Successful login, navigate to the next screen
        console.log("Login Successful:", data);
        Alert.alert("Success", "Login Successful!");
        navigation.navigate("Dashboard"); // Change to your home screen name
      } else {
        // Display error message if login fails
        setErrors({ general: data.message || "Invalid credentials" });
      }
    } catch (error) {
      console.error("Error during login:", error);
      setErrors({ general: "Network error. Please try again." });
    }
  };

  return (
    <View style={styles.div1}>
      <Text style={styles.text1}>Log In to your Account!
      </Text>
      <Text style={styles.text2}>Welcome back! Please enter your details</Text>

      <View style={styles.loginform}>
        {/* Username Input */}
        <TextInput
          style={styles.email}
          placeholder="Email or Phone Number"
          value={username}
          onChangeText={setUsername}
        />
        {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}

        {/* Password Input with Toggle Visibility */}
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

        {/* Display general login error */}
        {errors.general && <Text style={styles.errorText}>{errors.general}</Text>}

        {/* Login Button */}
        <TouchableOpacity style={styles.btnlogin} onPress={handleLogin}>
          <Text style={styles.logintext}>Login</Text>
        </TouchableOpacity>

        <Text style={styles.ortext}>Or</Text>

        {/* Google Login Button */}
        <TouchableOpacity style={styles.btngooglelogin}>
          <Image
            source={require("../assets/icons8-google-30.png")} // Replace with your Google logo file
            style={styles.googleIcon}
          />
          <Text style={styles.googlelogintext}>Log In with Google!</Text>
        </TouchableOpacity>
      </View>

      {/* Sign Up Link */}
      <View style={styles.signupContainer}>
        <Text style={styles.already}>Don't have an account?</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
          <Text style={styles.signuptxt}> Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Styles
const styles = {
  div1: {
    marginTop: 200,
    alignItems: "center",
  },
  text1: {
    fontSize: 26,
    color: "#009688",
    fontWeight: "bold",
  },
  text2: {
    fontSize: 16,
    marginTop: 8,
    fontWeight: "500",
    color: "gray",
  },
  loginform: {
    marginTop: 50,
    width: "80%",
  },
  email: {
    borderWidth: 1,
    height: 40,
    borderRadius: 15,
    backgroundColor: "#F8F8FF",
    paddingHorizontal: 10,
    borderColor: "#ccc",
  },
  pwd: {
    flex: 1,
    height: 40,
    backgroundColor: "#F8F8FF",
    borderRadius: 15,
    borderWidth: 1,
    paddingHorizontal: 10,
    borderColor: "#ccc",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    borderWidth: 1,
    borderRadius: 15,
    backgroundColor: "#F8F8FF",
    borderColor: "#ccc",
  },
  eyeIcon: {
    marginRight: 10,
  },
  btnlogin: {
    marginTop: 35,
    width: "100%",
    height: 40,
    backgroundColor: "#009688",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  logintext: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  ortext: {
    textAlign: "center",
    marginTop: 20,
    fontWeight: "600",
    color: "grey",
  },
  btngooglelogin: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: 24,
    borderWidth: 1,
    borderRadius: 15,
    height: 40,
    borderColor: "#ccc",
  },
  googleIcon: {
    marginRight: 10,
  },
  googlelogintext: {
    fontSize: 16,
    fontWeight: "600",
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 28,
  },
  already: {
    fontSize: 16,
  },
  signuptxt: {
    color: "#009688",
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
  },
};

export default Login;
