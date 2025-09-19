"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// fix default marker icon
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});
L.Marker.prototype.options.icon = DefaultIcon;

function LocationSelector({ onSelect }: { onSelect: (pos: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      onSelect([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

interface MapModalProps {
  onConfirm: (lat: number, lng: number) => void;
  showModalMap: boolean;
  setShowModalMap: (showModalMap: boolean) => void;
}

export default function MapModal({ onConfirm, showModalMap, setShowModalMap }: MapModalProps) {

  const [position, setPosition] = useState<[number, number] | null>(null);

  // หา location ตอนเปิด modal
  useEffect(() => {
    if (showModalMap && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
        (err) => alert("ບໍ່ສາມາດເຂົ້າເຖິງຕຳແໜ່ງປັດຈຸບັນໄດ້: " + err.message),
        { enableHighAccuracy: true }
      );
    }
  }, [showModalMap]);

  return (
    <div>
      {showModalMap && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-[90%] max-w-2xl p-4 rounded shadow-lg relative">
            <button
              className="absolute top-2 right-2 text-black font-bold text-xl"
              onClick={() => setShowModalMap(false)}
            >
              ✖
            </button>

            <h2 className="mb-2 font-bold text-lg">ເລືອກຕຳແໜ່ງ 📍</h2>

            {position ? (
              <MapContainer
                center={position}
                zoom={20}
                style={{ height: "400px", width: "100%" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='© <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                />

                <LocationSelector onSelect={(pos) => setPosition(pos)} />

                <Marker
                  position={position}
                  draggable
                  eventHandlers={{
                    dragend: (e) =>
                      setPosition([e.target.getLatLng().lat, e.target.getLatLng().lng]),
                  }}
                >
                  <Popup>ຢູ່ທີ່ນີ່ 📍</Popup>
                </Marker>
              </MapContainer>
            ) : (
              <p>ກຳລັງຫາຕຳແໜ່ງປັດຈຸບັນ...</p>
            )}

            {position && (
              <div className="mt-2 flex justify-between items-center">
                <p>
                  Latitude: {position[0].toFixed(6)}, Longitude: {position[1].toFixed(6)}
                </p>
                <button
                  className="px-4 py-2 bg-green-500 text-white rounded"
                  onClick={() => {
                    onConfirm(position[0], position[1]);
                    setShowModalMap(false);
                  }}
                >
                  ຢືນຢັນ
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
