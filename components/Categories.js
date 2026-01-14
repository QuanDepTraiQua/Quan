import { useEffect, useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { Chip, Text } from "react-native-paper";
import Apis, { endpoints } from "../utils/Apis";

const Categories = ({ setCate }) => {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                let res = await Apis.get(endpoints['categories']);
                setCategories(res.data);
            } catch (ex) {
                console.error(ex);
            }
        }
        loadCategories();
    }, []);

    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}>
            <Text style={{ fontWeight: "bold", marginHorizontal: 10 }}>Danh mục:</Text>
            {}
            <ScrollView 
                horizontal={true} 
                showsHorizontalScrollIndicator={false}
            >
                <TouchableOpacity onPress={() => setCate(null)} style={{ marginRight: 5 }}>
                    <Chip icon="shape" mode="outlined">Tất cả</Chip>
                </TouchableOpacity>

                {categories.map(c => (
                    <TouchableOpacity key={c.id} onPress={() => setCate(c.id)} style={{ marginRight: 5 }}>
                        <Chip mode="flat">{c.name}</Chip>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

export default Categories;