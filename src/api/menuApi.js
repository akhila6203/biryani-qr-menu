import axiosClient from "./axiosClient";


export const getMenuApi =
  () => {

    return axiosClient.get(
      "/menu"
    );

  };