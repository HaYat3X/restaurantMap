<template>
  <div id="app">
    <!-- 地図コンテナ -->
    <div id="map-container"></div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import Map from "ol/Map";
import View from "ol/View";
import Overlay from "ol/Overlay";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { fromLonLat } from "ol/proj";
import "ol/ol.css";

// 初期表示する中心位置の緯度と経度
const initialCenter = fromLonLat([135.49894802573942, 34.68264934296536]);

// マーカーの位置
const markerPosition = ref(initialCenter);

onMounted(() => {
  // 地図オブジェクトの初期化
  const map = initializeMap();

  // マーカーを地図に追加する
  addMarker(map);

  // マーカーがクリックされたときの処理を設定する
  setupMarkerClickHandler(map);

  // 地図全体をクリックしたときの処理を設定する
  setupMapClickHandler(map);
});

/**
 * 地図を初期化する関数
 */
function initializeMap(): Map {
  const map = new Map({
    target: "map-container", // 地図を表示するDOM要素のID
    layers: [
      new TileLayer({
        source: new OSM(), // OpenStreetMapのタイルレイヤーを使用
      }),
    ],
    view: new View({
      center: initialCenter, // 初期表示する中心位置
      zoom: 17, // 初期表示するズームレベル
    }),
  });
  return map;
}

/**
 * マーカーを地図に追加する関数
 */
function addMarker(map: Map): void {
  const markerOverlay = new Overlay({
    position: markerPosition.value,
    positioning: "center-center",
    element: createMarkerElement(),
    stopEvent: false,
  });
  map.addOverlay(markerOverlay);
}

/**
 * マーカーの要素を作成する関数
 */
function createMarkerElement(): HTMLDivElement {
  const element = document.createElement("div");
  element.innerHTML =
    '<img style="width: 40px;" src="https://suzukishi.com/wp-content/uploads/2022/03/mapicon_pin_red1.png">';
  return element;
}

/**
 * マーカーがクリックされたときの処理を設定する関数
 */
function setupMarkerClickHandler(map: Map): void {
  const markerOverlay = map.getOverlays().item(0); // マーカーオーバーレイは最初の要素として追加されていると仮定する

  markerOverlay?.getElement()?.addEventListener("click", () => {
    const clickedCoordinate = markerOverlay.getPosition() as [number, number]; // 明示的に型を指定する

    if (clickedCoordinate) {
      // クリックされた位置に既にオーバーレイが存在するかどうかを確認
      const existingOverlay = map.getOverlayById("info-overlay");

      // 既に表示されているオーバーレイがあれば削除する
      if (existingOverlay) {
        map.removeOverlay(existingOverlay);
      }

      // クリックされた位置にオーバーレイで情報を表示する
      const infoOverlay = new Overlay({
        id: "info-overlay", // オーバーレイにIDを設定することで識別する
        position: clickedCoordinate,
        element: createInfoElement(clickedCoordinate),
        autoPan: true, // autoPan のみを設定する
      });
      map.addOverlay(infoOverlay);
    }
  });
}

/**
 * 情報ウィンドウの要素を作成する関数
 */
function createInfoElement(
  clickedCoordinate: [number, number]
): HTMLDivElement {
  const element = document.createElement("div");
  element.innerHTML = `
    <div style="background-color: white; padding: 10px;">
      <h4>場所の情報</h4>
      <p>緯度: ${clickedCoordinate[1]}</p>
      <p>経度: ${clickedCoordinate[0]}</p>
    </div>
  `;
  return element;
}

/**
 * 地図全体をクリックしたときの処理を設定する関数
 */
function setupMapClickHandler(map: Map): void {
  map.on("click", () => {
    const existingOverlay = map.getOverlayById("info-overlay");

    // 既に表示されているオーバーレイがあれば削除する
    if (existingOverlay) {
      map.removeOverlay(existingOverlay);
    }
  });
}
</script>

<style scoped>
#map-container {
  width: 100%;
  height: 100vh;
  z-index: 0;
}
</style>
