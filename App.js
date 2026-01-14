import React, { useReducer, useEffect, useContext, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Icon, PaperProvider, ActivityIndicator } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View } from "react-native";

// --- 1. IMPORT CÁC MÀN HÌNH (Sửa đường dẫn cho đúng với thư mục của bạn) ---
// Giả sử bạn để các file này trong thư mục 'components' hoặc 'screens'
import Home from "./screens/Home/Home"; 
import MaterialDetails from "./screens/Home/MaterialDetails";
import Login from "./screens/User/Login";
import Register from "./screens/User/Register";
import User from "./screens/User/Users"; 

// --- 2. IMPORT UTILS ---
import { MyUserContext } from "./utils/MyContext";
import MyUserReducer from "./utils/MyUserReducer";
import { authApis, endpoints } from "./utils/Apis";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- 3. STACK NAVIGATOR (Cho các màn hình con) ---
const StackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={Home} options={{ title: "Thư viện" }} />
      <Stack.Screen name="MaterialDetails" component={MaterialDetails} options={{ title: "Chi tiết tài liệu", headerShown: true }} />
    </Stack.Navigator>
  );
}

// --- 4. TAB NAVIGATOR (Menu chính) ---
const TabNavigator = () => {
  const [user] = useContext(MyUserContext);

  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: "blue" }}>
      <Tab.Screen 
        name="HomeTab" 
        component={StackNavigator} 
        options={{ 
            title: "Trang chủ", 
            tabBarIcon: ({ color, size }) => <Icon source="home" color={color} size={size} /> 
        }} 
      />
      
      {/* Logic hiển thị Tab dựa trên trạng thái đăng nhập */}
      {user === null ? (
        <>
            <Tab.Screen 
                name="Login" 
                component={Login} 
                options={{ 
                    title: "Đăng nhập", 
                    tabBarIcon: ({ color, size }) => <Icon source="login" color={color} size={size} /> 
                }} 
            />
            <Tab.Screen 
                name="Register" 
                component={Register} 
                options={{ 
                    title: "Đăng ký", 
                    tabBarIcon: ({ color, size }) => <Icon source="account-plus" color={color} size={size} /> 
                }} 
            />
        </>
      ) : (
        <>
            <Tab.Screen 
                name="Profile" 
                component={User} 
                options={{ 
                    title: user.username || "Cá nhân", 
                    tabBarIcon: ({ color, size }) => <Icon source="account" color={color} size={size} /> 
                }} 
            />
        </>
      )}
    </Tab.Navigator>
  );
}

// --- 5. COMPONENT GỐC (APP) ---
const App = () => {
  // Quản lý state User toàn cục
  const [user, dispatch] = useReducer(MyUserReducer, null);
  const [isReady, setIsReady] = useState(false); // Trạng thái chờ load user xong mới hiện App

  // Logic: Load user từ AsyncStorage khi mở App (Thay thế cho loadIsAuthenticated)
  useEffect(() => {
    const checkSession = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            if (token) {
                console.log("Tìm thấy token, đang lấy thông tin user...");
                // Gọi API lấy thông tin user từ token lưu trong máy
                let res = await authApis(token).get(endpoints['current_user']);
                
                // Nếu thành công, lưu vào Context
                dispatch({
                    "type": "login",
                    "payload": res.data
                });
                console.log("Đăng nhập tự động thành công!");
            } else {
                console.log("Không tìm thấy token.");
            }
        } catch (err) {
            console.error("Lỗi khôi phục phiên đăng nhập:", err);
            // Nếu lỗi (token hết hạn...), xóa token đi
            await AsyncStorage.removeItem("token");
        } finally {
            setIsReady(true); // Đã kiểm tra xong, cho phép hiển thị App
        }
    }
    
    checkSession();
  }, []);

  // Màn hình chờ (Splash Screen giả) khi đang kiểm tra đăng nhập
  if (!isReady) {
      return (
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <ActivityIndicator size="large" color="blue" />
          </View>
      );
  }

  return (
    // Bọc PaperProvider để sửa lỗi java.lang.String cannot be cast to java.lang.Boolean
    <PaperProvider>
        <MyUserContext.Provider value={[user, dispatch]}>
            <NavigationContainer>
                <TabNavigator />
            </NavigationContainer>
        </MyUserContext.Provider>
    </PaperProvider>
  );
}

export default App;