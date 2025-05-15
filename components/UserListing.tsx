"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getEmoji } from "@/constants/emoji";
import React from "react";
import { Button } from "./ui/button";
import { PlusIcon } from "lucide-react";
import { RegisterUserModal } from "./RegisterUser";
import { useAllUsers } from "@/lib/api-services/auth-api";

const UserListing = () => {

  const { data: users, isLoading, isError, error, refetch } = useAllUsers();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {error?.message}</div>;
  }

  return (
    <div>
     <div className="flex flex-row items-center justify-between">
      <h2 className="text-2xl font-bold mb-4">Employee List - Emotion History</h2>
      <RegisterUserModal>
        <Button className="w-full sm:w-fit">
          <PlusIcon className="size-4 mr-2" />
          Register User
        </Button>
      </RegisterUserModal>
     </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">Id</TableHead>
            <TableHead>Emotion</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Emoji</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users?.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user?.id}</TableCell>
              <TableCell>{user?.emotion}</TableCell>
              <TableCell>{user?.name}</TableCell>
              <TableCell>{user?.email}</TableCell>
              <TableCell>{user?.role}</TableCell>
              <TableCell>{getEmoji(user?.emotion || "")}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserListing;
