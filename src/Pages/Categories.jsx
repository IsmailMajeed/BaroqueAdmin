import { useEffect, useState } from "react";
import axios from "axios";
import { withSwal } from 'react-sweetalert2';
import { useNavigate } from "react-router-dom";
import Spinner from "../Components/Spinner";
import { PREFIX } from "../Constants";

function Categories({ swal }) {
  const [editedCategory, setEditedCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryImage, setCategoryImage] = useState('');
  const [categories, setCategories] = useState([]);
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigate();

  function getToken() {
    return localStorage.getItem('token');
  }

  useEffect(() => {
    fetchCategories();
  }, [])
  function fetchCategories() {
    const token = getToken();
    if (!token) {
      navigation('/Account/Login');
      return;
    }
    const config = {
      headers: {
        'x-access-token': token, // Include the token in the headers
      }
    }
    setIsLoading(true);
    axios.get('/Category/getAllCategories', config).then(result => {
      setIsLoading(false)
      if (result.data.message === 'jwt expired') {
        navigation('/Account/Login');
        return;
      }
      setCategories(result.data);
    }).catch(err => console.log(err));
  }
  async function saveCategory(ev) {
    ev.preventDefault();
    const token = getToken();
    if (!token) {
      navigation('/Account/Login');
      return;
    }

    const data = {
      categoryName,
      categoryImage,
      properties: properties.map(p => {
        return {
          name: p.name,
          values: p.values.split(','),
        }
      }),
    };

    const formData = new FormData();
    formData.append("categoryName", data.categoryName);

    if (data.categoryImage instanceof File) {
      formData.append("file", data.categoryImage);
    }

    for (let i = 0; i < data.properties.length; i++) {
      const property = data.properties[i];
      formData.append(`properties[${i}][name]`, property.name);
      for (let j = 0; j < property.values.length; j++) {
        formData.append(`properties[${i}][values][${j}]`, property.values[j]);
      }
    }


    const config = {
      headers: {
        'x-access-token': token, // Include the token in the headers
        'content-type': 'multipart/form-data'
      }
    }
    if (editedCategory) {
      await axios.put(`/Category/updateCategory/${editedCategory._id}`, formData, config).then(res => {
        if (res.data.message === 'jwt expired') {
          navigation('/Account/Login');
          return;
        }
      })
        .catch(err => {
          console.log(err)
        });
      setEditedCategory(null);
    } else {
      await axios.post('/Category/', formData, config)
        .then(res => {
          if (res.data.message === 'jwt expired') {
            navigation('/Account/Login');
            return;
          }
        })
        .catch(err => {
          console.log(err)
        });
    }
    setCategoryName('');
    setCategoryImage('');
    setProperties([]);
    fetchCategories();
  }
  function editCategory(category) {
    setEditedCategory(category);
    setCategoryName(category.categoryName);
    setCategoryImage(category.categoryImage);
    setProperties(
      category.properties.map(({ name, values }) => ({
        name,
        values: values.join(',')
      }))
    );
  }

  function deleteCategory(category) {
    const token = getToken();
    if (!token) {
      navigation('/Account/Login');
      return;
    }
    const config = {
      headers: {
        'x-access-token': token, // Include the token in the headers
      }
    }
    swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete ${category.categoryName}?`,
      showCancelButton: true,
      cancelButtonText: 'Cancel',
      confirmButtonText: 'Yes, Delete!',
      confirmButtonColor: '#d55',
      reverseButtons: true,
    }).then(async result => {
      if (result.isConfirmed) {
        const { _id } = category;
        await axios.delete(`/Category/deleteCategory/${_id}`, config).then(res => {
          if (res.data.message === 'jwt expired') {
            navigation('/Account/Login');
            return;
          }
          console.log(res)
        })
          .catch(err => {
            console.log(err);
          });
        fetchCategories();
      }
    });
  }

  function addProperty() {
    setProperties(prev => {
      return [...prev, { name: '', values: '' }];
    });
  }

  function handlePropertyNameChange(index, property, newName) {
    setProperties(prev => {
      const properties = [...prev];
      properties[index].name = newName;
      return properties;
    });
  }
  function handlePropertyValuesChange(index, property, newValues) {
    setProperties(prev => {
      const properties = [...prev];
      properties[index].values = newValues;
      return properties;
    });
  }

  function removeProperty(indexToRemove) {
    setProperties(prev => {
      return [...prev].filter((p, pIndex) => {
        return pIndex !== indexToRemove;
      });
    });
  }
  function uploadImage(ev) {
    const file = ev.target?.files[0];
    setCategoryImage(file);
  }

  return (
    <>
      <h1>Categories</h1>
      <label>
        {editedCategory
          ? `Edit category ${editedCategory.categoryName}`
          : 'Create new category'}
      </label>
      <form onSubmit={saveCategory}>
        <div className="flex flex-col gap-2">
          <input
            type="text"
            placeholder={'Category name'}
            onChange={ev => setCategoryName(ev.target.value)}
            value={categoryName} />
          <div className="mb-2 flex flex-wrap gap-1">
            {
              editedCategory ?
                (
                  categoryImage
                    ? (
                      <div key={0} className="h-24 relative bg-white border border-gray-200">
                        {
                          categoryImage instanceof File ? (
                            <img src={URL.createObjectURL(categoryImage)} alt="" />
                          ) : (
                            <img src={`${PREFIX}${categoryImage}`} alt="" />
                          )
                        }
                        <button type="button" onClick={() => setCategoryImage(null)} className="absolute -top-2 -right-1">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-red-700">
                            <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    )
                    :
                    (
                      <label className="w-24 h-24 cursor-pointer text-center flex flex-col items-center justify-center text-sm gap-1 text-primary rounded-sm bg-white shadow-sm border border-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                        <div>
                          Add image
                        </div>
                        <input type="file" required onChange={ev => uploadImage(ev)} className="hidden" />
                      </label>
                    )
                )
                : (
                  categoryImage
                    ? (
                      <div key={0} className="h-24 relative bg-white border border-gray-200">
                        <img src={URL.createObjectURL(categoryImage)} alt="" />
                        <button type="button" onClick={() => setCategoryImage(null)} className="absolute -top-2 -right-1">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-red-700">
                            <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    )
                    :
                    (
                      <label className="w-24 h-24 cursor-pointer text-center flex flex-col items-center justify-center text-sm gap-1 text-primary rounded-sm bg-white shadow-sm border border-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                        <div>
                          Add image
                        </div>
                        <input type="file" required onChange={ev => uploadImage(ev)} className="hidden" />
                      </label>
                    )
                )
            }
          </div>
          {/* <select
            onChange={ev => setCategoryImage(ev.target.value)}
            value={categoryImage}>
            <option value="">No parent category</option>
            {categories.length > 0 && categories.map(category => (
              <option key={category._id} value={category._id}>{category.categoryName}</option>
            ))}
          </select> */}
        </div>
        <div className="mb-2">
          <label className="block">Properties</label>
          <button
            onClick={addProperty}
            type="button"
            className="btn-default text-sm mb-2">
            Add new property
          </button>
          {properties.length > 0 && properties.map((property, index) => (
            <div key={index} className="flex gap-1 mb-2">
              <input
                type="text"
                value={property.name}
                className="mb-0"
                onChange={(ev) => handlePropertyNameChange(index, property, ev.target.value)}
                placeholder="property name (example: color)"
              />
              <input
                type="text"
                className="mb-0"
                onChange={(ev) => handlePropertyValuesChange(index, property, ev.target.value)}
                value={property.values}
                placeholder="values, comma separated"
              />
              <button
                onClick={() => removeProperty(index)}
                type="button"
                className="btn-red"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-1">
          {editedCategory && (
            <button
              type="button"
              onClick={() => {
                setEditedCategory(null);
                setCategoryName('');
                setCategoryImage('');
                setProperties([]);
              }}
              className="btn-default">Cancel</button>
          )}
          <button type="submit"
            className="bg-primary text-white px-4 rounded-md shadow-sm py-1">
            Save
          </button>
        </div>
      </form>
      {!editedCategory && (
        <table className="basic mt-4">
          {
            isLoading && (
              <div className="flex justify-center">
                <Spinner />
              </div>
            )
          }
          <thead>
            <tr>
              <td>Category name</td>
              <td></td>
            </tr>
          </thead>
          <tbody>
            {categories.length > 0 && categories.map(category => (
              <tr key={category._id}>
                <td>{category.categoryName}</td>
                <td>
                  <button
                    onClick={() => editCategory(category)}
                    className="btn-default mr-1"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteCategory(category)}
                    className="btn-red">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

export default withSwal(({ swal }, ref) => (
  <Categories swal={swal} />
));
