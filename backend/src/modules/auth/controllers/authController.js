import { registerUser, loginUser } from '../services/authService.js';

export const register = async (req, res, next) => {
    try {
        const user = await registerUser(req.body);
        res.status(201).json({ success: true, data: user });
    } catch (err) {
        next(err);
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await loginUser(email, password);
        res.json({ success: true, data: user });
    } catch (err) {
        next(err);
    }
};
