import React, { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainScreen from "./src/screens/MainScreen";
import AddTransactionScreen from "./src/screens/AddTransactionScreen";
import EditTransactionScreen from "./src/screens/EditTransactionScreen";
import TrashScreen from "./src/screens/TrashScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import StatisticsScreen from "./src/screens/StatisticsScreen";
import { RootStackParamList } from "./src/types/Navigation";
import { initDatabase } from "./src/services/database";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  useEffect(() => {
    // Initialize database when app starts
    initDatabase().catch((error) => {
      console.error("Failed to initialize database:", error);
    });
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Main" component={MainScreen} />
          <Stack.Screen
            name="AddTransaction"
            component={AddTransactionScreen}
          />
          <Stack.Screen
            name="EditTransaction"
            component={EditTransactionScreen}
          />
          <Stack.Screen name="Trash" component={TrashScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Statistics" component={StatisticsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
