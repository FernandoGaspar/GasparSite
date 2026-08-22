import styled from "styled-components";

export const Container = styled.div`
  color: #dce8fa;
  max-width: 1480px;
  margin: 0 auto;
  padding-bottom: 36px;
  button {
    font: inherit;
    cursor: pointer;
  }
  button:disabled {
    cursor: not-allowed;
    opacity: 0.58;
  }
  .home-hero {
    min-height: 138px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 28px 30px;
    border: 1px solid #214563;
    border-radius: 18px;
    background:
      radial-gradient(
        circle at 88% 0%,
        rgba(18, 120, 255, 0.25),
        transparent 30%
      ),
      linear-gradient(115deg, #0a2035, #0d1728);
  }
  .title,
  .hero-actions,
  .connection,
  .command-bar,
  .search,
  .notice,
  .room header > div,
  .device-toggle {
    display: flex;
    align-items: center;
  }
  .title {
    gap: 16px;
  }
  .title > div {
    display: block;
    min-width: 0;
  }
  .home-mark {
    display: grid;
    flex: none;
    place-items: center;
    width: 55px;
    height: 55px;
    border-radius: 16px;
    color: #7ad3ff;
    background: linear-gradient(145deg, #126ad7, #0f3558);
    font-size: 27px;
    box-shadow: 0 12px 26px #061223;
  }
  .title small {
    color: #6ebeff;
    font-size: 10px;
    letter-spacing: 0.14em;
    font-weight: 800;
  }
  h1,
  h2,
  p {
    margin: 0;
  }
  h1 {
    margin: 5px 0;
    color: #fff;
    font-size: 25px;
    letter-spacing: -0.04em;
  }
  .title p,
  .room p {
    color: #8ca1bd;
    font-size: 12px;
  }
  .hero-actions {
    gap: 12px;
  }
  .connection {
    gap: 7px;
    padding: 10px 12px;
    color: #aebed5;
    font-size: 12px;
  }
  .connection i {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #29d59a;
    box-shadow: 0 0 9px #29d59a;
  }
  .hero-actions button,
  .notice button {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 10px 13px;
    border: 1px solid #39516d;
    border-radius: 9px;
    color: #d8e7fb;
    background: #122640;
    font-size: 12px;
    font-weight: 700;
  }
  .overview {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
    margin: 18px 0;
  }
  .summary {
    display: flex;
    align-items: center;
    gap: 13px;
    min-height: 94px;
    padding: 18px;
    border: 1px solid #203852;
    border-radius: 14px;
    background: #0d1a2a;
  }
  .summary > span {
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    border-radius: 12px;
    color: #94b4dc;
    background: #142943;
    font-size: 19px;
  }
  .summary.active > span {
    color: #4ee6b1;
    background: #0d3a35;
  }
  .active-filter {
    width: 100%;
    text-align: left;
    transition:
      border-color 0.18s ease,
      background 0.18s ease;
  }
  .active-filter:hover {
    border-color: #2f8f73;
  }
  .active-filter.selected {
    border-color: #35b38d;
    background: linear-gradient(135deg, #103a35, #102638);
    box-shadow: inset 0 0 0 1px #35b38d33;
  }
  .summary small,
  .summary em {
    display: block;
    color: #8296b1;
    font-size: 11px;
    font-style: normal;
  }
  .summary strong {
    display: block;
    margin: 3px 0;
    color: #f4f8ff;
    font-size: 23px;
  }
  .summary strong b {
    color: #7088a8;
    font-size: 13px;
    font-weight: 500;
  }
  .weather strong {
    color: #53d8a6;
    font-size: 17px;
  }
  .command-bar {
    justify-content: space-between;
    gap: 14px;
    margin-bottom: 14px;
  }
  .filters,
  .command-actions {
    display: flex;
    gap: 10px;
  }
  .filters {
    flex: 1;
  }
  .search {
    flex: 1;
    max-width: 420px;
    gap: 10px;
    padding: 0 14px;
    height: 45px;
    border: 1px solid #243b56;
    border-radius: 10px;
    background: #0d1a2a;
    color: #849bb9;
  }
  .search input {
    width: 100%;
    border: 0;
    outline: 0;
    color: #d9e8fb;
    background: transparent;
    font: inherit;
    font-size: 13px;
  }
  .filters select,
  .device select {
    min-width: 160px;
    padding: 0 11px;
    border: 1px solid #243b56;
    border-radius: 10px;
    outline: 0;
    color: #c8d9ef;
    background: #0d1a2a;
    font: inherit;
    font-size: 12px;
  }
  .filters select:focus,
  .device select:focus {
    border-color: #4589c6;
  }
  .organize,
  .all-off {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 15px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 700;
  }
  .organize {
    border: 1px solid #31577d;
    color: #a8d5ff;
    background: #102841;
  }
  .organize.selected {
    border-color: #1676d2;
    color: #fff;
    background: #1263b8;
  }
  .all-off {
    border: 1px solid #654251;
    color: #ffb7bf;
    background: #281923;
  }
  .room-editor {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 15px;
    margin-bottom: 18px;
    padding: 15px 17px;
    border: 1px solid #245987;
    border-radius: 13px;
    background: #0d2239;
  }
  .room-editor strong,
  .room-editor span {
    display: block;
  }
  .room-editor strong {
    font-size: 13px;
    color: #e5f1ff;
  }
  .room-editor span {
    margin-top: 3px;
    font-size: 11px;
    color: #8cabc8;
  }
  .room-editor > div:last-child {
    display: flex;
    gap: 8px;
  }
  .room-editor input {
    height: 36px;
    min-width: 190px;
    padding: 0 10px;
    border: 1px solid #315474;
    border-radius: 8px;
    outline: 0;
    color: #e5f1ff;
    background: #112b44;
    font: inherit;
    font-size: 12px;
  }
  .room-editor button {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0 11px;
    border: 0;
    border-radius: 8px;
    color: #fff;
    background: #1674d0;
    font-size: 11px;
    font-weight: 700;
  }
  .rooms {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }
  .room {
    overflow: hidden;
    border: 1px solid #203852;
    border-radius: 15px;
    background: #0d1a2a;
  }
  .room > header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 17px 18px;
    border-bottom: 1px solid #1d334b;
  }
  .room header > div {
    gap: 10px;
  }
  .room header > div > span {
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    border-radius: 10px;
    color: #68baff;
    background: #112d4b;
  }
  .room h2 {
    color: #eff5ff;
    font-size: 15px;
  }
  .room-name {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
  }
  .room-name p {
    width: 100%;
  }
  .rename-room {
    display: grid;
    place-items: center;
    width: 24px;
    height: 24px;
    padding: 0;
    border: 1px solid #315474;
    border-radius: 7px;
    color: #8cc7ff;
    background: #112b44;
  }
  .rename-room:hover {
    border-color: #5797ce;
    color: #d6ecff;
  }
  .room-rename-inline {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .room-rename-inline input {
    width: 150px;
    height: 28px;
    box-sizing: border-box;
    padding: 0 8px;
    border: 1px solid #4d85b5;
    border-radius: 7px;
    outline: 0;
    color: #eef7ff;
    background: #0c1b2d;
    font: inherit;
    font-size: 12px;
  }
  .room-rename-inline button {
    height: 28px;
    padding: 0 8px;
    border: 0;
    border-radius: 7px;
    color: #e7f4ff;
    background: #24577d;
    font: inherit;
    font-size: 11px;
    font-weight: 700;
  }
  .room-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .room-toggle {
    position: relative;
    width: 38px;
    height: 22px;
    padding: 0;
    border: 0;
    border-radius: 99px;
    background: #38506b;
    transition:
      background 0.18s ease,
      opacity 0.18s ease;
  }
  .room-toggle span {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #dceaff;
    box-shadow: 0 1px 4px #07111d88;
    transition:
      transform 0.18s ease,
      background 0.18s ease;
  }
  .room-toggle.is-on {
    background: #168f70;
  }
  .room-toggle.is-on span {
    transform: translateX(16px);
    background: #ffffff;
  }
  .room-toggle:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }
  .room header b {
    padding: 5px 8px;
    border-radius: 99px;
    color: #76d9b3;
    background: #10362e;
    font-size: 10px;
  }
  .room-order {
    width: 58px;
    height: 28px;
    box-sizing: border-box;
    padding: 0 6px;
    border: 1px solid #315474;
    border-radius: 7px;
    outline: 0;
    color: #c8d9ef;
    background: #0c1b2d;
    font: inherit;
    font-size: 10px;
  }
  .room-order:focus {
    border-color: #4589c6;
  }
  .delete-room {
    display: grid;
    place-items: center;
    width: 28px;
    height: 28px;
    border: 1px solid #704451;
    border-radius: 7px;
    color: #ffafb8;
    background: #2a1820;
  }
  .device-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 9px;
    padding: 12px;
  }
  .monitoring {
    margin-top: 18px;
    overflow: hidden;
    border: 1px solid #23435e;
    border-radius: 15px;
    background: #0c1a2a;
  }
  .monitoring-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    padding: 17px 18px;
    border-bottom: 1px solid #203850;
  }
  .monitoring-header > div {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .monitoring-header > div > span {
    display: grid;
    place-items: center;
    width: 33px;
    height: 33px;
    border-radius: 10px;
    color: #85c8ff;
    background: #163452;
  }
  .monitoring-header small {
    display: block;
    color: #7fa5c9;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.12em;
  }
  .monitoring-header h2 {
    margin: 2px 0;
    color: #eff6ff;
    font-size: 15px;
  }
  .monitoring-header p {
    color: #8ba4c1;
    font-size: 11px;
  }
  .live-cameras {
    display: flex;
    align-items: center;
    gap: 7px;
    min-height: 34px;
    padding: 0 11px;
    border: 1px solid #315574;
    border-radius: 9px;
    color: #b9d9f8;
    background: #122b45;
    font-size: 11px;
    font-weight: 700;
  }
  .live-cameras i {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #8298b3;
  }
  .live-cameras.is-live {
    border-color: #2a9a79;
    color: #86e7c1;
    background: #103930;
  }
  .live-cameras.is-live i {
    background: #4de0aa;
    box-shadow: 0 0 8px #4de0aa;
  }
  .camera-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
    gap: 12px;
    padding: 12px;
  }
  .camera-grid:has(.camera-card.is-live) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
  .camera-card {
    overflow: hidden;
    border: 1px solid #27435e;
    border-radius: 12px;
    background: #101f31;
  }
  .camera-card.is-hidden {
    opacity: 0.55;
  }
  .camera-card.is-live {
    grid-column: span 2;
    border-color: #278e73;
    box-shadow: 0 12px 30px #06131f;
  }
  .camera-image {
    position: relative;
    display: block;
    width: 100%;
    padding: 0;
    border: 0;
    aspect-ratio: 16 / 9;
    overflow: hidden;
    background: linear-gradient(135deg, #172b40, #0a1320);
  }
  .camera-image:hover img {
    transform: scale(1.02);
  }
  .camera-image img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.2s ease;
  }
  .camera-live-player video {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    background: #07111d;
  }
  .camera-image span {
    position: absolute;
    top: 9px;
    left: 9px;
    padding: 4px 7px;
    border-radius: 6px;
    color: #d8eaff;
    background: #07111dcc;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .camera-image:has(img[data-camera-state="unavailable"])::after {
    content: "Imagem indisponível · atualize a câmera";
    position: absolute;
    inset: auto 9px 9px;
    padding: 5px 7px;
    border-radius: 6px;
    color: #ffd1d7;
    background: #511d2ad9;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  .camera-card.is-live .camera-image span {
    color: #b8ffe1;
    background: #0a382ed9;
  }
  .stop-camera-live {
    width: calc(100% - 20px);
    min-height: 32px;
    margin: 10px;
    border: 1px solid #315574;
    border-radius: 7px;
    color: #b9d9f8;
    background: #122b45;
    font-size: 11px;
    font-weight: 700;
  }
  .camera-details {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 11px 12px;
  }
  .camera-details > div {
    display: flex;
    align-items: center;
    min-width: 0;
    gap: 7px;
  }
  .camera-details svg {
    flex: none;
    color: #72bfff;
  }
  .camera-details strong {
    overflow: hidden;
    color: #e8f2ff;
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .refresh-camera {
    display: grid;
    flex: none;
    place-items: center;
    width: 26px;
    height: 26px;
    border: 1px solid #2f506d;
    border-radius: 7px;
    color: #a6ccee;
    background: #132c46;
  }
  .camera-settings {
    display: grid;
    grid-template-columns: 72px 1fr;
    gap: 7px;
    padding: 0 12px 12px;
  }
  .camera-settings input {
    width: 100%;
    min-width: 0;
    height: 32px;
    box-sizing: border-box;
    padding: 0 6px;
    border: 1px solid #29435d;
    border-radius: 7px;
    outline: 0;
    color: #d3e4f7;
    background: #0b1929;
    font: inherit;
    font-size: 11px;
  }
  .camera-remove {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    border: 1px solid #704451;
    border-radius: 7px;
    color: #ffb4bd;
    background: #2a1820;
    font-size: 11px;
    font-weight: 700;
  }
  .device {
    width: 100%;
    overflow: hidden;
    border: 1px solid #213852;
    border-radius: 11px;
    color: #dce8fa;
    background: #101f31;
    transition: 0.18s ease;
  }
  .device:hover {
    border-color: #3f75a7;
    transform: translateY(-1px);
  }
  .device.is-on {
    border-color: #236b72;
    background: linear-gradient(135deg, #102c35, #10233a);
  }
  .device-toggle {
    width: 100%;
    gap: 10px;
    min-height: 70px;
    padding: 11px;
    text-align: left;
    border: 0;
    color: inherit;
    background: transparent;
  }
  .device-icon {
    display: grid;
    flex: none;
    place-items: center;
    width: 30px;
    height: 30px;
    border-radius: 9px;
    color: #93aac8;
    background: #1a3048;
  }
  .is-on .device-icon {
    color: #51e0af;
    background: #123e3b;
  }
  .device-toggle div {
    min-width: 0;
    flex: 1;
  }
  .device strong,
  .device small {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .device strong {
    color: #e6effd;
    font-size: 12px;
  }
  .device small {
    margin-top: 3px;
    color: #8298b7;
    font-size: 10px;
  }
  .is-on small {
    color: #5bd8ac;
  }
  .device-toggle > i {
    position: relative;
    flex: none;
    width: 27px;
    height: 16px;
    border-radius: 30px;
    background: #34455a;
  }
  .device-toggle > i span {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #97a7bc;
    transition: 0.2s;
  }
  .is-on .device-toggle > i {
    background: #1e9878;
  }
  .is-on .device-toggle > i span {
    left: 14px;
    background: #e8fff7;
  }
  .device-settings {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 7px;
    padding: 0 11px 11px;
  }
  .device-settings select,
  .device-settings input {
    width: 100%;
    min-width: 0;
    height: 32px;
    box-sizing: border-box;
    padding: 0 6px;
    border: 1px solid #243b56;
    border-radius: 7px;
    outline: 0;
    color: #c8d9ef;
    background: #0c1b2d;
    font: inherit;
    font-size: 11px;
  }
  .device-settings input:focus {
    border-color: #4589c6;
  }
  .television-device {
    overflow: hidden;
    border: 1px solid #354366;
    border-radius: 12px;
    background:
      radial-gradient(circle at 85% 5%, #43358b55, transparent 34%), #101d31;
  }
  .television-device.is-on {
    border-color: #406f94;
    background:
      radial-gradient(circle at 85% 5%, #3b82f655, transparent 34%), #10243a;
  }
  .television-device header {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 12px;
    border-bottom: 1px solid #263952;
  }
  .television-device header > span {
    display: grid;
    flex: none;
    place-items: center;
    width: 32px;
    height: 32px;
    border-radius: 9px;
    color: #b8b5ff;
    background: #292550;
  }
  .television-device.is-on header > span {
    color: #90d2ff;
    background: #173c61;
  }
  .television-device header > div {
    min-width: 0;
    flex: 1;
  }
  .television-device header small,
  .television-device header strong {
    display: block;
  }
  .television-device header small {
    color: #8498b7;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.08em;
  }
  .television-device header strong {
    overflow: hidden;
    margin-top: 2px;
    color: #eaf3ff;
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .television-device header em {
    padding: 4px 6px;
    border-radius: 6px;
    color: #93a8c4;
    background: #1a2a40;
    font-size: 9px;
    font-style: normal;
  }
  .television-device.is-on header em {
    color: #8ed7ff;
    background: #153e61;
  }
  .television-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 7px;
    padding: 11px 12px 8px;
  }
  .television-actions button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    height: 35px;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 700;
  }
  .tv-on {
    border: 1px solid #2e6e97;
    color: #b4e2ff;
    background: #143854;
  }
  .tv-off {
    border: 1px solid #684653;
    color: #ffb5bd;
    background: #2a1b24;
  }
  .television-volume {
    display: grid;
    grid-template-columns: 18px 28px 1fr 28px;
    align-items: center;
    gap: 7px;
    margin: 0 12px 12px;
    padding: 7px 8px;
    border: 1px solid #2b415c;
    border-radius: 8px;
    color: #88b9e7;
    background: #0c1929;
  }
  .television-volume > button {
    width: 28px;
    height: 25px;
    padding: 0;
    border: 1px solid #355471;
    border-radius: 6px;
    color: #d0e7ff;
    background: #153049;
    font-size: 16px;
    line-height: 1;
  }
  .television-volume span {
    color: #d5e6f8;
    font-size: 11px;
    font-weight: 700;
    text-align: center;
  }
  .television-volume.unavailable {
    color: #748aa5;
  }
  .television-volume.unavailable span {
    color: #7e91a8;
    font-size: 10px;
    font-weight: 500;
  }
  .climate-device {
    grid-column: span 2;
    overflow: hidden;
    border: 1px solid #34516c;
    border-radius: 13px;
    background:
      radial-gradient(
        circle at 76% 25%,
        rgba(50, 119, 197, 0.2),
        transparent 28%
      ),
      #101d2d;
  }
  .climate-device.unavailable {
    opacity: 0.68;
  }
  .climate-device header {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 13px 14px;
    border-bottom: 1px solid #203852;
  }
  .climate-device header > span {
    display: grid;
    place-items: center;
    width: 31px;
    height: 31px;
    border-radius: 9px;
    color: #75baff;
    background: #173452;
  }
  .climate-device header div {
    flex: 1;
  }
  .climate-device header small,
  .climate-device header strong {
    display: block;
  }
  .climate-device header small {
    color: #8299b8;
    font-size: 9px;
    letter-spacing: 0.08em;
  }
  .climate-device header strong {
    margin-top: 2px;
    color: #eaf3ff;
    font-size: 13px;
  }
  .climate-device header em {
    padding: 5px 7px;
    border-radius: 8px;
    color: #9fb4ce;
    background: #152942;
    font-size: 10px;
    font-style: normal;
  }
  .climate-device.is-on header em {
    color: #7ce1bb;
    background: #133e37;
  }
  .climate-readout {
    display: grid;
    place-items: center;
    min-height: 123px;
    margin: 13px 14px;
    border: 1px solid #213950;
    border-radius: 12px;
    background: linear-gradient(145deg, #132a42, #0e1b2c);
    text-align: center;
  }
  .climate-readout span {
    color: #f1f6ff;
    font-size: 36px;
    letter-spacing: -0.06em;
  }
  .climate-readout sup {
    margin-left: 3px;
    color: #7ca5d4;
    font-size: 13px;
    letter-spacing: 0;
  }
  .climate-readout small {
    display: block;
    margin-top: 4px;
    color: #91a6c2;
    font-size: 10px;
  }
  .climate-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    padding: 0 14px 10px;
  }
  .climate-actions button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    height: 37px;
    border: 1px solid #315271;
    border-radius: 8px;
    color: #bedaf7;
    background: #132941;
    font-size: 11px;
    font-weight: 700;
  }
  .climate-actions button:last-child {
    border-color: #5b4652;
    color: #f3b8bf;
    background: #271c24;
  }
  .temperature-control {
    padding: 0 14px 14px;
  }
  .temperature-control label {
    display: block;
    margin-bottom: 6px;
    color: #8ca6c5;
    font-size: 10px;
  }
  .temperature-control > div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 39px;
    border: 1px solid #294966;
    border-radius: 8px;
    background: #0c1a2a;
  }
  .temperature-control button {
    display: grid;
    place-items: center;
    width: 40px;
    height: 100%;
    border: 0;
    color: #9ecbfa;
    background: #142c46;
    font-size: 22px;
    font-weight: 500;
  }
  .temperature-control button:last-child {
    color: #fff;
    background: #176ec8;
  }
  .temperature-control > div > span {
    display: flex;
    align-items: center;
  }
  .temperature-control input {
    width: 48px;
    border: 0;
    outline: 0;
    color: #edf5ff;
    background: transparent;
    text-align: right;
    font: inherit;
    font-size: 16px;
    letter-spacing: -0.03em;
  }
  .temperature-control > div > span small {
    margin-left: 2px;
    color: #7ca6d2;
    font-size: 11px;
  }
  .climate-device .device-settings {
    padding: 0 14px 14px;
  }
  .notice {
    gap: 12px;
    margin-bottom: 16px;
    padding: 13px 15px;
    border: 1px solid #795443;
    border-radius: 11px;
    color: #ffcc9e;
    background: #2b211d;
  }
  .notice div {
    flex: 1;
  }
  .notice strong,
  .notice span {
    display: block;
  }
  .notice strong {
    font-size: 12px;
  }
  .notice span {
    margin-top: 3px;
    color: #d8b092;
    font-size: 11px;
  }
  .notice button {
    color: #ffd2af;
    background: transparent;
  }
  .loading,
  .empty {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 220px;
    border: 1px dashed #304964;
    border-radius: 14px;
    color: #98acca;
    gap: 9px;
    font-size: 13px;
  }
  .empty {
    grid-column: 1/-1;
    min-height: 120px;
  }
  .spin {
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  .device-settings {
    grid-template-columns: 1fr 1fr auto;
  }
  .visibility-toggle {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 0 8px;
    border: 1px solid #315474;
    border-radius: 7px;
    color: #a8c5e4;
    background: #11263c;
    font-size: 10px;
    font-weight: 700;
  }
  .climate-device .visibility-toggle {
    height: 32px;
  }
  .room-editor {
    flex-wrap: wrap;
  }
  .room-create {
    display: flex;
    gap: 8px;
  }
  @media (max-width: 1000px) {
    .overview {
      grid-template-columns: repeat(2, 1fr);
    }
    .rooms {
      grid-template-columns: 1fr;
    }
  }
  @media (max-width: 650px) {
    .home-hero,
    .command-bar,
    .room-editor {
      align-items: flex-start;
      flex-direction: column;
    }
    .hero-actions,
    .command-actions {
      width: 100%;
      justify-content: space-between;
    }
    .connection {
      padding-left: 0;
    }
    .overview,
    .device-grid,
    .camera-grid {
      grid-template-columns: 1fr;
    }
    .camera-grid:has(.camera-card.is-live) {
      grid-template-columns: 1fr;
    }
    .camera-card.is-live {
      grid-column: 1;
    }
    .climate-device {
      grid-column: auto;
    }
    .home-hero {
      padding: 20px;
    }
    h1 {
      font-size: 21px;
    }
    .device-grid {
      gap: 7px;
    }
    .filters {
      width: 100%;
      flex-direction: column;
    }
    .command-bar .search,
    .filters select {
      width: 100%;
      max-width: none;
      min-height: 45px;
      box-sizing: border-box;
    }
    .organize,
    .all-off {
      flex: 1;
      justify-content: center;
    }
    .room-editor > div:last-child {
      width: 100%;
      flex-direction: column;
    }
    .room-editor input,
    .room-editor button {
      width: 100%;
      box-sizing: border-box;
      min-height: 38px;
    }
    .room-editor button {
      justify-content: center;
    }
    .room > header {
      align-items: flex-start;
      gap: 10px;
    }
    .room-rename-inline {
      width: 100%;
    }
    .room-rename-inline input {
      width: 100%;
    }
    .room-actions {
      flex-shrink: 0;
    }
    .monitoring-header {
      align-items: flex-start;
    }
  }
`;
