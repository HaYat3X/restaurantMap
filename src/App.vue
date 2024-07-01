<template>
  <div id="app">
    <!-- 地図コンテナ -->
    <!-- 座標のXY軸逆なんでw -->
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
import RestaurantData from "./Restaurant.json"; // JSONデータのインポート
import "ol/ol.css";

// 初期表示する中心位置の緯度と経度
const initialCenter = fromLonLat([135.49894802573942, 34.68264934296536]);

// マーカーの位置
const markerPositions = ref<Overlay[]>([]);

onMounted(() => {
  // 地図オブジェクトの初期化
  const map = initializeMap();

  // マーカーを地図に追加する
  addMarkers(map);

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
function addMarkers(map: Map): void {
  RestaurantData.forEach((restaurant: any) => {
    const position = fromLonLat(restaurant.markerPosition);
    const markerOverlay = new Overlay({
      position: position,
      positioning: "center-center",
      element: createMarkerElement(),
      stopEvent: false,
    });

    // ピンがクリックされたときの処理を設定する
    markerOverlay.getElement()?.addEventListener("click", () => {
      // クリックされた位置に既にオーバーレイが存在するかどうかを確認
      const existingOverlay = map.getOverlayById("info-overlay");

      // 既に表示されているオーバーレイがあれば削除する
      if (existingOverlay) {
        map.removeOverlay(existingOverlay);
      }

      // クリックされた位置にオーバーレイで情報を表示する
      const infoOverlay = new Overlay({
        id: "info-overlay", // オーバーレイにIDを設定することで識別する
        position: position,
        element: createInfoElement(
          restaurant.name,
          restaurant.imgPath,
          restaurant.description,
          restaurant.url
        ),
        autoPan: true,
      });
      map.addOverlay(infoOverlay);
    });

    map.addOverlay(markerOverlay);
    markerPositions.value.push(markerOverlay);
  });
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
 * 情報ウィンドウの要素を作成する関数
 */
function createInfoElement(
  name: string,
  imgPath: string,
  description: string,
  url: string
): HTMLDivElement {
  const element = document.createElement("div");
  element.innerHTML = `
    <div data-v-7a7a37b1="" class="q-card q-card--bordered q-card--flat no-shadow my-card" style="width: 350px;">
      <div data-v-7a7a37b1="" class="q-img q-img--menu" role="img">
        <div style="padding-bottom: 66.5455%;"></div>
        <div class="q-img__container absolute-full">
          <img class="q-img__image q-img__image--with-transition q-img__image--loaded" loading="lazy" fetchpriority="auto" aria-hidden="true" draggable="false" src="${imgPath}" style="object-fit: cover; object-position: 50% 50%;">
        </div>
        <div class="q-img__content absolute-full q-anchor--skip"></div>
      </div>
      <div data-v-7a7a37b1="" class="q-card__section q-card__section--vert">
        <a href="${url}" target="_blank" rel="noopener noreferrer">
          <button data-v-7a7a37b1="" class="q-btn q-btn-item non-selectable no-outline q-btn--standard q-btn--rectangle q-btn--rounded bg-primary text-white q-btn--actionable q-focusable q-hoverable q-btn--fab absolute" tabindex="0" type="button" style="top: 0px; right: 12px; transform: translateY(-50%);">
            <span class="q-focus-helper"></span>
            <span class="q-btn__content text-center col items-center q-anchor--skip justify-center row">
              <i class="q-icon notranslate material-icons" aria-hidden="true" role="img">place</i>
            </span>
          </button>
        </a>
        <div data-v-7a7a37b1="" class="row no-wrap items-center">
          <div data-v-7a7a37b1="" class="col text-h6 ellipsis">${name}</div>
        </div>
        <div data-v-7a7a37b1="" class="text-subtitle1" style="margin-top: 20px;">${description}</div>
      </div>
    </div>
  `;

  // ボタンにクリックイベントを追加する
  const button = element.querySelector("button");
  button?.addEventListener("click", () => {
    handleButtonClick(url);
  });

  return element;
}

/**
 * ボタンクリック時の処理
 */
function handleButtonClick(url: string): void {
  window.open(url, "_blank"); // 新しいタブでリンクを開く
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
