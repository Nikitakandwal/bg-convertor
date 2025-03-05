import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  PanResponder,
  Dimensions,
  TouchableOpacity, 
} from "react-native";
import Slider from '@react-native-community/slider';
import { Video } from "expo-av";
import * as FileSystem from "expo-file-system";
import MediaPicker from "../components/MediaPicker";

const SCREEN_WIDTH = Dimensions.get("window").width;
const IMAGE_WIDTH = SCREEN_WIDTH * 0.9;

const CLOUDINARY_CLOUD_NAME = "dx1frlvl6";
const CLOUDINARY_API_KEY = "878753439394597";
const CLOUDINARY_API_SECRET = "FcSZq75MeX8cnW42Ljzs_STAk1U";
const CLOUDINARY_UPLOAD_PRESET = "blackandwhite";

export default function HomeScreen() {
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(IMAGE_WIDTH / 2);
  const [brightness, setBrightness] = useState(0); // Range: -100 to 100
  const [saturation, setSaturation] = useState(0);  
  const [contrast, setContrast] = useState(0);     

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gestureState) => {
        let newX = Math.max(0, Math.min(IMAGE_WIDTH, gestureState.moveX));
        setSliderPosition(newX);
      },
    })
  ).current;

  const getTransformedUrl = (baseUrl) => {
    if (!baseUrl) return baseUrl;
    const transformations = [
      "e_grayscale",
      `e_brightness:${brightness}`,
      `e_saturation:${saturation}`,
      `e_contrast:${contrast}`
    ].join(",");
    return baseUrl.replace("/upload/", `/upload/${transformations}/`);
  };

  const uploadToCloudinary = async (uri, type) => {
    console.log("Uploading to Cloudinary:", { uri, type });
    const formData = new FormData();
    formData.append("file", {
      uri,
      type: type === "video" ? "video/mp4" : "image/jpeg",
      name: `media.${type === "video" ? "mp4" : "jpg"}`,
    });
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${type}/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      console.log("Cloudinary response:", data);
      if (!data.secure_url) {
        throw new Error(`Upload failed: ${JSON.stringify(data)}`);
      }
      return data.secure_url;
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      throw error;
    }
  };

  const handleMediaSelect = async (asset) => {
    console.log("Selected asset:", asset);
    if (!asset?.uri) {
      alert("No valid media selected");
      return;
    }

    setLoading(true);
    try {
      const type = asset.type || (asset.uri.includes(".mp4") ? "video" : "image");
      const baseUrl = await uploadToCloudinary(asset.uri, type);
      const bwUri = getTransformedUrl(baseUrl);
      const newMedia = {
        uri: asset.uri,
        type,
        bwUri,
        baseUrl,
      };
      console.log("Setting media state:", newMedia);
      setMedia(newMedia);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to process media");
    }
    setLoading(false);
  };

  const handleAdjustmentChange = () => {
    if (media?.baseUrl) {
      const updatedBwUri = getTransformedUrl(media.baseUrl);
      setMedia(prev => ({ ...prev, bwUri: updatedBwUri }));
    }
  };

  const saveBlackWhiteMedia = async () => {
    if (!media?.bwUri) return;

    setLoading(true);
    try {
      const newUri = `${FileSystem.documentDirectory}bw_${Date.now()}.${
        media.type === "video" ? "mp4" : "jpg"
      }`;
      await FileSystem.downloadAsync(media.bwUri, newUri);
      alert(`Saved to: ${newUri}`);
    } catch (error) {
      console.error("Error saving:", error);
      alert("Failed to save media");
    }
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.title}>Black & White Converter</Text>
      <MediaPicker onMediaSelect={handleMediaSelect} />

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
      ) : (
        media && (
          <View style={styles.imageContainer}>
            <Text style={styles.subtitle}>Slide to Compare</Text>

            <View style={styles.sliderWrapper}>
              {media.type === "video" ? (
                <Video
                  source={{ uri: media.uri }}
                  style={styles.media}
                  shouldPlay
                  isLooping
                  resizeMode="cover"
                />
              ) : (
                <Image
                  source={{ uri: media.uri }}
                  style={styles.media}
                  resizeMode="cover"
                />
              )}

              <View
                style={[
                  styles.bwContainer,
                  { width: sliderPosition },
                ]}
              >
                {media.type === "video" ? (
                  <Video
                    source={{ uri: media.bwUri }}
                    style={styles.media}
                    shouldPlay
                    isLooping
                    resizeMode="cover"
                  />
                ) : (
                  <Image
                    source={{ uri: media.bwUri }}
                    style={styles.media}
                    resizeMode="cover"
                  />
                )}
              </View>

              <View
                style={[styles.slider, { left: sliderPosition - 2 }]}
                {...panResponder.panHandlers}
              />
            </View>

            {/* Adjustment Sliders - Only show for images */}
            {media.type === "image" && (
              <View style={styles.adjustmentContainer}>
                <Text style={styles.adjustmentLabel}>Brightness: {brightness}</Text>
                <Slider
                  style={styles.sliderControl}
                  minimumValue={-100}
                  maximumValue={100}
                  value={brightness}
                  onValueChange={(value) => {
                    setBrightness(Math.round(value));
                    handleAdjustmentChange();
                  }}
                />

                <Text style={styles.adjustmentLabel}>Saturation: {saturation}</Text>
                <Slider
                  style={styles.sliderControl}
                  minimumValue={-100}
                  maximumValue={100}
                  value={saturation}
                  onValueChange={(value) => {
                    setSaturation(Math.round(value));
                    handleAdjustmentChange();
                  }}
                />

                <Text style={styles.adjustmentLabel}>Contrast: {contrast}</Text>
                <Slider
                  style={styles.sliderControl}
                  minimumValue={-100}
                  maximumValue={100}
                  value={contrast}
                  onValueChange={(value) => {
                    setContrast(Math.round(value));
                    handleAdjustmentChange();
                  }}
                />
              </View>
            )}

            <TouchableOpacity style={styles.saveButton} onPress={saveBlackWhiteMedia}>
              <Text style={styles.saveButtonText}>Save Black & White</Text>
            </TouchableOpacity>
          </View>
        )
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    marginVertical: 10,
    textAlign: "center",
  },
  imageContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  sliderWrapper: {
    position: "relative",
    width: IMAGE_WIDTH,
    height: 300,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#000",
    overflow: "hidden",
  },
  media: {
    width: IMAGE_WIDTH,
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
  },
  bwContainer: {
    position: "absolute",
    height: "100%",
    top: 0,
    left: 0,
    overflow: "hidden",
  },
  slider: {
    position: "absolute",
    width: 4,
    height: "100%",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#000",
    top: 0,
  },
  loader: {
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  adjustmentContainer: {
    width: IMAGE_WIDTH,
    marginTop: 20,
  },
  adjustmentLabel: {
    fontSize: 16,
    marginTop: 10,
    marginBottom: 5,
  },
  sliderControl: {
    width: "100%",
    height: 40,
  },
});