export default function Footer() {
  return (
    <footer className="mt-16 pb-8 text-center text-purple-300 text-sm">
      <p>Voice-to-Anime Meme Generator &copy; {new Date().getFullYear()}</p>
      <p className="mt-2 text-purple-400/60">Built with Next.js, Tailwind CSS, and Hugging Face AI</p>
    </footer>
  )
}
