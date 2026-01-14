import { View, Text, Image } from "react-native";
import { Button } from "react-native-paper";
import { useContext } from "react";
import { MyUserContext } from "../../utils/MyContext";
import MyStyles from "../../styles/MyStyles";
import AsyncStorage from "@react-native-async-storage/async-storage";

const User = () => {
    const [user, dispatch] = useContext(MyUserContext);

    const logout = async () => {
        await AsyncStorage.removeItem("token");
        dispatch({ "type": "logout" });
    }

    return (
        <View style={[MyStyles.container, {alignItems: "center", padding: 20}]}>
            <Text style={MyStyles.title}>Xin chào, {user?.username}!</Text>
            
            {user?.avatar && <Image source={{ uri: user.avatar }} style={MyStyles.avatar} />}
            
            <Text style={{margin: 10, fontSize: 18}}>Vai trò: {user?.role}</Text>
            
            <Button mode="contained" buttonColor="red" onPress={logout}>Đăng xuất</Button>
        </View>
    );
}

export default User;