import { DocumentTypes } from './fileClassificationUtils';
import { FileMapping } from './fileUtils';

export function checkImportLicenseDocuments(fileMappings: FileMapping[]) {
  for (const fileMapping of fileMappings) {
    if (fileMapping.type === DocumentTypes.LICENCA_DE_IMPORTACAO) {
      return true;
    }
  }
  return false;
}
