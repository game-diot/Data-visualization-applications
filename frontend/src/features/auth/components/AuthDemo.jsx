import { useAuth } from "../hooks/useAuth.js";

export default function AuthDemo() {
    const { user, login, logout, fetchMe, refresh, loading, error } = useAuth();

    return (
        <div>
            <h2>Auth Hook 测试</h2>

            <button
                disabled={loading}
                onClick={() =>
                    login({ username: "emilys", password: "emilyspass" })
                }
            >
                登录
            </button>

            <button onClick={fetchMe}>获取个人信息</button>
            <button onClick={refresh}>刷新 Token</button>
            <button onClick={logout}>登出</button>

            {loading && <p>加载中...</p>}
            {error && <p style={{ color: "red" }}>错误: {error}</p>}

            <pre>{user && JSON.stringify(user, null, 2)}</pre>
        </div>
    );
}
