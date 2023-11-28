import { useContext, useEffect } from "react"
import { userContext } from "../userContext"
import Reviews from "../Components/Reviews";
import { useNavigate } from "react-router-dom";

export default function Dashboard(props) {
  const { user } = useContext(userContext);
  const navigation = useNavigate();
  useEffect(() => {
    if (!user.firstname) {
      navigation('/Account/Login');
      return;
    }
  }, []);

  return (
    <>
      <div className="text-black flex justify-between">
        <h2>
          Hello, <u>{user.firstname}&nbsp;{user.lastname}</u>
        </h2>
        <div className="flex items-center bg-gray-300 gap-1 text-black rounded-lg overflow-hidden">
          <img src={props.image} className="w-11 h-11" />
          <span className="px-2">
            {user.firstname}&nbsp;{user.lastname}
          </span>
        </div>
      </div>
      <div>
        <Reviews />
        {/* <Doughnut {...data} /> */}
      </div>
    </>
  )
}