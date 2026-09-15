// import { NextResponse } from "next/server";
// import { registerUser } from "../../../../controllers/authController";
// import { setAuthCookie } from "../../../../lib/auth";
// import { verifyRecaptchaToken } from "../../../../lib/recaptcha";

// export async function POST(request) {
//   try {
//     const body = await request.json();
//     const { firstName, lastName, email, password, phone, role, captchaToken } = body ?? {};

//     if (captchaToken) {
//       await verifyRecaptchaToken(captchaToken);
//     }

//     const { user, token } = await registerUser({ firstName, lastName, email, password, phone, role });

//     const response = NextResponse.json(
//       {
//         success: true,
//         message: "User registered successfully.",
//         user,
//       },
//       { status: 201 }
//     );

//     return setAuthCookie(response, token);
//   } catch (error) {
//     console.error("Signup error:", error);
//     return NextResponse.json(
//       {
//         success: false,
//         message: error.message || "Unable to register user.",
//       },
//       { status: error.statusCode || 500 }
//     );
//   }
// }
