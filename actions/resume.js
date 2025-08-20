// "use server";

// import { db } from "../lib/prisma";
// import { auth } from "@clerk/nextjs/server";
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { revalidatePath } from "next/cache";

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// export async function saveResume(content) {
//   const { userId } = await auth();
//   if (!userId) throw new Error("Unauthorized");

//   const user = await db.user.findUnique({
//     where: { clerkUserId: userId },
//   });

//   if (!user) throw new Error("User not found");

//   try {
//     const resume = await db.resume.upsert({
//       where: {
//         userId: user.id,
//       },
//       update: {
//         content,
//       },
//       create: {
//         userId: user.id,
//         content,
//       },
//     });

//     revalidatePath("/resume");
//     return resume;
//   } catch (error) {
//     console.error("Error saving resume:", error.message);
//     throw new Error("Failed to save resume");
//   }
// }

// export async function getResume() {
//   const { userId } = await auth();
//   if (!userId) throw new Error("Unauthorized");

//   const user = await db.user.findUnique({
//     where: { clerkUserId: userId },
//   });

//   if (!user) throw new Error("User not found");

//   return await db.resume.findUnique({
//     where: {
//       userId: user.id,
//     },
//   });
// }

// export async function improveWithAI({ current, type }) {
//   const { userId } = await auth();
//   if (!userId) throw new Error("Unauthorized");

//   const user = await db.user.findUnique({
//     where: { clerkUserId: userId },
//     include: {
//       industryInsight: true,
//     },
//   });

//   if (!user) throw new Error("User not found");

//   const prompt = `
//     As an expert resume writer, improve the following ${type} description for a ${user.industry} professional.
//     Make it more impactful, quantifiable, and aligned with industry standards.
//     Current content: "${current}"

//     Requirements:
//     1. Use action verbs
//     2. Include metrics and results where possible
//     3. Highlight relevant technical skills
//     4. Keep it concise but detailed
//     5. Focus on achievements over responsibilities
//     6. Use industry-specific keywords
    
//     Format the response as a single paragraph without any additional text or explanations.
//   `;

//   try {
//     const result = await model.generateContent(prompt);
//     const response = result.response;
//     const improvedContent = response.text().trim();
//     return improvedContent;
//   } catch (error) {
//     console.error("Error improving content:", error);
//     throw new Error("Failed to improve content");
//   }
// }

"use server";

import { db } from "../lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Helper function to get user with proper error handling
async function getAuthenticatedUser() {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized - No user ID found");
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found in database");
    }

    return { userId, user };
  } catch (error) {
    console.error("Authentication error:", error);
    throw error;
  }
}

export async function saveResume(content) {
  try {
    const { user } = await getAuthenticatedUser();

    if (!content || typeof content !== 'string') {
      throw new Error("Invalid content provided");
    }

    const resume = await db.resume.upsert({
      where: {
        userId: user.id,
      },
      update: {
        content: content.trim(),
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        content: content.trim(),
      },
    });

    revalidatePath("/resume");
    return { success: true, resume };
  } catch (error) {
    console.error("Error saving resume:", error);
    
    // Return more specific error messages
    if (error.message.includes("Unauthorized")) {
      throw new Error("Please sign in to save your resume");
    }
    if (error.message.includes("User not found")) {
      throw new Error("User account not found. Please try signing out and back in");
    }
    if (error.code === 'P2002') {
      throw new Error("Resume already exists for this user");
    }
    
    throw new Error(`Failed to save resume: ${error.message}`);
  }
}

export async function getResume() {
  try {
    const { user } = await getAuthenticatedUser();

    const resume = await db.resume.findUnique({
      where: {
        userId: user.id,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return resume;
  } catch (error) {
    console.error("Error fetching resume:", error);
    
    // Handle specific errors gracefully
    if (error.message.includes("Unauthorized")) {
      return null; // Return null instead of throwing for unauthorized users
    }
    if (error.message.includes("User not found")) {
      return null; // Return null if user not found
    }
    
    throw new Error(`Failed to fetch resume: ${error.message}`);
  }
}

export async function improveWithAI({ current, type }) {
  try {
    const { user } = await getAuthenticatedUser();

    // Validate inputs
    if (!current || typeof current !== 'string') {
      throw new Error("Invalid content provided for improvement");
    }
    
    if (!type || typeof type !== 'string') {
      throw new Error("Content type must be specified");
    }

    // Get user with industry insight
    const userWithInsight = await db.user.findUnique({
      where: { clerkUserId: user.clerkUserId },
      include: {
        industryInsight: true,
      },
    });

    const industry = userWithInsight?.industry || userWithInsight?.industryInsight?.industry || "general";

    const prompt = `
      As an expert resume writer, improve the following ${type} description for a ${industry} professional.
      Make it more impactful, quantifiable, and aligned with industry standards.
      Current content: "${current}"

      Requirements:
      1. Use action verbs
      2. Include metrics and results where possible
      3. Highlight relevant technical skills
      4. Keep it concise but detailed
      5. Focus on achievements over responsibilities
      6. Use industry-specific keywords for ${industry}
      
      Format the response as a single paragraph without any additional text or explanations.
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const improvedContent = response.text().trim();

    if (!improvedContent) {
      throw new Error("AI service returned empty response");
    }

    return improvedContent;
  } catch (error) {
    console.error("Error improving content:", error);
    
    if (error.message.includes("Unauthorized")) {
      throw new Error("Please sign in to use AI improvement");
    }
    if (error.message.includes("API")) {
      throw new Error("AI service temporarily unavailable");
    }
    
    throw new Error(`Failed to improve content: ${error.message}`);
  }
}

// New function to check if user exists and create if not
export async function ensureUserExists() {
  try {
    const { userId } = await auth();
    if (!userId) return null;

    let user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    // If user doesn't exist, this might be their first time - don't create here
    // Let the checkUser function handle user creation
    return user;
  } catch (error) {
    console.error("Error checking user existence:", error);
    return null;
  }
}