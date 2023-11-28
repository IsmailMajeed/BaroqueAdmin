import { useEffect, useState } from "react";
import axios from "axios";
import ProductForm from "../../../Components/ProductForm";
import { useNavigate, useParams } from "react-router-dom";
import Spinner from "../../../Components/Spinner";

export default function EditProductPage() {
  const [productInfo, setProductInfo] = useState(null);
  const { id } = useParams();
  const [isGetting, setIsGetting] = useState(false);
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
    setIsGetting(true);
    axios.get(`/Products/getProduct/${id}`, config).then(response => {
      if (response.data.message === 'jwt expired') {
        navigation('/Account/Login');
        return;
      }
      setProductInfo(response.data);
      setIsGetting(false)
    }).catch(err => {
      console.log(err);
      setIsGetting(false)
    });

  }, [id]);
  return (
    <>
      <h1>Edit product</h1>
      {
        isGetting &&
        <div className="h-24 flex items-center justify-center w-full">
          <Spinner />
        </div>
      }
      {productInfo && (
        <ProductForm {...productInfo} />
      )}
    </>
  );
}