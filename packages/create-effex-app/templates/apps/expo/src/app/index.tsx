import { Stack } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  return (
    <SafeAreaView className="bg-background">
      <Stack.Screen options={{ title: "Home Page" }} />
      <View className="h-full w-full bg-background p-4">
        <Text className="pb-2 text-center font-bold text-5xl text-foreground">
          Create <Text className="text-primary">Effex</Text> App
        </Text>

        <View className="py-4">
          <Text className="text-center text-foreground text-lg">
            Welcome to your Expo app with NativeWind v5!
          </Text>
        </View>

        <View className="rounded-lg bg-card p-4">
          <Text className="font-semibold text-card-foreground text-xl">
            Getting Started
          </Text>
          <Text className="mt-2 text-muted-foreground">
            Edit apps/expo/src/app/index.tsx to get started.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
