"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

export default function EarthGlobe() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isInteracting, setIsInteracting] = useState(false)
  const [selectedHotspot, setSelectedHotspot] = useState<number | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Animation arrays
    const animations: (() => void)[] = []

    // Scene setup
    const scene = new THREE.Scene()

    // Add a subtle background gradient
    const bgTexture = new THREE.TextureLoader().load("/space-background.jpg")
    scene.background = bgTexture

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000,
    )
    camera.position.z = 5

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    containerRef.current.appendChild(renderer.domElement)

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.rotateSpeed = 0.5
    controls.enableZoom = true
    controls.minDistance = 3
    controls.maxDistance = 9
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.5

    // Handle interaction state
    controls.addEventListener("start", () => setIsInteracting(true))
    controls.addEventListener("end", () => setIsInteracting(false))

    // Earth texture
    const textureLoader = new THREE.TextureLoader()

    // Load Earth textures with high-quality images
    const earthTexture = textureLoader.load("/earth-daymap.jpg")
    const earthBumpMap = textureLoader.load("/earth-bump.jpg")
    const earthSpecularMap = textureLoader.load("/earth-specular.jpg")
    const earthNightMap = textureLoader.load("/earth-nightmap.jpg")
    const cloudsTexture = textureLoader.load("/earth-clouds.png")

    // Create a shader material for Earth with day/night transition
    const earthCustomMaterial = new THREE.ShaderMaterial({
      uniforms: {
        dayTexture: { value: earthTexture },
        nightTexture: { value: earthNightMap },
        bumpTexture: { value: earthBumpMap },
        specularTexture: { value: earthSpecularMap },
        lightDirection: { value: new THREE.Vector3(1, 0, 1).normalize() },
        bumpScale: { value: 0.15 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D dayTexture;
        uniform sampler2D nightTexture;
        uniform sampler2D bumpTexture;
        uniform sampler2D specularTexture;
        uniform vec3 lightDirection;
        uniform float bumpScale;
        
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          vec3 normal = normalize(vNormal);
          float lightIntensity = max(0.0, dot(normal, lightDirection));
          
          // Apply bump mapping
          vec3 bumpValue = texture2D(bumpTexture, vUv).rgb;
          vec3 newNormal = normal + bumpScale * (bumpValue - 0.5);
          newNormal = normalize(newNormal);
          
          // Recalculate light intensity with bump mapping
          float bumpLightIntensity = max(0.0, dot(newNormal, lightDirection));
          
          // Get day and night textures
          vec4 dayColor = texture2D(dayTexture, vUv);
          vec4 nightColor = texture2D(nightTexture, vUv);
          
          // Blend between day and night based on light intensity
          vec4 color = mix(nightColor, dayColor, smoothstep(0.0, 0.3, bumpLightIntensity));
          
          // Add specular highlight
          vec3 viewDirection = normalize(-vPosition);
          vec3 halfVector = normalize(lightDirection + viewDirection);
          float specularIntensity = pow(max(0.0, dot(newNormal, halfVector)), 32.0);
          vec3 specular = specularIntensity * texture2D(specularTexture, vUv).rgb;
          
          // Add atmosphere at edges
          float atmosphereIntensity = 1.0 - max(0.0, dot(normal, viewDirection));
          vec3 atmosphere = vec3(0.1, 0.5, 1.0) * pow(atmosphereIntensity, 2.0) * 0.5;
          
          gl_FragColor = vec4(color.rgb + specular + atmosphere, 1.0);
        }
      `,
    })

    // Earth
    const earthGeometry = new THREE.SphereGeometry(2, 128, 128)
    const earthMesh = new THREE.Mesh(earthGeometry, earthCustomMaterial)
    scene.add(earthMesh)

    // Clouds
    const cloudGeometry = new THREE.SphereGeometry(2.05, 64, 64)
    const cloudMaterial = new THREE.MeshPhongMaterial({
      map: cloudsTexture,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
    })

    const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial)
    scene.add(cloudMesh)

    // Atmosphere glow
    const atmosphereGeometry = new THREE.SphereGeometry(2.1, 64, 64)
    const atmosphereMaterial = new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: new THREE.Color(0x00ffaa) },
        viewVector: { value: camera.position },
      },
      vertexShader: `
        uniform vec3 viewVector;
        varying float intensity;
        void main() {
          vec3 vNormal = normalize(normalMatrix * normal);
          vec3 vNormel = normalize(normalMatrix * viewVector);
          intensity = pow(0.7 - dot(vNormal, vNormel), 4.0);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        varying float intensity;
        void main() {
          vec3 glow = glowColor * intensity;
          gl_FragColor = vec4(glow, 1.0);
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
    })

    const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial)
    scene.add(atmosphereMesh)

    // Add a subtle grid overlay
    const gridGeometry = new THREE.SphereGeometry(2.02, 36, 36)
    const gridMaterial = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      wireframe: true,
      transparent: true,
      opacity: 0.1,
    })

    const gridMesh = new THREE.Mesh(gridGeometry, gridMaterial)
    scene.add(gridMesh)

    // Lights
    const ambientLight = new THREE.AmbientLight(0x333333)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5)
    directionalLight.position.set(5, 3, 5)
    scene.add(directionalLight)

    // Add a subtle point light for atmosphere
    const pointLight = new THREE.PointLight(0x00ffaa, 0.5, 10)
    pointLight.position.set(-5, 3, 5)
    scene.add(pointLight)

    // Add stars
    const starGeometry = new THREE.BufferGeometry()
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.05,
      transparent: true,
      blending: THREE.AdditiveBlending,
    })

    const starVertices = []
    for (let i = 0; i < 10000; i++) {
      const x = (Math.random() - 0.5) * 2000
      const y = (Math.random() - 0.5) * 2000
      const z = (Math.random() - 0.5) * 2000
      if (Math.abs(x) > 10 || Math.abs(y) > 10 || Math.abs(z) > 10) {
        starVertices.push(x, y, z)
      }
    }

    starGeometry.setAttribute("position", new THREE.Float32BufferAttribute(starVertices, 3))
    const stars = new THREE.Points(starGeometry, starMaterial)
    scene.add(stars)

    // Add hotspots
    const hotspots = [
      { lat: 40.7128, lng: -74.006, color: 0x22c55e, name: "New York", info: "Urban development monitoring" },
      { lat: 51.5074, lng: -0.1278, color: 0x3b82f6, name: "London", info: "Flood risk assessment" },
      { lat: 35.6762, lng: 139.6503, color: 0x22c55e, name: "Tokyo", info: "Earthquake impact analysis" },
      { lat: 35.6762, lng: 139.6503, color: 0x22c55e, name: "Tokyo", info: "Earthquake impact analysis" },
      { lat: -33.8688, lng: 151.2093, color: 0xf97316, name: "Sydney", info: "Wildfire monitoring" },
      { lat: -1.2921, lng: 36.8219, color: 0xef4444, name: "Nairobi", info: "Deforestation tracking" },
      { lat: -23.5505, lng: -46.6333, color: 0xef4444, name: "São Paulo", info: "Urban expansion analysis" },
      { lat: 19.4326, lng: -99.1332, color: 0xf97316, name: "Mexico City", info: "Air quality monitoring" },
      { lat: 28.6139, lng: 77.209, color: 0x3b82f6, name: "New Delhi", info: "Agricultural yield prediction" },
    ]

    const hotspotMeshes: THREE.Mesh[] = []
    const hotspotGroups: THREE.Group[] = []
    const targetingBoxes: THREE.LineSegments[] = []

    hotspots.forEach((hotspot, index) => {
      // Convert lat/lng to 3D coordinates
      const phi = (90 - hotspot.lat) * (Math.PI / 180)
      const theta = (hotspot.lng + 180) * (Math.PI / 180)

      const x = -(2 * Math.sin(phi) * Math.cos(theta))
      const y = 2 * Math.cos(phi)
      const z = 2 * Math.sin(phi) * Math.sin(theta)

      // Create hotspot group
      const hotspotGroup = new THREE.Group()
      hotspotGroup.position.set(x, y, z)
      hotspotGroup.lookAt(0, 0, 0)
      scene.add(hotspotGroup)
      hotspotGroups.push(hotspotGroup)

      // Create hotspot with a more advanced look
      const hotspotGeometry = new THREE.SphereGeometry(0.03, 16, 16)
      const hotspotMaterial = new THREE.MeshBasicMaterial({ color: hotspot.color })
      const hotspotMesh = new THREE.Mesh(hotspotGeometry, hotspotMaterial)

      // Position slightly above surface
      hotspotMesh.position.set(0, 0, 0.05)
      hotspotGroup.add(hotspotMesh)
      hotspotMeshes.push(hotspotMesh)

      // Add glow
      const glowGeometry = new THREE.SphereGeometry(0.06, 16, 16)
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: hotspot.color,
        transparent: true,
        opacity: 0.7,
      })
      const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial)
      glowMesh.position.set(0, 0, 0.05)
      hotspotGroup.add(glowMesh)

      // Add a ring around the hotspot
      const ringGeometry = new THREE.RingGeometry(0.06, 0.08, 32)
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: hotspot.color,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
      })
      const ring = new THREE.Mesh(ringGeometry, ringMaterial)
      ring.position.set(0, 0, 0.05)
      ring.rotation.x = Math.PI / 2
      hotspotGroup.add(ring)

      // Create targeting box
      const boxSize = 0.15
      const boxGeometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize)
      const edges = new THREE.EdgesGeometry(boxGeometry)
      const targetingBox = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({ color: hotspot.color, transparent: true, opacity: 0 }),
      )
      targetingBox.position.set(0, 0, 0.05)
      hotspotGroup.add(targetingBox)
      targetingBoxes.push(targetingBox)

      // Add a beam from the hotspot to the center
      const beamGeometry = new THREE.CylinderGeometry(0.005, 0.005, 2, 8)
      const beamMaterial = new THREE.MeshBasicMaterial({
        color: hotspot.color,
        transparent: true,
        opacity: 0.3,
      })
      const beam = new THREE.Mesh(beamGeometry, beamMaterial)
      beam.position.set(0, 0, -1)
      beam.rotation.x = Math.PI / 2
      hotspotGroup.add(beam)

      // Pulse animation for glow
      let scale = 1
      let growing = true
      let ringScale = 1
      let ringGrowing = false

      function animateHotspot() {
        // Animate glow
        if (growing) {
          scale += 0.01
          if (scale >= 1.3) growing = false
        } else {
          scale -= 0.01
          if (scale <= 1) growing = true
        }
        glowMesh.scale.set(scale, scale, scale)

        // Animate ring
        if (ringGrowing) {
          ringScale += 0.01
          if (ringScale >= 1.5) ringGrowing = false
        } else {
          ringScale -= 0.01
          if (ringScale <= 0.8) ringGrowing = true
        }
        ring.scale.set(ringScale, ringScale, ringScale)

        // Animate beam opacity
        beam.material.opacity = 0.3 * (0.5 + Math.sin(Date.now() * 0.003) * 0.5)
      }

      // Add to animation loop
      animations.push(animateHotspot)
    })

    // Add satellite
    const satelliteGroup = new THREE.Group()
    scene.add(satelliteGroup)

    // Create satellite body with more detail
    const satelliteBody = new THREE.Group()

    // Main body
    const bodyGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.4)
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      metalness: 0.8,
      roughness: 0.2,
    })
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
    satelliteBody.add(body)

    // Antenna
    const antennaGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.3, 8)
    const antennaMaterial = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      metalness: 0.8,
      roughness: 0.2,
    })
    const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial)
    antenna.position.set(0, 0.25, 0)
    satelliteBody.add(antenna)

    // Dish
    const dishGeometry = new THREE.SphereGeometry(0.1, 16, 8, 0, Math.PI)
    const dishMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.5,
      roughness: 0.2,
    })
    const dish = new THREE.Mesh(dishGeometry, dishMaterial)
    dish.rotation.x = Math.PI / 2
    dish.position.set(0, 0, 0.25)
    satelliteBody.add(dish)

    satelliteGroup.add(satelliteBody)

    // Add solar panels
    const panelGeometry = new THREE.BoxGeometry(0.8, 0.01, 0.3)
    const panelMaterial = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      metalness: 0.8,
      roughness: 0.2,
    })

    const panel1 = new THREE.Mesh(panelGeometry, panelMaterial)
    panel1.position.x = 0.5
    satelliteBody.add(panel1)

    const panel2 = new THREE.Mesh(panelGeometry, panelMaterial)
    panel2.position.x = -0.5
    satelliteBody.add(panel2)

    // Position satellite in orbit
    satelliteGroup.position.set(3.5, 0, 0)

    // Add data beams from satellite
    const beamGroup = new THREE.Group()
    satelliteGroup.add(beamGroup)

    // Create multiple beams
    for (let i = 0; i < 3; i++) {
      const beamGeometry = new THREE.CylinderGeometry(0.01, 0.05, 4, 8)
      const beamMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffaa,
        transparent: true,
        opacity: 0.3,
      })
      const beam = new THREE.Mesh(beamGeometry, beamMaterial)
      beam.rotation.x = Math.PI / 2 + (i - 1) * 0.2
      beam.rotation.z = (i - 1) * 0.2
      beam.position.z = 0.2
      beamGroup.add(beam)
    }

    // Satellite orbit animation
    let satelliteAngle = 0
    function animateSatellite() {
      satelliteAngle += 0.005
      satelliteGroup.position.x = 3.5 * Math.cos(satelliteAngle)
      satelliteGroup.position.z = 3.5 * Math.sin(satelliteAngle)
      satelliteGroup.rotation.y = satelliteAngle + Math.PI / 2

      // Animate beams
      beamGroup.children.forEach((beam, i) => {
        beam.material.opacity = 0.3 * (0.5 + Math.sin(Date.now() * 0.001 + i) * 0.5)
      })

      // Rotate solar panels to face the sun
      panel1.rotation.y = Math.sin(satelliteAngle * 0.5) * 0.2
      panel2.rotation.y = Math.sin(satelliteAngle * 0.5) * 0.2
    }
    animations.push(animateSatellite)

    // Add a second satellite in a different orbit
    const satellite2Group = new THREE.Group()
    scene.add(satellite2Group)

    // Create a simpler satellite
    const sat2Body = new THREE.BoxGeometry(0.15, 0.15, 0.3)
    const sat2Material = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      metalness: 0.8,
      roughness: 0.2,
    })
    const sat2 = new THREE.Mesh(sat2Body, sat2Material)
    satellite2Group.add(sat2)

    // Add solar panels
    const sat2Panel1 = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.01, 0.2),
      new THREE.MeshStandardMaterial({
        color: 0xf97316,
        metalness: 0.8,
        roughness: 0.2,
      }),
    )
    sat2Panel1.position.x = 0.4
    satellite2Group.add(sat2Panel1)

    const sat2Panel2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.01, 0.2),
      new THREE.MeshStandardMaterial({
        color: 0xf97316,
        metalness: 0.8,
        roughness: 0.2,
      }),
    )
    sat2Panel2.position.x = -0.4
    satellite2Group.add(sat2Panel2)

    // Position satellite in a different orbit
    satellite2Group.position.set(0, 4, 0)

    // Satellite 2 orbit animation
    let satellite2Angle = Math.PI / 2
    function animateSatellite2() {
      satellite2Angle += 0.007
      satellite2Group.position.x = 4 * Math.cos(satellite2Angle)
      satellite2Group.position.y = 4 * Math.sin(satellite2Angle)
      satellite2Group.rotation.z = satellite2Angle + Math.PI / 2
    }
    animations.push(animateSatellite2)

    // Raycaster for interactivity
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    function onMouseMove(event: MouseEvent) {
      // Calculate mouse position in normalized device coordinates
      const rect = renderer.domElement.getBoundingClientRect()
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      // Update the raycaster
      raycaster.setFromCamera(mouse, camera)

      // Check for intersections with hotspots
      const intersects = raycaster.intersectObjects(hotspotMeshes)

      if (intersects.length > 0) {
        const index = hotspotMeshes.indexOf(intersects[0].object as THREE.Mesh)

        // Show targeting box for hovered hotspot
        targetingBoxes.forEach((box, i) => {
          if (i === index) {
            box.material.opacity = 1
          } else if (i !== selectedHotspot) {
            box.material.opacity = 0
          }
        })

        containerRef.current!.style.cursor = "pointer"
      } else {
        // Hide targeting boxes except for selected hotspot
        targetingBoxes.forEach((box, i) => {
          if (i !== selectedHotspot) {
            box.material.opacity = 0
          }
        })

        containerRef.current!.style.cursor = "default"
      }
    }

    function onClick(event: MouseEvent) {
      // Calculate mouse position in normalized device coordinates
      const rect = renderer.domElement.getBoundingClientRect()
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      // Update the raycaster
      raycaster.setFromCamera(mouse, camera)

      // Check for intersections with hotspots
      const intersects = raycaster.intersectObjects(hotspotMeshes)

      if (intersects.length > 0) {
        const index = hotspotMeshes.indexOf(intersects[0].object as THREE.Mesh)

        // Update selected hotspot
        setSelectedHotspot((prevSelected) => (prevSelected === index ? null : index))

        // Show targeting box for selected hotspot
        targetingBoxes.forEach((box, i) => {
          box.material.opacity = i === index ? 1 : 0
        })

        // Focus camera on selected hotspot
        if (selectedHotspot !== index) {
          controls.autoRotate = false
          const position = hotspotGroups[index].position.clone().normalize().multiplyScalar(5)

          // Animate camera movement
          const startPosition = camera.position.clone()
          const endPosition = position
          let progress = 0

          function animateCamera() {
            progress += 0.02
            if (progress < 1) {
              camera.position.lerpVectors(startPosition, endPosition, progress)
              camera.lookAt(0, 0, 0)
              return true
            }
            return false
          }

          animations.push(animateCamera)
        } else {
          // Reset camera and enable auto-rotation
          controls.autoRotate = true
        }
      }
    }

    containerRef.current.addEventListener("mousemove", onMouseMove)
    containerRef.current.addEventListener("click", onClick)

    // Animation loop
    function animate() {
      requestAnimationFrame(animate)

      // Update atmosphere shader
      if (atmosphereMaterial.uniforms) {
        atmosphereMaterial.uniforms.viewVector.value = camera.position
      }

      // Rotate clouds slightly faster than Earth
      cloudMesh.rotation.y += 0.0005

      // Rotate grid slightly
      gridMesh.rotation.y += 0.0002
      gridMesh.rotation.x += 0.0001

      // Update controls
      controls.update()

      // Run and filter animations
      const activeAnimations: (() => void)[] = []
      animations.forEach((animation) => {
        const keepAnimation = animation() !== false
        if (keepAnimation) {
          activeAnimations.push(animation)
        }
      })
      animations.length = 0
      animations.push(...activeAnimations)

      // Render
      renderer.render(scene, camera)
    }

    // Handle resize
    function handleResize() {
      if (!containerRef.current) return

      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    }

    window.addEventListener("resize", handleResize)

    // Start animation
    animate()

    // Cleanup
    return () => {
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement)
        containerRef.current.removeEventListener("mousemove", onMouseMove)
        containerRef.current.removeEventListener("click", onClick)
      }
      window.removeEventListener("resize", handleResize)
    }
  }, [selectedHotspot])

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />

      {/* Targeting UI overlay */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {/* Top-left targeting bracket */}
        <div className="absolute top-1/4 left-1/4 w-16 h-16">
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary"></div>
        </div>

        {/* Bottom-right targeting bracket */}
        <div className="absolute bottom-1/4 right-1/4 w-16 h-16">
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary"></div>
        </div>

        {/* HUD elements */}
        <div className="absolute top-4 left-4 text-xs text-primary/70 font-mono">
          STATUS: {isInteracting ? "MANUAL CONTROL" : "AUTO SCAN"}
        </div>
        <div className="absolute top-4 right-4 text-xs text-primary/70 font-mono">
          {new Date().toISOString().split("T")[0]}
        </div>

        {/* Hotspot info display */}
        {selectedHotspot !== null && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-background/80 border border-primary/30 p-4 rounded-md max-w-xs text-center backdrop-blur-md">
            <h3 className="text-primary font-bold">{hotspots[selectedHotspot].name}</h3>
            <p className="text-sm text-muted-foreground">{hotspots[selectedHotspot].info}</p>
            <div className="mt-2 text-xs text-primary/70">Click again to close</div>
          </div>
        )}
      </div>
    </div>
  )
}

// Hotspot data
const hotspots = [
  { lat: 40.7128, lng: -74.006, color: 0x22c55e, name: "New York", info: "Urban development monitoring" },
  { lat: 51.5074, lng: -0.1278, color: 0x3b82f6, name: "London", info: "Flood risk assessment" },
  { lat: 35.6762, lng: 139.6503, color: 0x22c55e, name: "Tokyo", info: "Earthquake impact analysis" },
  { lat: 35.6762, lng: 139.6503, color: 0x22c55e, name: "Tokyo", info: "Earthquake impact analysis" },
  { lat: -33.8688, lng: 151.2093, color: 0xf97316, name: "Sydney", info: "Wildfire monitoring" },
  { lat: -1.2921, lng: 36.8219, color: 0xef4444, name: "Nairobi", info: "Deforestation tracking" },
  { lat: -23.5505, lng: -46.6333, color: 0xef4444, name: "São Paulo", info: "Urban expansion analysis" },
  { lat: 19.4326, lng: -99.1332, color: 0xf97316, name: "Mexico City", info: "Air quality monitoring" },
  { lat: 28.6139, lng: 77.209, color: 0x3b82f6, name: "New Delhi", info: "Agricultural yield prediction" },
]
