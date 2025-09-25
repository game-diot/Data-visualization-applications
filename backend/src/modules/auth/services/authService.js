import User from '../models/User.js'

export const registerUser = async (data) => {
    const user = new User(data)
    return user.save()
};

export const loginUser = async (email, password) => {
    const user = await User.findOne({email});
    if (!user) {
        throw new Error(`User with email ${email} not found`)
    }
    const isWatch = await user.comparePassword(password);
    if (!isWatch) {
        throw new Error(`User with password ${password} not match`)
    }
    return user

}