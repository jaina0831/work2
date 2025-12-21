import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useMemo, useState, useEffect } from "react";
import 'antd/dist/reset.css'; // Antd v5 樣式

// 自訂兩種 icon
const shelterIcon = new L.DivIcon({
  className: "bg-white/90 rounded-full border border-gray-300 shadow px-2 py-1",
  html: "🏠",
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -10],
});
const cafeIcon = new L.DivIcon({
  className: "bg-white/90 rounded-full border border-gray-300 shadow px-2 py-1",
  html: "☕️",
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -10],
});

// TODO: 換成你的真實座標
const PLACES = [
  { id: 1, type: "cafe", name: "浪浪別哭", lat: 25.0455961, lng: 121.524575, addr: "100台北市中正區林森北路9巷13號" },
  { id: 2, type: "shelter", name: "新北動物保護防疫所", lat: 25.012, lng: 121.462, addr: "新北市板橋區…" },
  { id: 3, type: "cafe", name: "転運棧-貓咪中途咖啡廳", lat: 25.053346, lng: 121.5138082, addr: "103台北市大同區天水路2-3號" },
  { id: 4, type: "cafe", name: "喵喵屋", lat: 25.0326745, lng: 121.538048, addr: "106台北市大安區建國南路二段19號1樓" },
  { id: 5, type: "cafe", name: "朵朵嚐嚐", lat: 25.0594268, lng: 121.5479963, addr: "106台北市松山區敦化北路 222 巷 17-2 號" },
  { id: 6, type: "cafe", name: "貓食光", lat: 25.0176399, lng: 121.531706, addr: "106台北市大安區羅斯福路三段 297-1 號 1 樓" },
  { id: 7, type: "cafe", name: "咪途之家", lat: 25.0068031, lng: 121.4728223, addr: "23546新北市中和區中山路三段 170 巷 5 號" },
  { id: 8, type: "cafe", name: "貓．領事館", lat: 25.046374, lng: 121.4524025, addr: "242新北市新莊區中港路 360 之 9 號" },
  { id: 9, type: "cafe", name: "O CAT CAFÈ", lat: 25.0579369, lng: 121.48837, addr: "241新北市三重區重新路四段29號1樓" },
  { id: 10, type: "shelter", name: "台北市動物之家", lat: 25.0604633, lng: 121.6030395, addr: "114台北市內湖區安美街191號" },
  { id: 11, type: "shelter", name: "巴克幫-浪犬之家", lat: 25.1135264, lng: 121.526214, addr: "111 台北市士林區中山北路六段405巷2號" },
  { id: 12, type: "shelter", name: "好好善待動物協會", lat: 25.0054224, lng: 121.5137743, addr: "234新北市永和區自由街55號9樓" },
  { id: 13, type: "cafe", name: "FUFUCatCafe", lat: 25.0447147, lng: 121.5072992, addr: "234新北市永和區自由街55號9樓" },
];

// --- 工具函式：計算距離 ---
function getDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1) return null;
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1); 
}

// ⭐ 3. 新增：MapResizer 組件 (解決您 ReferenceError 的主因)
// 當地圖寬度改變時，通知 Leaflet 重新校正中心點
function MapResizer({ isSidebarOpen }) {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 400); // 延遲時間需略大於 CSS 動畫時間
  }, [isSidebarOpen, map]);
  return null;
}

// ⭐ 4. 新增：MapController 組件
// 監聽 selectedPlace，當選中時讓地圖平滑移動中心點
function MapController({ selectedPlace }) {
  const map = useMap();
  useEffect(() => {
    if (selectedPlace) {
      map.panTo([selectedPlace.lat, selectedPlace.lng], { animate: true });
    }
  }, [selectedPlace, map]);
  return null;
}

// ⭐ 5. 新增：LocateButton 組件
function LocateButton({ onLocate }) {
  const map = useMap();
  const locate = () => {
    if (!navigator.geolocation) return alert("此裝置不支援定位");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        onLocate([latitude, longitude]); 
        map.setView([latitude, longitude], 15);
        L.marker([latitude, longitude], {
          icon: new L.DivIcon({
            className: "bg-[#00AA88] text-white rounded-full px-2 py-1 shadow ring-2 ring-white",
            html: "📍", iconSize: [28, 28], iconAnchor: [14, 14],
          }),
        }).addTo(map).bindPopup("你在這裡");
      },
      () => alert("無法取得定位")
    );
  };

  return (
    <button
      onClick={locate}
      className="absolute z-[1000] right-3 bottom-3 bg-white/90 backdrop-blur px-3 py-1 rounded shadow border text-sm"
    >
      我的定位
    </button>
  );
}

export default function MapPage() {
  const center = useMemo(() => [25.0436, 121.5360], []);
  const [showShelter, setShowShelter] = useState(true);
  const [showCafe, setShowCafe] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [userCoords, setUserCoords] = useState(null);

  // ⭐ 修改點：計算排序後的店家列表
  // 使用 useMemo 確保只有當過濾條件或位置改變時才重新排序
  const sortedPlaces = useMemo(() => {
    const filtered = PLACES.filter(
      (p) => (p.type === "shelter" && showShelter) || (p.type === "cafe" && showCafe)
    );

    if (!userCoords) return filtered; // 沒定位時顯示原始順序

    // 有定位時，計算距離並從小排到大
    return [...filtered].sort((a, b) => {
      const distA = parseFloat(getDistance(userCoords[0], userCoords[1], a.lat, a.lng));
      const distB = parseFloat(getDistance(userCoords[0], userCoords[1], b.lat, b.lng));
      return distA - distB;
    });
  }, [showShelter, showCafe, userCoords]);

return (
  <div className="max-w-7xl mx-auto px-6 py-8">
    {/* 1. 篩選與關閉按鈕 */}
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={showShelter} onChange={() => setShowShelter((prev) => !prev)} />
          <span>🏠 收容所</span>
        </label>
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={showCafe} onChange={() => setShowCafe((prev) => !prev)} />
          <span>☕️ 浪浪咖啡</span>
        </label>
      </div>

      {/* ⭐ 修改點：加回關閉按鈕，點擊後 selectedPlace 變回 null，列表就會隱藏 */}
      {selectedPlace && (
        <button 
          onClick={() => setSelectedPlace(null)} 
          className="text-gray-400 hover:text-gray-600 text-sm border px-2 py-1 rounded"
        >
          ✕ 關閉列表並放大地圖
        </button>
      )}
    </div>

    {/* 2. 佈局容器 */}
    <div className="flex flex-col lg:flex-row gap-5 transition-all duration-500">
      
      {/* ⭐ 修改點：地圖寬度根據 selectedPlace 動態切換 */}
      <div className={`relative rounded-xl overflow-hidden shadow-lg transition-all duration-500 ${
        selectedPlace ? 'lg:w-2/3' : 'w-full'
      }`}>
        <MapContainer center={center} zoom={12} style={{ height: "75vh", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='© OSM' />
          {sortedPlaces.map((p) => (
            <Marker
              key={p.id}
              position={[p.lat, p.lng]}
              icon={p.type === "shelter" ? shelterIcon : cafeIcon}
              eventHandlers={{ click: () => setSelectedPlace(p) }}
            >
              <Popup><div className="font-semibold">{p.name}</div></Popup>
            </Marker>
          ))}
          
          {/* ⭐ 這裡一定要保留 MapResizer，地圖縮放時才不會跑版 */}
          <MapResizer isSidebarOpen={!!selectedPlace} />
          <MapController selectedPlace={selectedPlace} />
          <LocateButton onLocate={(coords) => setUserCoords(coords)} />
        </MapContainer>
      </div>

      {/* ⭐ 修改點：右側列表設定條件渲染，只有選中店家時才「滑入」顯示 */}
      {selectedPlace && (
        <div className="lg:w-1/3 bg-white rounded-xl shadow-lg flex flex-col overflow-hidden animate-fadeIn" style={{ height: "75vh" }}>
          <div className="p-4 bg-[#836054] text-white">
            <h3 className="font-bold text-lg">附近店家距離</h3>
            <p className="text-xs opacity-80">
              {userCoords ? "已依距離由近到遠排序" : "點擊地圖定位後將自動計算距離"}
            </p>
          </div>

          <div className="flex-grow overflow-y-auto p-3 space-y-3 bg-gray-50">
            {sortedPlaces.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedPlace(p)}
                className={`p-4 rounded-xl cursor-pointer transition-all border-2 ${
                  selectedPlace?.id === p.id 
                  ? 'border-[#D6B788] bg-[#FFF7EB] shadow-inner' 
                  : 'border-transparent bg-white hover:bg-white hover:shadow-md'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-sm">{p.type === "shelter" ? "🏠" : "☕️"}</span>
                    <span className="font-bold ml-2 text-gray-700">{p.name}</span>
                  </div>
                  {userCoords && (
                    <div className="text-xs font-bold px-2 py-1 bg-white text-[#D6B788] border border-[#D6B788] rounded-full shadow-sm">
                      {getDistance(userCoords[0], userCoords[1], p.lat, p.lng)} km
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-2 truncate">{p.addr}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);
}