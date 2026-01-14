import { View, Text, ScrollView, Image, TouchableOpacity, Alert } from "react-native";
import { TextInput, Button } from "react-native-paper";
import { useState } from "react";
import * as ImagePicker from 'expo-image-picker';
import MyStyles from "../../styles/MyStyles"; // Sửa thành ../../
import Apis, { endpoints } from "../../utils/Apis"; // Sửa thành ../../
import { useNavigation } from "@react-navigation/native";

const Register = () => {
    const [user, setUser] = useState({});
    const [loading, setLoading] = useState(false);
    const nav = useNavigation();

    const fields = [
        { label: "Tên", name: "first_name", icon: "text" },
        { label: "Họ và tên lót", name: "last_name", icon: "text" },
        { label: "Tên đăng nhập", name: "username", icon: "account" },
        { label: "Mật khẩu", name: "password", icon: "eye", secure: true },
        { label: "Xác nhận mật khẩu", name: "confirm", icon: "eye", secure: true },
        { label: "Email", name: "email", icon: "email" }
    ];

    const updateState = (field, value) => {
        setUser(current => ({ ...current, [field]: value }));
    }

    const pickImage = async () => {
        let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert("Quyền truy cập", "Bạn cần cấp quyền truy cập thư viện ảnh!");
        } else {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!result.canceled) {
                updateState("avatar", result.assets[0]);
            }
        }
    }

    const register = async () => {
        if (user.password !== user.confirm) {
            Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp!");
            return;
        }

        setLoading(true);
        try {
            let form = new FormData();
            for (let key in user) {
                if (key === 'avatar') {
                    form.append(key, {
                        uri: user[key].uri,
                        name: user[key].fileName || "avatar.jpg",
                        type: user[key].mimeType || "image/jpeg"
                    });
                } else if (key !== 'confirm') {
                    form.append(key, user[key]);
                }
            }

            await Apis.post(endpoints['register'], form, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            Alert.alert("Thành công", "Đăng ký thành công! Vui lòng đăng nhập.");
            nav.navigate("Login");

        } catch (ex) {
            console.error(ex);
            Alert.alert("Lỗi", "Đã có lỗi xảy ra. Vui lòng thử lại!");
        } finally {
            setLoading(false);
        }
    }

    return (
        <ScrollView style={[MyStyles.container, { padding: 20 }]}>
            <Text style={MyStyles.title}>ĐĂNG KÝ</Text>

            {fields.map(f => (
                <TextInput 
                    key={f.name}
                    label={f.label} 
                    value={user[f.name]} 
                    onChangeText={t => updateState(f.name, t)}
                    style={MyStyles.margin}
                    secureTextEntry={!!f.secure}
                    right={<TextInput.Icon icon={f.icon} />}
                />
            ))}

            <TouchableOpacity onPress={pickImage} style={{ alignItems: "center", marginVertical: 10 }}>
                <Text style={{ color: "blue", marginBottom: 5 }}>Chọn ảnh đại diện</Text>
                {user.avatar ? (
                    <Image source={{ uri: user.avatar.uri }} style={MyStyles.avatar} />
                ) : (
                    <Image source={{ uri: "https://via.placeholder.com/100" }} style={[MyStyles.avatar, { opacity: 0.3 }]} />
                )}
            </TouchableOpacity>

            <Button mode="contained" loading={loading} onPress={register} style={MyStyles.margin}>
                Đăng ký
            </Button>
        </ScrollView>
    );
}

export default Register;