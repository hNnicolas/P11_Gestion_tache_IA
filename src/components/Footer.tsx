export default function Footer() {
  return (
    <footer className="w-full bg-white py-5 px-4 md:px-8 flex flex-col md:flex-row items-center justify-between">
      {/* Logo */}
      <div className="shrink-0 ml-[50px]">
        <img
          src="/images/icons/logo-footer.png"
          alt="Logo Abricot"
          className="h-8 w-auto max-w-full object-contain"
        />
      </div>

      {/* Texte */}
      <p className="small-text text-[--color-sous-texte] mr-20 text-center md:text-left mt-2 md:mt-0 md:ml-4">
        Abricot 2025
      </p>
    </footer>
  );
}
