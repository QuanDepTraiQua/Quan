    import { View, Text, Alert } from "react-native";
    import { TextInput, Button } from "react-native-paper";
    import { useState, useContext } from "react";
    import MyStyles from "../../styles/MyStyles";
    import Apis, { endpoints, authApis, CLIENT_ID, CLIENT_SECRET } from "../../utils/Apis";
    import { MyUserContext } from "../../utils/MyContext";
    import AsyncStorage from "@react-native-async-storage/async-storage";
    import { useNavigation } from "@react-navigation/native";

    const Login = () => {
        const [username, setUsername] = useState('');
        const [password, setPassword] = useState('');
        const [loading, setLoading] = useState(false);
        const [user, dispatch] = useContext(MyUserContext);
        const nav = useNavigation();

        const login = async () => {
            setLoading(true);
            try {
                console.log("Dang dang nhap...");
                // 1. Lấy Token
                let res = await Apis.post(endpoints['login'], {
                    "client_id": CLIENT_ID,
                    "client_secret": CLIENT_SECRET,
                    "username": username,
                    "password": password,
                    "grant_type": "password"
                });

                // 2. Lưu token vào máy
                await AsyncStorage.setItem("token", res.data.access_token);

                // 3. Lấy thông tin User
                let userRes = await authApis(res.data.access_token).get(endpoints['current_user']);
                
                // 4. Cập nhật Context toàn cục
                dispatch({
                    "type": "login",
                    "payload": userRes.data
                });

                // 5. Chuyển về trang chủ
                nav.navigate("Home");

            } catch (ex) {
                console.error(ex);
                Alert.alert("Lỗi", "Tên đăng nhập hoặc mật khẩu không đúng!");
            } finally {
                setLoading(false);
            }
        }

        return (
            <View style={MyStyles.padding}>
                <Text style={MyStyles.title}>ĐĂNG NHẬP</Text>
                <TextInput value={username} onChangeText={setUsername} label="Tên đăng nhập" style={MyStyles.margin} />
                <TextInput value={password} onChangeText={setPassword} label="Mật khẩu" secureTextEntry={true} style={MyStyles.margin} />
                <Button loading={loading} mode="contained" onPress={login} style={MyStyles.margin}>Đăng nhập</Button>
            </View>
        );
    }

    export default Login;