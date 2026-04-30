# Geospatial File Visualizer🌍

A web-based **GeoFile Visualizer** built with **Next.js** that allows users to upload, visualize, and manage geospatial vector files directly in the browser.

This app focuses on interactive map visualization with dynamic layer control and modern UI components.

---

## 🚀 Live Demo

🔗 Deployed on **Vercel**  
- https://canvas-one-topaz.vercel.app/

---

## ✨ Features

- Upload and visualize **GeoJSON** files
- Interactive map rendering using **MapLibre GL**
- Support for **multiple layers**
- Change layer **symbology / styling**
- Toggle layer visibility
- Delete layers dynamically
- Global state management with **Redux Toolkit**
- Responsive and modern UI with **Tailwind CSS** and **shadcn/ui**

---

## 🛠 Tech Stack

- **Framework**: Next.js
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Mapping**: MapLibre GL JS
- **State Management**: Redux Toolkit
- **Deployment**: Vercel

---

## 📂 Supported File Formats

### ✅ Currently Supported
- GeoJSON (`.geojson`, `.json`)

### 🚧 Planned Support
- Shapefile (`.shp`)
- GeoPackage (`.gpkg`)
- CSV (latitude / longitude based)

---

## 🧭 Application Workflow

1. User uploads a GeoJSON file
2. File is parsed and stored in Redux state
3. MapLibre renders the data as a new layer
4. Users can:
   - Add multiple layers
   - Change layer symbology
   - Toggle visibility
   - Delete layers

---

## 📦 Installation

```bash
git clone https://github.com/spiro-mukund-nemane/canvas.git
cd canvas
bun install
bun dev