import react from "@vitejs/plugin-react"
import vike from "vike/plugin"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react({ babel: { plugins: ["babel-plugin-react-compiler"] } }), vike()],

  ssr: {
    noExternal: ["react-streaming", "vike-react"],
  },
})
