import { integer, json, pgTable, varchar } from "drizzle-orm/pg-core";
import { update } from "lodash";
export const usersTable = pgTable("users", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 255 }).notNull().unique(),

});

export const HistoryTable = pgTable('historyTable',{
    id:integer().primaryKey().generatedAlwaysAsIdentity(),
    recordId: varchar({ length: 255 }).notNull(),
    content:json(),
    userEmail:varchar('userEmail').references(()=> usersTable.email) ,
    createdAt:varchar(),
    updatedAt:varchar(),
    aiAgentType:varchar(),
    metadeta:varchar()
});