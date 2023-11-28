import { useEffect, useState } from "react";
import axios from "axios";
import Spinner from "./Spinner"
import { ReactSortable } from "react-sortablejs";
import { useNavigate } from "react-router-dom";
import { PREFIX } from "../Constants";

export default function ProductForm({
  _id,
  productName: existingproductName,
  price: existingPrice,
  discount: existingDiscount,
  description: existingDescription,
  images: existingImages,
  category: assignedCategory,
  featured: existingFeatured,
  properties: assignedProperties,
  Colours: existingColours,
  Sizes: existingSizes,
}) {
  const navigate = useNavigate();
  const [productName, setproductName] = useState(existingproductName || '');
  const [description, setDescription] = useState(existingDescription || '');
  const [category, setCategory] = useState(assignedCategory || '');
  // const [productProperties, setProductProperties] = useState(assignedProperties || {});
  const [productProperties, setProductProperties] = useState(assignedProperties || []);
  const [price, setPrice] = useState(existingPrice || '');
  const [images, setImages] = useState(existingImages || []);

  const [discount, setDiscount] = useState(existingDiscount || 0);
  const [featured, setFeatured] = useState(existingFeatured || false);
  const [Colours, setColours] = useState(existingColours?.join(',') || '');
  const [Sizes, setSizes] = useState(existingSizes || []);

  const [goToProducts, setGoToProducts] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [categories, setCategories] = useState([]);

  function handleSizes(ev) {
    if (ev.target.checked) {
      setSizes(prev => [...prev, ev.target.id])
    }
    else {
      setSizes(prev => prev.filter(p => p !== ev.target.id));
    }
  }

  function getToken() {
    return localStorage.getItem('token');
  }
  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate('/Account/Login')
      return;
    }

    const config = {
      headers: {
        'x-access-token': token,
      }
    }

    axios.get('/Category/getAllCategories', config).then(result => {
      if (result.data.message === 'jwt expired') {
        navigate('/Account/Login');
        return;
      }
      setCategories(result.data);
    })
  }, []);
  async function saveProduct(ev) {
    ev.preventDefault();

    const token = getToken();
    if (!token) {
      navigate('/Account/Login')
      return;
    }

    const data = {
      productName, price, discount, description, images, category, featured, productProperties,
      Colours: Colours.split(','), Sizes
    };
    const formData = new FormData();
    formData.append("productName", data.productName);
    formData.append("price", data.price);
    formData.append("discount", data.discount);
    formData.append("description", data.description);

    formData.append("category", data.category);
    formData.append("featured", data.featured);

    for (let i = 0; i < data.Colours.length; i++) {
      formData.append("Colours", data.Colours[i]);
    }

    if (data.Sizes.length === 0) {
      formData.append("Sizes", data.Sizes);
    }
    for (let i = 0; i < data.Sizes.length; i++) {
      formData.append("Sizes", data.Sizes[i]);
    }

    for (let i = 0; i < data.images.length; i++) {
      formData.append("images", data.images[i]);
    }

    for (let i = 0; i < data.productProperties.length; i++) {
      const property = data.productProperties[i];
      formData.append(`properties[${i}][name]`, property.name);
      formData.append(`properties[${i}][value]`, property.value);
      // for (let j = 0; j < property.values.length; j++) {
      //   formData.append(`properties[${i}][values][${j}]`, property.values[j]);
      // }
    }

    const config = {
      headers: {
        'x-access-token': token,
        'content-type': 'multipart/form-data'
      }
    }
    if (_id) {
      //update
      await axios.put(`/Products/updateProduct/${_id}`, formData, config).then(res => {
        if (res.data.message === 'jwt expired') {
          navigate('/Account/Login');
          return;
        }
      })
        .catch(err => console.log(err));
    } else {
      //create
      axios.post('/Products/addProduct', formData, config).then(res => {
        if (res.data.message === 'jwt expired') {
          navigate('/Account/Login');
          return;
        }
        console.log(res);
      }).catch(err => console.log(err));
    }
    setGoToProducts(true);
  }
  if (goToProducts) {
    navigate('/Products')
    return;
  }

  function uploadImages(ev) {
    const files = ev.target?.files;

    if (files?.length > 0) {
      setIsUploading(true);
      setTimeout(() => {
        // Append the files to the 'images' state array
        setImages((oldImages) => [...oldImages, ...files]);
        setIsUploading(false);
      }, 1000);
    }
  }

  function updateImagesOrder(images) {
    setImages(images);
  }

  function handleDeleteImage(index) {
    // Create a new array with the selectedImages excluding the image at the given index
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
  }

  // function setProductProp(propName, value) {
  //   setProductProperties(prev => {
  //     const newProductProps = [ ...prev ];
  //     newProductProps[propName] = value;
  //     return newProductProps;
  //   });
  // }

  function setProductProp(propName, value) {
    setProductProperties(prev => {
      const newProductProps = prev.map(prop => {
        if (prop.name === propName) {
          return { ...prop, value: value };
        }
        return prop;
      });

      // If the property doesn't exist, add a new object with name and value properties
      const propertyExists = newProductProps.some(prop => prop.name === propName);
      if (!propertyExists) {
        newProductProps.push({ name: propName, value: value });
      }

      return newProductProps;
    });
  }

  function setProp() {

  }

  const propertiesToFill = [];
  if (categories.length > 0 && category) {
    let catInfo = categories.find(({ _id }) => _id === category);
    propertiesToFill.push(...catInfo.properties);

    if (productProperties.length <= 0) {
      propertiesToFill.forEach(property => {
        setProductProp(property.name, property.values[0])
      })
    }
  }

  return (
    <form onSubmit={saveProduct}>
      <label>Product name</label>
      <input
        required={true}
        type="text"
        placeholder="product name"
        value={productName}
        onChange={ev => setproductName(ev.target.value)} />
      <label>Category</label>
      <select
        required={true}
        value={category}
        onChange={ev => setCategory(ev.target.value)}>
        <option value="">Select a category</option>
        {categories.length > 0 && categories.map(c => (
          <option key={c._id} value={c._id}>{c.categoryName}</option>
        ))}
      </select>
      {propertiesToFill.length > 0 && productProperties.length > 0 && propertiesToFill.map((p, index) => (
        <div key={p.name} className="">
          <label>{p.name[0].toUpperCase() + p.name.substring(1)}</label>
          <div>
            <select value={productProperties[index].value}
              onChange={ev =>
                setProductProp(p.name, ev.target.value)
              }>
              {p.values.map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
        </div>
      ))}
      <label>
        Photos
      </label>
      <div className="mb-2 flex flex-wrap gap-1">
        <ReactSortable
          list={images}
          className="flex flex-wrap gap-1"
          setList={updateImagesOrder}
        >
          {!!images?.length &&
            images.map((link, index) => (
              <div key={index} className="h-24 relative bg-white border border-gray-200">
                {
                  _id
                    ? (
                      link instanceof File ? (
                        <img src={URL.createObjectURL(link)} alt="" />
                      ) : (
                        <img src={`${PREFIX}${link}`} alt="" />
                      )
                    )
                    : (<>
                      <img src={URL.createObjectURL(link)} alt="" />
                    </>)
                }
                <button type="button" onClick={() => handleDeleteImage(index)} className="absolute -top-2 -right-1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-red-700">
                    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
        </ReactSortable>
        {isUploading && (
          <div className="h-24 flex items-center">
            <Spinner />
          </div>
        )}
        <label className="w-24 h-24 cursor-pointer text-center flex flex-col items-center justify-center text-sm gap-1 text-primary rounded-sm bg-white shadow-sm border border-primary">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          <div>
            Add image
          </div>
          <input type="file" name="images" multiple onChange={ev => uploadImages(ev)} className="hidden" />
        </label>
      </div>
      <label>Colours</label>
      <input value={Colours} required={true} onChange={(ev) => setColours(ev.target.value)} type="text" placeholder="Example: Red,White,Black" />
      <label>Description</label>
      <textarea
        required={true}
        placeholder="description"
        value={description}
        onChange={ev => setDescription(ev.target.value)}
      />
      <label>Price (in PKR)</label>
      <input
        required={true}
        type="number" placeholder="price"
        value={price}
        onChange={ev => setPrice(ev.target.value)}
      />
      <label className="mt-1">Sizes</label>
      <div className="flex gap-5 mb-1">
        <div className="flex gap-1">
          <input checked={Sizes.includes('XL') ? true : false} onChange={handleSizes} className="w-auto" type="checkbox" id="XL" />
          <label htmlFor="XL">XL</label>
        </div>
        <div className="flex gap-1">
          <input checked={Sizes.includes('L') ? true : false} onChange={handleSizes} className="w-auto" type="checkbox" id="L" />
          <label htmlFor="L">L</label>
        </div>
        <div className="flex gap-1">
          <input checked={Sizes.includes('M') ? true : false} onChange={handleSizes} className="w-auto" type="checkbox" id="M" />
          <label htmlFor="M">M</label>
        </div>
        <div className="flex gap-1">
          <input checked={Sizes.includes('S') ? true : false} onChange={handleSizes} className="w-auto" type="checkbox" id="S" />
          <label htmlFor="S">S</label>
        </div>
        <div className="flex gap-1">
          <input checked={Sizes.includes('XS') ? true : false} onChange={handleSizes} className="w-auto" type="checkbox" id="XS" />
          <label htmlFor="XS">XS</label>
        </div>
      </div>
      <label>Discount (in %)</label>
      <input
        type="number" placeholder="discount"
        value={discount}
        onChange={ev => {
          if (ev.target.value > 100) {
            setDiscount(100)
          }
          else if (ev.target.value < 0) {
            setDiscount(0)
          }
          else
            setDiscount(ev.target.value)
        }}
      />
      <div className="flex mt-2">
        <input
          className="flex w-auto mr-1"
          id="featured"
          type="checkbox"
          value={featured}
          onChange={ev => setFeatured(ev.target.value)}
        />
        <label for="featured">Featured</label>
      </div>
      <button
        type="submit"
        className="bg-blue-700 py-2 px-4 rounded-md mt-3 text-white">
        Save
      </button>
    </form>
  );
}