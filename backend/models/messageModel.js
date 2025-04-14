import mongoose,{Schema} from "mongoose";

const messageModel = new mongoose.Schema({
    sendername: {
        type: String,
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
        required: true
    },
    message: {
        type: String,
        required: true
    }
}, {timestamps: true})

export default mongoose.model("Message", messageModel);