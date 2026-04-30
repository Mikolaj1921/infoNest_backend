const prisma = require('../config/db');
const AppError = require('../utils/appError');
const notificationService = require('./notification.service');

class MemberService {
  // Add user to workspace
  async addMember(workspaceId, email, role) {
    // ua: пошук користувача за email
    const userToAdd = await prisma.user.findUnique({ where: { email } });

    if (!userToAdd) {
      throw new AppError('User with this email does not exist', 404);
    }

    // ua: перевірка, чи користувач вже є учасником робочого простору
    // fixed param (WorkspaceMember to UserWorkspace) & (workspaceId_userId: to userId_workspaceId) - corrected with prisma schema
    const existingMembership = await prisma.userWorkspace.findUnique({
      where: {
        userId_workspaceId: {
          userId: userToAdd.id,
          workspaceId,
        },
      },
    });

    if (existingMembership) {
      throw new AppError('User is already a member of this workspace', 400);
    }

    // ua: отримуємо назву воркспейсу для тексту сповіщення
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { name: true },
    });

    // ua: запис у таблиці зв'язку між юзером та робочим простором з ролею
    const newMembership = await prisma.userWorkspace.create({
      data: {
        userId: userToAdd.id,
        workspaceId,
        role,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // ua: створення внутрішнього сповіщення для доданого користувача
    notificationService.createNotification(userToAdd.id, {
      title: 'New Workspace Invitation',
      message: `You have been added to the workspace "${workspace.name}" as ${role}`,
      type: 'INVITE',
    });

    return newMembership;
  }

  // update role
  // ua: зміна ролі існуючого учасника
  async updateMemberRole(workspaceId, userId, newRole) {
    // Не дозволяємо змінювати роль самому собі (щоб Owner не понизив себе випадково)
    // Цю логіку можна посилити в контролері

    const updatedMembership = await prisma.userWorkspace.update({
      where: {
        userId_workspaceId: { userId, workspaceId },
      },
      data: { role: newRole },
      include: { workspace: { select: { name: true } } },
    });

    // ua: сповіщення користувача про зміну його ролі
    notificationService.createNotification(userId, {
      title: 'Role Updated',
      message: `Your role in workspace "${updatedMembership.workspace.name}" has been changed to ${newRole}`,
      type: 'ROLE_CHANGE',
    });

    return updatedMembership;
  }

  // ua: Видалення учасника з воркспейсу
  async removeMember(workspaceId, userId) {
    const membership = await prisma.userWorkspace.findUnique({
      where: { userId_workspaceId: { userId, workspaceId } },
    });

    if (!membership) {
      throw new AppError('Member not found in this workspace', 404);
    }

    // Заборона видаляти власника (Owner)
    if (membership.role === 'Owner') {
      throw new AppError('Cannot remove the Owner of the workspace', 400);
    }

    return await prisma.userWorkspace.delete({
      where: { userId_workspaceId: { userId, workspaceId } },
    });
  }
}

module.exports = new MemberService();
