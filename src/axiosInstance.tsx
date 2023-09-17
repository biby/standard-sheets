import axios from "axios";
import axiosRetry from "axios-retry";

const axiosInstance = axios.create();

axiosRetry(axiosInstance, {
  retries: 5,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error: any) => {
    // if retry condition is not specified, by default idempotent requests are retried
    return (
      error.response.status === 503 ||
      error.response.status === 500 ||
      error.response.status === 429 ||
      error.response.status === 403
    );
  },
});

export default axiosInstance;
