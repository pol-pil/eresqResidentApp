"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { sendAlertNotification } from "./alertNode";


export const triggerAlertNotification = action({
    args: {
      category: v.string(),
      alertLevel: v.string(),
      location: v.string(),
    },
    handler: async (ctx, args) => {
      try {
        await sendAlertNotification(ctx, args);
      } catch (err) {
        console.error("FCM send error:", err);
        throw err; // rethrow so Convex reports it
      }
    },
  });
  
