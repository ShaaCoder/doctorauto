// app/api/register/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { hash } from "bcryptjs";

export async function POST(req: Request) {
  const { name, email, password } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json({ message: "All fields are required" }, { status: 400 });
  }

  await connectDB();

  const userExists = await User.findOne({ email });
  if (userExists) {
    return NextResponse.json({ message: "Email already in use" }, { status: 409 });
  }

  const hashedPassword = await hash(password, 12);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  return NextResponse.json({ message: "User registered", user }, { status: 201 });
}
