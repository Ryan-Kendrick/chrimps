import vikeReact from "vike-react/config"
import type { Config } from "vike/types"

// Default config (can be overridden by pages)
// https://vike.dev/config

export default {
  // https://vike.dev/Layout

  // https://vike.dev/head-tags
  title: "Chrimps",
  description: "The Incremental Adventure",

  ssr: false,
  passToClient: ["user"],
  extends: vikeReact,
} satisfies Config
