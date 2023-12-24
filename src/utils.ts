import { type App, Notice, TFile, Plugin } from "obsidian";

export const updateFrontMatterByFile = async (
  file: TFile,
  app: App,
  finalData: any
) => {
  await app.fileManager.processFrontMatter(file, (fm) => {
    Object.keys(finalData).forEach((key) => {
      fm[key] = finalData[key];
    });
  });
};

export const getFrontMatterByFile = async (file: TFile, app: App) => {
  let frontmatter = {} as Record<string, any>;
  await app.fileManager.processFrontMatter(file, (fm) => {
    frontmatter = fm;
  });
  return frontmatter;
};

export const handleLocalUrl = async (obUrl: string, plugin: Plugin) => {
  console.log("handleLocalUrl--", obUrl);
  try {
    const obInnerFile = await plugin.app.metadataCache.getFirstLinkpathDest(
      obUrl,
      ""
    );
    if (!obInnerFile) {
      new Notice(`Failed upload ${obUrl}, file does not exist`);
      return;
    }
    console.log("find ob local file");

    const conArrayBuffer = await plugin.app.vault.readBinary(obInnerFile);
    const blob = new Blob([conArrayBuffer], {
      type: "image/" + obInnerFile.extension,
    });
    return blob;
  } catch (error: any) {
    new Notice(`Fail Read ${obUrl}, ${error.message}`);
  }

  return;
};
