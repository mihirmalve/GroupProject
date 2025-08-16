import mongoose,{Schema} from "mongoose";

const userModel = new mongoose.Schema({
    fullName:{
        type: String,
        required: true
    },
    username:{
        type: String,
        required: true,
        unique: true
    },
    age:{
        type: Number,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true,
        minilength: 6
    },
    joinedGroups: [{
        type: mongoose.Schema.Types.ObjectId, ref: "Group"
    }],
    createdGroups: [{
        type: mongoose.Schema.Types.ObjectId, ref: "Group"
    }],
    codes: {
        type: Map,   
        of: String,
        default: {} 
    },
    language: {
        type: String
    }
}, {timestamps: true})

export default mongoose.model("User",userModel);