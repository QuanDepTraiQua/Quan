import React, { useReducer, useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Icon, MD3LightTheme, Provider as PaperProvider } from "react-native-paper";

// --- IMPORT SCREENS (Đường dẫn chính xác theo cấu trúc của bạn) ---
import Home from "./screens/Home/Home";
import MaterialDetails from "./screens/Home/MaterialDetails";
import Login from "./screens/User/Login";
import Register from "./screens/User/Register";
import User from "./screens/User/User";

// --- IMPORT UTILS ---
import { MyUserContext } from "./utils/MyContext";
import MyUserReducer from "./utils/MyUserReducer";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Stack cho Tab Home
const HomeStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeScreen" component={Home} options={{ title: "Thư viện" }} />
      <Stack.Screen name="MaterialDetails" component={MaterialDetails} options={{ headerShown: true, title: "Chi tiết tài liệu" }} />
    </Stack.Navigator>
  );
};

// Stack cho Tab User
const UserStackNavigator = () => {
    const [user] = useContext(MyUserContext);

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {user === null ? (
                <>
                    <Stack.Screen name="Login" component={Login} options={{ title: "Đăng nhập" }}/>
                    <Stack.Screen name="Register" component={Register} options={{ title: "Đăng ký" }}/>
                </>
            ) : (
                <Stack.Screen name="Profile" component={User} options={{ title: "Hồ sơ" }}/>
            )}
        </Stack.Navigator>
    );
}

const App = () => {
  const [user, dispatch] = useReducer(MyUserReducer, null);

  return (
    <PaperProvider theme={MD3LightTheme}>
        <MyUserContext.Provider value={[user, dispatch]}>
            <NavigationContainer>
                <Tab.Navigator screenOptions={({ route }) => ({
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => {
                        let iconName;
                        if (route.name === "HomeTab") iconName = "book-open-variant";
                        else if (route.name === "UserTab") iconName = "account";
                        return <Icon source={iconName} size={size} color={color} />;
                    },
                    tabBarActiveTintColor: "#d32f2f",
                    tabBarInactiveTintColor: "gray",
                })}>
                    
                    <Tab.Screen name="HomeTab" component={HomeStack} options={{ title: "Thư Viện" }} />
                    <Tab.Screen name="UserTab" component={UserStackNavigator} options={{ title: "Cá Nhân" }} />
                    
                </Tab.Navigator>
            </NavigationContainer>
        </MyUserContext.Provider>
    </PaperProvider>
  );
};

export default App;