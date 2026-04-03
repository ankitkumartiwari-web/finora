"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { MeshGradient, DotOrbit } from "@paper-design/shaders-react"

export default function DemoOne() {
  const { resolvedTheme } = useTheme()
  const [intensity, setIntensity] = useState(1.5)
  const [speed, setSpeed] = useState(1.0)
  const [activeEffect, setActiveEffect] = useState("mesh")
  const [isWebglAvailable, setIsWebglAvailable] = useState(false)

  useEffect(() => {
    const canvas = document.createElement("canvas")
    try {
      const context = canvas.getContext("webgl2") || canvas.getContext("webgl")
      setIsWebglAvailable(Boolean(context))
    } catch {
      setIsWebglAvailable(false)
    }
  }, [])

  const isDark = resolvedTheme === "dark"

  // Light mode: soft, eye-friendly pastel colors
  const lightModeColors = {
    mesh: ["#f8f6ff", "#f0ecff", "#e8e0ff", "#d8ceff"],
    dots: "#c9bfff",
    orbitDots: "#e8e0ff",
    bg: "#f8f6ff",
  }

  // Dark mode: original dramatic colors
  const darkModeColors = {
    mesh: ["#000000", "#1a1a1a", "#333333", "#ffffff"],
    dots: "#333333",
    orbitDots: "#1a1a1a",
    bg: "#000000",
  }

  const colors = isDark ? darkModeColors : lightModeColors

  return (
    <div className={`w-full h-full relative overflow-hidden ${isDark ? "bg-black" : "bg-[#f8f6ff]"}`}>
      {!isWebglAvailable && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(255,255,255,0.45),transparent_34%),radial-gradient(circle_at_78%_16%,rgba(201,191,255,0.45),transparent_38%),radial-gradient(circle_at_60%_80%,rgba(106,198,255,0.28),transparent_36%)]" />
      )}

      {isWebglAvailable && activeEffect === "mesh" && (
        <MeshGradient
          className="w-full h-full absolute inset-0"
          colors={colors.mesh}
          speed={speed}
        />
      )}

      {isWebglAvailable && activeEffect === "dots" && (
        <div className={`w-full h-full absolute inset-0 ${isDark ? "bg-black" : "bg-[#f8f6ff]"}`}>
          <DotOrbit
            className="w-full h-full"
            dotColor={colors.dots}
            orbitColor={colors.orbitDots}
            speed={speed}
            intensity={intensity}
          />
        </div>
      )}

      {isWebglAvailable && activeEffect === "combined" && (
        <>
          <MeshGradient
            className="w-full h-full absolute inset-0"
            colors={colors.mesh}
            speed={speed * 0.5}
            wireframe="true"
          />
          <div className="w-full h-full absolute inset-0 opacity-60">
            <DotOrbit
              className="w-full h-full"
              dotColor={colors.dots}
              orbitColor={colors.orbitDots}
              speed={speed * 1.5}
              intensity={intensity * 0.8}
            />
          </div>
        </>
      )}

      {/* Lighting overlay effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/4 left-1/3 w-32 h-32 bg-gray-800/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: `${3 / speed}s` }}
        />
        <div
          className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-white/2 rounded-full blur-2xl animate-pulse"
          style={{ animationDuration: `${2 / speed}s`, animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/2 right-1/3 w-20 h-20 bg-gray-900/3 rounded-full blur-xl animate-pulse"
          style={{ animationDuration: `${4 / speed}s`, animationDelay: "0.5s" }}
        />
      </div>

    </div>
  )
}
