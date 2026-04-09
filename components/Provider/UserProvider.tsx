"use client";
import { useSession } from "next-auth/react";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/rootReducer";
import Processing from "../Processing";

import {
  LoadUserFail,
  LoadUserRequest,
  LoadUserSuccess,
} from "@/redux/reducers/userReducer";
import Axios from "../Axios";

interface Props {
  children: React.ReactNode;
}
const UserProvider = ({ children }: Props) => {
  const dispatch = useDispatch();

  const { data: session, status } = useSession();
  const {user} = useSelector((state: RootState) => state.user);
  console.log(user)

  const getUser = async () => {
    try {
      dispatch(LoadUserRequest());
      const { data } = await Axios.get("/get/user", {
        headers: {
          Authorization: `Bearer ${session && session?.user?.id}`,
        },
      });
      dispatch(LoadUserSuccess(data.user));
    } catch (err: any) {
      dispatch(LoadUserFail(err.response.data.message));
    }
  };
  useEffect(() => {
    if (status === "authenticated") {
      getUser();
    }
  }, [status]);

  if (status === "loading") {
    return <Processing />;
  }
  return <div>{children}</div>;
};

export default UserProvider;
