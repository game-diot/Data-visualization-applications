import {fetcher} from "../../../shared/utils/api.js";
import {API} from "../../../shared/constants/api.js";

export const login = (detail)=>{
    return fetcher(API.auth.login,"POST",detail)
};
// 刷新 token (POST)
export const refreshToken = (refreshToken) => {
    return fetcher(API.auth.refresh, "POST", { token: refreshToken });
};

// 获取个人信息 (GET)
export const getPersonalInformation = (token) => {
    return fetcher(API.auth.personalInformation, "GET", null, {
        Authorization: `Bearer ${token}`,
    });
};