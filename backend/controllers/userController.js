import jwt from "jsonwebtoken";
import groupModel from "../models/groupModel.js";
import User from "../models/userModel.js";

class UserController {
  async getProfile(req, res) {
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

      // Fetch group names for createdGroups
      const groupDocs = await groupModel
        .find({
          _id: { $in: user.createdGroups },
        })
        .select("name");

      const createdGroups = groupDocs.map((group) => ({
        _id: group._id,
        name: group.name,
      }));

      const { password, ...userWithoutPassword } = user.toObject();
      userWithoutPassword.createdGroups = createdGroups;

      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.log("Error in getProfile controller", error.message);
      res.json({ error: "Internal server error" });
    }
  }

  async deleteGroup(req, res) {
    try {
      const { groupId } = req.body;
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

      const group = await groupModel.findById(groupId);
      if (!group) {
        return res.status(404).json({ error: "Group not found" });
      }

      // Check if the user is the admin of the group
      if (group.admin.toString() !== user_id) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      // Remove the group from the user's createdGroups array
      user.createdGroups.pull(groupId);
      await user.save();

      // Remove the group from the group's members array
      for (const memberId of group.members) {
        const member = await User.findById(memberId);
        if (member) {
          member.joinedGroups = member.joinedGroups.filter(
            (id) => id.toString() !== group._id.toString()
          );
          await member.save();
        }
      }

      // Delete the group
      await groupModel.findByIdAndDelete(groupId);

      res.status(200).json({ message: "Group deleted successfully" });
    } catch (error) {
      console.log("Error in deleteGroup controller", error.message);
      res.json({ error: "Could not delete the group" });
    }
  }

  // Save code
  async saveCode(req, res) {
    try {
      const { code } = req.body;
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
      user.code = code;
      await user.save();
      console.log(`Code saved successfully in ${code}`);
      res.status(200).json({ message: "Code saved successfully" });
    } catch (error) {
      console.log("Error in saveCode controller", error.message);
      res.json({ error: "Could not save the code" });
    }
  }

  // Fetch code
  async getCode(req, res) {
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
      res.status(200).json({ code: user.code });
    } catch (error) {
      console.log("Error in getCode controller", error.message);
      res.json({ error: "Could not fetch the code" });
    }
  }

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
      const groupDocs = await groupModel
        .find({
          _id: { $in: user.joinedGroups },
        })
        .select("name");

      const joinedGroups = groupDocs.map((group) => ({
        _id: group._id,
        name: group.name,
      }));
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.status(200).json({
        joinedGroups: joinedGroups,
      });
    } catch (err) {
      console.error("Error fetching user groups:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
}

export default new UserController();
