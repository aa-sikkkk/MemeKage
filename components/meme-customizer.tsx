import { useState } from "react"
import { Button } from "./ui/button"
import { Slider } from "./ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Label } from "./ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Input } from "./ui/input"
import { Switch } from "./ui/switch"
import { 
  Type, 
  Image as ImageIcon, 
  Layers, 
  Palette, 
  Sparkles,
  Move,
  RotateCw,
  Wand2
} from "lucide-react"
import { Sticker, AVAILABLE_STICKERS } from "./sticker"

interface MemeCustomizerProps {
  onCustomize: (settings: MemeSettings) => void
  settings: MemeSettings
}

export interface MemeSettings {
  text: {
    top: string
    bottom: string
    font: string
    size: number
    color: string
    strokeColor: string
    strokeWidth: number
    position: {
      x: number
      y: number
    }
    rotation: number
  }
  effects: {
    brightness: number
    contrast: number
    saturation: number
    blur: number
  }
  filters: string[]
  stickers: string[]
  dalle: {
    enabled: boolean
    prompt: string
    style: string
    size: "256x256" | "512x512" | "1024x1024"
  }
}

const AVAILABLE_FONTS = [
  "Impact",
  "Arial",
  "Comic Sans MS",
  "Times New Roman",
  "Verdana",
  "Courier New",
  "Georgia",
  "Trebuchet MS",
  "Helvetica",
  "Tahoma"
]

const AVAILABLE_FILTERS = [
  { id: "grayscale", name: "Grayscale" },
  { id: "sepia", name: "Sepia" },
  { id: "invert", name: "Invert" },
  { id: "hue-rotate", name: "Hue Rotate" },
  { id: "saturate", name: "Saturate" }
]

const DALL_E_STYLES = [
  "anime",
  "cartoon",
  "pixel art",
  "watercolor",
  "oil painting",
  "sketch",
  "3D render",
  "photorealistic"
]

export function MemeCustomizer({ onCustomize, settings }: MemeCustomizerProps) {
  const [activeTab, setActiveTab] = useState("text")

  const handleTextChange = (field: keyof MemeSettings["text"], value: any) => {
    onCustomize({
      ...settings,
      text: {
        ...settings.text,
        [field]: value
      }
    })
  }

  const handleEffectChange = (field: keyof MemeSettings["effects"], value: number) => {
    onCustomize({
      ...settings,
      effects: {
        ...settings.effects,
        [field]: value
      }
    })
  }

  const handleFilterToggle = (filterId: string) => {
    const newFilters = settings.filters.includes(filterId)
      ? settings.filters.filter(f => f !== filterId)
      : [...settings.filters, filterId]
    
    onCustomize({
      ...settings,
      filters: newFilters
    })
  }

  const handleStickerToggle = (stickerName: string) => {
    const newStickers = settings.stickers.includes(stickerName)
      ? settings.stickers.filter(s => s !== stickerName)
      : [...settings.stickers, stickerName]
    
    onCustomize({
      ...settings,
      stickers: newStickers
    })
  }

  const handleDalleToggle = (enabled: boolean) => {
    onCustomize({
      ...settings,
      dalle: {
        ...settings.dalle,
        enabled
      }
    })
  }

  const handleDalleChange = (field: keyof MemeSettings["dalle"], value: any) => {
    onCustomize({
      ...settings,
      dalle: {
        ...settings.dalle,
        [field]: value
      }
    })
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-white/5 backdrop-blur-sm rounded-lg p-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-6 mb-4">
          <TabsTrigger value="text">
            <Type className="h-4 w-4 mr-2" />
            Text
          </TabsTrigger>
          <TabsTrigger value="position">
            <Move className="h-4 w-4 mr-2" />
            Position
          </TabsTrigger>
          <TabsTrigger value="effects">
            <Palette className="h-4 w-4 mr-2" />
            Effects
          </TabsTrigger>
          <TabsTrigger value="filters">
            <Sparkles className="h-4 w-4 mr-2" />
            Filters
          </TabsTrigger>
          <TabsTrigger value="stickers">
            <Layers className="h-4 w-4 mr-2" />
            Stickers
          </TabsTrigger>
          <TabsTrigger value="dalle">
            <Wand2 className="h-4 w-4 mr-2" />
            DALL-E
          </TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="space-y-4">
          <div className="space-y-2">
            <Label>Top Text</Label>
            <Input
              value={settings.text.top}
              onChange={(e) => handleTextChange("top", e.target.value)}
              placeholder="Enter top text"
            />
          </div>
          <div className="space-y-2">
            <Label>Bottom Text</Label>
            <Input
              value={settings.text.bottom}
              onChange={(e) => handleTextChange("bottom", e.target.value)}
              placeholder="Enter bottom text"
            />
          </div>
          <div className="space-y-2">
            <Label>Font</Label>
            <Select
              value={settings.text.font}
              onValueChange={(value) => handleTextChange("font", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_FONTS.map((font) => (
                  <SelectItem key={font} value={font}>
                    {font}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Font Size</Label>
            <Slider
              value={[settings.text.size]}
              onValueChange={([value]) => handleTextChange("size", value)}
              min={20}
              max={100}
              step={1}
            />
          </div>
          <div className="space-y-2">
            <Label>Text Color</Label>
            <Input
              type="color"
              value={settings.text.color}
              onChange={(e) => handleTextChange("color", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Stroke Color</Label>
            <Input
              type="color"
              value={settings.text.strokeColor}
              onChange={(e) => handleTextChange("strokeColor", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Stroke Width</Label>
            <Slider
              value={[settings.text.strokeWidth]}
              onValueChange={([value]) => handleTextChange("strokeWidth", value)}
              min={0}
              max={10}
              step={0.5}
            />
          </div>
        </TabsContent>

        <TabsContent value="position" className="space-y-4">
          <div className="space-y-2">
            <Label>X Position</Label>
            <Slider
              value={[settings.text.position.x]}
              onValueChange={([value]) => handleTextChange("position", { ...settings.text.position, x: value })}
              min={-100}
              max={100}
              step={1}
            />
          </div>
          <div className="space-y-2">
            <Label>Y Position</Label>
            <Slider
              value={[settings.text.position.y]}
              onValueChange={([value]) => handleTextChange("position", { ...settings.text.position, y: value })}
              min={-100}
              max={100}
              step={1}
            />
          </div>
          <div className="space-y-2">
            <Label>Rotation</Label>
            <Slider
              value={[settings.text.rotation]}
              onValueChange={([value]) => handleTextChange("rotation", value)}
              min={-180}
              max={180}
              step={1}
            />
          </div>
        </TabsContent>

        <TabsContent value="effects" className="space-y-4">
          <div className="space-y-2">
            <Label>Brightness</Label>
            <Slider
              value={[settings.effects.brightness]}
              onValueChange={([value]) => handleEffectChange("brightness", value)}
              min={0}
              max={200}
              step={1}
            />
          </div>
          <div className="space-y-2">
            <Label>Contrast</Label>
            <Slider
              value={[settings.effects.contrast]}
              onValueChange={([value]) => handleEffectChange("contrast", value)}
              min={0}
              max={200}
              step={1}
            />
          </div>
          <div className="space-y-2">
            <Label>Saturation</Label>
            <Slider
              value={[settings.effects.saturation]}
              onValueChange={([value]) => handleEffectChange("saturation", value)}
              min={0}
              max={200}
              step={1}
            />
          </div>
          <div className="space-y-2">
            <Label>Blur</Label>
            <Slider
              value={[settings.effects.blur]}
              onValueChange={([value]) => handleEffectChange("blur", value)}
              min={0}
              max={10}
              step={0.1}
            />
          </div>
        </TabsContent>

        <TabsContent value="filters" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {AVAILABLE_FILTERS.map((filter) => (
              <button
                key={filter.id}
                onClick={() => handleFilterToggle(filter.id)}
                className={`p-4 rounded-lg border transition-all ${
                  settings.filters.includes(filter.id)
                    ? "border-purple-500 bg-purple-500/10"
                    : "border-gray-200 hover:border-purple-300"
                }`}
              >
                {filter.name}
              </button>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="stickers" className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {AVAILABLE_STICKERS.map((sticker) => (
              <Sticker
                key={sticker.name}
                name={sticker.name}
                src={sticker.src}
                onClick={() => handleStickerToggle(sticker.name)}
                isSelected={settings.stickers.includes(sticker.name)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="dalle" className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Enable DALL-E Background</Label>
            <Switch
              checked={settings.dalle.enabled}
              onCheckedChange={handleDalleToggle}
            />
          </div>

          {settings.dalle.enabled && (
            <>
              <div className="space-y-2">
                <Label>Prompt</Label>
                <Input
                  value={settings.dalle.prompt}
                  onChange={(e) => handleDalleChange("prompt", e.target.value)}
                  placeholder="Describe your background..."
                />
              </div>

              <div className="space-y-2">
                <Label>Style</Label>
                <Select
                  value={settings.dalle.style}
                  onValueChange={(value) => handleDalleChange("style", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    {DALL_E_STYLES.map((style) => (
                      <SelectItem key={style} value={style}>
                        {style}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Image Size</Label>
                <Select
                  value={settings.dalle.size}
                  onValueChange={(value) => handleDalleChange("size", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="256x256">256x256</SelectItem>
                    <SelectItem value="512x512">512x512</SelectItem>
                    <SelectItem value="1024x1024">1024x1024</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
} 