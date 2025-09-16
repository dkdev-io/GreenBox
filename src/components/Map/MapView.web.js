import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import L from 'leaflet';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Store markers globally to manage them
let markersMap = new Map();

export default function MapView({ style, children, initialRegion, ...props }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize the map
    const map = L.map(mapRef.current).setView(
      [initialRegion?.latitude || 32.7767, initialRegion?.longitude || -96.7970],
      13
    );

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map center when initialRegion changes
  useEffect(() => {
    if (mapInstanceRef.current && initialRegion) {
      mapInstanceRef.current.setView([initialRegion.latitude, initialRegion.longitude], 13);
    }
  }, [initialRegion]);

  // Handle markers
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersMap.forEach(marker => {
      mapInstanceRef.current.removeLayer(marker);
    });
    markersMap.clear();

    // Add new markers
    React.Children.forEach(children, (child) => {
      if (child && child.props && child.props.coordinate) {
        const { coordinate, title, description, pinColor, key } = child.props;

        // Create custom icon based on pinColor
        const iconColor = pinColor === 'blue' ? '#007AFF' : '#FF3B30';
        const customIcon = L.divIcon({
          html: `<div style="
            background-color: ${iconColor};
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          "></div>`,
          className: 'custom-marker',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        const marker = L.marker([coordinate.latitude, coordinate.longitude], {
          icon: customIcon
        }).addTo(mapInstanceRef.current);

        if (title) {
          marker.bindPopup(`<b>${title}</b>${description ? `<br/>${description}` : ''}`);
        }

        markersMap.set(key || `${coordinate.latitude}-${coordinate.longitude}`, marker);
      }
    });
  }, [children]);

  return (
    <View style={[styles.container, style]}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </View>
  );
}

export function Marker({ coordinate, title, description, pinColor, ...props }) {
  // This component doesn't render anything itself - it's used by the parent MapView
  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f8f0',
  },
});