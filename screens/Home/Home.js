import { useState } from "react";
import { View } from "react-native";
import MyStyles from "../../styles/MyStyles";
import Categories from "../../components/Categories";
// Lưu ý: Kiểm tra kỹ tên file của bạn trong thư mục components là Material.js hay Materials.js
import Materials from "../../components/Material"; 

const Home = ({  }) => {
    const [cate, setCate] = useState(null);

    return (
        <View style={[MyStyles.container, { padding: 10 }]}>
            {/* Component Danh mục */}
            <Categories setCate={setCate} />
            
            {/* Component Danh sách Tài liệu */}
            <Materials cate={cate} />
        </View>
    );
}

export default Home;