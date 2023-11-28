import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Spinner from '../Components/Spinner'
import { PREFIX } from "../Constants";

export default function Featured() {
  const [bigImg, setBigImg] = useState()
  const [smallImg, setSmallImg] = useState()
  const [featured, setFeatured] = useState(null)
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigate();

  function reset(featured) {
    setBigImg(featured.bigImg)
    setSmallImg(featured.smallImg)
  }
  function getToken() {
    return localStorage.getItem('token')
  }

  useEffect(() => {
    const token = getToken()
    if (!token) {
      navigation('/Account/Login');
      return;
    }
    const config = {
      headers: {
        'x-access-token': token,
      }
    }
    setIsLoading(true)
    axios.get('/Featured/getFeatured', config).then(res => {
      if (res.data.message === 'jwt expired') {
        navigation('/Account/Login');
        return;
      }
      setFeatured(res.data[0])
      reset(res.data[0]);
      setIsLoading(false)
    }).catch(err => {
      setIsLoading(false)
      console.log(err)
    })
  }, []);

  async function saveFeatured(ev) {
    ev.preventDefault();
    const token = getToken()
    if (!token) {
      navigation('/Account/Login');
      return;
    }
    const config = {
      headers: {
        'x-access-token': token,
        'content-type': 'multipart/form-data'
      }
    }

    const formData = new FormData();
    if (bigImg instanceof File) {
      formData.append('file1', bigImg);
    }
    if (smallImg instanceof File) {
      formData.append('file2', smallImg);
    }
    setIsLoading(true)
    await axios.put(`/Featured/updateFeatured/${featured._id}`, formData, config).then(res => {
      if (res.data.message === 'jwt expired') {
        navigation('/Account/Login');
        return;
      }
      console.log(res.data);
      setFeatured(res.data)
      reset(res.data)
      setIsLoading(false)
    }).catch(err => {
      setIsLoading(false)
      console.log(err)
    });
  }
  return (
    <div>
      {
        isLoading ? (
          <div className='flex justify-center'>
            <Spinner />
          </div>
        ) : (
          <>
            <h1>Featured</h1>
            <form onSubmit={saveFeatured}>
              <div className='flex max-md:flex-col gap-y-5'>
                <div className='flex-grow'>
                  <label>Main Image</label>
                  {bigImg ?
                    (
                      <div className='flex'>
                        <div className='relative flex-grow-0'>
                          {
                            (bigImg instanceof File) ? (
                              <img className='h-24 cursor-pointer rounded-sm shadow-sm' src={URL.createObjectURL(bigImg)} alt="" />
                            ) : (
                              <img className='h-24 cursor-pointer rounded-sm shadow-sm' src={`${PREFIX}${bigImg}`} alt="" />
                            )
                          }
                          <button type="button" onClick={() => setBigImg(null)} className="absolute -top-2 -right-1">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-red-700">
                              <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <label className="w-24 h-24 cursor-pointer text-center flex flex-col items-center justify-center text-sm gap-1 text-primary rounded-sm bg-white shadow-sm border border-primary">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                          </svg>
                          <div>
                            Add image
                          </div>
                          <input type="file" required onChange={ev => setBigImg(ev.target.files[0])} className="hidden" />
                        </label>
                      </>
                    )
                  }
                </div>

                <div className='flex-grow'>
                  <label>Mobile Image</label>
                  {smallImg ?
                    (
                      <div className='flex'>
                        <div className='relative flex-grow-0'>
                          {
                            (smallImg instanceof File) ? (
                              <img className='h-24 cursor-pointer rounded-sm shadow-sm' src={URL.createObjectURL(smallImg)} alt="" />
                            ) : (
                              <img className='h-24 cursor-pointer rounded-sm shadow-sm' src={`${PREFIX}${smallImg}`} alt="" />
                            )
                          }
                          <button type="button" onClick={() => setSmallImg(null)} className="absolute -top-2 -right-1">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-red-700">
                              <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <label className="w-24 h-24 cursor-pointer text-center flex flex-col items-center justify-center text-sm gap-1 text-primary rounded-sm bg-white shadow-sm border border-primary">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                          </svg>
                          <div>
                            Add image
                          </div>
                          <input type="file" required onChange={ev => setSmallImg(ev.target.files[0])} className="hidden" />
                        </label>
                      </>
                    )
                  }
                </div>
              </div>
              <div className='flex gap-2'>
                <button onClick={() => reset(featured)} type='button' className='btn-default px-4 py-2 rounded-md mt-3'>Cancel</button>
                <button disabled={(bigImg === null || !(bigImg instanceof File)) && (smallImg === null || !(smallImg instanceof File))} type='submit' className='bg-primary px-4 py-2 rounded-md text-white mt-3'>Save</button>
              </div>
            </form>
          </>
        )
      }
    </div>
  )
}