import React, { useRef, useEffect } from 'react';
import { MapContainer, TileLayer, FeatureGroup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface HikeMapProps {
  hikeId: string;
  polyline?: [number, number][];
  editable?: boolean;
}

export default function HikeMap({ hikeId, polyline, editable = true }: HikeMapProps) {
  const mapRef = useRef<L.Map>(null);
  const featureGroupRef = useRef<L.FeatureGroup>(null);

  const defaultPolyline: [number, number][] = [
    [45.8326, 6.8652],
    [45.8335, 6.8671],
    [45.8350, 6.8690],
    [45.8365, 6.8705],
    [45.8380, 6.8720],
    [45.8395, 6.8735],
  ];

  useEffect(() => {
    if (!editable || !mapRef.current || !featureGroupRef.current) return;

    const map = mapRef.current;
    const featureGroup = featureGroupRef.current;

    const drawControl = new L.Control.Draw({
      edit: { featureGroup },
      draw: { polygon: false, rectangle: false, circle: false, marker: false, polyline: true },
    });

    map.addControl(drawControl);

    map.on(L.Draw.Event.CREATED, async (e: any) => {
      const layer = e.layer;
      featureGroup.addLayer(layer);
      const latlngs = layer.getLatLngs().map((p: L.LatLng) => [p.lat, p.lng]);
      await updateDoc(doc(db, 'hikes', hikeId), { polyline: latlngs });
    });

    map.on(L.Draw.Event.EDITED, async (e: any) => {
      const layers = e.layers;
      layers.eachLayer(async (layer: any) => {
        const latlngs = layer.getLatLngs().map((p: L.LatLng) => [p.lat, p.lng]);
        await updateDoc(doc(db, 'hikes', hikeId), { polyline: latlngs });
      });
    });
  }, [hikeId, editable]);

  const actualPolyline = polyline && polyline.length ? polyline : defaultPolyline;

  return (
    <MapContainer
      center={actualPolyline[0]}
      zoom={14}
      style={{ height: '400px', width: '100%' }}
      whenCreated={(map) => (mapRef.current = map)}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <FeatureGroup ref={featureGroupRef}>
        <Polyline positions={actualPolyline} pathOptions={{ color: 'blue' }} />
      </FeatureGroup>
    </MapContainer>
  );
}
