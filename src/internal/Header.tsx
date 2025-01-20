import logo from "../assets/logo.png";

export const Header = () => {
  return (
    <header className="fixed top-4 left-4 right-4 flex justify-between items-center bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg z-50">
      <div className="flex items-center space-x-3">
        <img src={logo} alt="Logo" className="h-10 object-contain" />
        <p className="font-bold text-lg leading-none flex items-center m-0 h-10">
          <span className="text-logoYellow">Weather</span>
          <span className="text-logoBlue">ly</span>
        </p>
      </div>
      <ul className="hidden lg:flex lg:space-x-6">
        <li className="hover:scale-110 transition-transform">
          <a href="/weather" className="protected-link">Weather</a>
        </li>
        <li className="hover:scale-110 transition-transform">
          <a href="/favourites" className="protected-link">Favourites</a>
        </li>
      </ul>
      <div className="flex items-center space-x-4">
        <a href="/" className="hidden lg:block bg-white text-gray-900 px-4 py-2 rounded-full text-sm font-bold hover:bg-gray-200">
          Home
        </a>
      </div>
    </header>
  );
};
