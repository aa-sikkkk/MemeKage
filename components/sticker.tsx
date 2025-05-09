import Image from "next/image"

interface StickerProps {
  name: string
  src: string
  onClick: () => void
  isSelected: boolean
}

export function Sticker({ name, src, onClick, isSelected }: StickerProps) {
  return (
    <button
      onClick={onClick}
      className={`relative w-16 h-16 rounded-lg overflow-hidden transition-all ${
        isSelected ? "ring-2 ring-purple-500" : "hover:ring-2 hover:ring-purple-300"
      }`}
    >
      <Image
        src={src}
        alt={name}
        fill
        className="object-contain p-1"
      />
    </button>
  )
}

export const AVAILABLE_STICKERS = [
  { name: "laugh", src: "/stickers/laugh.png" },
  { name: "cry", src: "/stickers/cry.png" },
  { name: "surprised", src: "/stickers/surprised.png" },
  { name: "angry", src: "/stickers/angry.png" },
  { name: "cool", src: "/stickers/cool.png" },
  { name: "heart", src: "/stickers/heart.png" },
  { name: "fire", src: "/stickers/fire.png" },
  { name: "star", src: "/stickers/star.png" },
  { name: "crown", src: "/stickers/crown.png" },
] as const 