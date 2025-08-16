import mongoose,{Schema} from "mongoose";

const groupModel = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    codes: {
        type: Map,   
        of: String,
        default: {} 
    },
    language: {
        type: String
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    messages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message"
    }]
}, {timestamps: true})

export default mongoose.model("Group",groupModel);