import express from 'express';
import { AppDataSource } from '../../services/postgres';
import { Page } from '../../models/Page';
import { PlatformExtension } from '../../models/PlatformExtension';

export const pageRouter = express.Router();

pageRouter.post('/push', async (req, res) => {
  const { id, title, content, language, platformData } = req.body;

  const pageRepo = AppDataSource.getRepository(Page);
  let page = await pageRepo.findOneBy({ id });

  if (!page) {
    page = pageRepo.create({ id, title, content, language });
  } else {
    page.title = title;
    page.content = content;
    page.language = language;
  }
  await pageRepo.save(page);

  if (platformData && typeof platformData === 'object') {
    await PlatformExtension.findOneAndUpdate(
      { pageId: id, platform: platformData.platform },
      { data: platformData, syncedAt: new Date() },
      { upsert: true }
    );
  }

  res.json({ status: 'saved', id });
});
