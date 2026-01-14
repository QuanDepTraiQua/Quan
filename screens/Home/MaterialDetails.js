import { useEffect, useState, useContext } from "react";
import { ScrollView, View, Image, Text, Alert, Linking, useWindowDimensions, TouchableOpacity, ActivityIndicator } from "react-native";
import { Button, Card, Chip, Divider, TextInput, List, Avatar } from "react-native-paper";
import RenderHTML from "react-native-render-html";
import Apis, { authApis, endpoints } from "../../utils/Apis";
import MyStyles from "../../styles/MyStyles";
import { MyUserContext } from "../../utils/MyContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";
import 'moment/locale/vi'; // Format ngày tháng tiếng Việt

const MaterialDetails = ({ route, navigation }) => {
    const [material, setMaterial] = useState(null);
    const [comments, setComments] = useState([]);
    const [content, setContent] = useState(""); // Nội dung bình luận mới
    const [loading, setLoading] = useState(false);
    const { width } = useWindowDimensions();
    const { materialId } = route.params;
    const [user] = useContext(MyUserContext);

    // 1. Load thông tin chi tiết tài liệu
    useEffect(() => {
        const loadMaterial = async () => {
            try {
                let res = await Apis.get(endpoints['material-details'](materialId));
                setMaterial(res.data);
            } catch (ex) {
                console.error(ex);
            }
        }
        loadMaterial();
    }, [materialId]);

    // 2. Load danh sách bình luận (reviews)
    useEffect(() => {
        const loadComments = async () => {
            try {
                let res = await Apis.get(endpoints['material-comments'](materialId));
                setComments(res.data);
            } catch (ex) {
                console.error(ex);
            }
        }
        loadComments();
    }, [materialId]);

    // 3. Xử lý Mua tài liệu
    const handleBuy = async () => {
        if (!user) {
            Alert.alert("Thông báo", "Vui lòng đăng nhập để mua tài liệu!", [
                { text: "Đăng nhập ngay", onPress: () => navigation.navigate("Login") },
                { text: "Hủy", style: "cancel" }
            ]);
            return;
        }
        
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("token");
            // Gọi API mua (tạm thời mặc định thanh toán tiền mặt)
            await authApis(token).post(endpoints['material-buy'](materialId), {
                "payment_method": "CASH"
            });
            Alert.alert("Thành công", "Đã tạo yêu cầu mua! Vui lòng thanh toán tại quầy thư viện.");
        } catch (ex) {
            console.error(ex);
            Alert.alert("Lỗi", "Có lỗi xảy ra khi mua hoặc bạn đã mua rồi!");
        } finally {
            setLoading(false);
        }
    }

    // 4. Xử lý Thêm bình luận
    const addComment = async () => {
        if (!user) {
            Alert.alert("Lỗi", "Vui lòng đăng nhập để bình luận!");
            return;
        }
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("token");
            // Gửi comment lên server
            // Lưu ý: Backend phải có endpoint POST reviews tương ứng
            await authApis(token).post(endpoints['material-comments'](materialId), {
                "comment": content,
                "rating": 5 // Mặc định 5 sao, bạn có thể làm thêm UI chọn sao sau
            });
            
            setContent(""); // Xóa ô nhập
            
            // Reload lại comment
            let res = await Apis.get(endpoints['material-comments'](materialId));
            setComments(res.data);

        } catch (ex) {
            console.error(ex);
        } finally {
            setLoading(false);
        }
    }

    const openDocument = () => {
        if (material.file_url) {
            Linking.openURL(material.file_url);
        } else {
            Alert.alert("Thông báo", "Tài liệu này chưa có file đính kèm.");
        }
    }

    if (material === null) return <ActivityIndicator style={{marginTop: 50}} size="large" color="blue" />;

    return (
        <ScrollView style={{flex: 1, backgroundColor: '#fff'}}>
            {/* Ảnh bìa */}
            {material.cover_image && (
                <Image source={{ uri: material.cover_image }} style={{ width: "100%", height: 300, resizeMode: "contain", backgroundColor: "#f0f0f0" }} />
            )}
            
            <View style={{padding: 20}}>
                <Text style={{fontSize: 24, fontWeight: "bold", color: "#333", textAlign: 'center'}}>{material.title}</Text>
                
                <View style={{flexDirection: 'row', justifyContent: 'center', marginVertical: 10, flexWrap: 'wrap'}}>
                    <Chip icon="account" style={{margin: 4}}>{material.author}</Chip>
                    <Chip icon="calendar" style={{margin: 4}}>{material.published_year}</Chip>
                    <Chip icon="shape" style={{margin: 4}}>{material.category?.name}</Chip>
                </View>

                <Text style={{fontSize: 22, color: "#d32f2f", fontWeight: "bold", textAlign: 'center', marginVertical: 10}}>
                    {material.price > 0 ? `${material.price.toLocaleString()} VNĐ` : "Miễn phí"}
                </Text>

                {/* Nút hành động */}
                <View style={{marginTop: 10, marginBottom: 20}}>
                    {material.price === 0 ? (
                        <Button mode="contained" icon="book-open-variant" onPress={openDocument} style={{backgroundColor: "green"}}>
                            ĐỌC NGAY
                        </Button>
                    ) : (
                        <Button loading={loading} mode="contained" icon="cart" buttonColor="#d32f2f" onPress={handleBuy}>
                            MUA TÀI LIỆU
                        </Button>
                    )}
                </View>

                <Divider style={{marginVertical: 10}} />
                
                {/* Mô tả */}
                <Text style={{fontSize: 18, fontWeight: "bold", marginBottom: 5}}>Giới thiệu:</Text>
                <RenderHTML contentWidth={width} source={{ html: material.description }} />

                <Divider style={{marginVertical: 20}} />

                {/* Phần bình luận */}
                <Text style={{fontSize: 18, fontWeight: "bold", marginBottom: 10}}>Đánh giá & Bình luận:</Text>
                
                {user ? (
                    <View style={{marginBottom: 20}}>
                        <TextInput 
                            mode="outlined" 
                            label="Viết bình luận của bạn..." 
                            value={content} 
                            onChangeText={setContent}
                            multiline={true}
                            numberOfLines={3}
                        />
                        <Button mode="contained" onPress={addComment} style={{marginTop: 10}} disabled={!content}>Gửi</Button>
                    </View>
                ) : (
                    <Text style={{fontStyle: 'italic', color: 'gray', marginBottom: 10}}>Đăng nhập để bình luận</Text>
                )}

                {comments.map(c => (
                    <List.Item 
                        key={c.id}
                        title={c.user?.username || "Người dùng ẩn danh"}
                        description={`${c.comment}\n${moment(c.created_date).fromNow()}`}
                        descriptionNumberOfLines={5}
                        left={props => c.user?.avatar ? <Avatar.Image size={40} source={{uri: c.user.avatar}} /> : <Avatar.Icon size={40} icon="account" />}
                        style={{backgroundColor: '#f9f9f9', marginBottom: 5, borderRadius: 8}}
                    />
                ))}
            </View>
        </ScrollView>
    );
}

export default MaterialDetails;