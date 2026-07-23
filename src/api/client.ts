import axios from "axios";
import { toast } from "sonner";

export const apiClient = axios.create({
   baseURL: "",
   headers: {
      "Content-Type": "application/json",
   },
});

apiClient.interceptors.response.use(
   (response) => response,
   (error) => {
      if (error.response) {
         const status = error.response.status;
         if (status === 404 || status === 500) {
            const msg = error.response.data?.message || `Error ${status}: Something went wrong.`;
            toast.error(msg);
         }
      }
      return Promise.reject(error);
   }
);
