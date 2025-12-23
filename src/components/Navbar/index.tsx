import React, { useState } from "react";
import { User } from "lucide-react";
import UserProfile from "../modal/UserProfile";

interface NavbarInterface {
  // Define your interface properties here
}

const Navbar: React.FC<NavbarInterface> = () => {
  const [isModalShow, setIsModalShow] = useState<boolean>(false);
  return (
    <header className='bg-green py-2 px-10 text-white flex items-center justify-between'>
      <img src='./images/logo.png' alt='logo' className="w-60" />
      <button
        className='flex items-center justify-center gap-3 cursor-pointer'
        onClick={() => setIsModalShow(true)}
      >
        <div className='h-10 w-10 rounded-full flex items-center justify-center border-2 border-gray-300'>
          <User color='red' />
        </div>
        <div>Rajat Verma</div>
      </button>
      <UserProfile isModalShow={isModalShow} setIsModalShow={setIsModalShow} />
    </header>
  );
};

export default Navbar;
