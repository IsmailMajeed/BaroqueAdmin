import React, { useContext, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { userContext } from '../userContext';

function Settings() {
  const { user } = useContext(userContext);
  const navigation = useNavigate();
  useEffect(() => {
    if (!user.email) {
      navigation('/Account/Login');
      return;
    }
  }, []);

  function getToken() {
    return localStorage.getItem('token');
  }
  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigation('/Account/Login')
      return;
    }
  }, []);
  return (
    <div>
      <Link onClick={() => {
        localStorage.removeItem('token')
      }} to='/Account/Login'
        className='no-underline text-white bg-black px-3 py-2 flex gap-2 max-w-fit items-center rounded-md'
      >
        <span>Logout</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
        </svg>
      </Link>
      <div className='mt-3'>
        <label htmlFor="admin">Admin email</label>
        <input type="email" id="admin" disabled={true} value={user.email} />
      </div>
    </div>
  )
}

export default Settings