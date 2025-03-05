// MediaPicker.js
import React from 'react';
import { View, Button, Alert, TextInput } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const MediaPicker = ({ onMediaSelect }) => {
  const [url, setUrl] = React.useState('');

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Please allow access to photos.');
      return false;
    }
    return true;
  };

  const pickMedia = async (type) => {
    if (!(await requestPermissions())) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: type === 'image' 
        ? ImagePicker.MediaTypeOptions.Images 
        : ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      onMediaSelect(result.assets[0]); // Pass the full asset object
    }
  };

  const captureMedia = async (type) => {
    const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraStatus.status !== 'granted') {
      Alert.alert('Permission Denied', 'Please allow camera access.');
      return;
    }

    const result = type === 'image'
      ? await ImagePicker.launchCameraAsync({ quality: 1 })
      : await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Videos });

    if (!result.canceled) {
      onMediaSelect(result.assets[0]);
    }
  };

  const handleUrlSubmit = () => {
    if (url) {
      onMediaSelect({ uri: url, type: url.includes('.mp4') ? 'video' : 'image' });
    }
  };

  return (
    <View style={{ gap: 10 }}>
      <TextInput
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
        placeholder="Paste YouTube URL or media URL"
        value={url}
        onChangeText={setUrl}
        onSubmitEditing={handleUrlSubmit}
      />
      <Button title="Pick an Image" onPress={() => pickMedia('image')} />
      <Button title="Pick a Video" onPress={() => pickMedia('video')} />
      <Button title="Capture Image" onPress={() => captureMedia('image')} />
      <Button title="Record Video" onPress={() => captureMedia('video')} />
    </View>
  );
};

export default MediaPicker;