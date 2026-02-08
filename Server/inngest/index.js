import { Inngest } from "inngest";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Connection from "../models/Connection.js";
import sendEmail from "../config/nodeMailer.js";

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

// Inngest function to send reminder when a new connection is added
const sendNewConnectionRequestReminder = inngest.createFunction(
  { id: "send-new-connection-request-reminder" },
  { event: "app/connection-request" },
  async ({ event, step }) => {
    const { connectionId } = event.data;

    await step.run("send-connection-request-mail", async () => {
      const connection = await Connection.findById(connectionId).populate(
        "from_user_id to_user_id",
      );
      const subject = `👋 New Connection Request`;
      const body = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Hello ${connection.to_user_id.full_name},</h2>
          <p><strong>${connection.from_user_id.full_name}</strong> sent you a connection request!</p>
          <p>Check your profile to accept or decline the request.</p>
          <a href="${process.env.FRONTEND_URL}/connections"></a>
          <hr style="margin: 20px 0;" />
          <p style="color: #666; font-size: 12px;">This is an automated message. Please do not reply.</p>
        </div>
      `;

      await sendEmail({
        to: connection.to_user_id.email,
        subject,
        body,
      });
    });

    const in24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await step.sleepUntil("wait-for-24-hours", in24Hours);
    await step.run("send-connection-request-reminder", async () => {
      const connection = await Connection.findById(connectionId).populate(
        "from_user_id to_user_id",
      );

      if (connection.status === "accepted") {
        return { message: "Already Accepted" };
      }

      const subject = `👋 New Connection Request`;
      const body = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Hello ${connection.to_user_id.full_name},</h2>
          <p><strong>${connection.from_user_id.full_name}</strong> sent you a connection request!</p>
          <p>Check your profile to accept or decline the request.</p>
          <a href="${process.env.FRONTEND_URL}/connections"></a>
          <hr style="margin: 20px 0;" />
          <p style="color: #666; font-size: 12px;">This is an automated message. Please do not reply.</p>
        </div>
      `;

      await sendEmail({
        to: connection.to_user_id.email,
        subject,
        body,
      });

      return { message: "Reminder Send" };
    });
  },
);

export const functions = [
  syncUserCreation,
  syncUserUpdation,
  syncUserDeletion,
  sendNewConnectionRequestReminder,
];
