import { useEffect, useState } from "react";
import axios from "axios";
import { withSwal } from 'react-sweetalert2';
import { useNavigate } from "react-router-dom";
import Spinner from "../Components/Spinner";
import { PREFIX } from "../Constants";

function Order({ swal }) {
  const [orders, setOrders] = useState([]);
  const [showDetails, setShowDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  function handleDetails(index) {
    // Clone the existing showDetails array to avoid mutating the state directly.
    const updatedShowDetails = [...showDetails];

    // Toggle the value at the specified index.
    updatedShowDetails[index] = !updatedShowDetails[index];

    // Update the state with the new array.
    setShowDetails(updatedShowDetails);
  }

  const navigation = useNavigate();

  function getToken() {
    return localStorage.getItem('token');
  }

  useEffect(() => {
    fetchOrders();
  }, [])
  function fetchOrders() {
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
    axios.get('/Order/getAllOrders', config).then(result => {
      setIsLoading(false);
      if (result.data.message === 'jwt expired') {
        navigation('/Account/Login');
        return;
      }
      setOrders(result.data);
    }).catch(err => console.log(err));
  }

  function deleteOrder(order) {
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
      text: 'Do you want to delete this order?',
      showCancelButton: true,
      cancelButtonText: 'Cancel',
      confirmButtonText: 'Yes, Delete!',
      confirmButtonColor: '#d55',
      reverseButtons: true,
    }).then(async result => {
      if (result.isConfirmed) {
        const { _id } = order;
        await axios.delete(`/Order/deleteOrder/${_id}`, config).then(res => {
          if (res.data.message === 'jwt expired') {
            navigation('/Account/Login');
            return;
          }
        })
          .catch(err => {
            console.log(err);
          });
        fetchOrders();
      }
    });
  }

  async function editOrder(order) {
    const { _id } = order;
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
    const updatedStatus = {
      status: (order.status === 'Processing' ? 'Shipped' : 'Delivered')
    }
    setIsLoading(true);
    await axios.put(`/Order/updateOrderStatus/${_id}`, updatedStatus, config).then(res => {
      setIsLoading(false);
      if (res.data.message === 'jwt expired') {
        navigation('/Account/Login');
        return;
      }
      fetchOrders();
    }).catch(err => console.log(err))
  }

  return (
    <>
      <h1>Orders</h1>
      {
        isLoading && (
          <td className="flex justify-center">
            <Spinner />
          </td>
        )
      }
      <table className="basic mt-4">
        <thead>
          <tr>
            <td className="w-72">Customer Details</td>
            <td>Product Details</td>
            <td>Total Price</td>
            <td>Status</td>
            <td></td>
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 && orders.map((order, i) => (
            <tr key={order._id} className="cursor-pointer border-b">
              <td onClick={() => handleDetails(i)}>
                <nav>
                  <u>Name</u>: {order.firstname}&nbsp;{order.lastname}
                </nav>
                <div className={'duration-600 transition-all flex flex-col justify-center ' + (showDetails[i] ? 'translate-y-0' : 'absolute -z-10 -translate-y-1/3 opacity-0')}>
                  <nav><u>Email</u>: {order.email}</nav>
                  <nav><u>City</u>: {order.city}</nav>
                  <nav><u>Postal Code</u>: {order.postalCode}</nav>
                  <nav><u>Address</u>: {order.streetAddress}</nav>
                  {
                    order?.appartment && (
                      <nav><u>Appartment</u>: {order.appartment}</nav>
                    )
                  }
                  <nav><u>Country</u>: {order.country}</nav>
                  <nav><u>Phone Number</u>: {order.phone}</nav>
                </div>
              </td>
              <td onClick={() => handleDetails(i)}>
                {
                  order.line_items.map(item =>
                    <>
                      <nav className={(!showDetails[i] ? 'translate-y-0' : 'absolute -z-10 -translate-y-1/3 opacity-0')} >
                        {item.product.productName}
                      </nav>
                      <div className={'duration-600 transition-all ' + (showDetails[i] ? 'translate-y-0' : 'absolute -z-10 -translate-y-1/3 opacity-0')}>
                        <div className="flex gap-1 items-center">
                          <nav className="w-16 h-36 flex items-center">
                            <img src={`${PREFIX}${item.product.images[0]}`} alt="" />
                          </nav>
                          <div className="flex flex-col gap-1">
                            <nav className="text-xs">{item.product.productName}</nav>
                            <nav className="text-xs">{item.type === 'UNSTITCHED' ? item.type : (<>Size: {item.type}</>)}</nav>
                            <nav className="text-xs">Custom_Colour: {item.colour}</nav>
                            <nav className="text-xs">Price: {(item.product.price - (item.product.price * item.product.discount / 100)).toLocaleString()}</nav>
                            <nav className="text-xs">Quantity: {item.quantity}</nav>
                          </div>
                        </div>
                      </div>
                    </>
                  )
                }
              </td>
              <td onClick={() => handleDetails(i)}>Rs {order.totalPrice.toLocaleString()}</td>
              <td onClick={() => handleDetails(i)}>{order.status}</td>
              <td>
                <button
                  disabled={order.status === 'Delivered' ? true : false}
                  onClick={() => editOrder(order)}
                  className="btn-default flex justify-between"
                >
                  {
                    order.status !== 'Delivered' && order.status === 'Processing' && (
                      <ion-icon name="checkmark-outline"></ion-icon>
                    )
                  }
                  {
                    order.status === 'Shipped' && (
                      <ion-icon name="checkmark-done-outline"></ion-icon>
                    )
                  }
                  {
                    order.status === 'Delivered' && (
                      <ion-icon name="checkmark-done-sharp"></ion-icon>
                    )
                  }
                </button>
                <button
                  disabled={order.status === 'Delivered' ? true : false}
                  onClick={() => deleteOrder(order)}
                  className="btn-red flex">
                  {
                    order.status === 'Delivered' ?
                      <ion-icon name="trash-sharp"></ion-icon>
                      :
                      <ion-icon name="trash-outline"></ion-icon>
                  }
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default withSwal(({ swal }, ref) => (
  <Order swal={swal} />
));