import si from "systeminformation";

export const getGpu = async () => {
  try {
    const data = await si.graphics();
    return data.controllers;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
