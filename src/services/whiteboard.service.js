const prisma = require('../config/db');
const AppError = require('../utils/appError');

// ua: налаштування Excalidraw, які потрібно зберігати між сесіями (вибрані)
const PERSISTED_APP_STATE_KEYS = [
  'theme',
  'viewBackgroundColor',
  'gridSize',
  'gridModeEnabled',
  'zenModeEnabled',
  'currentItemStrokeColor',
  'currentItemBackgroundColor',
  'currentItemFillStyle',
  'currentItemStrokeWidth',
  'currentItemStrokeStyle',
  'currentItemRoughness',
  'currentItemOpacity',
  'currentItemFontFamily',
  'currentItemFontSize',
  'currentItemTextAlign',
  'currentItemStartArrowhead',
  'currentItemEndArrowhead',
];

// ua: отримання або створення дошки для всього воркспейсу або конкретної колонки
class WhiteboardService {
  async getOrCreateWhiteboard(workspaceId, columnId = null) {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new AppError('Workspace not found', 404);
    }

    // ua: пошук існуючої дошки для воркспейсу або колонки
    let whiteboard = await prisma.whiteboard.findFirst({
      where: {
        workspaceId,
        columnId: columnId || null,
      },
    });

    // ua: якщо дошка не існує
    if (!whiteboard) {
      whiteboard = await prisma.whiteboard.create({
        data: {
          workspaceId,
          columnId: columnId || null,
          elements: [],
          settings: { theme: 'light' },
        },
      });
    }

    return whiteboard;
  }

  // ua: оновлення елементів дошки та збережених налаштувань
  async updateWhiteboard(id, payload) {
    //console.log(
    //  'WHITEBOARD UPDATE PAYLOAD:',
    //  JSON.stringify(payload, null, 2),
    //);
    const whiteboard = await prisma.whiteboard.findUnique({
      where: { id },
    });

    if (!whiteboard) {
      throw new AppError('Whiteboard session not found', 404);
    }

    // ua: підтримка старого формату, де payload є масивом елементів
    const isLegacyArray = Array.isArray(payload);
    const incomingElements = isLegacyArray ? payload : payload?.elements;

    if (!Array.isArray(incomingElements)) {
      throw new AppError('Invalid whiteboard elements payload', 400);
    }

    // ua: очищення текстових блоків від HTML-тегів
    const sanitizedElements = incomingElements.map((el) => {
      if (el && typeof el === 'object' && typeof el.text === 'string') {
        return {
          ...el,
          text: el.text.replace(/</g, '&lt;').replace(/>/g, '&gt;'),
        };
      }

      return el;
    });

    //console.log(
    //  'WHITEBOARD APP STATE BEFORE DB:',
    //  JSON.stringify(appState, null, 2),
    //);
    // ua: збереження елементів без перезапису окремих налаштувань дошки
    return prisma.whiteboard.update({
      where: { id },
      data: {
        elements: sanitizedElements,
      },
    });
  }

  // ua: окреме збереження налаштувань інтерактивної дошки (вибрані налаштування)
  async updateWhiteboardSettings(id, settings) {
    if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
      throw new AppError('Invalid whiteboard settings', 400);
    }

    const filteredSettings = {};

    for (const key of PERSISTED_APP_STATE_KEYS) {
      if (Object.prototype.hasOwnProperty.call(settings, key)) {
        filteredSettings[key] = settings[key];
      }
    }

    if (Object.keys(filteredSettings).length === 0) {
      throw new AppError('No valid whiteboard settings provided', 400);
    }

    if (
      filteredSettings.theme !== undefined &&
      !['light', 'dark'].includes(filteredSettings.theme)
    ) {
      throw new AppError('Invalid whiteboard theme', 400);
    }

    const whiteboard = await prisma.whiteboard.findUnique({
      where: { id },
    });

    if (!whiteboard) {
      throw new AppError('Whiteboard session not found', 404);
    }

    const currentSettings =
      whiteboard.settings &&
      typeof whiteboard.settings === 'object' &&
      !Array.isArray(whiteboard.settings)
        ? whiteboard.settings
        : {};

    return prisma.whiteboard.update({
      where: { id },
      data: {
        settings: {
          ...currentSettings,
          ...filteredSettings,
        },
      },
    });
  }
}

module.exports = new WhiteboardService();
