import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Spinner from "../../../Components/Spinner";

export default function DeleteProductPage() {
  const navigate = useNavigate();
  const [productInfo, setProductInfo] = useState();
  const [isGetting, setIsGetting] = useState(false);

  const { id } = useParams();
  const navigation = useNavigate();
  function getToken() {
    return localStorage.getItem('token');
  }
  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigation('/Account/Login');
      return;
    }
    const config = {
      headers: {
        'x-access-token': token,
      }
    }
    if (!id) {
      return;
    }
    setIsGetting(true)
    axios.get(`/Products/getProduct/${id}`, config).then(response => {
      if (response.data.message === 'jwt expired') {
        navigation('/Account/Login');
        return;
      }
      setProductInfo(response.data)
      setIsGetting(false)
    }).catch(err => {
      console.log(err);
      setIsGetting(false)
    });
  }, [id]);
  function goBack() {
    navigate('/Products')
  }
  async function deleteProduct() {
    const token = getToken();
    if (!token) {
      navigation('/Account/Login');
      return;
    }
    const config = {
      headers: {
        'x-access-token': token,
      }
    }
    await axios.delete(`/Products/deleteProduct/${id}`, config).then(res => {
      if (res.data.message === 'jwt expired') {
        navigation('/Account/Login');
        return;
      }
    })
      .catch(err => {
        console.log(err)
      });
    goBack();
  }
  return (
    <>
      {
        isGetting &&
        <div className="h-24 flex items-center justify-center w-full">
          <Spinner />
        </div>
      }
      <h1 className="text-center">Do you really want to delete
        &nbsp;&quot;{productInfo?.productName}&quot;?
      </h1>
      <div className="flex gap-2 justify-center">
        <button
          onClick={deleteProduct}
          className="btn-red">Yes</button>
        <button
          className="btn-default"
          onClick={goBack}>
          NO
        </button>
      </div>
    </>
  );
}
