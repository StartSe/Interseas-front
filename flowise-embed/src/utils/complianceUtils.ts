import { DocumentTypes } from '@/utils/fileClassificationUtils';
import { FileMapping } from '@/utils/fileUtils';

export function checkImportLicenseDocuments(fileMappings: FileMapping[]) {
  for (const fileMapping of fileMappings) {
    if (fileMapping.type === DocumentTypes.LICENCA_DE_IMPORTACAO) {
      return true;
    }
  }
  return false;
}
