import { describe, expect, it } from 'vitest';
import CompareDocuments from '@/utils/compareDocuments';
import { DocumentTypes } from '@/utils/fileClassificationUtils';
import { FileMapping } from '@/utils/fileUtils';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const document = (name: string, type: DocumentTypes): FileMapping =>
  ({ file: { name }, type, content: { name }, filledChecklist: { name } }) as unknown as FileMapping;

// Names of the two documents embedded in a CROSS_VALIDATION prompt, in prompt order.
const documentsInPrompt = (prompt: string, names: string[]) => names.filter((name) => prompt.includes(` ${name} {`));

const crossValidationResponse = (firstDocument: string, secondDocument: string) => ({
  text:
    '```json\n' +
    JSON.stringify({
      equivalent_keys: [
        {
          data: [
            { key_identifier: `${firstDocument} x ${secondDocument}`, document_name: firstDocument, key_name: 'numero', value: 'A' },
            { key_identifier: `${firstDocument} x ${secondDocument}`, document_name: secondDocument, key_name: 'numero', value: 'B' },
          ],
        },
      ],
    }) +
    '\n```',
});

type Delays = { crossValidation: (documents: string[]) => number; specificCompliance: number };

const runComparison = async (fileMappings: FileMapping[], delays: Delays) => {
  const names = fileMappings.map((fileMapping) => fileMapping.file.name);
  const chatMessages: any[] = [];
  let listDifferentKeysPrompt = '';

  const sendBackgroundMessage = async (prompt: string) => {
    if (prompt.startsWith('Specific compliance')) {
      await sleep(delays.specificCompliance);
      return { text: 'specific compliance result' };
    }
    if (prompt.startsWith('LIST_DIFFERENT_KEYS')) {
      listDifferentKeysPrompt = prompt;
      return { text: 'natural language summary' };
    }
    const [firstDocument, secondDocument] = documentsInPrompt(prompt, names);
    await sleep(delays.crossValidation([firstDocument, secondDocument]));
    return crossValidationResponse(firstDocument, secondDocument);
  };

  const setMessages = (update: (previous: any[]) => any[]) => {
    chatMessages.splice(0, chatMessages.length, ...update(chatMessages));
  };

  await new CompareDocuments({ fileMappings, sendBackgroundMessage, setMessages }).execute();

  const differentKeys = listDifferentKeysPrompt ? JSON.parse(listDifferentKeysPrompt.replace('LIST_DIFFERENT_KEYS\n', '')) : [];
  return { reportedPairs: differentKeys.map((difference: any) => Object.keys(difference)[0]), chatMessages };
};

describe('CompareDocuments', () => {
  const ceMercante = document('ce-mercante.pdf', DocumentTypes.CE_MERCANTE);
  const billOfLading = document('bl.pdf', DocumentTypes.CONHECIMENTO_BL);
  const invoice = document('invoice.pdf', DocumentTypes.COMMERCIAL_INVOICE);

  it('reports the differences of every pair when a pair also runs a specific compliance check', async () => {
    const { reportedPairs, chatMessages } = await runComparison([ceMercante, billOfLading, invoice], {
      // The CE Mercante x B/L pair answers first, then waits on its specific compliance check
      // while the other pairs' cross validations come back.
      crossValidation: (documents) => (documents.includes('ce-mercante.pdf') && documents.includes('bl.pdf') ? 5 : 15),
      specificCompliance: 30,
    });

    expect(reportedPairs.sort()).toEqual(['bl.pdf x invoice.pdf', 'ce-mercante.pdf x bl.pdf', 'ce-mercante.pdf x invoice.pdf']);
    expect(chatMessages.map((message) => message.message)).toContain('specific compliance result');
  });

  it('does not depend on the order in which the cross validations resolve', async () => {
    const orders: Array<(documents: string[]) => number> = [
      () => 5,
      (documents) => (documents.includes('invoice.pdf') ? 1 : 20),
      (documents) => (documents.includes('invoice.pdf') ? 40 : 1),
    ];

    for (const crossValidation of orders) {
      const { reportedPairs } = await runComparison([ceMercante, billOfLading, invoice], { crossValidation, specificCompliance: 10 });
      expect(reportedPairs.sort()).toEqual(['bl.pdf x invoice.pdf', 'ce-mercante.pdf x bl.pdf', 'ce-mercante.pdf x invoice.pdf']);
    }
  });

  it('compares a single pair without a specific compliance check', async () => {
    const { reportedPairs, chatMessages } = await runComparison([billOfLading, invoice], { crossValidation: () => 1, specificCompliance: 1 });

    expect(reportedPairs).toEqual(['bl.pdf x invoice.pdf']);
    expect(chatMessages.map((message) => message.message)).toEqual(['natural language summary', '']);
  });

  it('does not ask for a summary when the documents agree', async () => {
    let summaryRequested = false;
    const sendBackgroundMessage = async (prompt: string) => {
      if (prompt.startsWith('LIST_DIFFERENT_KEYS')) summaryRequested = true;
      return { text: JSON.stringify({ equivalent_keys: [{ data: [{ value: 'Same' }, { value: 'same' }] }] }) };
    };

    const result = await new CompareDocuments({ fileMappings: [billOfLading, invoice], sendBackgroundMessage, setMessages: () => {} }).execute();

    expect(summaryRequested).toBe(false);
    expect(result).toBeUndefined();
  });
});
