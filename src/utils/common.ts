import baseApi from './baseApi';

export const getCookie = (name: any) => {
  const value = `; ${document.cookie}`;
  const parts: any = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop().split(';').shift();
  }
};

const refreshAccessToken = async (token: string): Promise<any> => {
  const res = await baseApi.post(
    '/security-service/oauth/token',
    {
      grant_type: 'refresh_token',
      refresh_token: token,
    },
    {
      headers: {
        'Authorization': `Basic d2ViYXBwOmVuYW9AMTIz`,
        'Content-Type': 'multipart/form-data',
      },
    },
  );
  return res;
};

const handleRefreshToken = (refreshToken: string) => {
  refreshAccessToken(refreshToken);
};

export const handleError = async (error: any): Promise<void> => {
  const originalRequest = { ...error.config };
  if (error?.response?.status === 401) {
    if (!originalRequest?.retry) {
      originalRequest.retry = true;
      const loginData = sessionStorage.getItem('loginData');
      const refreshToken = loginData
        ? JSON.parse(loginData).refresh_token
        : null;
      const response = (await handleRefreshToken(refreshToken)) as any;
      if (response?.data?.access_token) {
        // axios.defaults.headers.common.Authorization = `Bearer ${response.data.access_token}`;
        sessionStorage.setItem('loginData', JSON.stringify(response?.data));
        baseApi(error.config);
      } else {
        // xử lý khi refresh token lỗi
        window.location.reload();
      }
    } else {
      // xử lý sau khi đã refresh
      window.location.reload();
    }
  }
};
