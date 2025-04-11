import mongoose from "mongoose";

const dbConnect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_DB_URL)
        console.log("connected to MongoDB")
    } catch(error) {
        console.log("Error: ", error.message)
    }
}

export default dbConnect;