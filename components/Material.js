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

                
                if (page === 1)
                    setMaterials(res.data.results);
                else
                    setMaterials(current => [...current, ...res.data.results]);

                if (!res.data.next) setPage(0); 

            } catch (ex) {
                console.error(ex);
            } finally {
                setLoading(false);
            }
        }
    };

    
    useEffect(() => {
        
        setMaterials([]); 
        setPage(1);       
        
       
        
    }, [cate, q]);

    
    useEffect(() => {
        loadMaterials();
    }, [page, cate, q]); 
   

    const loadMore = () => {
        
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
                  
                    setPage(1); 
                }}
                style={{ marginBottom: 10, backgroundColor: "#fff" }}
            />
            
            <FlatList 
                data={materials}
                keyExtractor={item => item.id.toString()}
                
               
                onEndReached={loadMore}        
                onEndReachedThreshold={0.5}    
               
                ListFooterComponent={loading && page > 1 ? <ActivityIndicator size="small" color="blue" /> : null}
                
                
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