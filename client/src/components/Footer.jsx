export default function Footer() {
  return (
    <footer className="bg-brand-primary text-white py-6 mt-10 border-t-4 border-brand-secondary">
      <div className="container mx-auto px-4 text-center">
        <div className="flex flex-col items-center gap-2 mb-4">
          <img src="/logo.png" alt="Logo" className="h-8 w-auto bg-white rounded p-1 opacity-80" />
          <p className="text-sm opacity-70">Gestão simplificada, vizinhos felizes.</p>
        </div>
        <p className="text-xs opacity-50">
          &copy; {new Date().getFullYear()} CondoGest 360. Criado por Rafael Maia :D
        </p>
      </div>
    </footer>
  );
}