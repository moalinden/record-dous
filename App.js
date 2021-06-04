import * as React from 'react';
import { View, ScrollView, Button, Text } from 'react-native';
import { Audio } from 'expo-av';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();

const recordings = []

export default function App() {
    const [recording, setRecording] = React.useState();
    const [sound, setSound] = React.useState();
    const [source, setSource] = React.useState('');

    function HomeScreen() {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Button title="Play Sound" onPress={playSound} />
        </View>
      );
    }

    function SettingsScreen() {
      console.log(recordings)
      return (
        <ScrollView>
          <Text></Text>
          <Text></Text>
          <Text></Text>
          <Text></Text>
           <Button
            title={recording ? 'Stop Recording' : 'Start Recording'}
            onPress={recording ? stopRecording : startRecording}
          />
           {recordings.length > 0 ? recordings.map((sourceString, index) => { 
             return (
              <Text key={index}>{sourceString.source}</Text>
             )
            }) : null}
        </ScrollView>
      );
    }
  
    async function playSound() {
      console.log('Loading Sound');
      const { sound } = await Audio.Sound.createAsync(
         require('./assets/avicci-wakemeup.mp3')
      );
      setSound(sound);
  
      console.log('Playing Sound');
      await sound.playAsync(); }
  
    React.useEffect(() => {
      return sound
        ? () => {
            console.log('Unloading Sound');
            sound.unloadAsync(); }
        : undefined;
    }, [sound]);

    async function startRecording() {
      try {
        console.log('Requesting permissions..');
        await Audio.requestPermissionsAsync();
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        }); 
        console.log('Starting recording..');
        const recording = new Audio.Recording();
        await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
        await recording.startAsync(); 
        setRecording(recording);
        console.log('Recording started');
      } catch (err) {
        console.error('Failed to start recording', err);
      }
    }

    async function stopRecording() {
      console.log('Stopping recording..');
      setRecording(undefined);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI(); 
      try {
        if (source.source) {
          recordings.push(source);
        }
      } catch {
        // do nothing
      }
      setSource({source: uri})
      console.log('Recording stopped and stored at', uri);
    }

  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}