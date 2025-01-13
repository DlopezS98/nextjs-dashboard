import {
	clerkMiddleware,
	ClerkMiddlewareAuth,
	createRouteMatcher,
} from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)'])
// const protectedRoutes = ["/dashboard"];
const publicRoutes = ["/login", "/signup", "/"];
const isPublicRoute = createRouteMatcher(publicRoutes);
// const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(
	async (auth: ClerkMiddlewareAuth, request: NextRequest) => {
		if (!isPublicRoute(request)) {
			await auth.protect();
		}
	}
);

// export default async function middleware(request: NextRequest) {
// 	const path = request.nextUrl.pathname;
// 	const isProtectedRoute = protectedRoutes.includes(path);
// 	const isPublicRoute = publicRoutes.includes(path);

// 	console.log("middleware", path);

// 	if (isProtectedRoute) {
// 		return NextResponse.redirect(new URL("/login", request.nextUrl));
// 	}

// 	if (isPublicRoute && !request.nextUrl.pathname.startsWith("/dashboard")) {
// 		return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
// 	}

// 	return NextResponse.next(request);
// }

export const config = {
	matcher: [
		// Skip Next.js internals and all static files, unless found in search params
		"/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
		// Always run for API routes
		"/(api|trpc)(.*)",
		// "/((?!api|_next/static|_next/image|.*\\.png$).*)",
	],
};
