import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "../pages/loginPage/LoginPage.jsx";
import AuthPage from "../features/auth/pages/AuthPage.jsx";

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="*" element={<div>404 页面未找到</div>} />
            </Routes>
        </BrowserRouter>
    );
}
