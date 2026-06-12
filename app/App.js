import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import ConnectScreen from './src/screens/ConnectScreen';
import ChatScreen from './src/screens/ChatScreen';
import FileBrowserScreen from './src/screens/FileBrowserScreen';
import BrowserScreen from './src/screens/BrowserScreen';
import DiscoveryScreen from './src/screens/DiscoveryScreen';
import VaultScreen from './src/screens/VaultScreen';
import QRScannerScreen from './src/screens/QRScannerScreen';
import SessionDrawer from './src/components/SessionDrawer';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

function ChatDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <SessionDrawer {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: '#000',
          width: 280,
        },
      }}
    >
      <Drawer.Screen name="ChatContent" component={ChatScreen} />
    </Drawer.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Connect"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Connect" component={ConnectScreen} />
        <Stack.Screen name="Chat" component={ChatDrawer} />
        <Stack.Screen name="FileBrowser" component={FileBrowserScreen} />
        <Stack.Screen name="Browser" component={BrowserScreen} />
        <Stack.Screen name="Discovery" component={DiscoveryScreen} />
        <Stack.Screen name="Vault" component={VaultScreen} />
        <Stack.Screen name="QRScanner" component={QRScannerScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
