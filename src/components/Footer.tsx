import React from 'react';

const Footer = () => {
  return (
    <div className="w-full flex flex-col lg:flex-row gap-4 lg:gap-6 px-4 md:px-8 py-8 md:py-10">

      {/* Left Image */}
      <div className="w-full lg:w-1/3 flex justify-center items-stretch">
        <div className="relative w-full h-full overflow-hidden rounded-3xl">
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"
            alt="Nature"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 group-hover:rotate-1 rounded-3xl"
          />
        </div>
      </div>

      {/* Right Footer Content */}
      <footer className="w-full lg:w-2/3 bg-[#2C3E2E] rounded-3xl p-6 md:p-8 flex flex-col justify-between overflow-hidden">
        <div className="flex flex-col justify-between h-full">

          {/* Links Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8">
            <div className="flex flex-col space-y-3">
              <h3 className="text-[#7A9B76] font-bold text-xs uppercase tracking-widest mb-2">Navigation</h3>
              <a href="/" className="footer-link text-[#F5F3EF] text-xl tracking-tight w-fit">home</a>
              <a href="/hikes/list" className="footer-link text-[#F5F3EF] text-xl tracking-tight w-fit">hikes</a>
              <a href="/dashboard" className="footer-link text-[#F5F3EF] text-xl tracking-tight w-fit">profile</a>
            </div>

            <div className="flex flex-col space-y-3">
              <h3 className="text-[#7A9B76] font-bold text-xs uppercase tracking-widest mb-2">Legal</h3>
              <a href="#" className="footer-link text-[#F5F3EF] text-xl tracking-tight w-fit">privacy</a>
              <a href="#" className="footer-link text-[#F5F3EF] text-xl tracking-tight w-fit">cookies</a>
            </div>

            <div className="flex flex-col space-y-3">
              <h3 className="text-[#7A9B76] font-bold text-xs uppercase tracking-widest mb-2">Social</h3>
              <a href="https://instagram.com" className="footer-link text-[#F5F3EF] text-xl tracking-tight w-fit">instagram</a>
              <a href="https://youtube.com" className="footer-link text-[#F5F3EF] text-xl tracking-tight w-fit">youtube</a>
            </div>
          </div>

          {/* Huge HIKEE Text */}
          <div className="w-full overflow-hidden mt-auto mb-4">
            <h1
              className="w-full font-extrabold text-[#E8E4DD] select-none leading-[0.85] tracking-tight"
              style={{ fontSize: 'clamp(6rem, 12vw, 22rem)' }}
            >
              HIKEE
            </h1>
          </div>

          {/* Bottom info */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-[#7A9B76]">
            <p>© 2024 HIKEE. All rights reserved.</p>
            <p className="text-[#7A9B76]/70">Made by <a href="https://marie-camilo.fr/">Marie CAMILO--MARCHAL</a> & Charlotte DUVERGER</p>
          </div>
        </div>

        <style>{`
          .footer-link {
            position: relative;
            display: inline-block;
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          }
          .footer-link::before {
            content: '';
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            background: #D87855;
            transform: scaleX(0);
            transform-origin: left;
            transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
            z-index: -1;
          }
          .footer-link:hover {
            color: white;
            transform: translateY(-2px);
          }
          .footer-link:hover::before {
            transform: scaleX(1);
          }
          @media (max-width: 640px) {
            .footer-link:hover {
              transform: translateY(-1px);
            }
          }
        `}</style>
      </footer>
    </div>
  );
};

export default Footer;
