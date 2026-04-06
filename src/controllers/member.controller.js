// ua: тзв контролер - диспетчер який отримує запити від роутів,
// викликає відповідні сервіси і повертає відповіді клієнту

const memberService = require('../services/member.service');
const asyncHandler = require('../utils/asyncHandler');

// ua: Додавання учасника до воркспейсу за еmail

exports.addMember = asyncHandler(async (req, res) => {
  // ua: виклик сервісу для добавлення учасника до воркспейсу
  const membership = await memberService.addMember(
    req.params.id,
    req.body.email,
    req.body.role,
  );

  res.status(201).json({
    success: true,
    message: `User with email ${req.body.email} added to workspace`,
    data: { membership },
  });
});

// ua: Оновлення ролі учасника у воркспейсі
exports.updateMemberRole = asyncHandler(async (req, res) => {
  // ua: виклик сервісу для оновлення ролі учасника у воркспейсі
  const updatedMembership = await memberService.updateMemberRole(
    req.params.id,
    req.params.userId,
    req.body.role,
  );

  res.status(200).json({
    success: true,
    message: `User role updated to ${req.body.role}`,
    data: { membership: updatedMembership },
  });
});

// ua: Видалення учасника з воркспейсу
exports.removeMember = asyncHandler(async (req, res) => {
  // ua: виклик сервісу для видалення учасника з воркспейсу
  await memberService.removeMember(req.params.id, req.params.userId);

  res.status(204).json({
    success: true,
    message: `User removed from workspace`,
    data: null,
  });
});
