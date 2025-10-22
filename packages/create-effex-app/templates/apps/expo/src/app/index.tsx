import { Stack } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  return (
    <SafeAreaView className="bg-background">
      <Stack.Screen options={{ title: "Home Page" }} />
      <View className="bg-background h-full w-full p-4">
        <Text className="text-foreground pb-2 text-center text-5xl font-bold">
          Create <Text className="text-primary">Effex</Text> App
        </Text>

        <View className="py-4">
          <Text className="text-foreground text-center text-lg">
            Welcome to your Expo app with NativeWind v5!
          </Text>
        </View>

        <View className="bg-card rounded-lg p-4">
          <Text className="text-card-foreground text-xl font-semibold">
            Getting Started
          </Text>
          <Text className="text-muted-foreground mt-2">
            Edit apps/expo/src/app/index.tsx to get started.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

