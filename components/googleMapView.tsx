import { View } from "react-native";
import React, { useState, useEffect } from "react";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { styles } from "@/styles/home.styles";

export default function GoogleMapView() {
  const fallbackRegion = {
    latitude: 15.599,
    longitude: 121.0384,
    latitudeDelta: 0.011,
    longitudeDelta: 0.011,
  };

  const [mapRegion, setMapRegion] = useState(fallbackRegion);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.log("Permission denied, using fallback location");
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        setMapRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.011,
          longitudeDelta: 0.011,
        });
      } catch (error) {
        console.log("Failed to get location, using fallback", error);
      }
    })();
  }, []);

  return (
    <View>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        showsUserLocation={true}
        region={mapRegion}
      />
    </View>
  );
}
