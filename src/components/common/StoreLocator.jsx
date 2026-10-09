import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, MapPin, Minus, Plus, Search } from 'lucide-react';

const TILE_SIZE = 256;
const MIN_ZOOM = 2;
const MAX_ZOOM = 18;
const TILE_URL = 'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile';
// Tăng Nhơn Phú A area center; exact house-number geocoding was unavailable.
const TANG_NHON_PHU_A_CENTER = { latitude: 10.8424, longitude: 106.7936 };
const CITY_ZOOM = 13;
const STORES = [
  {
    id: 'thu-duc-160',
    name: '124 Đường 160',
    address: [
      '124 Đường 160',
      'Phường Tăng Nhơn Phú A',
      'TP. Thủ Đức, TP. Hồ Chí Minh',
      'Việt Nam',
    ],
    city: 'Tăng Nhơn Phú A',
    country: 'Việt Nam',
    ...TANG_NHON_PHU_A_CENTER,
  },
];

function project(latitude, longitude, zoom) {
  const scale = TILE_SIZE * (2 ** zoom);
  const safeLatitude = Math.max(-85.0511, Math.min(85.0511, latitude));
  const sin = Math.sin((safeLatitude * Math.PI) / 180);

  return {
    x: ((longitude + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale,
  };
}

function unproject(x, y, zoom) {
  const scale = TILE_SIZE * (2 ** zoom);
  const longitude = (x / scale) * 360 - 180;
  const latitudeRadians = Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / scale)));

  return {
    latitude: (latitudeRadians * 180) / Math.PI,
    longitude: longitude,
  };
}

function wrapTileX(x, tileCount) {
  return ((x % tileCount) + tileCount) % tileCount;
}

export default function StoreLocator() {
  const mapRef = useRef(null);
  const dragRef = useRef(null);
  const [search, setSearch] = useState('');
  const [selectedStoreId, setSelectedStoreId] = useState(STORES[0].id);
  const [center, setCenter] = useState(TANG_NHON_PHU_A_CENTER);
  const [zoom, setZoom] = useState(CITY_ZOOM);
  const [mapSize, setMapSize] = useState({ width: 0, height: 0 });
  const [tileError, setTileError] = useState(false);

  useEffect(() => {
    const element = mapRef.current;
    if (!element) return undefined;

    const observer = new ResizeObserver(([entry]) => {
      setMapSize({
        width: Math.round(entry.contentRect.width),
        height: Math.round(entry.contentRect.height),
      });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => setTileError(false), [center.latitude, center.longitude, zoom]);

  const filteredStores = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return STORES;

    return STORES.filter((store) => [
      store.name,
      store.city,
      store.country,
      ...store.address,
    ].some((value) => value.toLocaleLowerCase().includes(query)));
  }, [search]);

  const selectedStore = STORES.find((store) => store.id === selectedStoreId) || STORES[0];
  const centerPixel = project(center.latitude, center.longitude, zoom);
  const tileCount = 2 ** zoom;
  const firstTileX = Math.floor((centerPixel.x - mapSize.width / 2) / TILE_SIZE);
  const lastTileX = Math.floor((centerPixel.x + mapSize.width / 2) / TILE_SIZE);
  const firstTileY = Math.max(0, Math.floor((centerPixel.y - mapSize.height / 2) / TILE_SIZE));
  const lastTileY = Math.min(tileCount - 1, Math.floor((centerPixel.y + mapSize.height / 2) / TILE_SIZE));
  const visibleTiles = [];

  if (mapSize.width && mapSize.height) {
    for (let tileY = firstTileY; tileY <= lastTileY; tileY += 1) {
      for (let tileX = firstTileX; tileX <= lastTileX; tileX += 1) {
        visibleTiles.push({
          key: `${zoom}/${tileX}/${tileY}`,
          src: `${TILE_URL}/${zoom}/${tileY}/${wrapTileX(tileX, tileCount)}`,
          left: tileX * TILE_SIZE - centerPixel.x + mapSize.width / 2,
          top: tileY * TILE_SIZE - centerPixel.y + mapSize.height / 2,
        });
      }
    }
  }

  const selectedPixel = project(selectedStore.latitude, selectedStore.longitude, zoom);
  const markerPosition = {
    left: selectedPixel.x - centerPixel.x + mapSize.width / 2,
    top: selectedPixel.y - centerPixel.y + mapSize.height / 2,
  };
  const addressQuery = encodeURIComponent(`${selectedStore.address.join(', ')}, Việt Nam`);
  const largerMapUrl = `https://www.google.com/maps/search/?api=1&query=${addressQuery}`;

  const selectStore = (store) => {
    setSelectedStoreId(store.id);
    setCenter({ latitude: store.latitude, longitude: store.longitude });
    setZoom(14);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    if (filteredStores.length > 0) selectStore(filteredStores[0]);
  };

  const changeZoom = (amount) => setZoom((currentZoom) => (
    Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, currentZoom + amount))
  ));

  const resetCityView = () => {
    setCenter(TANG_NHON_PHU_A_CENTER);
    setZoom(CITY_ZOOM);
  };

  const handlePointerDown = useCallback((event) => {
    if (event.target.closest('button, a')) return;
    const pixel = project(center.latitude, center.longitude, zoom);
    dragRef.current = { x: event.clientX, y: event.clientY, centerX: pixel.x, centerY: pixel.y };
    event.currentTarget.setPointerCapture(event.pointerId);
  }, [center.latitude, center.longitude, zoom]);

  const handlePointerMove = useCallback((event) => {
    if (!dragRef.current) return;
    const drag = dragRef.current;
    setCenter(unproject(drag.centerX - (event.clientX - drag.x), drag.centerY - (event.clientY - drag.y), zoom));
  }, [zoom]);

  const finishDragging = (event) => {
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <section className="store-locator" aria-label="Địa chỉ cửa hàng">
      <div className="store-locator__layout">
        <aside className="store-locator__panel" aria-label="Tìm kiếm cửa hàng">
          <form className="store-locator__search" onSubmit={handleSearch} role="search">
            <label className="store-locator__sr-only" htmlFor="store-locator-search">
              Tìm thành phố có cửa hàng
            </label>
            <input
              id="store-locator-search"
              type="search"
              placeholder="Tìm thành phố hoặc địa chỉ..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <button type="submit" aria-label="Tìm cửa hàng"><Search size={16} color="#fff" /></button>
          </form>

          <div className="store-locator__results" aria-live="polite">
            {filteredStores.length ? filteredStores.map((store) => (
              <article className="store-locator__result" key={store.id}>
                <div
                  role="button"
                  tabIndex={0}
                  className={`store-locator__result-content ${selectedStoreId === store.id ? 'is-selected' : ''}`}
                  aria-pressed={selectedStoreId === store.id}
                  onClick={() => selectStore(store)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      selectStore(store);
                    }
                  }}
                >
                  <div className="store-locator__pin-icon">
                    <MapPin size={22} fill="#30302f" stroke="#fff" strokeWidth={1.5} />
                  </div>
                  <div className="store-locator__details-wrap">
                    <h3 className="store-locator__store-name">{store.name}</h3>
                    <address>
                      {store.address.map((line) => <span key={line}>{line}</span>)}
                    </address>
                    <span className="store-locator__location-note">
                      Ghim trên bản đồ đang hiển thị gần khu vực Tăng Nhơn Phú A.
                    </span>
                  </div>
                </div>
              </article>
            )) : (
              <p className="store-locator__empty">Không tìm thấy cửa hàng. Hãy thử “Hồ Chí Minh” hoặc “Thủ Đức”.</p>
            )}
          </div>
        </aside>

        <div className="store-locator__map-wrap">
          <div
            ref={mapRef}
            className="store-locator__map"
            role="region"
            aria-label="Bản đồ gần 124 Đường 160, Tăng Nhơn Phú A, Thủ Đức"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={finishDragging}
            onPointerCancel={finishDragging}
          >
            <div className="store-locator__tiles" aria-hidden="true">
              {visibleTiles.map((tile) => (
                <img
                  key={tile.key}
                  className="store-locator__tile"
                  src={tile.src}
                  alt=""
                  draggable="false"
                  onError={() => setTileError(true)}
                  style={{ left: tile.left, top: tile.top }}
                />
              ))}
            </div>

            {mapSize.width > 0 && mapSize.height > 0 && filteredStores.map(store => {
              const pixel = project(store.latitude, store.longitude, zoom);
              const pos = {
                left: pixel.x - centerPixel.x + mapSize.width / 2,
                top: pixel.y - centerPixel.y + mapSize.height / 2,
              };
              return (
                <button
                  key={store.id}
                  className={`store-locator__marker-circle ${selectedStoreId === store.id ? 'is-active' : ''}`}
                  style={{ left: pos.left, top: pos.top }}
                  onClick={(e) => { e.stopPropagation(); selectStore(store); }}
                  aria-label={`Chọn cửa hàng: ${store.name}`}
                  title={store.name}
                >
                  1
                </button>
              );
            })}

            {tileError && (
              <p className="store-locator__map-message" role="status">
                Không tải được bản đồ. Hãy kiểm tra kết nối hoặc{' '}
                <a href={largerMapUrl} target="_blank" rel="noreferrer">mở địa chỉ bằng Google Maps</a>.
              </p>
            )}

            <a className="store-locator__larger-map" href={largerMapUrl} target="_blank" rel="noreferrer">
              Mở bằng Google Maps <ArrowUpRight size={13} aria-hidden="true" />
            </a>

            <div className="store-locator__map-controls" aria-label="Điều khiển bản đồ">
              <button type="button" onClick={() => changeZoom(1)} aria-label="Phóng to" disabled={zoom >= MAX_ZOOM}>
                <Plus size={16} />
              </button>
              <button type="button" onClick={() => changeZoom(-1)} aria-label="Thu nhỏ" disabled={zoom <= MIN_ZOOM}>
                <Minus size={16} />
              </button>
              <button className="store-locator__reset" type="button" onClick={resetCityView} aria-label="Hiển thị khu vực Tăng Nhơn Phú A">
                <span aria-hidden="true">⌖</span>
              </button>
            </div>

            <div className="store-locator__attribution" aria-label="Nguồn dữ liệu bản đồ">
              Dữ liệu: <a href="https://doc.arcgis.com/en/data-appliance/7.2/maps/world-light-gray-base.htm" target="_blank" rel="noreferrer">Esri</a>, HERE, Garmin,{' '}
              <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© cộng đồng OpenStreetMap</a> và cộng đồng GIS.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
