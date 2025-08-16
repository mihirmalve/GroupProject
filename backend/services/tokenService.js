import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

const secret_token = process.env.ACCESS_TOKEN_SECRET;

class tokenService {
    generateTokenAndSetCookie(userId, res) {
        const token = jwt.sign({ userId }, secret_token, {
            expiresIn: '30d'
        });
        res.cookie("jwt", token, {
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production"
        });
    }
}

export default new tokenService();