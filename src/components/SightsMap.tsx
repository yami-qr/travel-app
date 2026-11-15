import { useEffect } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { attractionCategoryLabels, type Attraction } from "../services/api/wikipedia";
import { boundsFor, categoryColours } from "../utils/map";

interface SightsMapProps {
  centre: { latitude: number; longitude: number; name: string };
  /** The sights to pin, usually the ones that match the current filters. */
  sights: Attraction[];
}

/** Zooms the map to fit the centre and every sight, and again whenever the filters change. */
function FitToSights({ centre, sights }: SightsMapProps) {
  const map = useMap();

  useEffect(() => {
    const bounds = boundsFor([centre, ...sights]);
    if (bounds) map.fitBounds(bounds, { padding: [24, 24], maxZoom: 16 });
  }, [map, centre, sights]);

  return null;
}

/**
 * Map of the sights near a destination, on OpenStreetMap tiles. Every sight on
 * the map is also in the list below it, so the map adds a view, not information.
 */
export default function SightsMap({ centre, sights }: SightsMapProps) {
  return (
    <div className="sights-map" role="region" aria-label={`Map of sights near ${centre.name}`}>
      <MapContainer
        center={[centre.latitude, centre.longitude]}
        zoom={13}
        scrollWheelZoom={false}
        className="sights-map-canvas"
      >
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={19}
        />
        <FitToSights centre={centre} sights={sights} />

        <CircleMarker
          center={[centre.latitude, centre.longitude]}
          radius={9}
          pathOptions={{ color: "#fffdf7", weight: 3, fillColor: "#1d2433", fillOpacity: 1 }}
        >
          <Tooltip direction="top" offset={[0, -8]}>
            Centre of {centre.name}
          </Tooltip>
        </CircleMarker>

        {sights.map((sight) => (
          <CircleMarker
            key={sight.id}
            center={[sight.latitude, sight.longitude]}
            radius={7}
            pathOptions={{
              color: "#fffdf7",
              weight: 2,
              fillColor: categoryColours[sight.category],
              fillOpacity: 0.95,
            }}
          >
            <Tooltip direction="top" offset={[0, -6]}>
              {sight.title}
            </Tooltip>
            <Popup>
              <strong className="map-popup-title">{sight.title}</strong>
              <span className="map-popup-meta">{attractionCategoryLabels[sight.category]}</span>
              <a href={sight.pageUrl} target="_blank" rel="noreferrer">
                Read on Wikipedia
              </a>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      <ul className="map-legend" aria-label="Map key">
        {(Object.keys(categoryColours) as Attraction["category"][])
          .filter((category) => sights.some((s) => s.category === category))
          .map((category) => (
            <li key={category}>
              <span className="map-dot" style={{ background: categoryColours[category] }} aria-hidden="true" />
              {attractionCategoryLabels[category]}
            </li>
          ))}
      </ul>
    </div>
  );
}
