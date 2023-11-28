import Logo from "./Logo";
import Nav from "./Nav";
import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

export default function Layout({ children }) {
  const [showNav, setShowNav] = useState(false);
  function resize() {
    if (window.innerWidth >= 768) {
      setShowNav(false);
    }
  }
  useEffect(() => {
    window.addEventListener("resize", resize);
  }, []);

  useEffect(() => {
    setShowNav(false);
  }, [useLocation()]);

  return (
    <div className="bg-bgGray min-h-screen ">
      <div className="md:hidden flex items-center p-4">
        <button onClick={() => setShowNav(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path fillRule="evenodd" d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
          </svg>
        </button>
        <div className={"flex grow justify-center mr-6 " + (showNav ? 'hidden' : '')}>
          <Logo show={showNav} />
        </div>
      </div>
      <div className="flex">
        <Nav show={showNav}>
          <button onClick={() => setShowNav(false)} className="absolute right-0 top-0 md:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </Nav>
        <div className="flex-grow p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
}