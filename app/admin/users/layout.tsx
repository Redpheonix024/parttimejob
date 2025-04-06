"use client";

import React from "react";
import AdminGuard from "@/components/auth/AdminGuard";

export default function AdminUsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminGuard>{children}</AdminGuard>;
} 