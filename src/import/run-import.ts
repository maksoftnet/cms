import 'reflect-metadata';
import { initPostgres } from '../services/postgres';
import { initMongo } from '../services/mongo';
import { importSources } from './registry';
import { fetchRemoteData } from './fetcher';
import { parseXml } from './parser-xml';
import { normalizeFromXml } from './normalize';
import { AppDataSource } from '../services/postgres';
import { Page } from '../models/Page';
import { PlatformExtension } from '../models/PlatformExtension';

async function run() {
  await initPostgres();
  await initMongo();

  for (const source of importSources) {
    try {
      console.log(`Fetching from: ${source.url}`);
      const raw = await fetchRemoteData(source.url);
      const parsed = source.type === 'xml' ? parseXml(raw) : null;
      const unified = normalizeFromXml(parsed);

      for (const item of unified) {
        const repo = AppDataSource.getRepository(Page);
        let page = await repo.findOneBy({ title: item.title });

        if (!page) {
          page = repo.create({
            id: `import-${Date.now()}`,
            title: item.title,
            content: item.content,
            language: item.language || source.language || 'bg'
          });
        } else {
          page.content = item.content;
        }

        await repo.save(page);

        await PlatformExtension.findOneAndUpdate(
          { pageId: page.id, platform: source.id },
          { data: item.platformMeta, syncedAt: new Date() },
          { upsert: true }
        );
      }

      console.log(`✔ Imported from ${source.url}`);
    } catch (err) {
      console.error(`✖ Error importing ${source.url}:`, err);
    }
  }
}

run();
