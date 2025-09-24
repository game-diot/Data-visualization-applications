import { useState, useEffect, useCallback } from "react";
import {
    login as loginService,
    refreshToken as refreshService,
    getPersonalInformation,
} from "../services/authService";

export function useAuth() {
    const [user, setUser] = useState(null); // 保存用户信息
    const [accessToken, setAccessToken] = useState(
        localStorage.getItem("accessToken") || null
    );
    const [refreshToken, setRefreshToken] = useState(
        localStorage.getItem("refreshToken") || null
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 登录
    const login = useCallback(async (credentials) => {
        setLoading(true);
        setError(null);
        try {
            const data = await loginService(credentials);

            setUser(data);
            setAccessToken(data.accessToken);
            setRefreshToken(data.refreshToken);

            // 存到 localStorage，方便刷新页面后保持登录状态
            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("refreshToken", data.refreshToken);

            return data;
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // 获取用户信息
    const fetchMe = useCallback(async () => {
        if (!accessToken) return null;
        setLoading(true);
        try {
            const data = await getPersonalInformation(accessToken);
            setUser(data);
            return data;
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, [accessToken]);

    // 刷新 token
    const refresh = useCallback(async () => {
        if (!refreshToken) return null;
        try {
            const data = await refreshService(refreshToken);
            setAccessToken(data.accessToken);
            setRefreshToken(data.refreshToken);
            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("refreshToken", data.refreshToken);
            return data;
        } catch (err) {
            setError(err.message);
            return null;
        }
    }, [refreshToken]);

    // 登出
    const logout = useCallback(() => {
        setUser(null);
        setAccessToken(null);
        setRefreshToken(null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
    }, []);

    // 页面刷新时，如果有 accessToken，自动拉取个人信息
    useEffect(() => {
        if (accessToken) {
            fetchMe();
        }
    }, [accessToken, fetchMe]);

    return {
        user,
        accessToken,
        refreshToken,
        loading,
        error,
        login,
        fetchMe,
        refresh,
        logout,
    };
}
