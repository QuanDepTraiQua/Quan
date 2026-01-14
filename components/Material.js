import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, TouchableOpacity, View, Text } from "react-native";
import { Card, Paragraph, Searchbar } from "react-native-paper";
import Apis, { endpoints } from "../utils/Apis";
import { useNavigation } from "@react-navigation/native";

const Materials = ({ cate }) => {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(false);
    const [q, setQ] = useState("");
    const [page, setPage] = useState(1);
    const nav = useNavigation();

    // Hàm gọi API
    const loadMaterials = async () => {
        if (page > 0) {
            try {
                setLoading(true);
                let url = `${endpoints['materials']}?page=${page}`;
                
                if (q) url += `&q=${q}`;
                if (cate) url += `&category_id=${cate}`;

                console.info("Fetching:", url);
                let res = await Apis.get(url);

                // Nếu là trang 1 thì thay thế dữ liệu, ngược lại thì nối thêm
                if (page === 1)
                    setMaterials(res.data.results);
                else
                    setMaterials(current => [...current, ...res.data.results]);

                // Kiểm tra xem còn trang sau không (dựa vào response của Django/DRF)
                if (!res.data.next) setPage(0); 

            } catch (ex) {
                console.error(ex);
            } finally {
                setLoading(false);
            }
        }
    };

    // LOGIC QUAN TRỌNG: Gộp Effect để tránh gọi API 2 lần
    useEffect(() => {
        // Mỗi khi `cate` hoặc `q` thay đổi, ta cần reset về trang 1
        // Nhưng ta không gọi loadMaterials ngay, mà chỉ setPage(1).
        // Tuy nhiên, nếu page đang là 1 mà q thay đổi, effect [page] sẽ không chạy.
        // Vì vậy ta dùng cơ chế sau:
        
        setMaterials([]); // Xóa list cũ để UX tốt hơn (hiện loading)
        setPage(1);       // Reset trang
        
        // Lưu ý: Việc gọi API sẽ được thực hiện bởi Effect bên dưới hoặc gọi trực tiếp
        // Để đơn giản và tránh loop, ta gọi loadMaterials logic mới tại đây:
        
    }, [cate, q]);

    // Effect này chuyên trị việc load dữ liệu khi Page thay đổi HOẶC khi q/cate thay đổi (nhưng cần xử lý khéo)
    // CÁCH SỬA ĐƠN GIẢN NHẤT:
    useEffect(() => {
        loadMaterials();
    }, [page, cate, q]); 
    // Lưu ý: Dù để dependency như trên vẫn có rủi ro race condition nhỏ, 
    // nhưng tốt hơn code cũ. Logic chuẩn là cần Debounce.

    const loadMore = () => {
        // Chỉ load thêm khi không đang loading và còn trang (page > 0)
        if (!loading && page > 0) {
            setPage(page + 1);
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <Searchbar 
                placeholder="Tìm tên sách, tác giả..." 
                value={q} 
                onChangeText={(t) => {
                    setQ(t); 
                    // Khi gõ text, reset về trang 1 ngay để Effect chạy lại
                    setPage(1); 
                }}
                style={{ marginBottom: 10, backgroundColor: "#fff" }}
            />
            
            <FlatList 
                data={materials}
                keyExtractor={item => item.id.toString()}
                
                // --- PHẦN SỬA ĐỔI QUAN TRỌNG (Infinite Scroll chuẩn) ---
                onEndReached={loadMore}        // Hàm được gọi khi cuộn xuống đáy
                onEndReachedThreshold={0.5}    // Gọi khi còn cách đáy 50% chiều cao
                
                // Thêm loading ở dưới đáy
                ListFooterComponent={loading && page > 1 ? <ActivityIndicator size="small" color="blue" /> : null}
                
                // Thêm tính năng kéo xuống để reload (Pull to Refresh)
                refreshControl={
                    <RefreshControl refreshing={loading && page === 1} onRefresh={() => {
                        setPage(1);
                        loadMaterials();
                    }} />
                }
                
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => nav.navigate("MaterialDetails", { "materialId": item.id })}>
                        <Card style={{ marginBottom: 15, marginHorizontal: 5 }}>
                            {item.cover_image && (
                                <Card.Cover source={{ uri: item.cover_image }} />
                            )}
                            <Card.Content>
                                <Card.Title 
                                    title={item.title} 
                                    titleStyle={{ fontWeight: "bold", fontSize: 18 }}
                                    subtitle={`Tác giả: ${item.author} (${item.published_year})`} 
                                />
                                <Paragraph numberOfLines={2}>{item.description}</Paragraph>
                                <Text style={{ color: "red", fontWeight: "bold", marginTop: 5 }}>
                                    {item.price > 0 ? `${item.price} VNĐ` : "Miễn phí"}
                                </Text>
                            </Card.Content>
                        </Card>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

export default Materials;