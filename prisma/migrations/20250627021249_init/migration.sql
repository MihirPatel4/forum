/*
  Warnings:

  - You are about to drop the column `image` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the `Reply` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[threadId,postNumber]` on the table `Post` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `postNumber` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `threadId` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Made the column `content` on table `Post` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Reply" DROP CONSTRAINT "Reply_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Reply" DROP CONSTRAINT "Reply_postId_fkey";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "image",
DROP COLUMN "title",
ADD COLUMN     "postNumber" INTEGER NOT NULL,
ADD COLUMN     "threadId" INTEGER NOT NULL,
ALTER COLUMN "content" SET NOT NULL;

-- DropTable
DROP TABLE "Reply";

-- CreateTable
CREATE TABLE "Thread" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL,
    "authorId" INTEGER NOT NULL,

    CONSTRAINT "Thread_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Post_threadId_postNumber_key" ON "Post"("threadId", "postNumber");

-- AddForeignKey
ALTER TABLE "Thread" ADD CONSTRAINT "Thread_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "Thread"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
