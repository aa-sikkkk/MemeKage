// You can customize the footer here as per your will 

export default function Footer() {
  return (
    <footer className="mt-16 pb-8 text-center text-purple-300 text-sm">
      <p>MemeKage &copy; {new Date().getFullYear()}</p>
      <p className="mt-2 text-purple-400/60">Built with ❤ By Aashik | Next.js, Tailwind CSS, and Hugging Face AI</p>
    </footer>
  )
}
