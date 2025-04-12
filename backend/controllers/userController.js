import jwt from "jsonwebtoken";
import groupModel from "../models/groupModel.js";
import User from "../models/userModel.js";

class UserController {
  // Fetch groups the user has joined or created
  async getUserGroups(req, res) {
    try {
      const token = req.cookies.jwt;
      if (!token) {
        return res.status(401).json({ error: "No token provided" });
      }
      
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const user_id = decoded.userId;
      
      const user = await User.findById(user_id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const joinedGroups = user.joinedGroups;
      const createdGroups = user.createdGroups;
      const joinedGroupsNames = [];
      const createdGroupsNames = [];

      // Fetch group names for joined groups
      for (let i = 0; i < joinedGroups.length; i++) {
        const group = await groupModel.findById(joinedGroups[i]);
        if (group) {
          joinedGroupsNames.push(group.name);
        }
      }

      // Fetch group names for created groups
      for (let i = 0; i < createdGroups.length; i++) {
        const group = await groupModel.findById(createdGroups[i]);
        if (group) {
          createdGroupsNames.push(group.name);
        }
      }

      res.status(200).json({
        joinedGroups: joinedGroupsNames,
        createdGroups: createdGroupsNames,
      });
    } catch (err) {
      console.error("Error fetching user groups:", err);
      res.status(500).json({ error: "Server error" });
    }
  }

  // TODO: Implement user profile fetching here
  async getProfile(req, res) {
    // implementation coming soon
  }
}

export default new UserController();
