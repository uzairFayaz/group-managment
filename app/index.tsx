import { Button } from "@react-navigation/elements";
import { useRouter } from "expo-router";
import { View } from "react-native";

export default function Index() {
  const router = useRouter();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
    <Button onPress={()=>{
      router.navigate('/login')
    }}>Login</Button>
    <Button onPress={()=>{
      router.navigate('/register')
    }}>Register</Button>
    </View>
  );
}
