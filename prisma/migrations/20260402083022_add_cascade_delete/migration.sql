-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_workspaceId_fkey";

-- DropForeignKey
ALTER TABLE "UserWorkspace" DROP CONSTRAINT "UserWorkspace_workspaceId_fkey";

-- AddForeignKey
ALTER TABLE "UserWorkspace" ADD CONSTRAINT "UserWorkspace_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
