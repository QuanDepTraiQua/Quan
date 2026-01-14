import { StyleSheet } from "react-native";

export default StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 40,
        backgroundColor: '#f5f5f5'
    },
    row: {
        flexDirection: "row",
        flexWrap: "wrap"
    },
    margin: {
        margin: 5
    }, 
    padding: {
        padding: 20
    }, 
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40
    }, 
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#d32f2f", // Màu đỏ đặc trưng
        alignSelf: "center",
        marginBottom: 20
    },
    subject: {
        fontSize: 16,
        fontWeight: "bold",
        color: "blue"
    }
});