import bcrypt from "bcryptjs"; // Make sure this is installed
import Group from "../models/groupModel.js";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import groupModel from "../models/groupModel.js";

class GroupController {
  async createGroup(req, res) {
    try {
      const { name, description, password } = req.body;
      const token = req.cookies.jwt;
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const user_id = decoded.userId;
      
      // Hash the group password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const user = await userModel.findById( user_id );
      
      const newGroup = await Group.create({
        name,
        description,
        admin: user_id,
        members: [user_id],
        password: hashedPassword, // Store hashed password
      });

      // Update user’s createdGroups and joinedGroups
      user.createdGroups.push(newGroup._id);
      user.joinedGroups.push(newGroup._id);
      await user.save();
      
      res.status(201).json(newGroup);
    } catch (err) {
      console.error("Error creating group:", err);
      res.status(500).json({ message: "Server error" });
    }
  }

  async joinGroup(req, res) {
    try {
      const { name, password } = req.body;
      const token = req.cookies.jwt;
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const user_id = decoded.userId;
 
    
      // Check if the group exists
      const group = await groupModel.findOne({ name });
      if (!group) {
        console.log(1);
        return res.status(404).json({ message: "Group not found" });
      } else {
        // Check if the group password is correct
        if (group.password) {
          const isMatch = await bcrypt.compare(password, group.password);
          if (!isMatch) {
            console.log(2);
            return res.status(400).json({ message: "Incorrect password" });
          }
        }
      }
      const user = await userModel.findById( user_id );
      const groupId = group._id;
      
      // Add user to group members
      if (!group.members.includes(user_id)) {
        group.members.push(user_id);
        await group.save();
        // Add group to user joined Groups
        user.joinedGroups.push(groupId);
        await user.save();
      
      } 
      
      

      res.status(201).json({ message: "Joined group successfully" });
    } catch (err) {
      console.error("Error joining group:", err);
      res.status(500).json({ message: "Server error" });
    }
  }   
}
export default new GroupController();