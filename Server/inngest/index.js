import { Inngest } from "inngest";
import connectDB from "../config/db.js";
import User from "../models/User.js";

export const inngest = new Inngest({
  id: "SocialMediaApp",
});

/* =========================
   USER CREATED
========================= */
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    await connectDB();

    try {
      const { id, first_name, last_name, email_addresses, image_url } =
        event.data;

      let username =
        email_addresses?.[0]?.email_address?.split("@")[0] ??
        `user_${id.slice(0, 6)}`;

      const exists = await User.findOne({ username });
      if (exists) {
        username = `${username}_${Math.floor(Math.random() * 10000)}`;
      }

      await User.findByIdAndUpdate(
        id,
        {
          _id: id,
          email: email_addresses[0].email_address,
          full_name: [first_name, last_name].filter(Boolean).join(" "),
          profile_picture: image_url,
          username,
        },
        { upsert: true, new: true },
      );
    } catch (error) {
      console.error("❌ syncUserCreation failed:", error);
      throw error;
    }
  },
);

/* =========================
   USER UPDATED
========================= */
const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    await connectDB();

    try {
      const { id, first_name, last_name, email_addresses, image_url } =
        event.data;

      await User.findByIdAndUpdate(id, {
        email: email_addresses[0].email_address,
        full_name: [first_name, last_name].filter(Boolean).join(" "),
        profile_picture: image_url,
      });
    } catch (error) {
      console.error("❌ syncUserUpdation failed:", error);
      throw error;
    }
  },
);

/* =========================
   USER DELETED
========================= */
const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    await connectDB();

    try {
      const { id } = event.data;
      await User.findByIdAndDelete(id);
    } catch (error) {
      console.error("❌ syncUserDeletion failed:", error);
      throw error;
    }
  },
);

export const functions = [syncUserCreation, syncUserUpdation, syncUserDeletion];
