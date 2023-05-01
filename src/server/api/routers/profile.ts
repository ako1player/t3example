import { clerkClient } from "@clerk/nextjs/server";
import { z } from "zod";
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";
import { fileterUserForClient } from "~/server/helpers/filterUserForClients";

export const profileRouter = createTRPCRouter({
    getUserByUsername: publicProcedure.input(z.object({username: z.string()}))
    .query(async ({input}) =>{
        const [user] = await clerkClient.users.getUserList({
            username: [input.username],
        });

        if(!user){
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "User not found",
            });
        }
        return fileterUserForClient(user);
    }),
});
